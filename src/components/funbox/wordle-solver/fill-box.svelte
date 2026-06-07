<script lang="ts">
  import { shakeOnEvent } from "$components/funbox/interactions.svelte.ts";
  import type { FormEventHandler } from "svelte/elements";
  import type { LetterStatus } from "./game.svelte";

  let shouldShake = $state(false);
  let shouldDepress = $state(false);

  const checkInput: FormEventHandler<HTMLInputElement> = (ev) => {
    shouldShake = false;

    const input = ev.currentTarget;
    if (input.value.length === 0) {
      shouldShake = true;
    } else {
      shouldDepress = true;
      setTimeout(() => (shouldDepress = false), 200);
    }
  };

  let status: LetterStatus = $state("empty");
  let value: string = $state("");
</script>

<label>
  <input
    type="text"
    maxlength="1"
    placeholder="."
    class="w-12 h-12 border-4 border-slate-700 flex
    items-center text-center focus:outline-0 justify-center
    text-xl font-bold uppercase transition-all"
    class:border-emerald-700!={status === "correct"}
    class:border-yellow-700!={status === "present"}
    class:border-slate-700!={status === "absent" || status === "empty"}
    class:border-dashed!={status === "empty"}
    oninput={checkInput}
    bind:value
    {@attach shakeOnEvent("click")} />
  <input type="radio" value="correct" name="status" bind:group={status} />
  <input type="radio" value="present" name="status" bind:group={status} />
  <input type="radio" value="absent" name="status" bind:group={status} />
</label>
