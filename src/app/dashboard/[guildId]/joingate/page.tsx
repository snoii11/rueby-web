import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Server Action to update Join Gate settings
async function updateJoinGate(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    if (!guildId) return;

    const enabled = formData.get("enabled") === "on";
    const accountAgeMinDays = parseInt(formData.get("accountAgeMinDays") as string) || 7;
    const avatarRequired = formData.get("avatarRequired") === "on";

    const botAdditionPolicy = formData.get("botAdditionPolicy") as string;
    const unverifiedBotPolicy = formData.get("unverifiedBotPolicy") as string;
    const advertisingProfileRule = formData.get("advertisingProfileRule") as string;

    // Actions map
    const actions = {
        accountAge: formData.get("action_accountAge") as string,
        avatar: formData.get("action_avatar") as string,
        bot: formData.get("action_bot") as string,
        advertising: formData.get("action_advertising") as string,
    };

    await prisma.joinGate.upsert({
        where: { guildId },
        update: {
            enabled,
            accountAgeMinDays,
            avatarRequired,
            botAdditionPolicy,
            unverifiedBotPolicy,
            advertisingProfileRule,
            actions,
        },
        create: {
            guildId,
            enabled,
            accountAgeMinDays,
            avatarRequired,
            botAdditionPolicy,
            unverifiedBotPolicy,
            advertisingProfileRule,
            actions,
        }
    });

    revalidatePath(`/dashboard/${guildId}/joingate`);
}

export default async function JoinGatePage({
    params,
}: {
    params: Promise<{ guildId: string }>;
}) {
    const { guildId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const config = await prisma.joinGate.findUnique({
        where: { guildId },
    });

    const actions = config?.actions as any || {
        accountAge: "quarantine",
        avatar: "quarantine",
        bot: "block",
        advertising: "quarantine"
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    Join Gate
                </h1>
                <p className="text-white/60 mt-2">
                    Filter new members before they can access your server.
                </p>
            </header>

            <form action={updateJoinGate} className="space-y-8">
                <input type="hidden" name="guildId" value={guildId} />

                {/* Master Switch */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Enable Join Gate</h3>
                        <p className="text-white/50 text-sm">Strictly filter all incoming members</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="enabled"
                            defaultChecked={config?.enabled ?? false}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Age */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-blue-400">👶</span> Account Age
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Min Age (Days)</label>
                                <input
                                    type="number"
                                    name="accountAgeMinDays"
                                    defaultValue={config?.accountAgeMinDays ?? 7}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Action on Fail</label>
                                <select
                                    name="action_accountAge"
                                    defaultValue={actions.accountAge}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="quarantine">Quarantine</option>
                                    <option value="kick">Kick</option>
                                    <option value="ban">Ban</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Avatar Requirement */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">🖼️</span> Avatar Policy
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <label className="text-sm text-white/70">Require Avatar?</label>
                                <input
                                    type="checkbox"
                                    name="avatarRequired"
                                    defaultChecked={config?.avatarRequired ?? false}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Action on Fail</label>
                                <select
                                    name="action_avatar"
                                    defaultValue={actions.avatar}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="quarantine">Quarantine</option>
                                    <option value="kick">Kick</option>
                                    <option value="ban">Ban</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bot Policy */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-gray-400">🤖</span> Bot Addition
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">General Policy</label>
                                <select
                                    name="botAdditionPolicy"
                                    defaultValue={config?.botAdditionPolicy ?? "allow"}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="allow">Allow All Bots</option>
                                    <option value="block">Block All Bots</option>
                                    <option value="quarantine">Quarantine Bots</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Unverified Bots</label>
                                <select
                                    name="unverifiedBotPolicy"
                                    defaultValue={config?.unverifiedBotPolicy ?? "allow"}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="allow">Allow</option>
                                    <option value="kick">Kick</option>
                                    <option value="ban">Ban</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Advertising */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-yellow-400">📢</span> Profile Ads
                        </h3>
                        <div className="space-y-4">
                            <p className="text-xs text-white/40">Detects discord.gg links in status/bio</p>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Action</label>
                                <select
                                    name="advertisingProfileRule"
                                    defaultValue={config?.advertisingProfileRule ?? "ignore"}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="ignore">Ignore</option>
                                    <option value="warn">Warn</option>
                                    <option value="quarantine">Quarantine</option>
                                    <option value="kick">Kick</option>
                                    <option value="ban">Ban</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-900/20"
                    >
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
