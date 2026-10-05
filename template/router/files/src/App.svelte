<script lang="ts">
  import Router from "svelte-spa-router";
  import { paths } from "@/routing";
  import Home from "@/pages/Home.svelte";
  import About from "@/pages/About.svelte";

  const routes = {
    [paths.home]: Home,
    [paths.about]: About,
  };
</script>

<main>
  <Router {routes} />
</main>
