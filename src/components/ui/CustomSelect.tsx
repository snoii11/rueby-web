"use client";

import { useState, useRef, useEffect } from 'react';

interface Option {
    label: string;
    value: string;
    color?: string;
}

interface CustomSelectProps {
    name: string;
    options: Option[];
    defaultValue?: string;
    placeholder?: string;
    icon?: React.ReactNode;
}

export default function CustomSelect({ name, options, defaultValue, placeholder = "Select...", icon }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(defaultValue || "");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === selected);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        setSelected(value);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <input type="hidden" name={name} value={selected} />

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full bg-gradient-to-b from-black/60 to-black/80 
                    border rounded-lg px-4 py-3 
                    flex items-center justify-between 
                    cursor-pointer transition-all duration-200
                    ${isOpen
                        ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-black/70'
                    }
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-rose-400 text-sm">{icon}</span>}
                    {selectedOption ? (
                        <span
                            className="font-medium"
                            style={{ color: selectedOption.color || '#ffffff' }}
                        >
                            {selectedOption.label}
                        </span>
                    ) : (
                        <span className="text-white/50">{placeholder}</span>
                    )}
                </div>

                <svg
                    className={`w-4 h-4 text-rose-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Portal */}
            {isOpen && (
                <>
                    {/* Invisible backdrop to catch clicks */}
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div
                        className="absolute left-0 w-full mt-2 py-2 rounded-xl overflow-hidden"
                        style={{
                            zIndex: 9999,
                            background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
                            border: '1px solid rgba(244, 63, 94, 0.4)',
                            boxShadow: `
                                0 20px 60px -10px rgba(0, 0, 0, 0.9),
                                0 0 30px -5px rgba(244, 63, 94, 0.15),
                                inset 0 1px 0 rgba(255, 255, 255, 0.05)
                            `,
                        }}
                    >
                        <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-rose-500/30 scrollbar-track-transparent">
                            {options.length === 0 ? (
                                <div className="px-4 py-3 text-white/40 text-sm text-center">
                                    No options available
                                </div>
                            ) : (
                                options.map((opt, index) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`
                                            px-4 py-2.5 cursor-pointer flex items-center justify-between
                                            transition-all duration-150 relative
                                            ${selected === opt.value
                                                ? 'bg-rose-500/20 text-rose-300'
                                                : 'text-white/80 hover:bg-white/5 hover:text-white'
                                            }
                                            ${index === 0 ? 'rounded-t-lg' : ''}
                                            ${index === options.length - 1 ? 'rounded-b-lg' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            {opt.color && (
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: opt.color }}
                                                />
                                            )}
                                            <span
                                                className="font-medium text-sm"
                                                style={{ color: opt.color || undefined }}
                                            >
                                                {opt.label}
                                            </span>
                                        </div>

                                        {selected === opt.value && (
                                            <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
