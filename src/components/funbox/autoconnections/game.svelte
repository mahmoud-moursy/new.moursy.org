<script lang="ts">
  import { generateSet, loadList } from "$/pages/funbox/autoconnections/_logic.ts";
    import { flip } from "svelte/animate";
    import { fade, slide } from "svelte/transition";

  interface Props {
    wordBin: Uint8Array,
    connections: [string, number, number][] | undefined
  }

  let {
    wordBin,
    connections = $bindable()
  }: Props = $props();


  const maxMistakes = 4;
  let mistakeCount = $state(0);

  let currentQuip = $state("Autoconnections");

  let openingQuips = [
    "Tastes a little more metallic than the original...?",
    "We've decided to right-size our workforce due to increased AI demand!",
    "Now with 100% less human!",
    "Why play the real thing when you can play this instead!?",
    "Connections minus the human connection!",
    "Did You Know: Mr. Moursy couldn't figure out how they did the group title banners in Connections, so he gave up on re-implementing that part. Don't tell anyone else though!"
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
    "Okay I Believe I’ve Made My Point I’m Going To Procedurally Loop My Dialogue Now. 👸"
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
    "He who knows all answers has not been asked all questions. Harder trials await."
  ];

  let victory = $state(false);
  let defeat = $derived(mistakeCount >= maxMistakes);
  let gameOver = $derived(victory || defeat)

  let wordList = loadList(wordBin);
  let selections: Record<string, boolean>[] = $state([
    {},
    {},
    {},
    {}
  ])

  let solved = $state([false, false, false, false]);

  if(!connections) resetGame();

  shuffleArray(connections);

  let maxChecked = $derived(countChecked(selections) >= 4);

  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function countChecked(selections: Record<string, boolean>[]) {
    let count = 0;

    for(let group of selections) {
      Object.values(group).forEach(checked => checked ? count++ : count);
    }

    return count
  }

  function checkSolved() {
    let noMistake = false;

    selections.map((selection, idx) => {
      let solution = Object.values(selection).every(checked => checked);

      if(solution && !solved[idx])
        arrangeSolved(idx);

      solved[idx] = solved[idx] || solution;
      noMistake = noMistake || solution;

      return solution;
    })

    if(!noMistake) {
      mistakeCount += 1;
    }

    resetSelections();

    victory = solved.every(checked => checked);
  }

  function resetSelections() {
    let falsy = selections.map(selection => Object.entries(selection).map(([word, _]) => [word, false]))
    selections = falsy.map(Object.fromEntries)
  }

  function arrangeSolved(idx: number) {
    let row: number = solved.map(s => s ? 1 : 0).reduce((a, b) => a + b);

    let rowStart = row*4;


    let swapIndices = connections!.filter(([_word, _sim, tag]) => tag == idx).map(word => connections!.indexOf(word));

    for(let swapOrdering in swapIndices) {
      setTimeout(() => {
        let swapIdx = swapIndices[swapOrdering];
        [connections![rowStart], connections![swapIdx]] = [connections![swapIdx], connections![rowStart]];
        rowStart += 1;
      }, (swapOrdering+3) * 25)
    }
  }

  function resetGame() {
    let autoList = [...generateSet(wordList, 0, 0), ...generateSet(wordList, 1, 80), ...generateSet(wordList, 2, 90), ...generateSet(wordList, 3, 120)];

    mistakeCount = 0;
    solved = [false, false, false, false];
    connections = autoList;
    resetSelections();

    victory = false;
  }
</script>

<div class="grid grid-cols-1 grid-rows-1">
  <form class="grid grid-cols-4 grid-rows-4 gap-2 col-start-1 col-end-1 row-start-1 row-end-1">
    {#each connections as [word, sim, tag] (word)}
      <label for={word}
             class="flex items-center p-4 justify-center text-center text-sm sm:text-base md:text-lg font-bold bg-amber-200 cursor-pointer has-disabled:cursor-default has-checked:bg-amber-300 has-checked:scale-95 has-disabled:opacity-25 transition-all"
             class:bg-slate-300!={solved[tag]}
             animate:flip={{duration: 200}}
      >
        <input hidden id={word} type="checkbox" value={word} bind:checked={selections[tag][word]} disabled={(maxChecked && !selections[tag][word]) || solved[tag] || gameOver} />
        {word}
      </label>
    {/each}
  </form>
  {#if gameOver}
  <div class="col-start-1 col-end-1 row-start-1 row-end-1 flex items-center justify-center flex-col gap-4 bg-amber-200 z-10" transition:fade={{duration:150}}>
    <h1>{victory ? "You win! 🌟" : "Not quite 🚫"}</h1>
    <p class=""></p>
    <button class="p-4 border-4 border-amber-400 w-fit cursor-pointer hover:bg-amber-400 hover:text-white transition-all font-bold" onclick={resetGame}>Reset?</button>
  </div>
    {/if}
</div>

<div class="text-center">
  Mistakes Remaining: <br>
  {#key mistakeCount}

    {#each Array(maxMistakes-mistakeCount)}
    <span transition:slide>
      🛑
    </span>
  {:else}
    None
  {/each}
    {/key}
</div>


<nav class="mx-auto flex flex-wrap gap-4 items-center justify-center">
  <button class="active-button" onclick={() => shuffleArray(connections)} disabled={gameOver}>Shuffle</button>
  <button class="active-button" onclick={resetSelections} disabled={gameOver}>Deselect All</button>
  <button class="active-button" onclick={checkSolved} disabled={gameOver}>Submit</button>
  <button class="active-button border-red-400! hover:bg-red-400!" onclick={resetGame}>Reset game</button>
</nav>

<style>
  @import "tailwindcss";

  .active-button {
      @apply p-4 border-4 border-amber-400 w-fit cursor-pointer disabled:cursor-not-allowed hover:bg-amber-400 hover:text-white transition-all font-bold disabled:bg-slate-400! disabled:border-slate-400! disabled:text-white;
  }
</style>