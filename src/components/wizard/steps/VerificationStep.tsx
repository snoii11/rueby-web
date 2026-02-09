"use client";

interface Channel {
    id: string;
    name: string;
    type: number;
}

interface Role {
    id: string;
    name: string;
    color: number;
}

interface VerificationStepProps {
    data: {
        enabled: boolean;
        mode: string;
        channelId: string;
        roleId: string;
        failAction: string;
    };
    onChange: (field: string, value: any) => void;
    channels: Channel[];
    roles: Role[];
}

const modes = [
    { value: 'BUTTON', label: 'Button', icon: '🔘', desc: 'Click to verify' },
    { value: 'CAPTCHA', label: 'Captcha', icon: '🔐', desc: 'Solve image puzzle' },
    { value: 'WEB', label: 'Web Portal', icon: '🌐', desc: 'Browser verification' },
    { value: 'NONE', label: 'Disabled', icon: '⏸️', desc: 'No verification' },
];

const failActions = [
    { value: 'none', label: 'None', icon: '➖' },
    { value: 'quarantine', label: 'Quarantine', icon: '🔒' },
    { value: 'kick', label: 'Kick', icon: '👢' },
    { value: 'ban', label: 'Ban', icon: '🔨' },
];

export default function VerificationStep({ data, onChange, channels, roles }: VerificationStepProps) {
    const textChannels = channels.filter(c => c.type === 0);

    const getColorHex = (color: number) => color ? `#${color.toString(16).padStart(6, '0')}` : '#6b7280';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 mb-2">
                    <span className="text-3xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Verification System</h2>
                <p className="text-white/60">Protect your server from bots and raids</p>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                    <h3 className="font-semibold text-white">Enable Verification</h3>
                    <p className="text-sm text-white/50">Require new members to verify</p>
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
                <>
                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Verification Mode</label>
                        <div className="grid grid-cols-2 gap-3">
                            {modes.filter(m => m.value !== 'NONE').map((mode) => (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => onChange('mode', mode.value)}
                                    className={`p-4 rounded-xl text-left transition-all ${data.mode === mode.value
                                            ? 'bg-gradient-to-br from-rose-600/20 to-red-600/20 border-2 border-rose-500 shadow-lg shadow-rose-500/10'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{mode.icon}</span>
                                        <div>
                                            <div className={`font-semibold ${data.mode === mode.value ? 'text-rose-400' : 'text-white'}`}>
                                                {mode.label}
                                            </div>
                                            <div className="text-xs text-white/50">{mode.desc}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Channel Selection */}
                    <div className="space-y-3">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Verification Channel</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-32 overflow-y-auto">
                            {textChannels.length === 0 ? (
                                <p className="text-white/40 text-sm p-2">No text channels found</p>
                            ) : textChannels.map((channel) => (
                                <button
                                    key={channel.id}
                                    type="button"
                                    onClick={() => onChange('channelId', channel.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${data.channelId === channel.id
                                            ? 'bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/50'
                                            : 'bg-black/30 text-white/70 hover:bg-black/50'
                                        }`}
                                >
                                    <span className="text-white/50">#</span>
                                    {channel.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Verified Role</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-32 overflow-y-auto">
                            {roles.filter(r => r.name !== '@everyone').map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => onChange('roleId', role.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${data.roleId === role.id
                                            ? 'ring-2 ring-white/50 shadow-lg scale-105'
                                            : 'hover:scale-105'
                                        }`}
                                    style={{
                                        backgroundColor: data.roleId === role.id
                                            ? `${getColorHex(role.color)}40`
                                            : 'rgba(0,0,0,0.3)',
                                        color: data.roleId === role.id
                                            ? getColorHex(role.color)
                                            : 'rgba(255,255,255,0.7)'
                                    }}
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: getColorHex(role.color) }}
                                    />
                                    {role.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fail Action */}
                    <div className="space-y-3">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">On Fail / Timeout</label>
                        <div className="grid grid-cols-4 gap-2">
                            {failActions.map((action) => (
                                <button
                                    key={action.value}
                                    type="button"
                                    onClick={() => onChange('failAction', action.value)}
                                    className={`p-3 rounded-xl font-medium text-sm transition-all ${data.failAction === action.value
                                            ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg'
                                            : 'bg-black/30 text-white/70 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-lg block mb-1">{action.icon}</span>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
