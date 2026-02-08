"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Guild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchGuilds() {
            if (session?.accessToken) {
                try {
                    const res = await fetch("https://discord.com/api/users/@me/guilds", {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    });
                    const data = await res.json();
                    // Filter to guilds where user has admin permissions
                    const adminGuilds = data.filter(
                        (g: Guild) => (g.permissions & 0x8) === 0x8 || g.owner
                    );
                    setGuilds(adminGuilds);
                } catch (err) {
                    console.error("Failed to fetch guilds:", err);
                }
            }
            setLoading(false);
        }
        if (session) {
            fetchGuilds();
        }
    }, [session]);

    if (status === "loading" || loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-white/60">Loading...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="liquid-blob blob-1" />
            <div className="liquid-blob blob-2" />

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31C5F] to-[#B81650] flex items-center justify-center">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <span className="text-xl font-bold text-white">Rueby</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={session?.user?.image || "/default-avatar.png"}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="text-white/80 text-sm hidden sm:block">
                                {session?.user?.name}
                            </span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-white/60 hover:text-white text-sm transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-white mb-2">Select a Server</h1>
                <p className="text-white/60 mb-8">
                    Choose a server to configure Rueby
                </p>

                {guilds.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <span className="text-4xl mb-4 block">🤖</span>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            No Servers Found
                        </h2>
                        <p className="text-white/60 mb-6">
                            You don&apos;t have admin permissions on any servers, or Rueby isn&apos;t
                            added to them yet.
                        </p>
                        <Link
                            href="https://discord.com/api/oauth2/authorize?client_id=1469757745816277022&permissions=8&scope=bot%20applications.commands"
                            className="btn-ruby inline-block"
                        >
                            Add Rueby to a Server
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guilds.map((guild) => (
                            <Link
                                key={guild.id}
                                href={`/dashboard/${guild.id}`}
                                className="glass-card p-6 flex items-center gap-4 group"
                            >
                                {guild.icon ? (
                                    <img
                                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                        alt={guild.name}
                                        className="w-14 h-14 rounded-xl"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white/60 text-xl font-bold">
                                        {guild.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold truncate">
                                        {guild.name}
                                    </h3>
                                    <p className="text-white/50 text-sm">
                                        {guild.owner ? "Owner" : "Admin"}
                                    </p>
                                </div>
                                <div className="text-white/40 group-hover:text-[#E31C5F] transition-colors">
                                    →
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
