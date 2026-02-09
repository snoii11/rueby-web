"use client";

import ChannelSelect from '@/components/ui/ChannelSelect';

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
    const textChannels = channels
        .filter(c => c.type === 0)
        .map(c => ({
            label: c.name,
            value: c.id,
            type: 'text' as const
        }));

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

            {/* Log Channel Cards */}
            <div className="grid gap-4">
                {logTypes.map((log) => (
                    <div key={log.key} className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <span className="text-2xl">{log.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white">{log.label}</h3>
                                <p className="text-xs text-white/50">{log.desc}</p>
                            </div>
                            <div className="w-[200px]">
                                <ChannelSelect
                                    name={log.key}
                                    channels={textChannels}
                                    defaultValue={(data as any)[log.key] || ''}
                                    onChange={(val) => onChange(log.key, val)}
                                    placeholder="None"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Assign */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-white">Quick Assign</h3>
                        <p className="text-sm text-white/50">Send all logs to one channel</p>
                    </div>
                    <div className="w-[200px]">
                        <ChannelSelect
                            name="quickAssign"
                            channels={textChannels}
                            placeholder="Select channel..."
                            onChange={(val) => {
                                if (val) {
                                    logTypes.forEach(log => onChange(log.key, val));
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
