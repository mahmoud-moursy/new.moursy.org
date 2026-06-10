import { generateMaze } from "$/pages/funbox/mouse/logic.ts";
import type { APIRoute } from "astro";

export const prerender = false;
export const POST: APIRoute = ({}) => {
  generateMaze();

  return new Response("Ok");
};
