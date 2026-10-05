import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./public/migrations",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
});
