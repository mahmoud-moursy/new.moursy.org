<script lang="ts">
  import { fade } from "svelte/transition";
    import Game from "./game.svelte";

  const wordListUrl = "/funbox/autoconnections/word-list.bin.br"

  const cache: Cache = await caches.open('autoconnections-cache');

  let wordBin: Promise<Uint8Array | undefined> = $state(cache.match(wordListUrl).then(res => {
    if(res) {
      return res.bytes()
    }
  }));

  async function downloadList() {
    const request = fetch(wordListUrl);
    wordBin = request.then(res => res.clone().bytes())
    await cache.put(wordListUrl, await request)
  }
</script>

<main class="p-4 flex flex-col gap-4" in:fade>
  {#await wordBin}
    <h1 class="animate-pulse [animation-duration:0.5s]">Loading word list...</h1>
  {:then wordBin}
    {#if wordBin === undefined}
      <h1>Hello, you!</h1>
      <p>You need to download the word list before playing autoconnections (5.8MiB).</p>
      <button class="w-fit p-2 bg-yellow-700 text-amber-50" on:click={downloadList}>Download word list</button>
    {:else}
      <Game wordBin={wordBin} />
    {/if}
  {/await}
</main>