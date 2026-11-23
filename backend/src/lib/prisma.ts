import { PrismaClient } from "@prisma/client";

// One client for the whole process. Creating a client per route file opens
// a separate connection pool for each one.
export const prisma = new PrismaClient();
