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

                {/* Custom Toggle Switch */}
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                    <div>
                        <h3 className="font-semibold text-xl text-white">Enable Join Gate</h3>
                        <p className="text-sm text-gray-400">Strictly filter all incoming members</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group">
                        <input type="checkbox" name="enabled" className="sr-only peer" defaultChecked={settings?.enabled ?? false} />
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
                            <input type="number" name="accountAgeMinDays" defaultValue={settings?.accountAgeMinDays ?? 7} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all placeholder-white/20" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <div className="relative">
                                <select name="action_accountAge" defaultValue={activeActions.accountAge} className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all cursor-pointer hover:bg-white/5">
                                    <option value="quarantine">Quarantine</option>
                                    <option value="kick">Kick</option>
                                    <option value="ban">Ban</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
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
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="avatarRequired" className="sr-only peer" defaultChecked={settings?.avatarRequired ?? false} />
                                <div className="w-5 h-5 border-2 border-gray-500 rounded bg-transparent peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <div className="relative">
                                <select name="action_avatar" defaultValue={activeActions.avatar} className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all cursor-pointer hover:bg-white/5">
                                    <option value="quarantine">Quarantine</option>
                                    <option value="kick">Kick</option>
                                    <option value="ban">Ban</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
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
                            <div className="relative">
                                <select name="botAdditionPolicy" defaultValue={settings?.botAdditionPolicy ?? "allow"} className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all cursor-pointer hover:bg-white/5">
                                    <option value="allow">Allow All Bots</option>
                                    <option value="block">Block All Bots</option>
                                    <option value="verified_only">Verified Only</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <div className="relative">
                                <select name="action_bot" defaultValue={activeActions.bot} className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all cursor-pointer hover:bg-white/5">
                                    <option value="block">Kick Bot</option>
                                    <option value="quarantine">Quarantine Inviter</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
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
                            <div className="relative">
                                <select name="advertisingProfileRule" defaultValue={settings?.advertisingProfileRule ?? "ignore"} className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all cursor-pointer hover:bg-white/5">
                                    <option value="ignore">Ignore</option>
                                    <option value="warn">Warn User</option>
                                    <option value="strict">Strict (Discord Invites)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Action on Fail</label>
                            <div className="relative">
                                <select name="action_advertising" defaultValue={activeActions.advertising} className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all cursor-pointer hover:bg-white/5">
                                    <option value="quarantine">Quarantine</option>
                                    <option value="kick">Kick</option>
                                    <option value="ban">Ban</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
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
