import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { REST } from "@discordjs/rest";
import { Routes, APIChannel, APIRole, ChannelType } from "discord-api-types/v10";
import { revalidatePath } from "next/cache";

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

export default async function VerificationPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { guildId } = params;

    const settings = await prisma.verificationSettings.findUnique({
        where: { guildId }
    });

    // Fetch Channels and Roles from Discord
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    let channels: APIChannel[] = [];
    let roles: APIRole[] = [];

    try {
        channels = await rest.get(Routes.guildChannels(guildId)) as APIChannel[];
        roles = await rest.get(Routes.guildRoles(guildId)) as APIRole[];
    } catch (e) {
        console.error("Failed to fetch guild data from Discord", e);
    }

    // Filter text channels
    const textChannels = channels.filter(c => c.type === ChannelType.GuildText);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                Verification System
            </h1>
            <p className="text-gray-400">Ensure every member is human before they join.</p>

            <form action={updateVerification} className="space-y-8 bg-black/20 p-6 rounded-xl border border-white/10 backdrop-blur-md">
                <input type="hidden" name="guildId" value={guildId} />

                {/* Main Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                        <h3 className="font-semibold text-white">Enable Verification</h3>
                        <p className="text-sm text-gray-400">Turn the entire verification system on or off.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="enabled" className="sr-only peer" defaultChecked={settings?.enabled ?? false} />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>

                {/* Mode & Target */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Verification Mode</label>
                        <select name="mode" defaultValue={settings?.mode ?? "BUTTON"} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500">
                            <option value="BUTTON">Button Interaction</option>
                            <option value="CAPTCHA">Captcha Image</option>
                            <option value="WEB">Web Portal (Coming Soon)</option>
                            <option value="NONE">None</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Target Range</label>
                        <select name="target" defaultValue={settings?.target ?? "ALL"} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500">
                            <option value="ALL">All Users</option>
                            <option value="SUSPICIOUS">Suspicious Only (New Accounts)</option>
                        </select>
                    </div>
                </div>

                {/* Channel & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Verification Channel</label>
                        <select name="verificationChannelId" defaultValue={settings?.verificationChannelId ?? ""} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500">
                            <option value="">Select a Channel...</option>
                            {textChannels.map(c => (
                                <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">Where the verification prompt will be sent.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Verified Role</label>
                        <select name="verifiedRoleId" defaultValue={settings?.verifiedRoleId ?? ""} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500">
                            <option value="">Select a Role...</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id} style={{ color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : 'inherit' }}>
                                    @{r.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">Role given after successful verification.</p>
                    </div>
                </div>

                {/* Failure Action */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Action on Fail / Timeout</label>
                    <div className="flex space-x-4">
                        {['NONE', 'QUARANTINE', 'KICK', 'BAN'].map((action) => (
                            <label key={action} className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="actionOnFail" value={action} defaultChecked={(settings?.actionOnFail ?? "QUARANTINE") === action} className="form-radio text-green-500 bg-black/50 border-white/10" />
                                <span className="text-white capitalize">{action.toLowerCase()}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Timeout (Seconds)</label>
                        <input type="number" name="captchaTimeout" defaultValue={settings?.captchaTimeout ?? 300} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Max Attempts</label>
                        <input type="number" name="captchaMaxAttempts" defaultValue={settings?.captchaMaxAttempts ?? 3} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-green-500/20">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
