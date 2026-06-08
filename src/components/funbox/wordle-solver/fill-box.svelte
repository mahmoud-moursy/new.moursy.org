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

  interface FillBoxProps {
    value?: string;
    status?: LetterStatus;
    backward?: HTMLInputElement;
    next?: HTMLInputElement;
    element?: HTMLInputElement;
  }

  let {
    status = $bindable("empty"),
    value = $bindable(""),
    element = $bindable(),
    backward,
    next,
  }: FillBoxProps = $props();

  const statusOrdering: LetterStatus[] = $state(["correct", "absent", "present"]);
  const orderingPositions = [
    "row-start-1 row-end-1 col-start-1 col-end-1",
    "row-start-2 row-end-2 col-start-1 col-end-1",
    "row-start-3 row-end-3 col-start-1 col-end-1",
  ];

  function swapOn(idx: number) {
    [statusOrdering[1], statusOrdering[idx]] = [statusOrdering[idx], statusOrdering[1]];
  }

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
      swapOn(statusOrdering.indexOf(shortcuts[e.key]));

      if (value !== "" && status !== "empty" && next) {
        e.preventDefault();
        next.focus();
      }

      return;
    }

    if (pattern.test(e.key)) {
      value = e.key.trim().toUpperCase();
      bounce();

      if (value !== "" && status !== "empty" && next) {
        e.preventDefault();
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

  const statusEffects = {
    correct: "bg-emerald-700 text-white border-0!",
    present: "bg-yellow-700 text-white border-0!",
    absent: "bg-slate-700 text-white border-0!",
    empty: "border-slate-700/50 hocus:border-slate-700/90",
  };
</script>

<label class="grid grid-rows-3 grid-cols-1 transition-colors items-center justify-center">
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
      statusEffects[status],
    ]}
    onkeydown={checkKeypress}
    bind:this={element}
    bind:value />
  {#each statusOrdering as state, idx (state)}
    <label
      animate:flip={{ duration: 150 }}
      class={["radio-btn", orderingPositions[idx]]}
      class:bg-yellow-700={state === "present"}
      class:bg-emerald-700={state === "correct"}
      class:bg-slate-700={state === "absent"}
      {@attach bounceOnEvent("change")}>
      <input
        type="radio"
        bind:group={status}
        value={state}
        class="appearance-none"
        onchange={() => {
          swapOn(idx);
          ratchet();
          element.focus();
        }}
        tabindex="-1"
        disabled={state === status} />
      <ruby class="text-center">
        <rb>{phoneGlyphs[state]}</rb>
        <rt class="keyboard-shortcut text-current/50 font-black p-0.5"
          >{shortCutInverses[state]}</rt>
      </ruby>
    </label>
  {/each}
</label>

<style lang="postcss">
  @import "tailwindcss";

  .radio-btn {
    @apply flex aspect-square scale-80 cursor-pointer items-center justify-center font-mono font-black text-white transition-all select-none *:scale-125;
  }

  @media (hover: none) {
    .radio-btn > .keyboard-shortcut {
      @apply hidden;
    }
  }
</style>
