<script lang="ts">
  import type { LetterStatus } from "./game.svelte";

  interface GuessBoxProps {
    letter: string;
    status: LetterStatus;
  }

  let { letter, status }: GuessBoxProps = $props();
</script>

<div
  class="w-12 h-12 border-4 border-slate-700 flex items-center justify-center text-xl font-bold uppercase"
  class:border-emerald-700!={status === "correct"}
  class:border-yellow-700!={status === "present"}
  class:border-slate-700!={status === "absent" || status === "empty"}
  class:border-dashed!={status === "empty"}>
  {letter}
</div>
