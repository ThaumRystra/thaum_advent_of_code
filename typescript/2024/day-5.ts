import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day5: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const [lists, sortedLists] = parseInput();
  return lists
    .filter((list, index) => _.isEqual(list, sortedLists[index]))
    .reduce((acc, list) => acc + list[Math.floor(list.length / 2)], 0);
}

function part2(): number {
  const [lists, sortedLists] = parseInput();
  return sortedLists
    .filter((sortedList, index) => !_.isEqual(sortedList, lists[index]))
    .reduce((acc, list) => acc + list[Math.floor(list.length / 2)], 0);
}

function parseInput(): [number[][], number[][]] {
  const input = readInput(2024, 5);
  const [orderingInput, listsInput] = input.split('\n\n');
  const ordering = buildOrdering(orderingInput.trim().split('\n'));
  const lists = listsInput.trim().split('\n').map(line => line.split(',').map(Number));
  const sortedLists = lists.map((list) => {
    return [...list].sort((a, b) => {
      if (ordering.before[a]?.has(b)) {
        return 1;
      }
      if (ordering.after[a]?.has(b)) {
        return -1;
      }
      if (ordering.before[b]?.has(a)) {
        return -1;
      }
      if (ordering.after[b]?.has(a)) {
        return 1;
      }
      return 0;
    });
  });
  return [lists, sortedLists];
}
type Ordering = {
  // each entry lists all the numbers that must come before it
  before: {
    [key: number]: Set<number>,
  },
  // each entry lists all the numbers that must come after it
  after: {
    [key: number]: Set<number>,
  },
}

function buildOrdering(input: string[]): Ordering {
  const ordering: Ordering = {
    before: {},
    after: {},
  };
  for (const line of input) {
    const [left, right] = line.split('|').map(Number);
    if (ordering.before[right]) {
      ordering.before[right].add(left);
    } else {
      ordering.before[right] = new Set([left]);
    }
    if (ordering.after[left]) {
      ordering.after[left].add(right);
    } else {
      ordering.after[left] = new Set([right]);
    }
  }
  return ordering;
}
