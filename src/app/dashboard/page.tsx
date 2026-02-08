import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: number;
    features: string[];
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // 1. Fetch User's Guilds from Discord
    let userGuilds: DiscordGuild[] = [];
    try {
        const res = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
            next: { revalidate: 60 } // Cache for 60s
        });
        if (res.ok) {
            userGuilds = await res.json();
        }
    } catch (e) {
        console.error("Failed to fetch user guilds", e);
    }

    // 2. Filter for Admin/Owner perms
    // Permission: 0x8 (Administrator) or 0x20 (Manage Guild)
    const adminGuilds = userGuilds.filter(g =>
        (Number(g.permissions) & 0x8) === 0x8 ||
        (Number(g.permissions) & 0x20) === 0x20 ||
        g.owner
    );

    // 3. Fetch Bot's Guilds from DB
    const botGuildIds = await prisma.guild.findMany({
        select: { id: true }
    }).then(gs => new Set(gs.map(g => g.id)));

    // 4. Split into Active (Bot In) and Available (Bot Not In)
    const activeGuilds = adminGuilds.filter(g => botGuildIds.has(g.id));
    const availableGuilds = adminGuilds.filter(g => !botGuildIds.has(g.id));

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
                        {/* SignOut is client-side, so we need a Client Component for it or use a link to API */}
                        <Link
                            href="/api/auth/signout"
                            className="text-white/60 hover:text-white text-sm transition-colors"
                        >
                            Sign Out
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-white mb-2">Select a Server</h1>
                    <p className="text-white/60">
                        Manage your servers with Rueby
                    </p>
                </div>

                {/* Active Servers */}
                {activeGuilds.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            Active Servers
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeGuilds.map((guild) => (
                                <Link
                                    key={guild.id}
                                    href={`/dashboard/${guild.id}`}
                                    className="glass-card p-6 flex items-center gap-4 group hover:bg-white/10 transition-colors"
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
                    </div>
                )}

                {/* Available Servers (Invite) */}
                {availableGuilds.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            Add to Server
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableGuilds.map((guild) => (
                                <Link
                                    key={guild.id}
                                    href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`}
                                    target="_blank"
                                    className="glass-card p-6 flex items-center gap-4 group hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
                                >
                                    {guild.icon ? (
                                        <img
                                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                            alt={guild.name}
                                            className="w-14 h-14 rounded-xl grayscale group-hover:grayscale-0 transition-all"
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
                                            Invite Rueby
                                        </p>
                                    </div>
                                    <div className="text-white/40 group-hover:text-[#E31C5F] transition-colors">
                                        +
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {userGuilds.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            No Servers Found
                        </h2>
                        <p className="text-white/60">
                            You don't seem to have any servers where you can manage Rueby.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
