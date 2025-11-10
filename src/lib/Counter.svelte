<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  let count: number = $state(0);
  async function increment() {
    count = await invoke<number>("count", { diff: 1 });
  }
</script>

<button onclick={increment}>
  count is {count}
</button>
