import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day25: Day = {
  '1': part1,
  '2': part2,
};

function part1() {
  const [keys, locks] = parseInput();
  let uniqueCombos = 0;
  for (const lock of locks) {
    const expectKey = expectedKey(lock);
    for (const key of keys) {
      if (keyFits(key, expectKey)) {
        uniqueCombos++;
      }
    }
  }
  return uniqueCombos;
}

function part2() {
  return 0;
}

const _exampleInput = `
#####
.####
.####
.####
.#.#.
.#...
.....

#####
##.##
.#.##
...##
...#.
...#.
.....

.....
#....
#....
#...#
#.#.#
#.###
#####

.....
.....
#.#..
###..
###.#
###.#
#####

.....
.....
.....
#....
#.#..
#.#.#
#####
`.trim();

type Key = number[] & { __key: true };
type Lock = number[] & { __lock: true };

function parseInput(): [Key[], Lock[]] {
  const input = readInput(2024, 25);
  // const input = _exampleInput;

  const keys: Key[] = [];
  const locks: Lock[] = [];
  input.split('\n\n').forEach(str => {
    // count the hashes in columns
    const tumblers: number[] = [];
    const lines = str.trim().split('\n');
    for (let col = 0; col < lines[0].length; col++) {
      let count = 0;
      for (let row = 1; row < lines.length - 1; row++) {
        if (lines[row][col] === '#') {
          count += 1
        }
      }
      tumblers.push(count);
    }
    if (lines[0][0] === '#') {
      locks.push(tumblers as Lock);
    } else {
      keys.push(tumblers as Key)
    }
  });
  return [keys, locks];
}

function expectedKey(lock: Lock): Key {
  const key: Key = [] as unknown as Key;
  for (const tumbler of lock) {
    key.push(5 - tumbler);
  }
  return key;
}

function keyFits(key: Key, expected: Key): boolean {
  for (let i = 0; i < key.length; i++) {
    if (key[i] > expected[i]) return false;
  }
  return true;
}
