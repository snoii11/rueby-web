"use client";

import { useState } from 'react';

interface CustomCheckboxProps {
    name: string;
    defaultChecked?: boolean;
}

export default function CustomCheckbox({ name, defaultChecked = false }: CustomCheckboxProps) {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <label className="relative flex items-center justify-center w-6 h-6 cursor-pointer group">
            <input
                type="checkbox"
                name={name}
                className="sr-only" // Hide native checkbox
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
            />

            {/* Background Box */}
            <div className={`
                absolute inset-0 rounded-lg border transition-all duration-300 ease-out
                ${checked
                    ? 'bg-rose-600 border-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                    : 'bg-white/5 border-white/20 group-hover:border-rose-400/50'
                }
            `}></div>

            {/* Checkmark Icon */}
            <svg
                className={`
                    w-3.5 h-3.5 text-white z-10 transition-all duration-300 ease-spring
                    ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                `}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </label>
    );
}
