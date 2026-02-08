"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

interface LimitConfig {
    name: string;
    key: string;
    value: number;
    description: string;
}

export default function AntiNukePage() {
    const params = useParams();
    const guildId = params.guildId as string;

    const [enabled, setEnabled] = useState(true);
    const [limits, setLimits] = useState<LimitConfig[]>([
        { name: "Channel Delete", key: "channelDelete", value: 3, description: "Max channel deletions per minute" },
        { name: "Channel Create", key: "channelCreate", value: 5, description: "Max channel creations per minute" },
        { name: "Role Delete", key: "roleDelete", value: 3, description: "Max role deletions per minute" },
        { name: "Role Create", key: "roleCreate", value: 5, description: "Max role creations per minute" },
        { name: "Ban Limit", key: "ban", value: 5, description: "Max bans per minute" },
        { name: "Kick Limit", key: "kick", value: 10, description: "Max kicks per minute" },
        { name: "Webhook Create", key: "webhookCreate", value: 3, description: "Max webhook creations per minute" },
        { name: "Webhook Delete", key: "webhookDelete", value: 3, description: "Max webhook deletions per minute" },
    ]);

    const [saving, setSaving] = useState(false);

    const handleLimitChange = (key: string, value: number) => {
        setLimits(limits.map(l => l.key === key ? { ...l, value } : l));
    };

    const handleSave = async () => {
        setSaving(true);
        // TODO: Save to API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">🛡️ Anti-Nuke</h1>
                    <p className="text-white/60">
                        Protect your server from malicious admin actions
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-ruby flex items-center gap-2"
                >
                    {saving ? "Saving..." : "💾 Save Changes"}
                </button>
            </div>

            {/* Main Toggle */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31C5F]/20 to-[#E31C5F]/10 flex items-center justify-center">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Anti-Nuke Protection</h3>
                            <p className="text-white/60 text-sm">
                                Monitor and prevent mass destructive actions
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`toggle ${enabled ? "active" : ""}`}
                        aria-label="Toggle Anti-Nuke"
                    />
                </div>
            </div>

            {/* Limits Grid */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Rate Limits</h2>
                <p className="text-white/60 text-sm mb-6">
                    Set the maximum number of actions allowed per minute before triggering protection
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                    {limits.map((limit) => (
                        <div
                            key={limit.key}
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-white font-medium">{limit.name}</label>
                                <span className="text-[#E31C5F] font-mono font-bold">
                                    {limit.value}/min
                                </span>
                            </div>
                            <p className="text-white/40 text-xs mb-3">{limit.description}</p>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={limit.value}
                                onChange={(e) => handleLimitChange(limit.key, parseInt(e.target.value))}
                                className="w-full accent-[#E31C5F]"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Response Actions */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Response Actions</h2>
                <p className="text-white/60 text-sm mb-6">
                    What happens when a user exceeds the limits
                </p>

                <div className="space-y-3">
                    {[
                        { action: "Quarantine", desc: "Remove all roles and add quarantine role", selected: true },
                        { action: "Ban", desc: "Immediately ban the user", selected: false },
                        { action: "Kick", desc: "Kick the user from the server", selected: false },
                        { action: "Role Strip", desc: "Remove dangerous permissions only", selected: false },
                    ].map((option, i) => (
                        <label
                            key={i}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${option.selected
                                    ? "bg-[#E31C5F]/20 border border-[#E31C5F]/50"
                                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <input
                                type="radio"
                                name="response"
                                defaultChecked={option.selected}
                                className="accent-[#E31C5F]"
                            />
                            <div>
                                <p className="text-white font-medium">{option.action}</p>
                                <p className="text-white/40 text-sm">{option.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Exemptions */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Exemptions</h2>
                <p className="text-white/60 text-sm mb-6">
                    Roles that bypass anti-nuke checks
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {["Admin", "Owner", "Trusted Staff"].map((role, i) => (
                        <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-[#E31C5F]/20 border border-[#E31C5F]/50 text-white text-sm flex items-center gap-2"
                        >
                            {role}
                            <button className="text-white/60 hover:text-white">×</button>
                        </span>
                    ))}
                </div>

                <select className="input-glass w-full">
                    <option value="">Add a role...</option>
                    <option value="mod">Moderator</option>
                    <option value="helper">Helper</option>
                </select>
            </div>
        </div>
    );
}
