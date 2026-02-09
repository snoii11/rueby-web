"use client";

import { useState } from 'react';

interface Role {
    id: string;
    name: string;
    color: number;
}

interface Permit {
    roleId: string;
    level: number;
}

interface PermitsStepProps {
    data: {
        permits: Permit[];
    };
    onChange: (permits: Permit[]) => void;
    roles: Role[];
}

const levels = [
    { value: 1, label: 'L1 - Helper', desc: 'Basic mod commands' },
    { value: 2, label: 'L2 - Moderator', desc: 'Standard moderation' },
    { value: 3, label: 'L3 - Senior Mod', desc: 'Advanced moderation' },
    { value: 4, label: 'L4 - Admin', desc: 'Configuration access' },
    { value: 5, label: 'L5 - Owner', desc: 'Full server access' },
];

export default function PermitsStep({ data, onChange, roles }: PermitsStepProps) {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(2);

    const getColorHex = (color: number) => color ? `#${color.toString(16).padStart(6, '0')}` : '#6b7280';

    const availableRoles = roles.filter(r =>
        r.name !== '@everyone' &&
        !data.permits.some(p => p.roleId === r.id)
    );

    const addPermit = () => {
        if (!selectedRole) return;
        const newPermits = [...data.permits, { roleId: selectedRole, level: selectedLevel }];
        onChange(newPermits);
        setSelectedRole('');
    };

    const removePermit = (roleId: string) => {
        onChange(data.permits.filter(p => p.roleId !== roleId));
    };

    const getRoleById = (id: string) => roles.find(r => r.id === id);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-2">
                    <span className="text-3xl">🎫</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Staff Permissions</h2>
                <p className="text-white/60">Assign permission levels to staff roles</p>
            </div>

            {/* Add Permit */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                <h3 className="font-semibold text-white">Add Staff Role</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role Selector */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none"
                        >
                            <option value="">Select a role...</option>
                            {availableRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    @{role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Level Selector */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Permission Level</label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none"
                        >
                            {levels.map((level) => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={addPermit}
                    disabled={!selectedRole}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${selectedRole
                            ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    <span>➕</span> Add Permit
                </button>
            </div>

            {/* Current Permits */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Current Permits</h3>
                {data.permits.length === 0 ? (
                    <div className="text-center py-8 text-white/30">
                        No permits configured yet. Add staff roles above.
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {data.permits.map((permit) => {
                            const role = getRoleById(permit.roleId);
                            const level = levels.find(l => l.value === permit.level);
                            if (!role) return null;

                            return (
                                <div
                                    key={permit.roleId}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: getColorHex(role.color) }}
                                        />
                                        <span className="font-medium text-white">@{role.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium">
                                            {level?.label || `L${permit.level}`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removePermit(permit.roleId)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Level Reference */}
            <div className="bg-black/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Level Reference</h4>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {levels.map((level) => (
                        <div key={level.value} className="p-2">
                            <div className="font-bold text-white/60">L{level.value}</div>
                            <div className="text-white/30">{level.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
