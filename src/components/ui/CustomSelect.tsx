"use client";

import { useState, useRef, useEffect, createPortal } from 'react';
import ReactDOM from 'react-dom';

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
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);

    const selectedOption = options.find(opt => opt.value === selected);

    // Update dropdown position when opening
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isOpen]);

    // Close on click outside or escape
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setIsOpen(false);
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSelect = (value: string) => {
        setSelected(value);
        setIsOpen(false);
    };

    // Dropdown rendered via portal
    const dropdownMenu = isOpen && typeof window !== 'undefined' ? ReactDOM.createPortal(
        <>
            {/* Full-screen invisible backdrop */}
            <div
                className="fixed inset-0 bg-transparent"
                style={{ zIndex: 99998 }}
                onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <div
                className="fixed py-2 rounded-xl overflow-hidden"
                style={{
                    zIndex: 99999,
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
                    border: '1px solid rgba(244, 63, 94, 0.5)',
                    boxShadow: `
                        0 25px 80px -15px rgba(0, 0, 0, 0.95),
                        0 0 40px -10px rgba(244, 63, 94, 0.2)
                    `,
                }}
            >
                <div className="max-h-56 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-white/40 text-sm text-center">
                            No options available
                        </div>
                    ) : (
                        options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`
                                    px-4 py-2.5 cursor-pointer flex items-center justify-between
                                    transition-all duration-150
                                    ${selected === opt.value
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    {opt.color && (
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: opt.color }}
                                        />
                                    )}
                                    <span className="font-medium text-sm">
                                        {opt.label}
                                    </span>
                                </div>

                                {selected === opt.value && (
                                    <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className="relative w-full">
            <input type="hidden" name={name} value={selected} />

            {/* Trigger Button */}
            <button
                ref={triggerRef}
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

            {dropdownMenu}
        </div>
    );
}
