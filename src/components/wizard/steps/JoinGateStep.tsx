"use client";

interface JoinGateStepProps {
    data: {
        enabled: boolean;
        accountAgeMinDays: number;
        avatarRequired: boolean;
        botAdditionPolicy: string;
    };
    onChange: (field: string, value: any) => void;
}

const botPolicies = [
    { value: 'allow', label: 'Allow All', icon: '✅', desc: 'All bots can join' },
    { value: 'verified_only', label: 'Verified Only', icon: '✓', desc: 'Discord verified bots' },
    { value: 'block', label: 'Block All', icon: '🚫', desc: 'No bot additions' },
];

export default function JoinGateStep({ data, onChange }: JoinGateStepProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-2">
                    <span className="text-3xl">🚪</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Join Gate</h2>
                <p className="text-white/60">Filter new members before they access your server</p>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                    <h3 className="font-semibold text-white">Enable Join Gate</h3>
                    <p className="text-sm text-white/50">Automatically screen new members</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.enabled}
                        onChange={(e) => onChange('enabled', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-black/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-600 peer-checked:to-red-600" />
                </label>
            </div>

            {data.enabled && (
                <div className="grid gap-6">
                    {/* Account Age */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <span className="text-xl">👶</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Account Age Requirement</h3>
                                <p className="text-sm text-white/50">Minimum days since account created</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="30"
                                value={data.accountAgeMinDays}
                                onChange={(e) => onChange('accountAgeMinDays', parseInt(e.target.value))}
                                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                            <div className="w-20 text-center">
                                <span className="text-2xl font-bold text-rose-400">{data.accountAgeMinDays}</span>
                                <span className="text-sm text-white/50 ml-1">days</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-white/30">
                            <span>No limit</span>
                            <span>7 days</span>
                            <span>14 days</span>
                            <span>30 days</span>
                        </div>
                    </div>

                    {/* Avatar Required */}
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <span className="text-xl">🖼️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Require Avatar</h3>
                                <p className="text-sm text-white/50">Members must have a profile picture</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.avatarRequired}
                                onChange={(e) => onChange('avatarRequired', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-black/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-600 peer-checked:to-red-600" />
                        </label>
                    </div>

                    {/* Bot Policy */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <span className="text-xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Bot Addition Policy</h3>
                                <p className="text-sm text-white/50">Control which bots can be added</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {botPolicies.map((policy) => (
                                <button
                                    key={policy.value}
                                    type="button"
                                    onClick={() => onChange('botAdditionPolicy', policy.value)}
                                    className={`p-4 rounded-xl text-center transition-all ${data.botAdditionPolicy === policy.value
                                            ? 'bg-gradient-to-br from-rose-600/20 to-red-600/20 border-2 border-rose-500 shadow-lg'
                                            : 'bg-black/30 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-2xl block mb-2">{policy.icon}</span>
                                    <div className={`font-semibold text-sm ${data.botAdditionPolicy === policy.value ? 'text-rose-400' : 'text-white'}`}>
                                        {policy.label}
                                    </div>
                                    <div className="text-xs text-white/40 mt-1">{policy.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
