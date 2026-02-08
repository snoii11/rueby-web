"use client";

import { useState, useRef, useEffect } from 'react';

interface Option {
    label: string;
    value: string;
    color?: string; // Hex color for role/label indicator
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

    // Close on click outside
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
            {/* Hidden input for FormData */}
            <input type="hidden" name={name} value={selected} />

            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full bg-black/40 border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all
                    ${isOpen ? 'border-rose-500/50 ring-2 ring-rose-500/20' : 'border-white/10 hover:bg-white/5'}
                `}
            >
                <div className="flex items-center space-x-2 truncate">
                    {icon && <span className="text-gray-400">{icon}</span>}
                    {selectedOption ? (
                        <span className={selectedOption.color ? '' : 'text-white'} style={{ color: selectedOption.color }}>
                            {selectedOption.label}
                        </span>
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </div>

                <div className={`transition-transform duration-200 text-rose-400 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`
                                    px-4 py-2.5 cursor-pointer flex items-center justify-between group transition-colors
                                    ${selected === opt.value ? 'bg-rose-500/10' : 'hover:bg-white/5'}
                                `}
                            >
                                <span className="font-medium truncate" style={{ color: opt.color || (selected === opt.value ? '#fb7185' : '#d4d4d8') }}>
                                    {opt.label}
                                </span>
                                {selected === opt.value && (
                                    <span className="text-rose-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
