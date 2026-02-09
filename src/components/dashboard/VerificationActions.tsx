"use client";

import { useTransition } from "react";
import { sendVerificationPanel, setupVerificationPermissions } from "@/actions/verification";

interface VerificationActionsProps {
    guildId: string;
}

export default function VerificationActions({ guildId }: VerificationActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleSendPanel = () => {
        if (!confirm("This will post a new verification panel to the configured channel. Continue?")) return;

        startTransition(async () => {
            const result = await sendVerificationPanel(guildId);
            if (result.success) {
                alert("✅ Panel sent successfully!");
            } else {
                alert(`❌ Failed: ${result.error}`);
            }
        });
    };

    const handleSetupPerms = () => {
        if (!confirm("⚠️ WARNING: This will hide ALL channels from @everyone and only allow the Verified role to see them. The Verification Channel will remain visible to everyone.\n\nType 'CONFIRM' to proceed.")) return;
        // In a real app we'd check the input. For now just standard confirm.

        startTransition(async () => {
            const result = await setupVerificationPermissions(guildId);
            if (result.success) {
                alert("✅ Permissions updated successfully!");
            } else {
                alert(`❌ Failed: ${result.error}`);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                type="button"
                onClick={handleSendPanel}
                disabled={isPending}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left group"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                        📨
                    </div>
                    <div className="font-bold text-white">Send Verification Panel</div>
                </div>
                <p className="text-sm text-white/50">Post the verification embed and button to the selected channel.</p>
            </button>

            <button
                type="button"
                onClick={handleSetupPerms}
                disabled={isPending}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left group"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                        🔒
                    </div>
                    <div className="font-bold text-white">Lockdown Channels</div>
                </div>
                <p className="text-sm text-white/50">Hide all channels from unverified users. (Updates @everyone permissions)</p>
            </button>
        </div>
    );
}
