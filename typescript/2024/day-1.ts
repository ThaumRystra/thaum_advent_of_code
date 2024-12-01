import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day1: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const [left, right] = importLists();
  // Sort each group
  left.sort((a, b) => a - b);
  right.sort((a, b) => a - b);

  // Transform them back into number pairs
  const linesAsMatchedPairs = _.zip(left, right) as [number, number][];

  // Total the differences between pairs
  return linesAsMatchedPairs.reduce((total, [left, right]) => total + Math.abs(left - right), 0);
}

function part2(): number {
  const [left, right] = importLists();

  const rightFrequencyTable = caclulateFrequencyTable(right);

  return left.reduce((total, number) => {
    if (rightFrequencyTable[number]) {
      return total + number * rightFrequencyTable[number];
    }
    return total;
  }, 0);
}

function importLists(): [number[], number[]] {
  const input = readInput(2024, 1);
  // get each line as [number, number]
  const lines = input.trim().split('\n');
  const linesAsNumberPairs = lines.map(
    line => line.split(/\s+/)
      .map(Number)
  );
  // Split the left and right numbers into groups
  const [left, right] = _.unzip(linesAsNumberPairs);
  return [left, right];
}

function caclulateFrequencyTable(input: number[]): { [key: number]: number } {
  const frequency: { [key: number]: number } = {};
  for (const number of input) {
    if (frequency[number]) {
      frequency[number]++;
    } else {
      frequency[number] = 1;
    }
  }
  return frequency;
}
