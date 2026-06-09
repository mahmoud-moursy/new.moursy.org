export type Filterable = "correct" | "present" | "absent";
export type LetterStatus = Filterable | "empty";
export type FilterResult = "ignored" | "invalid" | "accepted";

export class Filter {
  valid: boolean;
  filterType: Filterable;
  letter: string;
  pos: number;

  constructor(letter: string, filterType: Filterable, pos: number) {
    const validLetter = /^[a-z]$/;

    this.valid = validLetter.test(letter);
    this.letter = letter;
    this.filterType = filterType;
    this.pos = pos;

    if (this.letter.length !== 1) this.valid = false;
    if (this.pos > 4 || this.pos < 0) this.valid = false;
    if (
      this.filterType !== "correct" &&
      this.filterType !== "present" &&
      this.filterType !== "absent"
    )
      this.valid = false;
  }

  sameLetter(other: Filter) {
    return this.letter === other.letter;
  }

  samePos(other: Filter) {
    return this.pos === other.pos;
  }

  sameType(other: Filter) {
    return this.filterType === other.filterType;
  }

  apply(word: string) {
    if (this.filterType === "absent") {
      return !word.includes(this.letter);
    } else if (this.filterType === "present") {
      return word.includes(this.letter) && word[this.pos] !== this.letter;
    } else if (this.filterType === "correct") {
      return word[this.pos] === this.letter;
    }
  }
}

export class FilterList {
  filterList: Filter[];

  constructor() {
    this.filterList = [];
  }

  append(filter: Filter): FilterResult {
    if (!filter.valid) {
      return "invalid";
    }
    const letterFilters = this.filterList.filter((f) => filter.sameLetter(f));
    for (const original of letterFilters) {
      if (filter.filterType === "absent" && original.filterType !== "absent") {
        // Sometimes there can be one correct and one absent of the same letter,
        // (e.g: the input 'never') can have a green e (1st e) and a gray e (2nd e)
        return "ignored";
      }
    }

    const spotFilters = letterFilters.filter((f) => filter.samePos(f));
    for (const original of spotFilters) {
      const oneIsCorrect = [original.filterType, filter.filterType].includes("correct");

      if (oneIsCorrect && !filter.sameType(original)) {
        return "invalid";
      }
    }

    this.filterList.push(filter);
    return "accepted";
  }

  apply(word: string) {
    return this.filterList.every((filter) => filter.apply(word));
  }
}
