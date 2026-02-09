"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "@/components/wizard/WizardLayout";
import BasicStep from "@/components/wizard/steps/BasicStep";
import VerificationStep from "@/components/wizard/steps/VerificationStep";
import JoinGateStep from "@/components/wizard/steps/JoinGateStep";
import LogsStep from "@/components/wizard/steps/LogsStep";
import PermitsStep from "@/components/wizard/steps/PermitsStep";
import CompleteStep from "@/components/wizard/steps/CompleteStep";

interface Channel {
    id: string;
    name: string;
    type: number;
}

interface Role {
    id: string;
    name: string;
    color: number;
}

interface WizardData {
    prefix: string;
    timezone: string;
    verification: {
        enabled: boolean;
        mode: string;
        channelId: string;
        roleId: string;
        failAction: string;
        lockdown?: boolean;
    };
    joinGate: {
        enabled: boolean;
        accountAgeMinDays: number;
        avatarRequired: boolean;
        botAdditionPolicy: string;
    };
    logs: {
        antinukeChannel: string;
        moderationChannel: string;
        verificationChannel: string;
        fallbackChannel: string;
    };
    permits: { roleId: string; level: number }[];
}

interface SetupWizardClientProps {
    guildId: string;
    guildName: string;
    channels: Channel[];
    roles: Role[];
    initialData: WizardData;
    saveAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

const STEP_TITLES = ["Basics", "Verification", "Join Gate", "Logs", "Permits", "Complete"];

export default function SetupWizardClient({
    guildId,
    guildName,
    channels,
    roles,
    initialData,
    saveAction,
}: SetupWizardClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<WizardData>(initialData);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = STEP_TITLES.length;
    const isLastStep = currentStep === totalSteps - 1;

    const updateData = (section: keyof WizardData, field: string, value: any) => {
        if (section === 'prefix' || section === 'timezone') {
            setData(prev => ({ ...prev, [section]: value }));
        } else {
            setData(prev => ({
                ...prev,
                [section]: {
                    ...(prev[section] as object),
                    [field]: value,
                },
            }));
        }
    };

    const handleNext = () => {
        if (isLastStep) {
            // Save and complete
            startTransition(async () => {
                const formData = new FormData();
                formData.set("guildId", guildId);
                formData.set("settings", JSON.stringify(data));

                const result = await saveAction(formData);

                if (result.success) {
                    router.push(`/dashboard/${guildId}`);
                } else {
                    setError(result.error || "Failed to save settings");
                }
            });
        } else {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSkip = () => {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    };

    return (
        <WizardLayout
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitles={STEP_TITLES}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLastStep={isLastStep}
            isSubmitting={isPending}
        >
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {currentStep === 0 && (
                <BasicStep
                    data={{ prefix: data.prefix, timezone: data.timezone }}
                    onChange={(field, value) => {
                        setData(prev => ({ ...prev, [field]: value }));
                    }}
                    guildName={guildName}
                />
            )}

            {currentStep === 1 && (
                <VerificationStep
                    data={data.verification}
                    onChange={(field, value) => updateData('verification', field, value)}
                    channels={channels}
                    roles={roles}
                />
            )}

            {currentStep === 2 && (
                <JoinGateStep
                    data={data.joinGate}
                    onChange={(field, value) => updateData('joinGate', field, value)}
                />
            )}

            {currentStep === 3 && (
                <LogsStep
                    data={data.logs}
                    onChange={(field, value) => updateData('logs', field, value)}
                    channels={channels}
                />
            )}

            {currentStep === 4 && (
                <PermitsStep
                    data={{ permits: data.permits }}
                    onChange={(permits) => setData(prev => ({ ...prev, permits }))}
                    roles={roles}
                />
            )}

            {currentStep === 5 && (
                <CompleteStep
                    data={data}
                    guildName={guildName}
                />
            )}
        </WizardLayout>
    );
}
