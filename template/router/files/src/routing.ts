import { pop, push, replace as spaReplace } from "svelte-spa-router";

export const routes = ["home", "about"] as const;
export type Route = (typeof routes)[number];

export const paths: Record<Route, string> = {
  home: "/",
  about: "/about",
};

export function buildPath(
  route: Route,
  params?: Record<string, string | number>,
): string {
  let path = paths[route];
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, String(value));
    }
  }

  return path;
}

export function toPath(path: string) {
  push(path);
}

export function to(route: Route, params?: Record<string, string | number>) {
  const p = buildPath(route, params);
  push(p);
}

export function replace(
  route: Route,
  params?: Record<string, string | number>,
) {
  spaReplace(buildPath(route, params));
}

export function back() {
  pop();
}
