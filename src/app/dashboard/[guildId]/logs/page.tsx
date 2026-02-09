import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { REST } from "@discordjs/rest";
import { Routes, APIChannel, ChannelType } from "discord-api-types/v10";
import CustomSelect from "@/components/ui/CustomSelect";

// Server action to update logs routing
async function updateLogs(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    if (!guildId) return;

    const getChannel = (key: string) => {
        const val = formData.get(key) as string;
        return val || null;
    };

    await prisma.logsRouting.upsert({
        where: { guildId },
        update: {
            automodChannel: getChannel("automodChannel"),
            antinukeChannel: getChannel("antinukeChannel"),
            verificationChannel: getChannel("verificationChannel"),
            joingateChannel: getChannel("joingateChannel"),
            joinraidChannel: getChannel("joinraidChannel"),
            panicChannel: getChannel("panicChannel"),
            reportsChannel: getChannel("reportsChannel"),
            moderationChannel: getChannel("moderationChannel"),
            fallbackChannelId: getChannel("fallbackChannelId")
        },
        create: {
            guildId,
            automodChannel: getChannel("automodChannel"),
            antinukeChannel: getChannel("antinukeChannel"),
            verificationChannel: getChannel("verificationChannel"),
            joingateChannel: getChannel("joingateChannel"),
            joinraidChannel: getChannel("joinraidChannel"),
            panicChannel: getChannel("panicChannel"),
            reportsChannel: getChannel("reportsChannel"),
            moderationChannel: getChannel("moderationChannel"),
            fallbackChannelId: getChannel("fallbackChannelId")
        }
    });

    revalidatePath(`/dashboard/${guildId}/logs`);
}

export default async function LogsPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { guildId } = params;

    const routing = await prisma.logsRouting.findUnique({
        where: { guildId }
    });

    // Fetch channels
    let channels: APIChannel[] = [];
    let discordError = null;

    try {
        const token = process.env.DISCORD_TOKEN;
        if (!token) throw new Error("DISCORD_TOKEN missing");

        const rest = new REST({ version: '10' }).setToken(token);
        channels = await rest.get(Routes.guildChannels(guildId)) as APIChannel[];
    } catch (e: any) {
        console.error("Failed to fetch channels", e);
        discordError = e.message;
    }

    if (discordError) {
        return <div className="p-4 text-red-400 bg-red-900/20 rounded-xl border border-red-500/20">Error loading channels: {discordError}</div>;
    }

    const textChannels = channels
        .filter(c => c.type === ChannelType.GuildText)
        .map(c => ({
            label: `#${c.name}`,
            value: c.id
        }));

    const LogCategory = ({ title, icon, color, items }: any) => (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-6 shadow-lg hover:border-white/20 transition-all mb-8">
            <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 bg-${color}-500/20 rounded-lg text-${color}-400`}>
                    <span className="text-xl">{icon}</span>
                </div>
                <h3 className="font-semibold text-white text-lg">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item: any) => (
                    <div key={item.key} className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">{item.label}</label>
                        <CustomSelect
                            name={item.key}
                            defaultValue={routing?.[item.key as keyof typeof routing] as string ?? ""}
                            placeholder="Select a Channel..."
                            options={textChannels}
                            icon={<span className="text-gray-500">#</span>}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600">
                    Log Routing
                </h1>
                <p className="text-white/60 mt-2">
                    Direct security events to specific channels.
                </p>
            </header>

            <form action={updateLogs}>
                <input type="hidden" name="guildId" value={guildId} />

                <LogCategory
                    title="Security & Protection"
                    icon="🛡️"
                    color="rose"
                    items={[
                        { key: "antinukeChannel", label: "Anti-Nuke Logs" },
                        { key: "panicChannel", label: "Panic Mode Events" }
                    ]}
                />

                <LogCategory
                    title="Gatekeeping"
                    icon="🚪"
                    color="indigo"
                    items={[
                        { key: "joingateChannel", label: "Join Gate Rejections" },
                        { key: "verificationChannel", label: "Verification Attempts" },
                        { key: "joinraidChannel", label: "Join Raid Alerts" }
                    ]}
                />

                <LogCategory
                    title="Moderation"
                    icon="🔨"
                    color="amber"
                    items={[
                        { key: "moderationChannel", label: "Mod Actions (Kick/Ban)" },
                        { key: "automodChannel", label: "Heat / AutoMod" },
                        { key: "reportsChannel", label: "User Reports" }
                    ]}
                />

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4 shadow-lg hover:border-white/20 transition-all">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gray-500/20 rounded-lg text-gray-400">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <h3 className="font-semibold text-white text-lg">Fallback</h3>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Default Channel</label>
                        <CustomSelect
                            name="fallbackChannelId"
                            defaultValue={routing?.fallbackChannelId ?? ""}
                            placeholder="Select a Channel..."
                            options={textChannels}
                        />
                        <p className="text-xs text-gray-500">Used if a specific route is not configured.</p>
                    </div>
                </div>

                <div className="pt-8">
                    <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20 flex items-center justify-center space-x-2">
                        <span>Save Routing</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
