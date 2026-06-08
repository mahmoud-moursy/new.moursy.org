<script lang="ts">
  import type { LetterStatus } from "./game.svelte";
  import type { TransitionConfig } from "svelte/transition";

  interface GuessBoxProps {
    letter: string;
    status: LetterStatus;
    rowOrder: number;
  }
  const flipIn = (node: HTMLElement, params: { delay: number }): TransitionConfig => {
    return {
      delay: params.delay,
      duration: 300,
      css: (t) => `
        transform: rotateX(${(1 - t) * 180}deg);
      `,
    };
  };

  let { letter, status, rowOrder }: GuessBoxProps = $props();
</script>

<div
  class="w-12 h-12 flex items-center justify-center text-xl font-bold uppercase backface-hidden text-white"
  class:bg-emerald-700!={status === "correct"}
  class:bg-yellow-700!={status === "present"}
  class:bg-slate-700!={status === "absent" || status === "empty"}
  class:border-dashed!={status === "empty"}
  in:flipIn={{ delay: rowOrder * 300 }}>
  {letter}
</div>
