<script lang="ts">
  import { wordleFlip } from "../interactions.svelte";
  import type { LetterStatus } from "./filter";

  interface GuessBoxProps {
    letter: string;
    status: LetterStatus;
    rowOrder: number;
    animate?: boolean;
  }

  const statusEffects: Record<LetterStatus, string> = {
    correct: "bg-emerald-700!",
    present: "bg-yellow-700!",
    absent: "bg-slate-700!",
    empty: "bg-amber-700/50! border-2! border-amber-700/50! border-dashed!",
  };

  let { letter, status, rowOrder, animate }: GuessBoxProps = $props();
</script>

<div
  class={[
    "w-full h-full flex aspect-square items-center justify-center text-xl font-bold backface-hidden text-white uppercase",
    statusEffects[status],
  ]}
  in:wordleFlip|global={{
    delay: animate ? rowOrder * 300 : 0,
    duration: animate ? 150 : 0,
  }}>
  {letter}
</div>
