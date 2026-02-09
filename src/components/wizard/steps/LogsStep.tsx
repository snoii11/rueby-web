"use client";



interface Channel {
    id: string;
    name: string;
    type: number;
}

interface LogsStepProps {
    data: {
        antinukeChannel: string;
        moderationChannel: string;
        verificationChannel: string;
        fallbackChannel: string;
    };
    onChange: (field: string, value: string) => void;
    channels: Channel[];
}

const logTypes = [
    { key: 'antinukeChannel', label: 'Anti-Nuke Logs', icon: '🛡️', desc: 'Security alerts and nuke attempts' },
    { key: 'moderationChannel', label: 'Moderation Logs', icon: '🔨', desc: 'Bans, kicks, warns, timeouts' },
    { key: 'verificationChannel', label: 'Verification Logs', icon: '✅', desc: 'Member verification events' },
    { key: 'fallbackChannel', label: 'Fallback Channel', icon: '📝', desc: 'Everything else goes here' },
];

export default function LogsStep({ data, onChange, channels }: LogsStepProps) {
    const textChannels = channels.filter(c => c.type === 0);

    const ChannelPicker = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => (
        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
            {textChannels.length === 0 ? (
                <p className="text-white/40 text-sm p-2">No text channels found</p>
            ) : textChannels.map((channel) => (
                <button
                    key={channel.id}
                    type="button"
                    onClick={() => onChange(channel.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === channel.id
                        ? 'bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/50'
                        : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'
                        }`}
                >
                    <span className="text-white/50">#</span>
                    {channel.name}
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 mb-2">
                    <span className="text-3xl">📜</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Log Routing</h2>
                <p className="text-white/60">Choose where different types of logs are sent</p>
            </div>

            {/* Quick Assign */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-white">Quick Assign</h3>
                        <p className="text-sm text-white/50">Send all logs to one channel</p>
                    </div>
                    <ChannelPicker
                        value=""
                        onChange={(val) => {
                            if (val) {
                                logTypes.forEach(log => onChange(log.key, val));
                            }
                        }}
                        placeholder="Select channel to apply to all..."
                    />
                </div>
            </div>

            {/* Log Channel Cards */}
            <div className="grid gap-6">
                {logTypes.map((log) => (
                    <div key={log.key} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <span className="text-xl">{log.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{log.label}</h3>
                                <p className="text-xs text-white/50">{log.desc}</p>
                            </div>
                        </div>
                        <ChannelPicker
                            value={(data as any)[log.key] || ''}
                            onChange={(val) => onChange(log.key, val)}
                            placeholder="Select channel..."
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
