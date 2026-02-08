import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import CustomSelect from "@/components/ui/CustomSelect";
import CustomCheckbox from "@/components/ui/CustomCheckbox";

// Server action to update heat config
async function updateHeatConfig(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    if (!guildId) return;

    const enabled = formData.get("enabled") === "on";
    const panicThreshold = parseInt(formData.get("panicThreshold") as string) || 5;
    const panicWindowSeconds = parseInt(formData.get("panicWindowSeconds") as string) || 60;
    const panicDurationMinutes = parseInt(formData.get("panicDurationMinutes") as string) || 10;

    // Weights
    const weights = {
        messageRate: parseFloat(formData.get("w_messageRate") as string) || 1.0,
        duplicates: parseFloat(formData.get("w_duplicates") as string) || 2.0,
        massMentions: parseFloat(formData.get("w_massMentions") as string) || 3.0,
        links: parseFloat(formData.get("w_links") as string) || 1.5,
        attachments: parseFloat(formData.get("w_attachments") as string) || 0.5,
        emojiSpam: parseFloat(formData.get("w_emojiSpam") as string) || 1.0,
        suspiciousUnicode: parseFloat(formData.get("w_suspiciousUnicode") as string) || 2.0,
        webhookMessages: parseFloat(formData.get("w_webhookMessages") as string) || 2.5
    };

    // Thresholds
    const thresholds = {
        T1: parseInt(formData.get("t_T1") as string) || 10,
        T2: parseInt(formData.get("t_T2") as string) || 25,
        T3: parseInt(formData.get("t_T3") as string) || 50,
        T4: parseInt(formData.get("t_T4") as string) || 100
    };

    // Actions
    const actions = {
        T1: formData.get("a_T1") as string || "warn",
        T2: formData.get("a_T2") as string || "timeout",
        T3: formData.get("a_T3") as string || "kick",
        T4: formData.get("a_T4") as string || "ban"
    };

    await prisma.heatConfig.upsert({
        where: { guildId },
        update: {
            enabled,
            panicThreshold,
            panicWindowSeconds,
            panicDurationMinutes,
            weights,
            thresholds,
            actions
        },
        create: {
            guildId,
            enabled,
            panicThreshold,
            panicWindowSeconds,
            panicDurationMinutes,
            weights,
            thresholds,
            actions
        }
    });

    revalidatePath(`/dashboard/${guildId}/moderation`);
}

export default async function ModerationPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { guildId } = params;

    const config = await prisma.heatConfig.findUnique({
        where: { guildId }
    });

    const weights = config?.weights as any || {
        messageRate: 1.0, duplicates: 2.0, massMentions: 3.0, links: 1.5,
        attachments: 0.5, emojiSpam: 1.0, suspiciousUnicode: 2.0, webhookMessages: 2.5
    };

    const thresholds = config?.thresholds as any || { T1: 10, T2: 25, T3: 50, T4: 100 };
    const actions = config?.actions as any || { T1: "warn", T2: "timeout", T3: "kick", T4: "ban" };

    const actionOptions = [
        { label: "Warn", value: "warn" },
        { label: "Timeout", value: "timeout" },
        { label: "Kick", value: "kick" },
        { label: "Ban", value: "ban" },
    ];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600">
                    Moderation (Heat System)
                </h1>
                <p className="text-white/60 mt-2">
                    Configure automated moderation and raid protection.
                </p>
            </header>

            <form action={updateHeatConfig} className="space-y-8">
                <input type="hidden" name="guildId" value={guildId} />

                {/* Main Toggle */}
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                    <div>
                        <h3 className="font-semibold text-xl text-white">Enable Heat System</h3>
                        <p className="text-sm text-gray-400">Automatically tracking user behavior and spam score.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group">
                        <input type="checkbox" name="enabled" className="sr-only peer" defaultChecked={config?.enabled ?? true} />
                        <div className="w-14 h-8 bg-black/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-600 peer-checked:to-red-600 shadow-inner"></div>
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/5 group-hover:ring-white/20 transition-all"></div>
                    </label>
                </div>

                {/* Signal Weights */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-6 shadow-lg hover:border-white/20 transition-all">
                    <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                        <span className="text-xl">⚖️</span> Signal Weights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(weights).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold break-words">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name={`w_${key}`}
                                    defaultValue={value as number}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all placeholder-white/20 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thresholds & Actions */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-6 shadow-lg hover:border-white/20 transition-all">
                    <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                        <span className="text-xl">📈</span> Escalation Tiers
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        {['T1', 'T2', 'T3', 'T4'].map((tier) => (
                            <div key={tier} className="flex flex-col md:flex-row gap-4 items-center bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/50 text-xl border border-white/10">
                                    {tier}
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Score Threshold</label>
                                    <input
                                        type="number"
                                        name={`t_${tier}`}
                                        defaultValue={thresholds[tier]}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-rose-500/50 outline-none"
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action</label>
                                    <CustomSelect
                                        name={`a_${tier}`}
                                        defaultValue={actions[tier]}
                                        options={actionOptions}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panic Mode */}
                <div className="bg-rose-500/5 p-6 rounded-2xl border border-rose-500/20 backdrop-blur-md space-y-6 shadow-lg hover:border-rose-500/30 transition-all">
                    <h3 className="font-semibold text-rose-400 text-lg flex items-center gap-2">
                        <span className="text-xl">🚨</span> Panic Mode Triggers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-rose-300/70 font-bold">User Threshold</label>
                            <input type="number" name="panicThreshold" defaultValue={config?.panicThreshold ?? 5} className="w-full bg-black/40 border border-rose-500/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none" />
                            <p className="text-[10px] text-rose-300/50">Unique users triggering filters.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-rose-300/70 font-bold">Time Window (Sec)</label>
                            <input type="number" name="panicWindowSeconds" defaultValue={config?.panicWindowSeconds ?? 60} className="w-full bg-black/40 border border-rose-500/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-rose-300/70 font-bold">Duration (Min)</label>
                            <input type="number" name="panicDurationMinutes" defaultValue={config?.panicDurationMinutes ?? 10} className="w-full bg-black/40 border border-rose-500/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20 flex items-center justify-center space-x-2">
                        <span>Save Heat Config</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
