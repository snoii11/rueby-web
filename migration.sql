-- CreateEnum
CREATE TYPE "PermitLevel" AS ENUM ('L1', 'L2', 'L3', 'L4', 'L5');

-- CreateEnum
CREATE TYPE "WhitelistRefType" AS ENUM ('MEMBER', 'ROLE', 'CHANNEL', 'CATEGORY', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "VerificationMode" AS ENUM ('NONE', 'BUTTON', 'CAPTCHA', 'WEB');

-- CreateEnum
CREATE TYPE "VerificationFailAction" AS ENUM ('NONE', 'QUARANTINE', 'KICK', 'BAN');

-- CreateEnum
CREATE TYPE "VerificationTarget" AS ENUM ('ALL', 'SUSPICIOUS');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('WARN', 'TIMEOUT', 'MUTE', 'UNMUTE', 'KICK', 'BAN', 'UNBAN', 'SOFTBAN', 'QUARANTINE', 'UNQUARANTINE', 'PURGE', 'LOCKDOWN', 'UNLOCK', 'PANIC', 'VERIFICATION_FAIL', 'JOINGATE_FAIL', 'HEAT_ACTION', 'ANTINUKE_ACTION');

-- CreateEnum
CREATE TYPE "PanicType" AS ENUM ('HEAT', 'ANTINUKE', 'MANUAL', 'MANUAL_LOCKDOWN');

-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "featureFlags" JSONB NOT NULL DEFAULT '{}',
    "prefix" TEXT NOT NULL DEFAULT '!',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quarantineRole" TEXT,
    "muteRole" TEXT,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "level" "PermitLevel" NOT NULL,
    "overrides" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whitelists" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "refType" "WhitelistRefType" NOT NULL,
    "refId" TEXT NOT NULL,
    "scopes" TEXT[],
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whitelists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heat_states" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL DEFAULT 'user',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strikes" INTEGER NOT NULL DEFAULT 0,
    "lastEventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decayCursor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heat_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heat_configs" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "weights" JSONB NOT NULL DEFAULT '{"messageRate": 1.0, "duplicates": 2.0, "massMentions": 3.0, "links": 1.5, "attachments": 0.5, "emojiSpam": 1.0, "suspiciousUnicode": 2.0, "webhookMessages": 2.5}',
    "thresholds" JSONB NOT NULL DEFAULT '{"T1": 10, "T2": 25, "T3": 50, "T4": 100}',
    "actions" JSONB NOT NULL DEFAULT '{"T1": "warn", "T2": "timeout", "T3": "kick", "T4": "ban"}',
    "decayRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "strikeCaps" JSONB NOT NULL DEFAULT '{"T1": 3, "T2": 2, "T3": 1}',
    "webhookMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "autoTimeoutSeconds" INTEGER NOT NULL DEFAULT 300,
    "resetOnTimeout" BOOLEAN NOT NULL DEFAULT true,
    "dmOnAction" BOOLEAN NOT NULL DEFAULT true,
    "panicThreshold" INTEGER NOT NULL DEFAULT 5,
    "panicWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "panicDurationMinutes" INTEGER NOT NULL DEFAULT 10,
    "mentionLockdownThreshold" INTEGER NOT NULL DEFAULT 20,
    "mentionLockdownWindow" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heat_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antinuke_limits" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "minuteLimits" JSONB NOT NULL DEFAULT '{"channelDelete": 3, "channelCreate": 5, "roleDelete": 3, "roleCreate": 5, "ban": 5, "kick": 10, "webhookCreate": 3, "webhookDelete": 3}',
    "hourLimits" JSONB NOT NULL DEFAULT '{"channelDelete": 10, "channelCreate": 20, "roleDelete": 10, "roleCreate": 20, "ban": 20, "kick": 50, "webhookCreate": 10, "webhookDelete": 10}',
    "responses" JSONB NOT NULL DEFAULT '{"channelDelete": "quarantine", "roleDelete": "quarantine", "ban": "quarantine", "kick": "quarantine"}',
    "exemptRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "antinuke_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'auto',
    "snapshot" JSONB NOT NULL,
    "diff" JSONB,
    "signature" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_settings" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mode" "VerificationMode" NOT NULL DEFAULT 'BUTTON',
    "actionOnFail" "VerificationFailAction" NOT NULL DEFAULT 'QUARANTINE',
    "target" "VerificationTarget" NOT NULL DEFAULT 'ALL',
    "verificationChannelId" TEXT,
    "verifiedRoleId" TEXT,
    "captchaLength" INTEGER NOT NULL DEFAULT 6,
    "captchaStyle" TEXT NOT NULL DEFAULT 'alphanumeric',
    "captchaNoise" INTEGER NOT NULL DEFAULT 3,
    "captchaTimeout" INTEGER NOT NULL DEFAULT 300,
    "captchaMaxAttempts" INTEGER NOT NULL DEFAULT 3,
    "regenSeconds" INTEGER NOT NULL DEFAULT 0,
    "welcomeMessage" TEXT,
    "verificationPrompt" TEXT,
    "successMessage" TEXT,
    "failMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "join_gates" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "accountAgeMinDays" INTEGER NOT NULL DEFAULT 7,
    "avatarRequired" BOOLEAN NOT NULL DEFAULT false,
    "botAdditionPolicy" TEXT NOT NULL DEFAULT 'allow',
    "unverifiedBotPolicy" TEXT NOT NULL DEFAULT 'allow',
    "advertisingProfileRule" TEXT NOT NULL DEFAULT 'ignore',
    "usernameRules" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL DEFAULT '{"accountAge": "quarantine", "avatar": "quarantine", "bot": "block", "advertising": "quarantine", "username": "quarantine"}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "join_gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "caseId" INTEGER NOT NULL,
    "type" "CaseType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT,
    "evidence" JSONB,
    "duration" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_routing" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "automodChannel" TEXT,
    "antinukeChannel" TEXT,
    "verificationChannel" TEXT,
    "joingateChannel" TEXT,
    "joinraidChannel" TEXT,
    "panicChannel" TEXT,
    "reportsChannel" TEXT,
    "moderationChannel" TEXT,
    "fallbackChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logs_routing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panic_states" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "type" "PanicType" NOT NULL DEFAULT 'MANUAL',
    "reason" TEXT,
    "startedAt" TIMESTAMP(3),
    "startedBy" TEXT,
    "autoUnlockPolicy" TEXT NOT NULL DEFAULT 'manual',
    "autoUnlockMinutes" INTEGER NOT NULL DEFAULT 30,
    "storedPermissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panic_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lockdown_states" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelLockdown" BOOLEAN NOT NULL DEFAULT false,
    "rolesLockdown" BOOLEAN NOT NULL DEFAULT false,
    "joinsLockdown" BOOLEAN NOT NULL DEFAULT false,
    "lockedChannels" JSONB NOT NULL DEFAULT '[]',
    "strippedRoles" JSONB NOT NULL DEFAULT '{}',
    "joinAction" TEXT NOT NULL DEFAULT 'kick',
    "autoUnlock" BOOLEAN NOT NULL DEFAULT false,
    "autoUnlockMinutes" INTEGER NOT NULL DEFAULT 30,
    "startedAt" TIMESTAMP(3),
    "startedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lockdown_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "permits_guildId_idx" ON "permits"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "permits_guildId_roleId_key" ON "permits"("guildId", "roleId");

-- CreateIndex
CREATE INDEX "whitelists_guildId_idx" ON "whitelists"("guildId");

-- CreateIndex
CREATE INDEX "whitelists_guildId_refType_idx" ON "whitelists"("guildId", "refType");

-- CreateIndex
CREATE UNIQUE INDEX "whitelists_guildId_refType_refId_key" ON "whitelists"("guildId", "refType", "refId");

-- CreateIndex
CREATE INDEX "heat_states_guildId_idx" ON "heat_states"("guildId");

-- CreateIndex
CREATE INDEX "heat_states_guildId_subjectId_idx" ON "heat_states"("guildId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "heat_states_guildId_subjectId_key" ON "heat_states"("guildId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "heat_configs_guildId_key" ON "heat_configs"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "antinuke_limits_guildId_key" ON "antinuke_limits"("guildId");

-- CreateIndex
CREATE INDEX "backups_guildId_idx" ON "backups"("guildId");

-- CreateIndex
CREATE INDEX "backups_guildId_createdAt_idx" ON "backups"("guildId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "verification_settings_guildId_key" ON "verification_settings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "join_gates_guildId_key" ON "join_gates"("guildId");

-- CreateIndex
CREATE INDEX "cases_guildId_idx" ON "cases"("guildId");

-- CreateIndex
CREATE INDEX "cases_guildId_targetId_idx" ON "cases"("guildId", "targetId");

-- CreateIndex
CREATE INDEX "cases_guildId_actorId_idx" ON "cases"("guildId", "actorId");

-- CreateIndex
CREATE INDEX "cases_guildId_type_idx" ON "cases"("guildId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "cases_guildId_caseId_key" ON "cases"("guildId", "caseId");

-- CreateIndex
CREATE UNIQUE INDEX "logs_routing_guildId_key" ON "logs_routing"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "panic_states_guildId_key" ON "panic_states"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "lockdown_states_guildId_key" ON "lockdown_states"("guildId");

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whitelists" ADD CONSTRAINT "whitelists_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heat_states" ADD CONSTRAINT "heat_states_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heat_configs" ADD CONSTRAINT "heat_configs_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antinuke_limits" ADD CONSTRAINT "antinuke_limits_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_settings" ADD CONSTRAINT "verification_settings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_gates" ADD CONSTRAINT "join_gates_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_routing" ADD CONSTRAINT "logs_routing_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panic_states" ADD CONSTRAINT "panic_states_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lockdown_states" ADD CONSTRAINT "lockdown_states_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

