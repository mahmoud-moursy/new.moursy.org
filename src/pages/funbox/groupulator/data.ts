import { EventEmitter } from "node:events";
import type { APIRoute } from "astro";
import * as mathjs from "mathjs";

export const prerender = false;

const emitter = new EventEmitter();
const encoder = new TextEncoder();
const ALLOWED_CHARACTERS = "0123456789+-/*".split("");

let state = "";

export const POST: APIRoute = async ({ request }) => {
  interface Body {
    interaction: "append" | "delete" | "process";
    data: string;
  }

  const body: Body = await request.formData().then(
    (x) =>
      ({
        interaction: String(x.get("interaction")),
        data: String(x.get("data")),
      }) as Body,
  );

  switch (body.interaction) {
    case "append":
      if (ALLOWED_CHARACTERS.includes(body.data)) {
        state += body.data;
      }
      break;
    case "delete":
      state = state.substring(0, state.length - 1);
      break;
    case "process":
      try {
        state = mathjs.evaluate(state).toString();
      } catch {
        state = "";

        emitter.emit("calc_error");

        return new Response("nope.");
      }

      break;
    default:
      return new Response("nope.");
  }

  state = state
    .split("")
    .filter((x) => ALLOWED_CHARACTERS.includes(x))
    .join("");

  emitter.emit("calc_input_received");

  return new Response("Success.");
};

export const GET: APIRoute = async () => {
  let success_callback: () => any;
  let calc_error_callback: () => any;

  const customReadable = new ReadableStream({
    start(controller) {
      success_callback = () => {
        controller.enqueue(encoder.encode(`data: ${state}\n\n`));
      };

      calc_error_callback = () => {
        controller.enqueue(encoder.encode(`data: CALC ERR\n\n`));
      };

      success_callback();

      emitter.on("calc_input_received", success_callback);
      emitter.on("calc_error", calc_error_callback);
    },

    cancel() {
      emitter.off("calc_input_received", success_callback);
      emitter.off("calc_error", calc_error_callback);
    },
  });

  return new Response(customReadable, {
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
};
