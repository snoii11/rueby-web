import { PrismaClient } from "@prisma/client";
import dns from "node:dns";

// Force IPv4 for Prisma/Neon connectivity
try {
    dns.setDefaultResultOrder("ipv4first");
} catch (e) {
    // Ignore if not available or already set
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
