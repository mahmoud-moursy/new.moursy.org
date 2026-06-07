<script lang="ts">
  import {
    bounceOnEvent,
    makeBouncer,
    makeRatchet,
    makeShaker,
    shakeOnEvent,
  } from "$components/funbox/interactions.svelte.ts";
  import type { FormEventHandler, KeyboardEventHandler } from "svelte/elements";
  import type { LetterStatus } from "./game.svelte";
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";

  let element: HTMLInputElement;

  interface FillBoxProps {
    value?: string;
    status?: LetterStatus;
    backward?: HTMLInputElement;
    next?: HTMLInputElement;
  }

  let {
    status = $bindable("empty"),
    value = $bindable(""),
    backward,
    next,
  }: FillBoxProps = $props();

  const arrowStates: Record<LetterStatus, [LetterStatus, LetterStatus, LetterStatus]> = {
    empty: ["correct", "empty", "present"],
    correct: ["present", "correct", "absent"],
    present: ["correct", "present", "absent"],
    absent: ["correct", "absent", "present"],
  };

  let shake: () => void;
  let bounce: () => void;
  let ratchet: () => void;

  onMount(() => {
    shake = makeShaker(element);
    bounce = makeBouncer(element);
    ratchet = makeRatchet(element);
  });

  const shortCutInverses: Record<LetterStatus, string> = {
    correct: "1",
    present: "2",
    absent: "3",
    empty: "",
  };

  const phoneGlyphs: Record<LetterStatus, string> = {
    correct: "✅",
    present: "⚠️",
    absent: "❌",
    empty: "",
  };

  const shortcuts: Record<string, LetterStatus> = {
    [shortCutInverses.correct]: "correct",
    [shortCutInverses.present]: "present",
    [shortCutInverses.absent]: "absent",
  };

  const checkKeypress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const pattern = /^[a-zA-Z]$/g;

    if (e.key === "Tab") {
      return;
    }

    if (e.key in shortcuts) {
      if (status !== shortcuts[e.key]) {
        ratchet();
      }
      status = shortcuts[e.key];
      return;
    }

    if (pattern.test(e.key)) {
      value = e.key.trim().toUpperCase();
      bounce();

      if (value !== "" && status !== "empty" && next) {
        next.focus();
      }

      return;
    }

    if (e.key === "Backspace") {
      if (value === "" && backward) {
        backward.focus();
      }
      shake();
      value = "";
      return;
    }

    status = "empty";
    ratchet();
  };

  $effect(() => {
    value = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
  });

  const borderEffects = {
    correct: "border-emerald-700",
    present: "border-yellow-700",
    absent: "border-slate-700",
    empty: "border-slate-700/50 hocus:border-slate-700/90",
  };
</script>

<label
  class="grid grid-rows-3 grid-cols-1 gap-4 transition-colors items-center justify-center perspective-normal">
  <input
    type="text"
    maxlength="1"
    pattern="[A-Z]"
    placeholder="."
    class={[
      "w-12 h-12 flex border-2",
      "items-center text-center focus:outline-0 focus:border-4 justify-center",
      "text-xl font-bold uppercase peer bg-amber-50",
      "row-start-2 row-end-2 col-start-1 col-end-1 z-10 transition-[border,border-color]",
      borderEffects[status],
    ]}
    onkeydown={checkKeypress}
    bind:this={element}
    bind:value />
  {#each arrowStates[status] as state (state)}
    <label
      animate:flip={{ duration: 150 }}
      class="radio-btn"
      class:bg-yellow-700={state === "present"}
      class:bg-emerald-700={state === "correct"}
      class:bg-slate-700={state === "absent"}
      class:row-start-2={state === status}
      class:row-end-2={state === status}
      class:col-start-1={state === status}
      class:col-end-1={state === status}
      class:-translate-z-96={state === status}
      class:-translate-z-48={state !== status}
      {@attach bounceOnEvent("change")}>
      <input
        type="radio"
        bind:group={status}
        value={state}
        class="appearance-none"
        onchange={() => {
          ratchet();
          element.focus();
        }}
        tabindex="-1"
        disabled={state === status} />
      <p class="keyboard-shortcut">
        {shortCutInverses[state]}
      </p>
      <p class="phone-glyph hidden">
        {phoneGlyphs[state]}
      </p>
    </label>
  {/each}
</label>

<style lang="postcss">
  @import "tailwindcss";

  .radio-btn {
    @apply flex aspect-square cursor-pointer items-center justify-center font-mono font-black text-white transition-all select-none *:scale-125;
  }

  @media (hover: none) {
    .radio-btn > .keyboard-shortcut {
      @apply hidden;
    }
    .radio-btn > .phone-glyph {
      @apply block;
    }
  }
</style>
