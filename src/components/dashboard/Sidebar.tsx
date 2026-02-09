"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
    guildId: string;
    guildName?: string;
}

const menuItems = [
    { id: "setup", label: "Setup Wizard", icon: "⚡", href: "/setup" },
    { id: "overview", label: "Overview", icon: "📊", href: "" },
    { id: "antinuke", label: "Anti-Nuke", icon: "🛡️", href: "/antinuke" },
    { id: "joingate", label: "Join Gate", icon: "🚪", href: "/joingate" },
    { id: "verification", label: "Verification", icon: "✅", href: "/verification" },
    { id: "moderation", label: "Moderation", icon: "🔨", href: "/moderation" },
    { id: "permits", label: "Permits", icon: "🎫", href: "/permits" },
    { id: "logs", label: "Logs", icon: "📜", href: "/logs" },
    { id: "settings", label: "Settings", icon: "⚙️", href: "/settings" },
];

export function Sidebar({ guildId, guildName }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="sidebar w-64 min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31C5F] to-[#B81650] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <span className="text-xl font-bold text-white">Rueby</span>
                </Link>
            </div>

            {/* Guild Info */}
            <div className="p-4 border-b border-white/10">
                <div className="glass-card p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 font-bold">
                        {guildName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate text-sm">
                            {guildName || "Loading..."}
                        </h3>
                        <Link
                            href="/dashboard"
                            className="text-xs text-white/40 hover:text-[#E31C5F] transition-colors"
                        >
                            Switch Server
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const fullPath = `/dashboard/${guildId}${item.href}`;
                        const isActive =
                            item.href === ""
                                ? pathname === `/dashboard/${guildId}`
                                : pathname.startsWith(fullPath);

                        return (
                            <li key={item.id}>
                                <Link
                                    href={fullPath}
                                    className={`sidebar-link ${isActive ? "active" : ""}`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <img
                        src={session?.user?.image || "/default-avatar.png"}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{session?.user?.name}</p>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-xs text-white/40 hover:text-[#E31C5F] transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
