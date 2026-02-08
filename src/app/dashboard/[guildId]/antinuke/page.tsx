import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Server Action to update Anti-Nuke settings
async function updateAntiNuke(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    if (!guildId) return;

    const enabled = formData.get("enabled") === "on";

    // Parse limits
    const minuteLimits = {
        ban: parseInt(formData.get("minute_ban") as string) || 5,
        kick: parseInt(formData.get("minute_kick") as string) || 10,
        channelDelete: parseInt(formData.get("minute_channelDelete") as string) || 3,
        roleDelete: parseInt(formData.get("minute_roleDelete") as string) || 3,
    };

    const hourLimits = {
        ban: parseInt(formData.get("hour_ban") as string) || 20,
        kick: parseInt(formData.get("hour_kick") as string) || 50,
        channelDelete: parseInt(formData.get("hour_channelDelete") as string) || 10,
        roleDelete: parseInt(formData.get("hour_roleDelete") as string) || 10,
    };

    const responses = {
        ban: formData.get("response_ban") as string,
        kick: formData.get("response_kick") as string,
        channelDelete: formData.get("response_channelDelete") as string,
        roleDelete: formData.get("response_roleDelete") as string,
    };

    await prisma.antiNukeLimits.upsert({
        where: { guildId },
        update: {
            enabled,
            minuteLimits,
            hourLimits,
            responses,
        },
        create: {
            guildId,
            enabled,
            minuteLimits,
            hourLimits,
            responses,
        }
    });

    revalidatePath(`/dashboard/${guildId}/antinuke`);
}

export default async function AntiNukePage({
    params,
}: {
    params: Promise<{ guildId: string }>;
}) {
    const { guildId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const config = await prisma.antiNukeLimits.findUnique({
        where: { guildId },
    });

    // Default values if no config exists
    const limits = config?.minuteLimits as any || { ban: 5, kick: 10, channelDelete: 3, roleDelete: 3 };
    const hLimits = config?.hourLimits as any || { ban: 20, kick: 50, channelDelete: 10, roleDelete: 10 };
    const responses = config?.responses as any || { ban: "quarantine", kick: "quarantine", channelDelete: "quarantine", roleDelete: "quarantine" };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">
                    Anti-Nuke Configuration
                </h1>
                <p className="text-white/60 mt-2">
                    Configure thresholds to prevent mass destruction of your server.
                </p>
            </header>

            <form action={updateAntiNuke} className="space-y-8">
                <input type="hidden" name="guildId" value={guildId} />

                {/* Master Switch */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Enable Anti-Nuke</h3>
                        <p className="text-white/50 text-sm">Globally enable or disable protection</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="enabled"
                            defaultChecked={config?.enabled ?? true}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                </div>

                {/* Limits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bans */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-rose-500">🛡️</span> Mass Bans
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Max Bans per Minute</label>
                                <input
                                    type="number"
                                    name="minute_ban"
                                    defaultValue={limits.ban}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Action on Trigger</label>
                                <select
                                    name="response_ban"
                                    defaultValue={responses.ban}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                >
                                    <option value="quarantine">Quarantine Manager</option>
                                    <option value="kick">Kick Manager</option>
                                    <option value="ban">Ban Manager</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Kicks */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-orange-500">👢</span> Mass Kicks
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Max Kicks per Minute</label>
                                <input
                                    type="number"
                                    name="minute_kick"
                                    defaultValue={limits.kick}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Action on Trigger</label>
                                <select
                                    name="response_kick"
                                    defaultValue={responses.kick}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                >
                                    <option value="quarantine">Quarantine Manager</option>
                                    <option value="kick">Kick Manager</option>
                                    <option value="ban">Ban Manager</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Channel Deletion */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-red-500">🗑️</span> Channel Deletion
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Max Deletes per Minute</label>
                                <input
                                    type="number"
                                    name="minute_channelDelete"
                                    defaultValue={limits.channelDelete}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Action on Trigger</label>
                                <select
                                    name="response_channelDelete"
                                    defaultValue={responses.channelDelete}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                >
                                    <option value="quarantine">Quarantine Manager</option>
                                    <option value="kick">Kick Manager</option>
                                    <option value="ban">Ban Manager</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Role Deletion */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <span className="text-yellow-500">🏷️</span> Role Deletion
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Max Deletes per Minute</label>
                                <input
                                    type="number"
                                    name="minute_roleDelete"
                                    defaultValue={limits.roleDelete}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Action on Trigger</label>
                                <select
                                    name="response_roleDelete"
                                    defaultValue={responses.roleDelete}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                                >
                                    <option value="quarantine">Quarantine Manager</option>
                                    <option value="kick">Kick Manager</option>
                                    <option value="ban">Ban Manager</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg shadow-rose-900/20"
                    >
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
