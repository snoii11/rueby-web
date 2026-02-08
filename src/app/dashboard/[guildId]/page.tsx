import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GuildOverviewPage({
    params,
}: {
    params: Promise<{ guildId: string }>;
}) {
    const { guildId } = await params;

    // Fetch Guild Data in parallel
    const [
        caseCount,
        banCount,
        warnCount,
        heatConfig,
        antiNuke,
        joinGate,
        verification,
        panicState,
        recentCases
    ] = await Promise.all([
        prisma.case.count({ where: { guildId } }),
        prisma.case.count({ where: { guildId, type: "BAN" } }),
        prisma.case.count({ where: { guildId, type: "WARN" } }),
        prisma.heatConfig.findUnique({ where: { guildId } }),
        prisma.antiNukeLimits.findUnique({ where: { guildId } }),
        prisma.joinGate.findUnique({ where: { guildId } }),
        prisma.verificationSettings.findUnique({ where: { guildId } }),
        prisma.panicState.findUnique({ where: { guildId } }),
        prisma.case.findMany({
            where: { guildId },
            orderBy: { createdAt: "desc" },
            take: 5,
        })
    ]);

    // Format stats
    const stats = [
        { label: "Cases", value: caseCount.toString(), icon: "📋" },
        { label: "Bans", value: banCount.toString(), icon: "🔨" },
        { label: "Warnings", value: warnCount.toString(), icon: "⚠️" },
        { label: "Heat Score", value: "Low", icon: "🔥" }, // Placeholder for calculated score
    ];

    // Format recent actions
    const formattedActions = recentCases.map(c => ({
        type: c.type.toLowerCase(),
        user: c.targetId || "Unknown",
        mod: c.actorId || "System",
        time: new Date(c.createdAt).toLocaleDateString(),
        original: c
    }));

    // Config toggles state
    const toggles = [
        { label: "Anti-Nuke Protection", enabled: antiNuke?.enabled ?? false, link: "/antinuke" },
        { label: "Join Gate", enabled: joinGate?.enabled ?? false, link: "/joingate" },
        { label: "Verification Required", enabled: verification?.enabled ?? false, link: "/verification" },
        { label: "Panic Mode", enabled: panicState?.active ?? false, link: "/panic" },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-white/60">Server overview and quick actions</p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-white/60 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Config & Actions Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Toggles / Status */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
                    <div className="space-y-4">
                        {toggles.map((toggle, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                            >
                                <span className="text-white">{toggle.label}</span>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${toggle.enabled ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"}`} />
                                    <Link
                                        href={`/dashboard/${guildId}${toggle.link}`}
                                        className="text-xs text-white/40 hover:text-white transition-colors"
                                    >
                                        Configure →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Actions */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Actions</h2>
                    <div className="space-y-3">
                        {formattedActions.length > 0 ? (
                            formattedActions.map((action, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg" title={action.type}>
                                            {action.type.includes("ban") ? "🔨" :
                                                action.type.includes("warn") ? "⚠️" :
                                                    action.type.includes("mute") ? "🔇" : "📝"}
                                        </span>
                                        <div>
                                            <p className="text-white text-sm truncate max-w-[120px]">
                                                {action.user}
                                            </p>
                                            <p className="text-white/40 text-xs">by {action.mod}</p>
                                        </div>
                                    </div>
                                    <span className="text-white/40 text-xs">{action.time}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-white/40 text-sm">
                                No recent actions found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bot Status */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31C5F] to-[#B81650] flex items-center justify-center">
                        <span className="text-white font-bold text-xl">R</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Rueby Bot</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 text-sm">Online</span>
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-white/60 text-sm">Prefix</p>
                        <p className="text-white font-mono">r.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
