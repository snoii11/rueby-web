import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { REST } from "@discordjs/rest";
import { Routes, ChannelType, type APIChannel, type APIRole } from "discord-api-types/v10";
import SetupWizardClient from "./SetupWizardClient";

// Server action to save all wizard settings
async function saveWizardSettings(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    const guildId = formData.get("guildId") as string;
    const settingsJson = formData.get("settings") as string;

    if (!guildId || !settingsJson) return { error: "Missing data" };

    try {
        const settings = JSON.parse(settingsJson);

        // Update Guild (basic settings)
        await prisma.guild.upsert({
            where: { id: guildId },
            update: {
                prefix: settings.prefix,
                timezone: settings.timezone,
            },
            create: {
                id: guildId,
                ownerId: (session as any).user?.id || "unknown",
                prefix: settings.prefix,
                timezone: settings.timezone,
            },
        });

        // Update Verification Settings
        await prisma.verificationSettings.upsert({
            where: { guildId },
            update: {
                enabled: settings.verification.enabled,
                mode: settings.verification.mode,
                verificationChannelId: settings.verification.channelId || null,
                verifiedRoleId: settings.verification.roleId || null,
                actionOnFail: settings.verification.failAction?.toUpperCase() || "NONE",
            },
            create: {
                guildId,
                enabled: settings.verification.enabled,
                mode: settings.verification.mode,
                verificationChannelId: settings.verification.channelId || null,
                verifiedRoleId: settings.verification.roleId || null,
                actionOnFail: settings.verification.failAction?.toUpperCase() || "NONE",
            },
        });

        // Update Join Gate
        await prisma.joinGate.upsert({
            where: { guildId },
            update: {
                enabled: settings.joinGate.enabled,
                accountAgeMinDays: settings.joinGate.accountAgeMinDays,
                avatarRequired: settings.joinGate.avatarRequired,
                botAdditionPolicy: settings.joinGate.botAdditionPolicy,
            },
            create: {
                guildId,
                enabled: settings.joinGate.enabled,
                accountAgeMinDays: settings.joinGate.accountAgeMinDays,
                avatarRequired: settings.joinGate.avatarRequired,
                botAdditionPolicy: settings.joinGate.botAdditionPolicy,
            },
        });

        // Update Log Routing
        await prisma.logsRouting.upsert({
            where: { guildId },
            update: {
                antinukeChannel: settings.logs.antinukeChannel || null,
                moderationChannel: settings.logs.moderationChannel || null,
                verificationChannel: settings.logs.verificationChannel || null,
                fallbackChannelId: settings.logs.fallbackChannel || null,
            },
            create: {
                guildId,
                antinukeChannel: settings.logs.antinukeChannel || null,
                moderationChannel: settings.logs.moderationChannel || null,
                verificationChannel: settings.logs.verificationChannel || null,
                fallbackChannelId: settings.logs.fallbackChannel || null,
            },
        });

        // Update Permits - delete existing and recreate
        await prisma.permit.deleteMany({ where: { guildId } });
        if (settings.permits.length > 0) {
            await prisma.permit.createMany({
                data: settings.permits.map((p: { roleId: string; level: number }) => ({
                    guildId,
                    roleId: p.roleId,
                    level: `L${p.level}` as any, // PermitLevel enum is L1, L2, etc.
                })),
            });
        }

        // Automatic Verification Setup
        if (settings.verification.enabled) {
            // Import dynamically to avoid circular dependencies if any, though here it's fine
            const { sendVerificationPanel, setupVerificationPermissions } = await import("@/actions/verification");

            // Send Panel
            await sendVerificationPanel(guildId);

            // Setup Permissions if requested
            if (settings.verification.lockdown) {
                await setupVerificationPermissions(guildId);
            }
        }

        revalidatePath(`/dashboard/${guildId}`);
        return { success: true };
    } catch (err: any) {
        console.error("Failed to save wizard settings:", err);
        return { error: err.message || "Failed to save settings" };
    }
}

export default async function SetupWizardPage({
    params,
}: {
    params: Promise<{ guildId: string }>;
}) {
    const { guildId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Fetch Discord data
    let channels: APIChannel[] = [];
    let roles: APIRole[] = [];
    let guildName = "Your Server";

    try {
        const token = process.env.DISCORD_TOKEN;
        if (!token) throw new Error("Bot token not configured");

        const rest = new REST({ version: '10' }).setToken(token);

        const [channelsData, rolesData] = await Promise.all([
            rest.get(Routes.guildChannels(guildId)) as Promise<APIChannel[]>,
            rest.get(Routes.guildRoles(guildId)) as Promise<APIRole[]>,
        ]);

        channels = channelsData.filter(c =>
            c.type === ChannelType.GuildText ||
            c.type === ChannelType.GuildAnnouncement
        );
        roles = rolesData.sort((a, b) => b.position - a.position);
    } catch (err) {
        console.error("Failed to fetch Discord data:", err);
    }

    // Fetch existing settings if any
    const [guild, verification, joinGate, logRouting, permits] = await Promise.all([
        prisma.guild.findUnique({ where: { id: guildId } }),
        prisma.verificationSettings.findUnique({ where: { guildId } }),
        prisma.joinGate.findUnique({ where: { guildId } }),
        prisma.logsRouting.findUnique({ where: { guildId } }),
        prisma.permit.findMany({ where: { guildId } }),
    ]);

    const initialData = {
        prefix: guild?.prefix || "!",
        timezone: guild?.timezone || "UTC",
        verification: {
            enabled: verification?.enabled ?? false,
            mode: verification?.mode || "BUTTON",
            channelId: verification?.verificationChannelId || "",
            roleId: verification?.verifiedRoleId || "",

            failAction: verification?.actionOnFail?.toLowerCase() || "none",
            lockdown: false,
        },
        joinGate: {
            enabled: joinGate?.enabled ?? false,
            accountAgeMinDays: joinGate?.accountAgeMinDays ?? 7,
            avatarRequired: joinGate?.avatarRequired ?? false,
            botAdditionPolicy: joinGate?.botAdditionPolicy || "allow",
        },
        logs: {
            antinukeChannel: logRouting?.antinukeChannel || "",
            moderationChannel: logRouting?.moderationChannel || "",
            verificationChannel: logRouting?.verificationChannel || "",
            fallbackChannel: logRouting?.fallbackChannelId || "",
        },
        permits: permits.map(p => ({
            roleId: p.roleId,
            level: parseInt(p.level.replace('L', ''))
        })),
    };

    return (
        <SetupWizardClient
            guildId={guildId}
            guildName={guildName}
            channels={channels.map(c => ({ id: c.id, name: c.name || '', type: c.type }))}
            roles={roles.map(r => ({ id: r.id, name: r.name, color: r.color }))}
            initialData={initialData}
            saveAction={saveWizardSettings}
        />
    );
}
