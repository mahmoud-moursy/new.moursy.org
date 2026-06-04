const decoder = new TextDecoder("utf-8");

export function loadList(input_buffer: Uint8Array): Record<string, number[]> {
  let pos = 0;
  let output: Record<string, number[]> = {};

  while (pos < input_buffer.length) {
    let currentWord = [];
    let currentChar = input_buffer[pos++];
    while (currentChar !== 0) {
      currentWord.push(currentChar);
      currentChar = input_buffer[pos++];
    }

    let wordBuffer = new Uint8Array(currentWord);
    const word = decoder.decode(wordBuffer);
    const coords = [];

    for (let i = 0; i < 300; i++) {
      const coordBuf = new Uint8Array([
        input_buffer[pos++],
        input_buffer[pos++],
        input_buffer[pos++],
        input_buffer[pos++],
      ]);
      const coordView = new Float32Array(coordBuf.buffer);
      coords.push(coordView[0]);
    }

    output[word] = coords;
  }

  return output
}

export function l1Distance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}

export function generateSet(wordList: Record<string, number[]>, set_tag: number, difficulty: number = 0) {
  const allWords = Object.keys(wordList);

  const wordIdx = Math.floor(Math.random() * allWords.length);
  const coreWord = allWords[wordIdx];
  const coreCoord = wordList[coreWord];

  const similarityList: [string, number, number][] =
    Object.entries(wordList).map(
      ([currentWord, currentCoord]) =>
      [currentWord, l1Distance(coreCoord, currentCoord), set_tag]
    );

  const selectionList = similarityList.filter(([word, sim]) => sim >= difficulty).toSorted(([wordA, simA], [wordB, simB]) => simB - simA);
  const wordSet = [selectionList.pop(), selectionList.pop(), selectionList.pop(), selectionList.pop()];

  const successful = wordSet.every(set => set !== undefined);

  if(successful)
    return wordSet
  else
    return generateSet(wordList, set_tag, difficulty)
}