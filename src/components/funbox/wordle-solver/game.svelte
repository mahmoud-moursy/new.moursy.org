<script context="module" lang="ts">
  export type LetterStatus = "correct" | "present" | "absent" | "empty";
</script>

<script lang="ts">
  import FillBox from "./fill-box.svelte";

  import GuessBox from "./guess-box.svelte";

  let inputs = $state([
    { value: "", status: "empty" as LetterStatus },
    { value: "", status: "empty" as LetterStatus },
    { value: "", status: "empty" as LetterStatus },
    { value: "", status: "empty" as LetterStatus },
    { value: "", status: "empty" as LetterStatus },
  ]);

  let inputElements = $state([undefined, undefined, undefined, undefined, undefined]);
</script>

<section class="grid grid-cols-5 grid-rows-7 mx-auto gap-4 w-fit uppercase">
  <GuessBox letter="A" status="correct" rowOrder={0} />
  <GuessBox letter="B" status="present" rowOrder={1} />
  <GuessBox letter="C" status="absent" rowOrder={2} />
  <GuessBox letter="D" status="empty" rowOrder={3} />
  <GuessBox letter="E" status="correct" rowOrder={4} />
  <h2 class="col-span-5 text-center border-4 border-amber-300/30">Hello</h2>
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
