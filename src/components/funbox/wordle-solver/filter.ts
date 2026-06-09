export type InputState = "correct" | "present" | "absent";
export type LetterStatus = InputState | "empty";
export type FilterResult = "ignored" | "invalid" | "accepted";
export type FilterType = InputState | "at-least" | "at-most";

export class Filter {
  valid: boolean;
  filterType: FilterType;
  letter: string;
  pos: number;

  constructor(letter: string, filterType: FilterType, pos: number) {
    const validLetter = /^[a-z]$/;

    this.valid = validLetter.test(letter);
    this.letter = letter;
    this.filterType = filterType;
    this.pos = pos;

    if (this.letter.length !== 1) this.valid = false;
    if (this.pos > 4 || this.pos < -1) this.valid = false;
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
    return this.pos === other.pos || other.pos === -1 || this.pos === -1;
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
export class AtLeastFilter extends Filter {
  limit: number;

  constructor(letter: string, limit: number) {
    super(letter, "at-least", -1);
    this.limit = limit;
  }

  sameLetter(other: Filter) {
    return this.letter === other.letter;
  }

  samePos(other: Filter) {
    return true;
  }

  sameType(other: Filter) {
    return this.filterType === other.filterType;
  }

  apply(word: string) {
    const occurrences = word.split("").filter((c) => c === this.letter).length;
    return occurrences >= this.limit;
  }
}
export class AtMostFilter extends Filter {
  limit: number;

  constructor(letter: string, limit: number) {
    super(letter, "at-most", -1);
    this.limit = limit;
  }

  apply(word: string) {
    const occurrences = word.split("").filter((c) => c === this.letter).length;
    return occurrences <= this.limit;
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

    const spotFilters = letterFilters.filter((f) => filter.samePos(f));
    for (const original of spotFilters) {
      const oneIsCorrect = [original.filterType, filter.filterType].includes("correct");

      if (oneIsCorrect && !filter.sameType(original)) {
        return "invalid";
      }
    }

    for (const original of letterFilters) {
      if (filter.filterType === "absent" && original.filterType !== "absent") {
        // Sometimes there can be one correct and one absent of the same letter,
        // (e.g: the input 'never') can have a green e (1st e) and a gray e (2nd e)
        return "ignored";
      }
    }

    this.filterList.push(filter);
    return "accepted";
  }

  apply(word: string) {
    const lastFive = this.filterList.slice(-5);

    for (const filter of lastFive) {
      const sameLetters = lastFive.filter((f) => f.sameLetter(filter));

      const filterPresent = sameLetters.filter((f) => f.filterType === "present");
      const filterAbsent = sameLetters.filter((f) => f.filterType === "absent");

      const hasPresent = filterPresent.length > 0;
      const hasAbsent = filterAbsent.length > 0;

      if (hasPresent && hasAbsent) {
        this.filterList.push(new AtMostFilter(filter.letter, filterPresent.length));
      }

      this.filterList.push(new AtLeastFilter(filter.letter, filterPresent.length));
    }

    return this.filterList.every((filter) => filter.apply(word));
  }
}
