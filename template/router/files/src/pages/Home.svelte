<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import Counter from "../lib/Counter.svelte";
  import { to } from "@/routing";

  let value = $state("");
  let messages: string[] = $state([]);

  async function add(e: SubmitEvent) {
    e.preventDefault();
    if (value === "") return;

    const res = await invoke<string[]>("greet", { name: value });
    messages = res;
    value = "";
  }
</script>

<h1>Vite + Svelte + Tauri</h1>
<div class="card">
  <Counter />
  <form onsubmit={add}>
    <input bind:value />
    <button>Add</button>
  </form>
</div>
<pre>
{JSON.stringify(messages, null, 2)}
</pre>

<button onclick={() => to("about")}>Go to about</button>
