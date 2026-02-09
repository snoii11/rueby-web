"use client";

import { useState } from 'react';

interface Option {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface PillSelectProps {
    name?: string;
    options: Option[];
    defaultValue?: string;
    columns?: 2 | 3 | 4 | 'flex';
    onChange?: (value: string) => void;
    placeholder?: string;
}

export default function PillSelect({ name, options, defaultValue, columns = 4, onChange }: PillSelectProps) {
    const [selected, setSelected] = useState(defaultValue || "");

    if (defaultValue !== undefined && selected !== defaultValue) {
        setSelected(defaultValue);
    }

    const gridClass = columns === 'flex'
        ? 'flex flex-wrap'
        : `grid grid-cols-${columns}`;

    return (
        <div className="w-full">
            {name && <input type="hidden" name={name} value={selected} />}

            <div className={`${gridClass} gap-2`}>
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                            setSelected(opt.value);
                            if (onChange) onChange(opt.value);
                        }}
                        className={`
                            relative px-4 py-3 rounded-xl font-semibold text-sm
                            transition-all duration-200 flex items-center justify-center gap-2
                            ${selected === opt.value
                                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30 scale-[1.02]'
                                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                            }
                            ${columns === 'flex' ? 'flex-grow md:flex-grow-0' : ''}
                        `}
                    >
                        {opt.icon && <span className="text-lg">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>

                        {/* Selected indicator */}
                        {selected === opt.value && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md z-10">
                                <svg className="w-2.5 h-2.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
