# tauri-svelte-vite

A generic Tauri + Svelte + Vite template, ready to use with [degit](https://github.com/Rich-Harris/degit).

## Usage

```sh
bunx degit vikkio/tauri-svelte-vite my-app
cd my-app
bun create.ts
```

The setup script will ask for:

- **Project name** — used for `package.json`, the Cargo package/lib name, and the Tauri product name/window title.
- **Identifier prefix** — combined with the project name to build the Tauri app identifier (`<prefix>.<name>`), default `com.vikkio`.
- Whether to include:
  - **svelte-spa-router** — adds `src/routing.ts` and wires up example `Home`/`About` pages in `App.svelte`.
  - **Tailwind CSS** — adds the Vite plugin and a starter `app.css`.
  - **Drizzle + @tauri-apps/plugin-sql** — adds `drizzle.config.ts`, `src/db/schema.ts`, `src/db/client.ts`, and registers the SQL plugin in `src-tauri`.

It then replaces every `APPNAME` placeholder, deletes the `template/` folder and itself, and optionally runs `bun install`.

## Manual setup

If you'd rather not run the script, replace `APPNAME` by hand in:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`

and pick whichever pieces you want from `template/<feature>/files` yourself.
