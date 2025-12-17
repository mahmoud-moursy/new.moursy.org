import type {APIRoute} from "astro";
import {generateMaze} from "$/pages/funbox/mouse/logic.ts";

export const POST: APIRoute = ({}) => {
    generateMaze()

    return new Response("Ok")
}