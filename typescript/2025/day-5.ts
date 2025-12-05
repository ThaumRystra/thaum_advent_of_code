import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day5: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  //   const input = `\
  // 3-5
  // 10-14
  // 16-20
  // 12-18

  // 1
  // 5
  // 8
  // 11
  // 17
  // 32`;
  const input = readInput(2025, 5);
  const [ranges, numbers] = parseInput(input);
  const mergedRanges = mergeOverlappingRanges(ranges);
  return numbers.reduce((acc, num) => {
    for (const range of mergedRanges) {
      // If we go past the relevant ranges, give up
      if (num < range.low) {
        return acc;
      }
      // If it's in range, count ti
      if (inRange(range, num)) {
        return acc + 1;
      }
    }
    return acc;
  }, 0);
}

function part2(): number {
  const input = readInput(2025, 5);
  const [ranges] = parseInput(input);
  const mergedRanges = mergeOverlappingRanges(ranges);
  return mergedRanges.reduce(
    (acc, range) => acc + (1 + range.high - range.low),
    0
  );
}

function parseInput(input: string): [Range[], number[]] {
  const [rangeInput, numbersInput] = input.split("\n\n");
  const ranges: Range[] = rangeInput.split("\n").map((line) => {
    const [lowString, highString] = line.split("-");
    return {
      low: Number.parseInt(lowString),
      high: Number.parseInt(highString),
    };
  });
  const numbers = numbersInput.split("\n").map((num) => Number.parseInt(num));
  return [ranges, numbers];
}

type Range = {
  low: number;
  high: number;
};

function rangeCompareByLow(a: Range, b: Range): number {
  return a.low - b.low;
}

function inRange(range: Range, num: number): boolean {
  return num >= range.low && num <= range.high;
}

function mergeOverlappingRanges(ranges: Range[]): Range[] {
  const sortedRanges = [...ranges].sort(rangeCompareByLow);
  const mergedRanges: Range[] = [];
  let currentRange: Range | null = null;
  for (let range of sortedRanges) {
    // If current range isn't set, set it and continue
    if (!currentRange) {
      currentRange = { ...range };
      continue;
    }
    // If this range overlaps the current range and extends its right side, grow the current range
    if (inRange(currentRange, range.low) && range.high > currentRange.high) {
      currentRange.high = range.high;
    }
    // If this range is strictly after the current range, push the current range and carry on
    if (range.low > currentRange.high) {
      mergedRanges.push(currentRange);
      currentRange = { ...range };
    }
  }
  if (currentRange) mergedRanges.push(currentRange);
  return mergedRanges;
}
