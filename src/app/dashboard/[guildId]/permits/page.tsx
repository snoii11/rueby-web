import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { REST } from "@discordjs/rest";
import { Routes, APIRole } from "discord-api-types/v10";
import CustomSelect from "@/components/ui/CustomSelect";

// Server action to add permit
async function addPermit(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    const roleId = formData.get("roleId") as string;
    const level = formData.get("level") as any;

    if (!guildId || !roleId || !level) return;

    try {
        await prisma.permit.create({
            data: {
                guildId,
                roleId,
                level
            }
        });
    } catch (e) {
        // Ignore duplicate errors for now
        console.error("Failed to add permit", e);
    }

    revalidatePath(`/dashboard/${guildId}/permits`);
}

// Server action to remove permit
async function removePermit(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    const guildId = formData.get("guildId") as string;
    const permitId = formData.get("permitId") as string;

    if (!guildId || !permitId) return;

    await prisma.permit.delete({
        where: { id: permitId }
    });

    revalidatePath(`/dashboard/${guildId}/permits`);
}

export default async function PermitsPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { guildId } = params;

    // Fetch existing permits
    const permits = await prisma.permit.findMany({
        where: { guildId },
        orderBy: { level: 'desc' }
    });

    // Fetch roles
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    let roles: APIRole[] = [];
    try {
        roles = await rest.get(Routes.guildRoles(guildId)) as APIRole[];
    } catch (e) {
        console.error("Failed to fetch roles", e);
    }

    const permitsWithRoles = permits.map(p => {
        const role = roles.find(r => r.id === p.roleId);
        return {
            ...p,
            roleName: role ? role.name : "Unknown Role",
            roleColor: role?.color ? `#${role.color.toString(16).padStart(6, '0')}` : "#999"
        };
    });

    // Filter out roles that already have a permit for the "Add" dropdown
    const availableRoles = roles
        .filter(r => !permits.some(p => p.roleId === r.id) && r.name !== "@everyone")
        .map(r => ({
            label: `@${r.name}`,
            value: r.id,
            color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : undefined
        }));

    const levelOptions = [
        { label: "L5 - Owner / Extra Owner", value: "L5" },
        { label: "L4 - Trusted Admin", value: "L4" },
        { label: "L3 - Senior Moderator", value: "L3" },
        { label: "L2 - Moderator", value: "L2" },
        { label: "L1 - Helper", value: "L1" },
    ];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600">
                    Permits
                </h1>
                <p className="text-white/60 mt-2">
                    Manage staff permissions and access levels.
                </p>
            </header>

            {/* Add New Permit */}
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl mb-12">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="p-2 bg-rose-500/20 rounded-lg text-rose-400 text-lg">➕</span>
                    Add New Permit
                </h3>
                <form action={addPermit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <input type="hidden" name="guildId" value={guildId} />

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Role</label>
                        <CustomSelect
                            name="roleId"
                            placeholder="Select a Role..."
                            options={availableRoles}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Access Level</label>
                        <CustomSelect
                            name="level"
                            placeholder="Select Level..."
                            options={levelOptions}
                        />
                    </div>

                    <button type="submit" className="h-[52px] w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 hover:border-white/30">
                        <span>Grant Permission</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                    </button>
                </form>
            </div>

            {/* Existing Permits List */}
            <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-rose-500">Active Permits</h3>

            {permitsWithRoles.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                    <p className="text-white/40">No permits configured yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {permitsWithRoles.map((permit) => (
                        <div key={permit.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-white/[0.07] transition-all group">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 font-bold text-lg border border-white/5" style={{ color: permit.roleColor }}>
                                    #
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg" style={{ color: permit.roleColor }}>
                                        {permit.roleName}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${permit.level === 'L5' ? 'bg-red-500/20 text-red-400' :
                                                permit.level === 'L4' ? 'bg-orange-500/20 text-orange-400' :
                                                    permit.level === 'L3' ? 'bg-amber-500/20 text-amber-400' :
                                                        permit.level === 'L2' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {permit.level}
                                        </span>
                                        <span className="text-xs text-white/40">ID: {permit.roleId}</span>
                                    </div>
                                </div>
                            </div>

                            <form action={removePermit} className="w-full md:w-auto">
                                <input type="hidden" name="guildId" value={guildId} />
                                <input type="hidden" name="permitId" value={permit.id} />
                                <button type="submit" className="w-full md:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-all flex items-center justify-center gap-2 group-hover:border-red-500/40">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    <span>Revoke</span>
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
