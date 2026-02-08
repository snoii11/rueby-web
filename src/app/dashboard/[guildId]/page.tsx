"use client";

import { useParams } from "next/navigation";

export default function GuildOverviewPage() {
    const params = useParams();
    const guildId = params.guildId as string;

    // Mock stats - in production, fetch from API
    const stats = [
        { label: "Cases", value: "247", icon: "📋" },
        { label: "Bans", value: "42", icon: "🔨" },
        { label: "Warnings", value: "156", icon: "⚠️" },
        { label: "Heat Score", value: "Low", icon: "🔥" },
    ];

    const recentActions = [
        { type: "ban", user: "Spammer#1234", mod: "Admin#0001", time: "2 min ago" },
        { type: "warn", user: "User#5678", mod: "Mod#0002", time: "15 min ago" },
        { type: "mute", user: "Troll#9999", mod: "Admin#0001", time: "1 hour ago" },
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

            {/* Quick Toggles */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Toggles</h2>
                    <div className="space-y-4">
                        {[
                            { label: "Anti-Nuke Protection", enabled: true },
                            { label: "Join Gate", enabled: true },
                            { label: "Verification Required", enabled: false },
                            { label: "Panic Mode", enabled: false },
                        ].map((toggle, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                            >
                                <span className="text-white">{toggle.label}</span>
                                <button
                                    className={`toggle ${toggle.enabled ? "active" : ""}`}
                                    aria-label={`Toggle ${toggle.label}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Actions */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Actions</h2>
                    <div className="space-y-3">
                        {recentActions.map((action, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">
                                        {action.type === "ban"
                                            ? "🔨"
                                            : action.type === "warn"
                                                ? "⚠️"
                                                : "🔇"}
                                    </span>
                                    <div>
                                        <p className="text-white text-sm">{action.user}</p>
                                        <p className="text-white/40 text-xs">by {action.mod}</p>
                                    </div>
                                </div>
                                <span className="text-white/40 text-xs">{action.time}</span>
                            </div>
                        ))}
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
