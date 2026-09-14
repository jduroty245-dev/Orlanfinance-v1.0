import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL (session-mode pooler / port 5432) is used by the CLI for
    // migrations and introspection. DATABASE_URL (transaction-mode pooler /
    // port 6543 with pgbouncer=true) is passed to PrismaClient at runtime.
    url: env("DIRECT_URL"),
  },
});
