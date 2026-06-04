<script lang="ts">
  import { fade } from "svelte/transition";
    import Game from "./game.svelte";

  const wordListUrl = "/funbox/autoconnections/word-list.bin.br"

  const cache: Cache | undefined = window["caches"] ? await window.caches.open('autoconnections-cache') : undefined;

  let emptyPromise: Promise<undefined> = new Promise(res => res(undefined));
  let wordBin: Promise<Uint8Array | undefined> = $state(cache ? cache.match(wordListUrl).then(res => {
    if(res) {
      return res.bytes()
    }
  }) : emptyPromise);

  async function downloadList() {
    const request = fetch(wordListUrl);
    wordBin = request.then(res => res.clone().bytes())
    await cache?.put(wordListUrl, await request)
  }
</script>

<main class="p-4 flex flex-col gap-4" in:fade>
  {#await wordBin}
    <h1 class="animate-pulse [animation-duration:0.5s]">Loading word list...</h1>
  {:then wordBin}
    {#if wordBin === undefined}
      <h1>Hello, you!</h1>
      <p>You need to download the word list before playing autoconnections (5.8MiB).</p>
      {#if !window.isSecureContext}
      <p class="font-bold">Please connect to the website over HTTPS so that this download can be cached!</p>
      {/if}
      <button class="w-fit p-2 bg-yellow-700 text-amber-50" on:click={downloadList}>Download word list</button>
    {:else}
      <Game wordBin={wordBin} />
    {/if}
  {/await}
</main>