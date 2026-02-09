import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import PillSelect from "@/components/ui/PillSelect";
import CustomCheckbox from "@/components/ui/CustomCheckbox";

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

                {/* Custom Toggle Switch */}
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                    <div>
                        <h3 className="font-semibold text-xl text-white">Enable Join Gate</h3>
                        <p className="text-sm text-gray-400">Strictly filter all incoming members</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group">
                        <input type="checkbox" name="enabled" className="sr-only peer" defaultChecked={config?.enabled ?? false} />
                        <div className="w-14 h-8 bg-black/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-600 peer-checked:to-red-600 shadow-inner"></div>
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/5 group-hover:ring-white/20 transition-all"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Account Age */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">👶</span>
                            </div>
                            <h3 className="font-semibold text-white">Account Age</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Min Age (Days)</label>
                            <input type="number" name="accountAgeMinDays" defaultValue={config?.accountAgeMinDays ?? 7} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all placeholder-white/20" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <PillSelect
                                name="action_accountAge"
                                defaultValue={actions.accountAge}
                                columns={3}
                                options={[
                                    { label: 'Quarantine', value: 'quarantine', icon: '🔒' },
                                    { label: 'Kick', value: 'kick', icon: '👢' },
                                    { label: 'Ban', value: 'ban', icon: '🔨' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Avatar Policy */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">🖼️</span>
                            </div>
                            <h3 className="font-semibold text-white">Avatar Policy</h3>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                            <label className="text-sm font-medium text-gray-300">Require Avatar?</label>
                            <CustomCheckbox name="avatarRequired" defaultChecked={config?.avatarRequired} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <PillSelect
                                name="action_avatar"
                                defaultValue={actions.avatar}
                                columns={3}
                                options={[
                                    { label: 'Quarantine', value: 'quarantine', icon: '🔒' },
                                    { label: 'Kick', value: 'kick', icon: '👢' },
                                    { label: 'Ban', value: 'ban', icon: '🔨' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Bot Addition */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">🤖</span>
                            </div>
                            <h3 className="font-semibold text-white">Bot Addition</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Policy</label>
                            <PillSelect
                                name="botAdditionPolicy"
                                defaultValue={config?.botAdditionPolicy ?? "allow"}
                                columns={3}
                                options={[
                                    { label: 'Allow All', value: 'allow', icon: '✅' },
                                    { label: 'Block All', value: 'block', icon: '🚫' },
                                    { label: 'Verified Only', value: 'verified_only', icon: '✓' }
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <PillSelect
                                name="action_bot"
                                defaultValue={actions.bot}
                                columns={2}
                                options={[
                                    { label: 'Kick Bot', value: 'block', icon: '🤖' },
                                    { label: 'Quarantine Inviter', value: 'quarantine', icon: '🔒' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Profile Ads */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">📢</span>
                            </div>
                            <h3 className="font-semibold text-white">Profile Ads</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Detection Rule</label>
                            <PillSelect
                                name="advertisingProfileRule"
                                defaultValue={config?.advertisingProfileRule ?? "ignore"}
                                columns={3}
                                options={[
                                    { label: 'Ignore', value: 'ignore', icon: '👀' },
                                    { label: 'Warn', value: 'warn', icon: '⚠️' },
                                    { label: 'Strict', value: 'strict', icon: '🚨' }
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <PillSelect
                                name="action_advertising"
                                defaultValue={actions.advertising}
                                columns={3}
                                options={[
                                    { label: 'Quarantine', value: 'quarantine', icon: '🔒' },
                                    { label: 'Kick', value: 'kick', icon: '👢' },
                                    { label: 'Ban', value: 'ban', icon: '🔨' }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20 flex items-center justify-center space-x-2">
                        <span>Save Configuration</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
