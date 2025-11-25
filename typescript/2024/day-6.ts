import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _, { has } from "npm:lodash";

export const day6: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2024, 6);
  const [grid, guard] = parseInput(input);
  // printMap(grid, guard);
  let newGuard: Guard | 'out-of-bounds' = guard;
  const pointsVisited = new Set([positionHash(guard.position)]);
  while (true) {
    newGuard = step(grid, newGuard);
    if (newGuard === 'out-of-bounds') break;
    pointsVisited.add(positionHash(newGuard.position));
    // printMap(grid, newGuard);
  }
  return pointsVisited.size;
}

function part2(): number {
  let numLoops = 0;
  const input = readInput(2024, 6);
  const [grid, guard] = parseInput(input);
  // printMap(grid, guard);
  let newGuard: Guard | 'out-of-bounds' = guard;
  const pointsVisited = new Set([positionHash(guard.position)]);
  while (true) {
    newGuard = step(grid, newGuard);
    if (newGuard === 'out-of-bounds') break;
    pointsVisited.add(positionHash(newGuard.position));
    // printMap(grid, newGuard);
  }
  pointsVisited.forEach((pointHash) => {
    const point = positionFromHash(pointHash);
    const newGrid = _.cloneDeep(grid);
    if (newGrid[point.row][point.col].content === 'obstacle') return;
    newGrid[point.row][point.col] = { content: 'obstacle' };
    let newGuard: Guard | 'out-of-bounds' = guard;
    const visitedSet = new Set<string>([]);
    while (true) {
      newGuard = step(newGrid, newGuard);
      if (newGuard === 'out-of-bounds') return;
      const visit = visitedHash(newGuard);
      if (visitedSet.has(visit)) {
        numLoops += 1;
        return;
      }
      visitedSet.add(visitedHash(newGuard));
    }
  });
  return numLoops;
}

type Grid = Row[]

type Row = Point[];

type Point = {
  content: 'obstacle' | 'empty';
}

type Position = {
  row: number;
  col: number;
}

type Direction = 'N' | 'S' | 'E' | 'W';

type Guard = {
  position: Position;
  facing: Direction;
}

function parseInput(input: string): [Grid, Guard] {
  const guard: Guard = { position: { row: 0, col: 0 }, facing: 'N' };
  const grid: Grid = input.split('\n').map((line, row) => line.split('').map((character, col) => {
    switch (character) {
      case '#': return { content: 'obstacle' };
      case '.': return { content: 'empty' };
      case '^': {
        guard.position = { row, col };
        return { content: 'empty' };
      }
      default: throw Error('unexpected character: ' + character);
    }
  }));
  return [grid, guard];
}

function printMap(grid: Grid, guard: Guard) {
  console.log(
    grid.map((points, row) =>
      // Get row string
      points.map((point, col) => {
        if (guard.position.col === col && guard.position.row === row) {
          switch (guard.facing) {
            case 'N': return '^';
            case "S": return 'v';
            case "E": return '>';
            case "W": return '<';
          }
        }
        if (point.content === "obstacle") {
          return '#';
        } else {
          return '.';
        }
      }).join('')
    ).join('\n') + '\n\n',
  )
}

function step(grid: Grid, guard: Guard): Guard | 'out-of-bounds' {
  const nextLocation: Position = getNextLocation(guard);
  const nextPoint: Point | undefined = grid[nextLocation.row]?.[nextLocation.col];
  if (nextPoint === undefined) return 'out-of-bounds';
  switch (nextPoint.content) {
    case 'empty': return { ...guard, position: nextLocation };
    case 'obstacle': return { ...guard, facing: rotateRight(guard.facing) };
  }
}

function getNextLocation(guard: Guard): Position {
  switch (guard.facing) {
    case "N": return { row: guard.position.row - 1, col: guard.position.col };
    case "S": return { row: guard.position.row + 1, col: guard.position.col };
    case "E": return { row: guard.position.row, col: guard.position.col + 1 };
    case "W": return { row: guard.position.row, col: guard.position.col - 1 };
  }
}

function rotateRight(facing: Direction): Direction {
  switch (facing) {
    case "N": return 'E';
    case "S": return 'W';
    case "E": return 'S';
    case "W": return 'N';
  }
}

function positionHash(pos: Position): string {
  return `${pos.row}, ${pos.col}`;
}

function positionFromHash(hash: string): Position {
  const [row, col] = hash.split(', ').map(num => Number.parseInt(num));
  return { row, col };
}

function visitedHash(guard: Guard): string {
  return `${guard.position.row}, ${guard.position.col}, ${guard.facing}`;
}
