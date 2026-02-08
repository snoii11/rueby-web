"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface Guild {
    id: string;
    name: string;
    icon: string | null;
}

export default function GuildDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const guildId = params.guildId as string;
    const [guild, setGuild] = useState<Guild | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchGuild() {
            if (session?.accessToken && guildId) {
                try {
                    const res = await fetch("https://discord.com/api/users/@me/guilds", {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    });
                    const guilds = await res.json();
                    const found = guilds.find((g: Guild) => g.id === guildId);
                    setGuild(found || null);
                } catch (err) {
                    console.error("Failed to fetch guild:", err);
                }
            }
        }
        if (session) {
            fetchGuild();
        }
    }, [session, guildId]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white/60">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex relative">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="liquid-blob blob-1 opacity-30" />
                <div className="liquid-blob blob-2 opacity-30" />
            </div>

            {/* Sidebar */}
            <Sidebar guildId={guildId} guildName={guild?.name} />

            {/* Main Content */}
            <main className="flex-1 min-h-screen relative z-10">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
