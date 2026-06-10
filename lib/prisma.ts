import { PrismaClient } from "@prisma/client";
import path from "path";

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;

  // For SQLite (local dev): resolve relative file paths to absolute
  if (dbUrl && dbUrl.startsWith("file:")) {
    const relativePath = dbUrl.replace("file:", "");
    if (!path.isAbsolute(relativePath)) {
      const absolutePath = path.resolve(
        process.cwd(),
        "prisma",
        path.basename(relativePath)
      );
      console.log(
        `[Prisma] Resolving SQLite path → file:${absolutePath}`
      );
      return new PrismaClient({
        datasources: {
          db: {
            url: `file:${absolutePath}`,
          },
        },
      });
    }
  }

  // For hosted databases (PostgreSQL, Turso, etc.) on Vercel
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

