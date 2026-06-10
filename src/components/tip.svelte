<script lang="ts">
  import { onMount } from "svelte";
  import { elasticOut } from "svelte/easing";
  import { scale } from "svelte/transition";

  interface Props {
    htmlContent: string;
    onClosed: () => void;
    desktopOnly?: boolean;
  }

  const { htmlContent, onClosed, desktopOnly = false }: Props = $props();
  let rightOffset = $state("default");

  let element: Element;

  const calculateBounds = () => {
    const elRect = element.getBoundingClientRect();

    let current = elRect.width + 10;

    if (elRect.left - elRect.width < 0) current += elRect.left - elRect.width - 20;

    rightOffset = `${current}px`;
  };

  onMount(() => {
    calculateBounds();
    window.addEventListener("resize", calculateBounds);
    return () => {
      window.removeEventListener("resize", calculateBounds);
      onClosed();
    };
  });

  let heyListen = $state(false);
</script>

<div
  class="relative h-0 w-0 opacity-85 hocus:opacity-100 transition-all z-20"
  style:right={rightOffset}
  style:bottom={"0px"}
  class:desktop-only={desktopOnly}>
  <label
    bind:this={element}
    class={[
      "relative w-max bg-amber-200/80 max-w-96 cursor-help has-focus:border-solid has-focus:border-4 grid border-amber-800/40 border-2 border-dashed grid-cols-1 grid-rows-1 transition-all text-sm items-center justify-center z-20 p-2",
      heyListen && " text-amber-800 font-bold p-4!",
    ]}>
    {#if !heyListen}
      <p
        class="row-start-1 row-end-1 col-start-1 col-end-1 relative w-max"
        transition:scale={{ easing: elasticOut, start: 0.8, duration: 500 }}>
        <button
          class="appearance-none"
          onclick={(e) => {
            e.preventDefault();
            heyListen = true;
          }}>
          💡</button>
      </p>
    {:else}
      <p
        class="row-start-1 row-end-1 col-start-1 col-end-1 relative w-max"
        transition:scale={{ easing: elasticOut, start: 0.8, duration: 500 }}>
        <button
          onclick={(e) => {
            e.preventDefault();
            onClosed();
          }}
          class="text-rose-900 underline">(x)</button>
        {@html htmlContent}
      </p>
    {/if}
  </label>
</div>

<style>
  @keyframes bouncing {
    from {
      scale: 100%;
    }

    50% {
      scale: 98%;
    }

    to {
      scale: 100%;
    }
  }

  .bouncing {
    animation: bouncing 0.45s ease-in-out infinite;
  }

  @media (hover: none) {
    .desktop-only {
      display: none;
    }
  }
</style>
