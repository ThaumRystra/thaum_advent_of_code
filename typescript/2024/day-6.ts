import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day6: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const [grid, startLocation] = parseGrid();
  let direction: Direction = [-1, 0];
  let currentLocation = startLocation;
  let visitedCount = 1; // starting location is visited
  while (true) {
    // printMap(grid, currentLocation);
    let nextLocation = locationInFront(currentLocation, direction);
    // while obstacle in front, turn right
    while (grid[nextLocation[0]]?.[nextLocation[1]]?.obstacle) {
      direction = turnRight(direction);
      nextLocation = locationInFront(currentLocation, direction);
    }
    // If we are stepping out of the grid, we are done
    if (nextLocation[0] < 0 || nextLocation[0] >= grid.length || nextLocation[1] < 0 || nextLocation[1] >= grid[0].length) {
      return visitedCount;
    }
    // otherwise, move forward
    currentLocation = nextLocation;
    // Mark visited and increase visited count
    if (!grid[currentLocation[0]][currentLocation[1]].visited) {
      grid[currentLocation[0]][currentLocation[1]].visited = true;
      visitedCount++;
    }
  }
}

function part2(): number {
  const [grid, startLocation] = parseGrid();
  let numLoopObstacles = 0;
  for (let row = 0; row < grid.length; row++) {
    console.log('testing row ' + row + ' of ' + grid.length);
    for (let col = 0; col < grid[0].length; col++) {
      const newGrid = _.cloneDeep(grid);
      newGrid[row][col].obstacle = true;
      const visitedCount = walk(newGrid, startLocation, [-1, 0]);
      if (visitedCount === 'loop') {
        numLoopObstacles++;
      }
    }
  }
  return numLoopObstacles;
}

function walk(grid: Grid, startLocation: [number, number], direction: Direction): number | 'loop' {
  let currentLocation = startLocation;
  let visitedCount = 1;
  while (true) {
    // printMap(grid, currentLocation);
    let nextLocation = locationInFront(currentLocation, direction);
    // while obstacle in front, turn right
    while (grid[nextLocation[0]]?.[nextLocation[1]]?.obstacle) {
      direction = turnRight(direction);
      nextLocation = locationInFront(currentLocation, direction);
    }
    // If we are stepping out of the grid, we are done
    if (nextLocation[0] < 0 || nextLocation[0] >= grid.length || nextLocation[1] < 0 || nextLocation[1] >= grid[0].length) {
      return visitedCount;
    }
    // If we are stepping into a spot we have visited in the same direction before, we are in a loop
    if (grid[nextLocation[0]][nextLocation[1]][directionToString(direction)]) {
      return 'loop';
    }
    // otherwise, move forward
    currentLocation = nextLocation;
    // Mark visited and increase visited count
    if (!grid[currentLocation[0]][currentLocation[1]].visited) {
      grid[currentLocation[0]][currentLocation[1]].visited = true;
      grid[currentLocation[0]][currentLocation[1]][directionToString(direction)] = true;
      visitedCount++;
    }
  }
}

type Grid = {
  visited: boolean,
  obstacle: boolean,
  visitedFacingN: boolean,
  visitedFacingS: boolean,
  visitedFacingE: boolean,
  visitedFacingW: boolean,
}[][]

function parseGrid(): [Grid, [number, number]] {
  const input = readInput(2024, 6);
  let currentLocation: [number, number] = [0, 0];
  const grid = input.split('\n').map((line, row) => line.split('').map((character, col) => {
    if (character === '^') {
      currentLocation = [row, col];
    }
    return {
      obstacle: character === '#',
      visited: character === '^',
      visitedFacingN: false,
      visitedFacingS: false,
      visitedFacingE: false,
      visitedFacingW: false,
    };
  }));
  return [grid, currentLocation]
}

type Direction = [1, 0] | [-1, 0] | [0, 1] | [0, -1]

function turnRight(currentDirection: Direction): Direction {
  // Poor man's pattern matching
  switch (currentDirection.join(',')) {
    case '1,0':
      return [0, -1];
    case '-1,0':
      return [0, 1];
    case '0,1':
      return [1, 0];
    case '0,-1':
      return [-1, 0];
    default:
      throw new Error('Invalid direction');
  }
}

function directionToString(direction: Direction): 'visitedFacingN' | 'visitedFacingS' | 'visitedFacingE' | 'visitedFacingW' {
  switch (direction.join(',')) {
    case '1,0':
      return 'visitedFacingS';
    case '-1,0':
      return 'visitedFacingN';
    case '0,1':
      return 'visitedFacingE';
    case '0,-1':
      return 'visitedFacingW';
    default:
      throw new Error('Invalid direction');
  }
}

function locationInFront(currentLocation: [number, number], currentDirection: Direction): [number, number] {
  return [currentLocation[0] + currentDirection[0], currentLocation[1] + currentDirection[1]];
}

// function printMap(grid: Grid, currentLocation: [number, number]): void {
//   console.log(grid.map(
//     (row, rowIndex) => row.map(
//       (cell, colIndex) => currentLocation[0] === rowIndex && currentLocation[1] === colIndex
//         ? '@'
//         : cell.visited
//           ? 'X'
//           : cell.obstacle
//             ? '#'
//             : '.'
//     ).join('')
//   ).join('\n') + '\n\n\n');
// }
