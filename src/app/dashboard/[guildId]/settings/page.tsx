import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { REST } from "@discordjs/rest";
import { Routes, APIRole } from "discord-api-types/v10";
import PillSelect from "@/components/ui/PillSelect";
import RoleSelect from "@/components/ui/RoleSelect";

// Server action to update settings
async function updateSettings(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    if (!guildId) return;

    const prefix = formData.get("prefix") as string;
    const timezone = formData.get("timezone") as string;
    const muteRole = formData.get("muteRole") as string;
    const quarantineRole = formData.get("quarantineRole") as string;

    await prisma.guild.update({
        where: { id: guildId },
        data: {
            prefix,
            timezone,
            muteRole: muteRole || null,
            quarantineRole: quarantineRole || null
        }
    });

    revalidatePath(`/dashboard/${guildId}/settings`);
}

export default async function SettingsPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const guild = await prisma.guild.findUnique({
        where: { id: guildId }
    });

    if (!guild) return <div>Guild not found</div>;

    // Fetch roles
    let roles: APIRole[] = [];
    let discordError = null;

    try {
        const token = process.env.DISCORD_TOKEN;
        if (!token) throw new Error("DISCORD_TOKEN missing");

        const rest = new REST({ version: '10' }).setToken(token);
        roles = await rest.get(Routes.guildRoles(guildId)) as APIRole[];
    } catch (e: any) {
        console.error("Failed to fetch roles", e);
        discordError = e.message;
    }

    if (discordError) {
        return <div className="p-4 text-red-400 bg-red-900/20 rounded-xl border border-red-500/20">Error: {discordError}</div>;
    }

    const roleOptions = roles.map(r => ({
        label: r.name,
        value: r.id,
        color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : undefined
    }));

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600">
                    General Settings
                </h1>
                <p className="text-white/60 mt-2">
                    Configure core bot behavior for this server.
                </p>
            </header>

            <form action={updateSettings} className="space-y-8">
                <input type="hidden" name="guildId" value={guildId} />

                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Prefix */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Prefix</label>
                            <input
                                type="text"
                                name="prefix"
                                defaultValue={guild.prefix}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all placeholder-white/20 font-mono"
                                placeholder="!"
                            />
                            <p className="text-xs text-gray-500">The character(s) used to trigger bot commands.</p>
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Timezone</label>
                            <PillSelect
                                name="timezone"
                                defaultValue={guild.timezone}
                                columns={3}
                                options={[
                                    { label: 'UTC', value: 'UTC' },
                                    { label: 'EST', value: 'America/New_York' },
                                    { label: 'PST', value: 'America/Los_Angeles' },
                                    { label: 'CST', value: 'America/Chicago' },
                                    { label: 'GMT', value: 'Europe/London' },
                                    { label: 'CET', value: 'Europe/Paris' },
                                    { label: 'IST', value: 'Asia/Kolkata' },
                                    { label: 'JST', value: 'Asia/Tokyo' },
                                    { label: 'AEST', value: 'Australia/Sydney' },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="border-t border-white/5 my-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Mute Role */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Mute Role</label>
                            <RoleSelect
                                name="muteRole"
                                defaultValue={guild.muteRole || ""}
                                roles={roleOptions}
                            />
                            <p className="text-xs text-gray-500">Role assigned when a user is muted.</p>
                        </div>

                        {/* Quarantine Role */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Quarantine Role</label>
                            <RoleSelect
                                name="quarantineRole"
                                defaultValue={guild.quarantineRole || ""}
                                roles={roleOptions}
                            />
                            <p className="text-xs text-gray-500">Role assigned when a user is flagged by security systems.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20 flex items-center justify-center space-x-2">
                        <span>Save Settings</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
