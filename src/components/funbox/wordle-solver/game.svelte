<script context="module" lang="ts">
  export type LetterStatus = "correct" | "present" | "absent" | "empty";
</script>

<script lang="ts">
  import FillBox from "./fill-box.svelte";

  import GuessBox from "./guess-box.svelte";

  let inputs = $state([
    { value: "", status: "absent" as LetterStatus },
    { value: "", status: "absent" as LetterStatus },
    { value: "", status: "absent" as LetterStatus },
    { value: "", status: "absent" as LetterStatus },
    { value: "", status: "absent" as LetterStatus },
  ]);

  let inputElements = $state([undefined, undefined, undefined, undefined, undefined]);
</script>

<section class="grid grid-cols-5 grid-rows-6 mx-auto gap-4 w-fit uppercase">
  <GuessBox letter="A" status="correct" />
  <GuessBox letter="B" status="present" />
  <GuessBox letter="C" status="absent" />
  <GuessBox letter="D" status="empty" />
  <GuessBox letter="E" status="correct" />
</section>

<form class="flex gap-4 mx-auto pb-12">
  {#each inputs as input, idx}
    <FillBox
      bind:value={input.value}
      bind:status={input.status}
      bind:element={inputElements[idx]}
      next={inputElements[idx + 1]}
      backward={inputElements[idx - 1]} />
  {/each}
</form>

{#each inputs as input}
  {input.value} - {input.status}
{/each}
