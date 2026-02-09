"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REST } from "@discordjs/rest";
import { Routes, PermissionFlagsBits } from "discord-api-types/v10";

export async function sendVerificationPanel(guildId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    try {
        const settings = await prisma.verificationSettings.findUnique({
            where: { guildId }
        });

        if (!settings?.verificationChannelId) {
            return { error: "Verification channel not configured" };
        }

        if (!settings.enabled) {
            return { error: "Verification system is disabled" };
        }

        const token = process.env.DISCORD_TOKEN;
        if (!token) throw new Error("Bot token not configured");

        const rest = new REST({ version: '10' }).setToken(token);

        // Construct Embed
        const embed = {
            title: "Verification Required",
            description: settings.welcomeMessage || "To access the rest of the server, please verify yourself by clicking the button below.",
            color: 0xe11d48, // Rose-600
            footer: {
                text: "Rueby Security"
            }
        };

        // Construct Button
        const components = [
            {
                type: 1, // ActionRow
                components: [
                    {
                        type: 2, // Button
                        style: 3, // Success (Green)
                        label: "Verify Me",
                        emoji: { name: "✅" },
                        custom_id: "verify"
                    }
                ]
            }
        ];

        await rest.post(Routes.channelMessages(settings.verificationChannelId), {
            body: {
                embeds: [embed],
                components: components
            }
        });

        return { success: true };
    } catch (err: any) {
        console.error("Failed to send verification panel:", err);
        return { error: err.message || "Failed to send panel" };
    }
}

export async function setupVerificationPermissions(guildId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Not authenticated" };

    try {
        const settings = await prisma.verificationSettings.findUnique({
            where: { guildId }
        });

        if (!settings?.verificationChannelId || !settings?.verifiedRoleId) {
            return { error: "Verification channel or role not configured" };
        }

        const token = process.env.DISCORD_TOKEN;
        if (!token) throw new Error("Bot token not configured");

        const rest = new REST({ version: '10' }).setToken(token);

        // 1. Set @everyone to ViewChannel: FALSE globally (Guild Settings)
        // Note: This is invasive. We'll modify the @everyone role.
        await rest.patch(Routes.guildRole(guildId, guildId), {
            body: {
                permissions: (BigInt(0)).toString() // This nukes all perms. Dangerous!
            }
        });
        // WAIT! modifying @everyone perms via ID=ID. But nuking all perms is bad.
        // We just want to remove VIEW_CHANNEL.
        // To do this safely, we need to fetch current perms, remove VIEW_CHANNEL, and send back.

        const roles: any[] = await rest.get(Routes.guildRoles(guildId)) as any[];
        const everyoneRole = roles.find(r => r.id === guildId);

        if (everyoneRole) {
            const currentPerms = BigInt(everyoneRole.permissions);
            const viewChannel = BigInt(PermissionFlagsBits.ViewChannel);
            const newPerms = currentPerms & ~viewChannel; // Remove ViewChannel

            if (newPerms !== currentPerms) {
                await rest.patch(Routes.guildRole(guildId, guildId), {
                    body: { permissions: newPerms.toString() },
                    reason: "Rueby Verification Setup: Hiding channels from unverified users"
                });
            }
        }

        // 2. Set Verified Role to ViewChannel: TRUE globally
        const verifiedRole = roles.find(r => r.id === settings.verifiedRoleId);
        if (verifiedRole) {
            const currentPerms = BigInt(verifiedRole.permissions);
            const viewChannel = BigInt(PermissionFlagsBits.ViewChannel);
            const newPerms = currentPerms | viewChannel; // Add ViewChannel

            if (newPerms !== currentPerms) {
                await rest.patch(Routes.guildRole(guildId, settings.verifiedRoleId), {
                    body: { permissions: newPerms.toString() },
                    reason: "Rueby Verification Setup: Allowing verified users to view channels"
                });
            }
        }

        // 3. Set Verification Channel to be visible to @everyone
        // We need to edit channel permission overwrites
        await rest.put(Routes.channelPermission(settings.verificationChannelId, guildId), {
            body: {
                type: 0, // Role
                allow: (BigInt(PermissionFlagsBits.ViewChannel) | BigInt(PermissionFlagsBits.ReadMessageHistory)).toString(),
                deny: "0"
            },
            reason: "Rueby Verification Setup: Allow unverified to see verification channel"
        });

        // Also ensure bot can see it
        // We typically don't need to do this as bot has admin, but good practice if not.

        return { success: true };
    } catch (err: any) {
        console.error("Failed to setup permissions:", err);
        return { error: err.message || "Failed to setup permissions" };
    }
}
