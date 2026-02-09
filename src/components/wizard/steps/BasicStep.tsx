"use client";

interface BasicStepProps {
    data: {
        prefix: string;
        timezone: string;
    };
    onChange: (field: string, value: string) => void;
    guildName: string;
    guildIcon?: string | null;
}

const timezones = [
    { label: 'UTC', value: 'UTC', offset: '+0:00' },
    { label: 'EST', value: 'America/New_York', offset: '-5:00' },
    { label: 'PST', value: 'America/Los_Angeles', offset: '-8:00' },
    { label: 'CST', value: 'America/Chicago', offset: '-6:00' },
    { label: 'GMT', value: 'Europe/London', offset: '+0:00' },
    { label: 'CET', value: 'Europe/Paris', offset: '+1:00' },
    { label: 'IST', value: 'Asia/Kolkata', offset: '+5:30' },
    { label: 'JST', value: 'Asia/Tokyo', offset: '+9:00' },
    { label: 'AEST', value: 'Australia/Sydney', offset: '+10:00' },
];

export default function BasicStep({ data, onChange, guildName, guildIcon }: BasicStepProps) {
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/20 border border-rose-500/30 mb-2">
                    {guildIcon ? (
                        <img
                            src={`https://cdn.discordapp.com/icons/${guildIcon}`}
                            alt={guildName}
                            className="w-full h-full rounded-2xl object-cover"
                        />
                    ) : (
                        <span className="text-3xl font-bold text-rose-400">
                            {guildName?.charAt(0) || 'R'}
                        </span>
                    )}
                </div>
                <h2 className="text-3xl font-black text-white">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500">{guildName}</span>
                </h2>
                <p className="text-white/60 max-w-lg mx-auto">
                    Let's configure Rueby for your server. This wizard will guide you through the essential settings.
                </p>
            </div>

            {/* Settings Cards */}
            <div className="grid gap-6">
                {/* Prefix */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 rounded-lg">
                            <span className="text-xl">⌨️</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Command Prefix</h3>
                            <p className="text-sm text-white/50">The character(s) to trigger bot commands</p>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={data.prefix}
                        onChange={(e) => onChange('prefix', e.target.value)}
                        placeholder="!"
                        maxLength={5}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all"
                    />
                </div>

                {/* Timezone */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 rounded-lg">
                            <span className="text-xl">🌍</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Timezone</h3>
                            <p className="text-sm text-white/50">Used for scheduled actions and logs</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {timezones.map((tz) => (
                            <button
                                key={tz.value}
                                type="button"
                                onClick={() => onChange('timezone', tz.value)}
                                className={`p-3 rounded-xl font-medium text-sm transition-all ${data.timezone === tz.value
                                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30'
                                        : 'bg-black/30 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div className="font-bold">{tz.label}</div>
                                <div className="text-xs opacity-60">{tz.offset}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
