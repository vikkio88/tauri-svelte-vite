#!/usr/bin/env bun
/**
 * One-shot setup script for this Tauri + Svelte + Vite template.
 *
 * Usage:
 *   bunx degit vikkio/tauri-svelte-vite my-app
 *   cd my-app
 *   bun create.ts
 *
 * Prompts for a project name + identifier, lets you opt in to
 * svelte-spa-router / Tailwind / Drizzle+SQL, wires everything up,
 * replaces the APPNAME placeholders, and removes itself.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import path from "node:path";

const root = process.cwd();
const rl = createInterface({ input: process.stdin, output: process.stdout });

async function ask(question: string, fallback: string): Promise<string> {
  const answer = (await rl.question(`${question} (${fallback}): `)).trim();
  return answer || fallback;
}

async function confirm(question: string, fallback: boolean): Promise<boolean> {
  const hint = fallback ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();
  if (!answer) return fallback;
  return answer === "y" || answer === "yes";
}

function toSnakeCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
}

async function walk(dir: string): Promise<string[]> {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const SKIP_DIRS = new Set(["node_modules", ".git", "target", "dist", "template"]);

async function replaceInFile(file: string, replacements: [RegExp, string][]) {
  const original = await readFile(file, "utf8").catch(() => null);
  if (original === null) return; // binary or unreadable, skip
  let content = original;
  for (const [pattern, value] of replacements) {
    content = content.replace(pattern, value);
  }
  if (content !== original) await writeFile(file, content);
}

async function mergePackageJson(fragment: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}) {
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.dependencies = { ...pkg.dependencies, ...fragment.dependencies };
  pkg.devDependencies = { ...pkg.devDependencies, ...fragment.devDependencies };
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

async function mergeScripts(fragment: Record<string, string>) {
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.scripts = { ...pkg.scripts, ...fragment };
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

async function copyFeatureFiles(feature: string) {
  const src = path.join(root, "template", feature, "files");
  if (!existsSync(src)) return;
  await cp(src, root, { recursive: true, force: true });
}

async function enableTailwindPlugin() {
  const viteConfigPath = path.join(root, "vite.config.ts");
  await replaceInFile(viteConfigPath, [
    [
      /import { svelte } from "@sveltejs\/vite-plugin-svelte";/,
      `import { svelte } from "@sveltejs/vite-plugin-svelte";\nimport tailwindcss from "@tailwindcss/vite";`,
    ],
    [/plugins: \[svelte\(\)\]/, "plugins: [svelte(), tailwindcss()]"],
  ]);
}

async function main() {
  console.log("Tauri + Svelte + Vite template setup\n");

  const defaultName = path.basename(root);
  const projectName = await ask("Project name", defaultName);
  const identifierPrefix = await ask("Identifier prefix", "com.vikkio");
  const useRouter = await confirm("Include svelte-spa-router?", false);
  const useTailwind = await confirm("Include Tailwind CSS?", false);
  const useDrizzle = await confirm("Include Drizzle + @tauri-apps/plugin-sql?", false);
  const runInstall = await confirm("Run `bun install` when done?", true);
  rl.close();

  const snakeName = toSnakeCase(projectName);
  const identifier = `${identifierPrefix}.${projectName}`;

  if (useRouter) {
    await copyFeatureFiles("router");
    const deps = JSON.parse(
      await readFile(path.join(root, "template/router/deps.json"), "utf8"),
    );
    await mergePackageJson(deps);
  }

  if (useTailwind) {
    await copyFeatureFiles("tailwind");
    const deps = JSON.parse(
      await readFile(path.join(root, "template/tailwind/deps.json"), "utf8"),
    );
    await mergePackageJson(deps);
    await enableTailwindPlugin();
  }

  if (useDrizzle) {
    await copyFeatureFiles("drizzle");
    const deps = JSON.parse(
      await readFile(path.join(root, "template/drizzle/deps.json"), "utf8"),
    );
    await mergePackageJson(deps);
    const scripts = JSON.parse(
      await readFile(path.join(root, "template/drizzle/scripts.json"), "utf8"),
    );
    await mergeScripts(scripts);
  }

  // Replace APPNAME placeholders everywhere (skip node_modules/.git/etc).
  const files = (await walk(root)).filter(
    (f) => !f.split(path.sep).some((part) => SKIP_DIRS.has(part)),
  );

  for (const file of files) {
    await replaceInFile(file, [
      [/com\.vikkio\.APPNAME/g, identifier],
      [/APPNAME_lib/g, `${snakeName}_lib`],
      [/APPNAME/g, projectName],
    ]);
  }

  await rm(path.join(root, "template"), { recursive: true, force: true });
  await rm(path.join(root, "create.ts"), { force: true });

  console.log(`\nDone! "${projectName}" is ready (identifier: ${identifier}).`);

  if (runInstall) {
    console.log("Running bun install...");
    const proc = Bun.spawn(["bun", "install"], { stdio: ["inherit", "inherit", "inherit"] });
    await proc.exited;
  }

  console.log("\nNext steps:");
  console.log("  bun dev        # tauri dev mode");
  if (useDrizzle) console.log("  bun db:gen     # generate drizzle migrations");
}

main();
