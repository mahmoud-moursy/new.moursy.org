<script lang="ts">
  import { generateSet, loadList } from "$/pages/funbox/autoconnections/_logic.ts";
  import { flip } from "svelte/animate";
  import { fade, fly, scale, slide } from "svelte/transition";
  import { bounceOnEvent } from "$components/funbox/interactions.svelte.ts";
  import { cubicInOut, elasticIn, elasticInOut } from "svelte/easing";

  interface Props {
    wordBin: Uint8Array;
    connections?: [string, number, any][];
  }

  let { wordBin, connections = $bindable() }: Props = $props();

  const maxMistakes = 4;
  let mistakeCount = $state(0);

  let openingQuips = [
    "Tastes a little more metallic than the original...?",
    "Moursy.org has decided to right-size its workforce due to increased AI demand! Not that it was ever larger than one, anyways...",
    "Now with 100% less human! Except for the human that made this...",
    "Why play the real thing when you can play this instead!?",
    "Connections minus the human connection!",
    "Did You Know: Mr. Moursy is actually 7'5\" in real life! This is a true verifiable fact from an unbiased source. You can trust me.",
  ];

  let mistakeQuipIdx = 0;
  let mistakeQuips = [
    "I'm so proud of you for being this slow and trying in vain anyway 💓",
    "I'm sure there's a puzzle game out there for someone with your... (dis)abilities 😄👍",
    "Like a baby learning to walk... but it's a stupid baby that can't solve the puzzle.",
    "Hey, if you keep playing and making mistakes, you might get to see all the quips on offer!",
    "Better to remain silent and be thought a fool than to speak and remove all doubt.",
    "You cannot disappoint, because at this point nobody expects anything at all.",
    "I'm sorry for being so harsh. It's okay... we all make mistakes! What's important is that we learn from them!",
    "Being encouraging is not for me. Back to insults.",
    "So confident yet so wrong 🥰",
    "This is why you should never try. What if you try and mess it up?",
    "Okay I Believe I’ve Made My Point I’m Going To Procedurally Loop My Dialogue Now. 👸",
  ];

  let correctQuipIdx = 0;
  let correctQuips = [
    "Even a broken clock is right twice a day. That means you're half as accurate as a broken clock.",
    "Now you're *exactly* as accurate as a broken clock.",
    "A broken clock can be right thrice a day if it's a Really Weird Day.",
    "Given an infinite amount of monkeys a typewriter each, and eventually one could write Shakespeare. You're the monkey. My game is the typewriter.",
    "They say the journey of a thousand miles begins with a single step...",
    "There is nothing so useless as doing efficiently that which should not be done at all. Spend your time on something more productive.",
    "Fortune often favors the foolish, so they mistake survival for wisdom.",
    "He who knows all answers has not been asked all questions. Harder trials await.",
  ];

  let nearSolveQuips = [
    "You were never close anyway.",
    "Close, but no cigar... what does that even mean?",
    "There's a red herring in there!",
    "At least you have a 75% success rate!",
  ];

  let currentQuip = $state(selectRandom(openingQuips));

  let victory = $state(false);
  let defeat = $derived(mistakeCount >= maxMistakes);
  let gameOver = $derived(victory || defeat);
  let hideGameOverScreen = $state(false);

  let wordList = loadList(wordBin);
  let selections: Record<any, boolean>[] = $state([{}, {}, {}, {}]);

  let solved: Record<any, boolean> = $state({});
  let solveOrder: any[] = $state([]);

  if (!connections) resetGame();

  shuffleArray(connections);

  let maxChecked = $derived(countChecked(selections) >= 4);

  function shuffleArray(array: any[]) {
    let numSolved: number = Object.values(solved).reduce((a, b) => a + b, 0);
    let rowStart = numSolved * 4;

    for (let i = rowStart; i < array.length; i++) {
      let j = Math.floor(Math.random() * (array.length - rowStart)) + rowStart;
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function countChecked(selections: Record<string, boolean>[]) {
    let count = 0;

    for (let group of selections) {
      Object.values(group).forEach((checked) => (checked ? count++ : count));
    }

    return count;
  }

  function checkSolved() {
    let noMistake = false;
    let nearSolve = false;

    selections.map((selection, idx) => {
      let numCorrect: number = Object.values(selection).reduce((a, b) => a + b, 0);

      let solution = numCorrect >= 4;
      nearSolve ||= numCorrect === 3;

      if (solution && !solved[idx]) {
        arrangeSolved(idx);
        solveOrder.push(idx);
      }

      solved[idx] ||= solution;
      noMistake ||= solution;

      return solution;
    });

    if (!noMistake) {
      mistakeCount += 1;
      if (nearSolve) {
        currentQuip = selectRandom(nearSolveQuips) + " (One away...)";
      } else {
        currentQuip = mistakeQuips[mistakeQuipIdx++];
        mistakeQuipIdx %= mistakeQuips.length;
      }
    } else {
      currentQuip = correctQuips[correctQuipIdx++];
      correctQuipIdx %= correctQuips.length;
    }

    resetSelections();

    victory = Object.values(solved).every((checked) => checked);
  }

  function resetSelections() {
    let falsy = selections.map((selection) =>
      Object.entries(selection).map(([word, _]) => [word, false]),
    );
    selections = falsy.map(Object.fromEntries);
  }

  function arrangeSolved(tag: any, row: number | undefined = undefined) {
    row = row ?? Object.values(solved).reduce((a, b) => a + b, 0);

    let rowStart = row * 4;

    let swapIndices = connections!
      .filter(([_word, _sim, ctag]) => {
        return ctag == tag;
      })
      .map((word) => connections!.indexOf(word));

    for (let swapOrdering in swapIndices) {
      setTimeout(
        () => {
          let swapIdx = swapIndices[swapOrdering];
          [connections![rowStart], connections![swapIdx]] = [
            connections![swapIdx],
            connections![rowStart],
          ];
          rowStart += 1;
        },
        (parseInt(swapOrdering) + 3) * 25,
      );
    }
  }

  function showSolution() {
    hideGameOverScreen = true;

    let solveCount = 1;

    for (let key in selections) {
      if (solved[key]) {
        continue;
      }

      setTimeout(
        () => {
          arrangeSolved(key);
          solved[key] = true;
        },
        solveCount++ * 500 + solveCount * 50,
      );
    }
  }

  function resetGame() {
    let autoList = [
      ...generateSet(wordList, 0, 0),
      ...generateSet(wordList, 1, 0),
      ...generateSet(wordList, 2, 0),
      ...generateSet(wordList, 3, 0),
    ];

    mistakeCount = 0;
    solved = {};
    solveOrder = [];
    connections = autoList;
    selections = [{}, {}, {}, {}];
    shuffleArray(connections);
    resetSelections();

    victory = false;
    hideGameOverScreen = false;
  }

  function selectRandom(list: any[]) {
    let randIdx = Math.floor(Math.random() * list.length);
    return list[randIdx];
  }
</script>

<div class="grid grid-cols-1 grid-rows-1">
  {#key currentQuip}
    <aside
      class="text-sm max-w-md mx-auto text-center col-start-1 col-end-1 row-start-1 row-end-1"
      transition:fade>
      {currentQuip}
    </aside>
  {/key}
</div>
<div class="grid grid-cols-1 grid-rows-1">
  <form
    class="grid grid-cols-4 grid-rows-4 gap-2 col-start-1 col-end-1 row-start-1 row-end-1">
    {#each connections as [word, sim, tag] (word + tag + sim)}
      <label
        for={word}
        class="flex items-center p-4 justify-center text-center text-xs md:text-lg font-bold bg-amber-200 cursor-pointer has-disabled:cursor-default has-checked:bg-amber-300 has-checked:scale-95 has-disabled:opacity-25 transition-all"
        class:bg-slate-300!={solved[tag]}
        animate:flip={{ duration: 300, delay: 500, easing: cubicInOut }}>
        <input
          hidden
          id={word}
          type="checkbox"
          value={word}
          bind:checked={selections[tag][word]}
          disabled={(maxChecked && !selections[tag][word]) || solved[tag] || gameOver} />
        {word}
      </label>
    {/each}
  </form>
  <div
    class="col-start-1 col-end-1 gap-2 z-10 pointer-events-none row-start-1 row-end-1 grid grid-cols-1 grid-rows-4">
    {#each solveOrder as key (key)}
      {#if solved[key]}
        <div
          class="bg-amber-950 text-white flex flex-col items-center justify-center"
          in:scale|global={{ easing: elasticInOut, duration: 1500, start: 0.8 }}>
          <h3 class="p-2">Group {parseInt(key) + 1}</h3>
          <p class="p-1">
            {#each Object.keys(selections[key]) as word}
              <span class="px-2">{word}</span>
            {/each}
          </p>
        </div>
      {/if}
    {/each}
  </div>
  {#if gameOver && !hideGameOverScreen}
    <div
      class="col-start-1 col-end-1 row-start-1 row-end-1 flex items-center justify-center flex-col gap-4 bg-amber-200 z-20"
      transition:fade={{ duration: 150 }}>
      <h1>{victory ? "You win! 🌟" : "Not quite 🚫"}</h1>
      <nav class="flex flex-wrap gap-4">
        <button
          class="interactive-button"
          onclick={resetGame}
          {@attach bounceOnEvent("click")}>Reset?</button>
        <button
          class="interactive-button"
          onclick={() => (hideGameOverScreen = true)}
          {@attach bounceOnEvent("click")}>Review Puzzle</button>
        {#if defeat}
          <button
            class="interactive-button"
            onclick={showSolution}
            {@attach bounceOnEvent("click")}>Show solution?</button>
        {/if}
      </nav>
    </div>
  {/if}
</div>

<div class="text-center">
  Mistakes Remaining: <br />
  <nav class="flex gap-1 justify-center">
    {#key mistakeCount}
      {#each Array(Math.max(0, maxMistakes - mistakeCount)) as a, p (p)}
        <p out:fly>🛑</p>
      {:else}
        None
      {/each}
    {/key}
  </nav>
</div>

<nav class="mx-auto flex flex-wrap gap-4 justify-stretch">
  <button
    class="interactive-button flex-1 border-red-400! hocus:bg-red-400!"
    onclick={resetGame}
    {@attach bounceOnEvent("click")}>Reset game</button>
  <button
    class="interactive-button flex-1"
    onclick={resetSelections}
    disabled={gameOver}
    {@attach bounceOnEvent("click")}>Deselect All</button>
  <button
    class="interactive-button flex-1"
    onclick={() => shuffleArray(connections)}
    disabled={gameOver}
    {@attach bounceOnEvent("click")}>Shuffle</button>
  <button
    class="interactive-button flex-1"
    onclick={checkSolved}
    disabled={gameOver || !maxChecked}
    {@attach bounceOnEvent("click")}>Submit</button>
</nav>

<style lang="postcss">
  @import "tailwindcss";
  @custom-variant hocus (&:hover, &:focus, &:active);

  .interactive-button {
    @apply hocus:bg-amber-400 hocus:text-white cursor-pointer border-4 border-amber-400 p-4 font-bold transition-all disabled:cursor-not-allowed disabled:border-slate-400! disabled:bg-slate-400! disabled:text-white;
  }
</style>
