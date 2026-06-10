import { PrismaClient } from "@prisma/client";
import path from "path";

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;

  // For SQLite: resolve relative file paths to absolute
  // Works for both local dev and Vercel (which deploys to /var/task)
  if (dbUrl && dbUrl.startsWith("file:")) {
    const filePart = dbUrl.replace(/^file:/, "");
    if (!path.isAbsolute(filePart)) {
      // Strip leading ./  if present
      const basename = path.basename(filePart);
      const absolutePath = path.resolve(process.cwd(), "prisma", basename);
      console.log(`[Prisma] SQLite → ${absolutePath}`);
      return new PrismaClient({
        datasources: { db: { url: `file:${absolutePath}` } },
      });
    }
  }

  // For hosted databases (PostgreSQL via Neon, MySQL, etc.)
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
