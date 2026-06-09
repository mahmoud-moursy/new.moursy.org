<script lang="ts">
  import {
    bounceOnEvent,
    makeBouncer,
    makeRatchet,
    makeShaker,
    shakeOnEvent,
  } from "$components/funbox/interactions.svelte.ts";
  import type { FormEventHandler, KeyboardEventHandler } from "svelte/elements";
  import type { LetterStatus, Filterable } from "./filter";
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { elasticIn, elasticOut } from "svelte/easing";

  interface FillBoxProps {
    value?: string;
    status?: LetterStatus;
    backward?: HTMLInputElement;
    next?: HTMLInputElement;
    element?: HTMLInputElement;
    start_element?: HTMLInputElement;
    disabled?: boolean;
  }

  let {
    status = $bindable("absent"),
    value = $bindable(""),
    element = $bindable(),
    disabled,
    backward,
    next,
    start_element,
  }: FillBoxProps = $props();

  const statusOrdering: Filterable[] = $state(["correct", "absent", "present"]);
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

  let display: HTMLElement | undefined;

  onMount(() => {
    shake = makeShaker(display!);
    bounce = makeBouncer(display!);
    ratchet = makeRatchet(display!);
  });

  const shortCutInverses: Record<Filterable, string> = {
    correct: "1",
    present: "2",
    absent: "3",
  };

  const hintGlyphs: Record<Filterable, string> = {
    correct: "✓",
    present: "?",
    absent: "✗",
  };

  const shortcuts: Record<string, Filterable> = {
    [shortCutInverses.correct]: "correct",
    [shortCutInverses.present]: "present",
    [shortCutInverses.absent]: "absent",
  };

  const checkShouldNext = (e: Event) => {
    const check = value !== "" && status !== "empty" && next;
    if (check) {
      if (next.value === "") next.focus();
    }

    return check;
  };

  const checkKeypress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const pattern = /^[a-zA-Z]$/g;

    if (e.key === "Tab") {
      return;
    }

    if (e.key === "Enter") {
      start_element?.focus();
      return;
    }

    if (e.key === "ArrowLeft") {
      backward?.focus();
      return;
    }

    if (e.key === "ArrowRight") {
      next?.focus();
      return;
    }

    if (e.key in shortcuts) {
      if (status !== shortcuts[e.key]) {
        ratchet();
      }
      status = shortcuts[e.key];
      swapOn(statusOrdering.indexOf(shortcuts[e.key]));

      checkShouldNext(e);
      e?.preventDefault();

      return;
    }

    if (pattern.test(e.key)) {
      value = e.key.trim().toLowerCase();
      bounce();

      if (checkShouldNext(e)) next?.focus();
      e?.preventDefault();

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

    status = "absent";
    ratchet();
  };

  $effect(() => {
    value = value.replace(/[^A-Za-z]/g, "").toLowerCase();
  });

  const statusEffects = {
    correct: "bg-emerald-700 text-white border-0!",
    present: "bg-yellow-700 text-white border-0!",
    absent: "bg-slate-700 text-white border-0!",
    empty: "border-slate-700/50 peer-hocus:border-slate-700/90",
  };
</script>

<label
  class="grid min-w-8 grid-rows-3 grid-cols-1 transition-colors items-center justify-center uppercase">
  <div class="relative w-full h-full row-start-2 row-end-2 col-start-1 col-end-1 z-10">
    <input
      type="text"
      maxlength="1"
      pattern="^[a-z]$"
      placeholder="."
      class="opacity-0 peer"
      {disabled}
      onkeydown={checkKeypress}
      bind:this={element}
      bind:value />
    <div
      class={[
        "absolute top-0 left-0 grid grid-cols-1 grid-rows-1 overflow-clip",
        "w-full h-full aspect-square flex border-2 mx-auto",
        "items-center text-center peer-focus:outline-2 outline-amber-300 peer-focus:border-4 justify-center",
        "text-xl font-bold uppercase peer bg-amber-50",
        "transition-[border,border-color]",
        statusEffects[status],
      ]}
      bind:this={display}>
      {#key value}
        <span
          in:fly={{
            duration: 500,
            easing: elasticOut,
            y: -50,
          }}
          out:fly={{
            duration: 500,
            easing: elasticOut,
            y: 50,
          }}
          class="col-start-1 col-end-1 row-start-1 row-end-1">
          {value.replace(/[^A-Za-z]/g, "").toLowerCase() || "."}
        </span>
      {/key}
    </div>
  </div>
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
        onchange={(e) => {
          swapOn(idx);
          ratchet();
          element!.focus();
          checkShouldNext(e);
        }}
        onclick={checkShouldNext}
        tabindex="-1"
        disabled={state === status} />
      <span class="text-[0.5rem] keyboard-shortcut text-current/50 scale-90">
        {shortCutInverses[state]}
      </span>
      {hintGlyphs[state]}
    </label>
  {/each}
</label>

<style lang="postcss">
  @import "tailwindcss";

  .radio-btn {
    @apply flex aspect-square scale-80 cursor-pointer flex-col items-center justify-center text-center font-black text-white transition-all duration-500 select-none *:h-min *:w-min *:scale-125 disabled:scale-50;
  }

  @media (hover: none) {
    label > .keyboard-shortcut {
      @apply hidden;
    }
  }
</style>
