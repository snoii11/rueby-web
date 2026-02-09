import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { REST } from "@discordjs/rest";
import { Routes, APIChannel, APIRole, ChannelType } from "discord-api-types/v10";
import { revalidatePath } from "next/cache";
import PillSelect from "@/components/ui/PillSelect";
import ChannelSelect from "@/components/ui/ChannelSelect";
import RoleSelect from "@/components/ui/RoleSelect";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import VerificationActions from "@/components/dashboard/VerificationActions";

async function updateVerification(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    if (!guildId) return;

    const enabled = formData.get("enabled") === "on";
    const mode = formData.get("mode") as "NONE" | "BUTTON" | "CAPTCHA" | "WEB";
    const actionOnFail = formData.get("actionOnFail") as "NONE" | "QUARANTINE" | "KICK" | "BAN";
    const target = formData.get("target") as "ALL" | "SUSPICIOUS";

    const verificationChannelId = formData.get("verificationChannelId") as string || null;
    const verifiedRoleId = formData.get("verifiedRoleId") as string || null;

    const captchaTimeout = parseInt(formData.get("captchaTimeout") as string) || 300;
    const captchaMaxAttempts = parseInt(formData.get("captchaMaxAttempts") as string) || 3;

    const welcomeMessage = formData.get("welcomeMessage") as string || null;
    const successMessage = formData.get("successMessage") as string || null;
    const failMessage = formData.get("failMessage") as string || null;

    await prisma.verificationSettings.upsert({
        where: { guildId },
        update: {
            enabled,
            mode,
            actionOnFail,
            target,
            verificationChannelId,
            verifiedRoleId,
            captchaTimeout,
            captchaMaxAttempts,
            welcomeMessage,
            successMessage,
            failMessage
        },
        create: {
            guildId,
            enabled,
            mode,
            actionOnFail,
            target,
            verificationChannelId,
            verifiedRoleId,
            captchaTimeout,
            captchaMaxAttempts,
            welcomeMessage,
            successMessage,
            failMessage
        }
    });

    revalidatePath(`/dashboard/${guildId}/verification`);
}

