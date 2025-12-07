import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day7: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 7);
  const grid = parseInput(input);
  let splits = 0;
  for (let row = 0; row < grid.length; row++){
    for (let col = 0; col < grid[row].length; col++){
      const cell = grid[row][col];
      // First propagate the beams from above
      const above = grid[row - 1]?.[col];
      if (above && above.content !== '^' && above.hasBeam) cell.hasBeam = true;
      // If this cell is a splitter, propagate left and right as well
      if (cell.content === "^" && cell.hasBeam) {
        splits += 1;
        const left = grid[row][col - 1];
        const right = grid[row][col + 1];
        if (left?.content === ".") left.hasBeam = true;
        if (right?.content === ".") right.hasBeam = true;
      }
    }
  }
  printGrid(grid);
  return splits;
}

function part2(): number {
  const input = readInput(2025, 7);
  const grid = parseInput(input);

  // Make a memoized function that counts the universes
  const memo = new Map<string, number>();
  const hash = (row: number, col: number) => `${row}:${col}`;
  function countUniverses(row: number, col: number): number {
    // If we have already solved it, use the memo
    const key = hash(row, col);
    if (memo.has(key)) return memo.get(key) as number;
    // Otherwise, find the next cell
    const next = grid[row + 1]?.[col];
    if (!next) {
      // There is no next cell, we're done, there is one universe accessible from here
      memo.set(key, 1);
      return 1;
    }
    if (next.content === '.') {
      // There is a next cell, and it's empty, count the universes from there, store the answer
      const ans = countUniverses(row + 1, col);
      memo.set(key, ans);
      return ans;
    }
    if (next.content === "^") {
      // There is a next cell and it's a splitter, count the universes accessible from each side
      // and store the answer
      const ans = countUniverses(row + 1, col - 1) + countUniverses(row + 1, col + 1);
      memo.set(key, ans);
      return ans;
    }
    // We hit a beam source after starting, crash
    throw "didn't expect this content here"
  }
  // Figure out where we are starting
  const startCol = grid[0].findIndex((cell) => cell.content === "S");
  // Count the universes accessible from the start
  return countUniverses(0, startCol);
}

type Grid = Row[];
type Row = Cell[];
type Cell = Empty | Source | Splitter;

type Empty = {
  content: '.',
  hasBeam: boolean;
}

type Source = {
  content: 'S',
  hasBeam: true,
}

type Splitter = {
  content: '^',
  hasBeam: boolean,
}

const red = "\x1b[31m";
const reset = "\x1b[0m";
function formatCell(cell: Cell): string {
  if (cell.content === "S") return "S";
  if (cell.content === "^") {
    if (cell.hasBeam) {
      return `${red}^${reset}`;
    } else {
      return "^";
    }
  }
  if (cell.hasBeam) return `${red}|${reset}`;
  return '.'
}

function printGrid(grid: Grid) {
  console.log(grid.map(row => row.map(formatCell).join('')).join('\n'))
}

function parseInput(input: string): Grid {
  return input.split('\n').map(line => line.split('').map(char => ({
    content: char as "S" | "." | "^",
    hasBeam: char === "S",
  } as Cell)))
}
