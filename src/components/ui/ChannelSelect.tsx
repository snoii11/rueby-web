"use client";

import { useState } from 'react';

interface Channel {
    label: string;
    value: string;
    type?: 'text' | 'voice' | 'announcement';
}

interface ChannelSelectProps {
    name: string;
    channels: Channel[];
    defaultValue?: string;
    placeholder?: string;
}

export default function ChannelSelect({ name, channels, defaultValue, placeholder = "Select a channel..." }: ChannelSelectProps) {
    const [selected, setSelected] = useState(defaultValue || "");

    const getIcon = (type?: string) => {
        switch (type) {
            case 'voice':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3zm-1 14.93A7.006 7.006 0 015 11h2a5 5 0 0010 0h2a7.006 7.006 0 01-6 6.93V21h2v2H9v-2h2v-3.07z" />
                    </svg>
                );
            case 'announcement':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3A4.5 4.5 0 0014 8.5v7c1.06-.44 1.97-1.27 2.5-2.5z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 15H15.4105L16.4705 9H10.4705L9.41045 15Z" />
                    </svg>
                );
        }
    };

    return (
        <div className="w-full">
            <input type="hidden" name={name} value={selected} />

            {channels.length === 0 ? (
                <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/10">
                    <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <p className="text-sm">No channels available</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
                    {channels.map((channel) => (
                        <button
                            key={channel.value}
                            type="button"
                            onClick={() => setSelected(channel.value)}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                transition-all duration-150
                                ${selected === channel.value
                                    ? 'bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/50'
                                    : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'
                                }
                            `}
                        >
                            <span className={selected === channel.value ? 'text-rose-400' : 'text-white/50'}>
                                {getIcon(channel.type)}
                            </span>
                            <span className="truncate max-w-32">{channel.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
