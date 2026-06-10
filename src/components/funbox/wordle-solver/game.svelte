<script lang="ts">
  import { fade } from "svelte/transition";
  import { bounceOnEvent, shakeOnEvent, shakeUp } from "../interactions.svelte";
  import FillBox from "./fill-box.svelte";
  import { Filter, FilterList, type InputState, type LetterStatus } from "./filter";
  import GuessBox from "./guess-box.svelte";
  import wordRanks from "./word-ranks.json";

  let inputs = $state([
    { value: "", status: "absent" as InputState },
    { value: "", status: "absent" as InputState },
    { value: "", status: "absent" as InputState },
    { value: "", status: "absent" as InputState },
    { value: "", status: "absent" as InputState },
  ]);

  let filters = $derived([
    new Filter(inputs[0].value, inputs[0].status, 0),
    new Filter(inputs[1].value, inputs[1].status, 1),
    new Filter(inputs[2].value, inputs[2].status, 2),
    new Filter(inputs[3].value, inputs[3].status, 3),
    new Filter(inputs[4].value, inputs[4].status, 4),
  ]);
  let guesses: { value: string; status: InputState }[][] = $state([]);
  let ollKorrect = $derived(
    guesses[guesses.length - 1]?.every((i) => i.status === "correct"),
  );
  let submitButton;

  let inputElements: (HTMLInputElement | undefined)[] = $state([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);

  let filterList: FilterList = $state(new FilterList());

  let wordRanking = $state(
    Object.entries(wordRanks)
      .filter((a) => filterList.apply(a[0]))
      .sort((a, b) => b[1] - a[1]),
  );

  let filterError = $state(false);

  function resetAll(e: Event | undefined = undefined) {
    e?.preventDefault();

    filterError = false;
    inputs.forEach((inp) => (inp.value = ""));
    guesses = [];
    filterList = new FilterList();
    wordRanking = Object.entries(wordRanks)
      .filter((a) => filterList.apply(a[0]))
      .sort((a, b) => b[1] - a[1]);

    setTimeout(() => inputElements[0]!.focus(), 150);
  }

  function tryGuessing(e: Event) {
    e.preventDefault();

    for (const filter of filters) {
      const res = filterList.append(filter);
      if (res === "invalid") {
        filterError = true;
        break;
      }
    }

    wordRanking = Object.entries(wordRanks)
      .filter((a) => filterList.apply(a[0]))
      .sort((a, b) => b[1] - a[1]);

    const inputsCopy = JSON.parse(JSON.stringify(inputs));
    guesses = [...guesses, inputsCopy];
    const green = "GREEN";
    inputs = inputs.map((inp, idx) => ({
      value: ollKorrect
        ? green[idx]
        : wordRanking.length > 0
          ? wordRanking[0][0][idx]
          : "",
      status: ollKorrect ? "correct" : inp.status,
    }));

    inputElements[0]?.focus();

    if (ollKorrect) submitButton!.focus();
  }
</script>

<section class="grid grid-cols-5 z-10 mx-auto gap-4 w-sm max-w-full">
  {#each guesses as guess, uidx}
    {#each guess as box, idx (uidx * 5 + idx + box.value)}
      <GuessBox letter={box.value} status={box.status} rowOrder={idx} animate={false} />
    {/each}
  {/each}
  {#if !ollKorrect}
    {#if wordRanking.length > 0}
      {#key wordRanking[0][0]}
        {#each wordRanking[0][0] as letter, idx}
          <GuessBox {letter} status="empty" rowOrder={idx} animate={true} />
        {/each}
      {/key}
    {:else}
      {#each new Array(5) as _, idx}
        <GuessBox letter="💥" status="empty" rowOrder={idx} />
      {/each}
      <div
        class=" border-rose-900 bg-rose-50/50 border-2 border-dashed col-span-5 text-rose-900 flex flex-col text-center text-sm font-bold items-center justify-center p-2"
        in:shakeUp|global>
        <p>
          {#if filterError}
            The filter combination you put in was impossible, so you should probably reset
            everything and try putting it in again... 🤤
          {:else}
            Seems you've exhausted the word list... either The Wordle Solver is broken, or <em
              >you</em>
            are.
          {/if}
        </p>
      </div>
    {/if}
  {/if}
</section>

<form class="flex flex-col gap-4 p-12 mx-auto max-w-xs" onsubmit={tryGuessing}>
  <section class="grid grid-cols-5 *:col-span-1 gap-1">
    {#each inputs as input, idx (idx)}
      <FillBox
        bind:value={input.value}
        bind:status={input.status}
        bind:element={inputElements[idx]}
        disabled={ollKorrect || wordRanking.length === 0}
        next={inputElements[idx + 1]}
        backward={inputElements[idx - 1]}
        start_element={inputElements[0]} />
    {/each}
  </section>
  <button
    disabled={filters.some((f) => !f.valid) && !ollKorrect}
    class="transition-colors p-4 disabled:bg-slate-700 bg-rose-700 duration-300 text-white font-bold h-fit my-auto"
    {@attach bounceOnEvent("click")}
    onclick={ollKorrect ? resetAll : tryGuessing}
    bind:this={submitButton}>{ollKorrect ? "Reset All 🔄" : "Try 🎰"}</button>

  <button
    class="text-sm text-rose-700 decoration-wavy underline transition-all"
    {@attach shakeOnEvent("click")}
    onclick={resetAll}
    disabled={ollKorrect}
    class:opacity-0={ollKorrect}
    >Reset All 🔄
  </button>
</form>
