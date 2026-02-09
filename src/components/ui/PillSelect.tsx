"use client";

import { useState } from 'react';

interface Option {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface PillSelectProps {
    name: string;
    options: Option[];
    defaultValue?: string;
    columns?: 2 | 3 | 4;
}

export default function PillSelect({ name, options, defaultValue, columns = 4 }: PillSelectProps) {
    const [selected, setSelected] = useState(defaultValue || options[0]?.value || "");

    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
    };

    return (
        <div className="w-full">
            <input type="hidden" name={name} value={selected} />

            <div className={`grid ${gridCols[columns]} gap-2`}>
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelected(opt.value)}
                        className={`
                            relative px-4 py-3 rounded-xl font-semibold text-sm
                            transition-all duration-200 flex items-center justify-center gap-2
                            ${selected === opt.value
                                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30 scale-[1.02]'
                                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                            }
                        `}
                    >
                        {opt.icon && <span className="text-lg">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>

                        {/* Selected indicator */}
                        {selected === opt.value && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
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