export default async function VerificationPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const settings = await prisma.verificationSettings.findUnique({
        where: { guildId }
    });

    // Fetch Channels and Roles from Discord
    // Fetch Channels and Roles from Discord
    let channels: APIChannel[] = [];
    let roles: APIRole[] = [];
    let discordError = null;

    try {
        const token = process.env.DISCORD_TOKEN;
        if (!token) throw new Error("DISCORD_TOKEN is not set in environment variables");

        const rest = new REST({ version: '10' }).setToken(token);

        // Parallel fetch for speed
        const [channelsData, rolesData] = await Promise.all([
            rest.get(Routes.guildChannels(guildId)) as Promise<APIChannel[]>,
            rest.get(Routes.guildRoles(guildId)) as Promise<APIRole[]>
        ]);

        channels = channelsData;
        roles = rolesData;
    } catch (e: any) {
        console.error("Failed to fetch guild data from Discord:", e);
        discordError = e.message || "Unknown error";
    }

    if (discordError) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200">
                <h3 className="text-xl font-bold mb-2">Failed to load Discord Data</h3>
                <p className="mb-4">Could not fetch channels and roles from Discord.</p>
                <div className="bg-black/40 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                    {discordError}
                </div>
                <p className="mt-4 text-sm text-red-300/60">
                    Check if the Bot is in the server and `DISCORD_TOKEN` is correct.
                </p>
            </div>
        );
    }

    // Filter text-based channels (text, announcements, voice, etc.)
    const textChannels = channels.filter(c =>
        c.type === ChannelType.GuildText ||
        c.type === ChannelType.GuildAnnouncement ||
        c.type === ChannelType.GuildVoice
    );

    // Debug: Log counts (will show in Vercel logs)
    console.log(`[Verification Page] Guild ${guildId}: ${channels.length} channels fetched, ${textChannels.length} after filter, ${roles.length} roles`);

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600">
                Verification System
            </h1>
            <p className="text-gray-400 text-lg">Ensure every member is human before they join.</p>

            <form action={updateVerification} className="space-y-8">
                <input type="hidden" name="guildId" value={guildId} />

                {/* Main Toggle */}
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                    <div>
                        <h3 className="font-semibold text-xl text-white">Enable Verification</h3>
                        <p className="text-sm text-gray-400">Turn the entire verification system on or off.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group">
                        <input type="checkbox" name="enabled" className="sr-only peer" defaultChecked={settings?.enabled ?? false} />
                        <div className="w-14 h-8 bg-black/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-600 peer-checked:to-red-600 shadow-inner"></div>
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/5 group-hover:ring-white/20 transition-all"></div>
                    </label>
                </div>

                {/* Mode & Target */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">🛡️</span>
                            </div>
                            <h3 className="font-semibold text-white">Verification Mode</h3>
                        </div>
                        <PillSelect
                            name="mode"
                            defaultValue={settings?.mode ?? "BUTTON"}
                            columns={2}
                            options={[
                                { label: 'Button', value: 'BUTTON', icon: '🔘' },
                                { label: 'Captcha', value: 'CAPTCHA', icon: '🔐' },
                                { label: 'Web Portal', value: 'WEB', icon: '🌐' },
                                { label: 'None', value: 'NONE', icon: '⏸️' }
                            ]}
                        />
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">🎯</span>
                            </div>
                            <h3 className="font-semibold text-white">Target Range</h3>
                        </div>
                        <PillSelect
                            name="target"
                            defaultValue={settings?.target ?? "ALL"}
                            columns={2}
                            options={[
                                { label: 'All Users', value: 'ALL', icon: '👥' },
                                { label: 'Suspicious Only', value: 'SUSPICIOUS', icon: '🔍' }
                            ]}
                        />
                    </div>
                </div>

                {/* Channel & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">📢</span>
                            </div>
                            <h3 className="font-semibold text-white">Verification Channel</h3>
                        </div>
                        <ChannelSelect
                            name="verificationChannelId"
                            defaultValue={settings?.verificationChannelId ?? ""}
                            channels={textChannels.map(c => ({
                                label: c.name,
                                value: c.id,
                                type: c.type === 0 ? 'text' : c.type === 2 ? 'voice' : 'announcement'
                            }))}
                        />
                        <p className="text-xs text-gray-500 font-medium pt-2">Where the verification prompt will be sent.</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                <span className="text-xl">🏅</span>
                            </div>
                            <h3 className="font-semibold text-white">Verified Role</h3>
                        </div>
                        <RoleSelect
                            name="verifiedRoleId"
                            defaultValue={settings?.verifiedRoleId ?? ""}
                            roles={roles.map(r => ({
                                label: r.name,
                                value: r.id,
                                color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : undefined
                            }))}
                        />
                        <p className="text-xs text-gray-500 font-medium pt-2">Role given after successful verification.</p>
                    </div>
                </div>

                {/* Failure Action */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <h3 className="block text-sm font-medium text-gray-300">Action on Fail / Timeout</h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {['NONE', 'QUARANTINE', 'KICK', 'BAN'].map((action) => (
                            <label key={action} className="relative cursor-pointer group">
                                <input type="radio" name="actionOnFail" value={action} defaultChecked={(settings?.actionOnFail ?? "QUARANTINE") === action} className="sr-only peer" />
                                <div className="px-6 py-3 rounded-xl border border-white/10 bg-black/20 text-gray-400 peer-checked:bg-rose-500/20 peer-checked:border-rose-500 peer-checked:text-rose-400 transition-all group-hover:bg-white/5">
                                    <span className="font-bold tracking-wider">{action}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Timeout (Seconds)</label>
                        <input type="number" name="captchaTimeout" defaultValue={settings?.captchaTimeout ?? 300} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all placeholder-white/20" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Max Attempts</label>
                        <input type="number" name="captchaMaxAttempts" defaultValue={settings?.captchaMaxAttempts ?? 3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all placeholder-white/20" />
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                    <VerificationActions guildId={guildId} />
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
