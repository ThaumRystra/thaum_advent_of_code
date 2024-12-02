import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day2: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  return parse().map(checkLineSafety).reduce((total, safe) => safe[0] ? total + 1 : total, 0);
}

function part2(): number {
  return parse().map((line) => {
    const [safe, index] = checkLineSafety(line);
    if (safe) return true;
    // Try again removing the element at index
    const safeWithoutI = checkWithoutElement(line, index);
    if (safeWithoutI) return true;
    // try again removing the element at index - 1
    const safeWithoutI2 = checkWithoutElement(line, index - 1);
    if (safeWithoutI2) return true;

    // try again removing the element at 0 and 1 because it may change whether the line is 
    // increasing or not
    const safeWithout0 = checkWithoutElement(line, 0);
    if (safeWithout0) return true;
    const safeWithout1 = checkWithoutElement(line, 1);
    if (safeWithout1) return true;

  }).reduce((total, safe) => safe ? total + 1 : total, 0);
}

function parse() {
  const input = readInput(2024, 2);
  // const input = `7 6 4 2 1
  // 1 2 7 8 9
  // 9 7 6 2 1
  // 1 3 2 4 5
  // 8 6 4 4 1
  // 1 3 6 7 9`
  return input.trim().split('\n').map(line => line.trim().split(/\s+/).map(Number));
}

function checkLineSafety(line: number[]): [false, number] | [true, null] {
  const increasing = line[1] > line[0];
  for (let i = 1; i < line.length; i++) {
    const safe = checkSafe(line[i - 1], line[i], increasing);
    if (!safe) return [false, i];
  }
  return [true, null];
}

function checkWithoutElement(line: number[], index: number): boolean {
  const newLine = [...line];
  newLine.splice(index, 1);
  const [safeWithoutI] = checkLineSafety(newLine);
  return safeWithoutI;
}

function checkSafe(val1: number, val2: number, increasing: boolean): boolean {
  if (val1 === val2) return false;
  if (increasing && val1 > val2) return false;
  if (!increasing && val1 < val2) return false;
  if (Math.abs(val1 - val2) > 3) return false;
  return true;
}
