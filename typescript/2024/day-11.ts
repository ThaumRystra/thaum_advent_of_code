import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day11: Day = {
  '1': part1,
  '2': part2,
}

export const _exampleInput = [125, 17];

function part1(): number {
  let stones = readInput(2024, 11).split(' ').map(Number);
  // stones = _exampleInput;
  for (let i = 0; i < 25; i++) {
    stones = _.flatMap(stones, blinkStone);
  }
  return stones.length;
}

function part2(): number {
  let stones = [1];
  // stones = _exampleInput;
  for (let i = 0; i < 75; i++) {
    stones = _.flatMap(stones, blinkStone);
    console.log(`${i}: ${stones.length}`);
  }
  return stones.length;
}

// This naive solution runs out of memory at around 38 iterations
function _part2Naive(): number {
  let stones = readInput(2024, 11).split(' ').map(Number);
  for (let i = 0; i < 75; i++) {
    stones = _.flatMap(stones, blinkStone);
    console.log(i);
  }
  return stones.length;
}

function blinkStone(number: number): number[] {
  if (number === 0) return [1];
  const str = number.toString();
  if (str.length % 2 === 0) {
    const halfway = str.length / 2;
    return [parseInt(str.slice(0, halfway)), parseInt(str.slice(halfway))];
  }
  return [number * 2024];
}
