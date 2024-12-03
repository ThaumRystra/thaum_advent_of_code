import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day3: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const re = /mul\(\d+,\d+\)/g;
  const input = readInput(2024, 3);
  const matches = input.match(re) ?? [];
  return matches.map(match => {
    const [left, right] = match.split(',');
    console.log(left, right);
    return Number(left.match(/\d+/)?.[0]) * Number(right.match(/\d+/)?.[0]);
  }).reduce((total, val) => total + val, 0);
}

function part2(): number {
  const re = /mul\(\d+,\d+\)|do\(\)|don't\(\)/g;
  const input = readInput(2024, 3);
  const matches = input.match(re) ?? [];
  let active = true;
  return matches.map(match => {
    if (match === 'do()') {
      active = true;
      return 0;
    }
    if (match === 'don\'t()') {
      active = false;
      return 0;
    }
    if (!active) return 0;
    const [left, right] = match.split(',');
    console.log(left, right);
    return Number(left.match(/\d+/)?.[0]) * Number(right.match(/\d+/)?.[0]);
  }).reduce((total, val) => total + val, 0);
}
