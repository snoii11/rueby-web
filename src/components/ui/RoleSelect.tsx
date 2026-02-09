"use client";

import { useState } from 'react';

interface Role {
    label: string;
    value: string;
    color?: string;
}

interface RoleSelectProps {
    name: string;
    roles: Role[];
    defaultValue?: string;
    placeholder?: string;
}

export default function RoleSelect({ name, roles, defaultValue, placeholder = "Select a role..." }: RoleSelectProps) {
    const [selected, setSelected] = useState(defaultValue || "");

    // Get contrasting text color based on role color
    const getTextColor = (hexColor?: string): string => {
        if (!hexColor || hexColor === '#000000') return '#ffffff';
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    };

    return (
        <div className="w-full">
            <input type="hidden" name={name} value={selected} />

            {roles.length === 0 ? (
                <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/10">
                    <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm">No roles available</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
                    {roles.map((role) => {
                        const isSelected = selected === role.value;
                        const bgColor = role.color && role.color !== '#000000' ? role.color : undefined;

                        return (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => setSelected(role.value)}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-150
                                    ${isSelected
                                        ? 'ring-2 ring-white/50 shadow-lg scale-105'
                                        : 'hover:scale-105'
                                    }
                                `}
                                style={{
                                    backgroundColor: bgColor || (isSelected ? 'rgba(244, 63, 94, 0.3)' : 'rgba(0,0,0,0.3)'),
                                    color: bgColor ? getTextColor(bgColor) : (isSelected ? '#fda4af' : 'rgba(255,255,255,0.7)')
                                }}
                            >
                                {/* Color dot */}
                                <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: role.color || '#6b7280' }}
                                />
                                <span className="truncate max-w-32">{role.label}</span>

                                {isSelected && (
                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
