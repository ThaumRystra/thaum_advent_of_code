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
  for (let i = 0; i < 25; i++) {
    stones = _.flatMap(stones, blinkStone);
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

// This naive solution runs out of memory at around 38 iterations
function _part2Naive(): number {
  let stones = readInput(2024, 11).split(' ').map(Number);
  for (let i = 0; i < 75; i++) {
    stones = _.flatMap(stones, blinkStone);
    console.log(i);
  }
  return stones.length;
}

function part2(): number {
  const stones = readInput(2024, 11).split(' ').map(Number);
  let total = 0;
  const memo = {};
  for (const stone of stones) {
    total += blinkAndCount(stone, 75, memo)
  }
  return total;
}

/* 
 * Count how many stones we have, step starts at the total number of iterations, and counts
 * down for each recursion using a memo to record the result of any stone number and step combo we
 * have already seen
 */
function blinkAndCount(stone: number, step: number, memo: { [key: string]: number }): number {
  const key = `${stone}-${step}`;
  if (memo[key]) return memo[key];

  // Base Case: If there are no steps left, we have 1 stone
  if (step === 0) return 1;
  // if the stone is zero, count as if the stone was 1 and we have 1 step fewer
  if (stone === 0) {
    const result = blinkAndCount(1, step - 1, memo);
    memo[key] = result;
    return result;
  }
  // if the stone is even length, count each half as if they were stones and we have 1 step fewer
  const str = stone.toString();
  if (str.length % 2 === 0) {
    const halfway = str.length / 2;
    const left = parseInt(str.slice(0, halfway));
    const right = parseInt(str.slice(halfway));
    const result = blinkAndCount(left, step - 1, memo) + blinkAndCount(right, step - 1, memo);
    memo[key] = result;
    return result;
  }

  // Otherwise multiply the stone by 2024 and count as if the stone was that number and we have 1 step fewer
  const result = blinkAndCount(stone * 2024, step - 1, memo);
  memo[key] = result;
  return result;
}
