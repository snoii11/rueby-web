"use client";

interface CompleteStepProps {
    data: {
        prefix: string;
        timezone: string;
        verification: { enabled: boolean; mode: string };
        joinGate: { enabled: boolean };
        permits: { roleId: string; level: number }[];
    };
    guildName: string;
}

export default function CompleteStep({ data, guildName }: CompleteStepProps) {
    return (
        <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/50 mb-4 animate-pulse">
                    <span className="text-5xl">🎉</span>
                </div>
                <h2 className="text-3xl font-black text-white">
                    You're All Set!
                </h2>
                <p className="text-white/60 max-w-md mx-auto">
                    Rueby is now configured for <span className="text-white font-semibold">{guildName}</span>.
                    Here's a summary of your settings.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4">
                {/* Basics */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 bg-rose-500/20 rounded-xl">
                        <span className="text-2xl">⌨️</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white">Basics</h3>
                        <p className="text-sm text-white/50">
                            Prefix: <span className="text-white font-mono">{data.prefix || '!'}</span> •
                            Timezone: <span className="text-white">{data.timezone || 'UTC'}</span>
                        </p>
                    </div>
                    <span className="text-green-400">✓</span>
                </div>

                {/* Verification */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                        <span className="text-2xl">✅</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white">Verification</h3>
                        <p className="text-sm text-white/50">
                            {data.verification.enabled
                                ? `Enabled • Mode: ${data.verification.mode}`
                                : 'Disabled'
                            }
                        </p>
                    </div>
                    <span className={data.verification.enabled ? 'text-green-400' : 'text-white/30'}>
                        {data.verification.enabled ? '✓' : '–'}
                    </span>
                </div>

                {/* Join Gate */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <span className="text-2xl">🚪</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white">Join Gate</h3>
                        <p className="text-sm text-white/50">
                            {data.joinGate.enabled ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                    <span className={data.joinGate.enabled ? 'text-green-400' : 'text-white/30'}>
                        {data.joinGate.enabled ? '✓' : '–'}
                    </span>
                </div>

                {/* Permits */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                        <span className="text-2xl">🎫</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white">Staff Permits</h3>
                        <p className="text-sm text-white/50">
                            {data.permits.length} role{data.permits.length !== 1 ? 's' : ''} configured
                        </p>
                    </div>
                    <span className={data.permits.length > 0 ? 'text-green-400' : 'text-white/30'}>
                        {data.permits.length > 0 ? '✓' : '–'}
                    </span>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-rose-500/10 to-red-600/10 rounded-2xl border border-rose-500/20 p-6 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <span>💡</span> Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        Run <code className="px-2 py-0.5 bg-black/30 rounded text-rose-300">{data.prefix}setup verification</code> to post the verification panel
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        Configure Anti-Nuke from the dashboard for advanced protection
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        Use <code className="px-2 py-0.5 bg-black/30 rounded text-rose-300">{data.prefix}help</code> to see all available commands
                    </li>
                </ul>
            </div>
        </div>
    );
}
