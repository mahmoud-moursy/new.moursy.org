<script context="module" lang="ts">
  export type LetterStatus = "correct" | "present" | "absent" | "empty";
</script>

<script lang="ts">
  import FillBox from "./fill-box.svelte";

  import GuessBox from "./guess-box.svelte";
</script>

<section class="grid grid-cols-5 grid-rows-6 p-4 gap-4 w-fit uppercase">
  <GuessBox letter="A" status="correct" />
  <GuessBox letter="B" status="present" />
  <GuessBox letter="C" status="absent" />
  <GuessBox letter="D" status="empty" />
  <GuessBox letter="E" status="correct" />
  <FillBox />
</section>
