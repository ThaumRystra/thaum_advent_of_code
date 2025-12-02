import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day11: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  // Take our list of stones and turn it into an array of numbers
  let stones = readInput(2024, 11).split(" ").map(Number);
  // For each step, blink at each stone
  for (let i = 0; i < 25; i++) {
    stones = _.flatMap(stones, blinkStone);
  }
  // Return the length of our list of stones
  return stones.length;
}

function blinkStone(number: number): number[] {
  // if the stone has 0 on it, replace it with a stone with a 1 on it
  if (number === 0) return [1];
  // If the stone's number is an even number of characters, split it into two stones
  const str = number.toString();
  if (str.length % 2 === 0) {
    const halfway = str.length / 2;
    return [parseInt(str.slice(0, halfway)), parseInt(str.slice(halfway))];
  }
  // Otherwise multiply the stone's number by 2024
  return [number * 2024];
}

// Identical to part 1, but with 75 iterations
// This naive solution runs out of memory at around 38 iterations
function _part2Naive(): number {
  let stones = readInput(2024, 11).split(" ").map(Number);
  for (let i = 0; i < 75; i++) {
    stones = _.flatMap(stones, blinkStone);
    console.log(i);
  }
  return stones.length;
}

function part2(): number {
  const stones = readInput(2024, 11).split(" ").map(Number);

  function blinkAtStone(stone: number, blinksLeft: number): number {
    if (blinksLeft === 0) {
      return 1;
    }
    if (stone === 0) {
      // at the next step, we have [1] and 1 fewer blinks left
      return blinkAtStoneMemoized(1, blinksLeft - 1);
    }
    const str = stone.toString();
    if (str.length % 2 === 0) {
      const halfway = str.length / 2;
      return (
        blinkAtStoneMemoized(parseInt(str.slice(0, halfway)), blinksLeft - 1) +
        blinkAtStoneMemoized(parseInt(str.slice(halfway)), blinksLeft - 1)
      );
    }
    return blinkAtStoneMemoized(stone * 2024, blinksLeft - 1);
  }

  const memo = new Map<string, number>();
  const hash = (stone: number, blinksLeft: number) => `${stone}:${blinksLeft}`;

  function blinkAtStoneMemoized(stone: number, blinksLeft: number): number {
    const key = hash(stone, blinksLeft);
    if (memo.has(key)) {
      return memo.get(key) as number;
    }
    const count = blinkAtStone(stone, blinksLeft);
    memo.set(key, count);
    return count;
  }

  return stones
    .map((stone) => blinkAtStoneMemoized(stone, 75))
    .reduce((prev, acc) => prev + acc, 0);
}
