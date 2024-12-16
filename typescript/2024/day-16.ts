import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day16: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const [map, start, end] = parseInput();
  const costs = getNeighbours(map, start)
    .map(neighbour => step(map, start, '>', neighbour, 0, [start]))
    .filter(cost => cost !== 'deadEnd')
    .sort((a, b) => a - b);
  tracePath(map, start, end);
  _printMap(map);
  return costs[0];
}

function part2(): number {
  const [map, start] = parseInput();
  const costs = getNeighbours(map, start)
    .map(neighbour => step(map, start, '>', neighbour, 0, [start]))
    .filter(cost => cost !== 'deadEnd')
    .sort((a, b) => a - b);
  const lowestCost = costs[0];
  _printMap2(map, lowestCost);
  // count all points on complete paths with the lowest cost
  return map.reduce((acc, row) => acc + row.reduce((acc, cell) => cell.onCompletePaths.has(lowestCost) ? acc + 1 : acc, 0), 0);
}

const _exampleInput = `
###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############
`

const _example2 = `
#################
#...#...#...#..E#
#.#.#.#.#.#.#.#.#
#.#.#.#...#...#.#
#.#.#.#.###.#.#.#
#...#.#.#.....#.#
#.#.#.#.#.#####.#
#.#...#.#.#.....#
#.#.#####.#.###.#
#.#.#.......#...#
#.#.###.#####.###
#.#.#...#.....#.#
#.#.#.#####.###.#
#.#.#.........#.#
#.#.#.#########.#
#S#.............#
#################
`

type Coordinate = {
  row: number;
  col: number;
}

type Direction = '^' | 'v' | '>' | '<';

type Visit = {
  distanceFromStart: number;
  direction: Direction;
  previous: Point;
}

type Point = Coordinate & {
  contents: 'S' | '.' | '#' | 'E';
  visits: { [direction in Direction]: Visit };
  onFinalPath?: true;
  onCompletePaths: Set<number>;
}

type Map = Point[][];

function directionToCoord(direction: Direction): Coordinate {
  switch (direction) {
    case '^': return { row: - 1, col: 0 };
    case 'v': return { row: + 1, col: 0 };
    case '>': return { row: 0, col: + 1 };
    case '<': return { row: 0, col: - 1 };
  }
}

function add(a: Coordinate, b: Coordinate): Coordinate {
  return {
    row: a.row + b.row,
    col: a.col + b.col,
  }
}

function _printMap(map: Map) {
  console.log(map.map(row => row.map(cell => {
    const cheapDirection = getCheapestVisit(cell);
    if (cheapDirection && cell.onFinalPath) {
      return cheapDirection
    }
    switch (cell.contents) {
      case 'S': return 'S';
      case '.': return ' ';
      case '#': return '#';
      case 'E': return 'E';
    }
  }).join('')).join('\n'));
}

function _printMap2(map: Map, lowestCost: number) {
  console.log(map.map(row => row.map(cell => {
    if (cell.onCompletePaths.has(lowestCost)) {
      return 'O';
    }
    switch (cell.contents) {
      case 'S': return 'S';
      case '.': return ' ';
      case '#': return '#';
      case 'E': return 'E';
    }
  }).join('')).join('\n'));
}

function getCheapestVisit(point: Point): Direction | undefined {
  let cheapestCost = Infinity;
  let cheapestDirection: Direction | undefined;
  for (const direction in point.visits) {
    const visit = point.visits[direction as Direction];
    const cost = visit.distanceFromStart;
    if (cost < cheapestCost) {
      cheapestCost = cost;
      cheapestDirection = direction as Direction;
    }
  }
  if (cheapestDirection) {
    return cheapestDirection;
  }
}

function parseInput(): [Map, Point, Point] {
  const input = readInput(2024, 16);
  let start: Point | undefined;
  let end: Point | undefined;
  const map: Map = input.split('\n').map((line, row) => line.split('').map((char, col): Point => {
    const point: Point = {
      row,
      col,
      contents: char as Point['contents'],
      visits: {} as Point['visits'],
      onCompletePaths: new Set(),
    }
    if (char === 'S') {
      start = point;
    }
    if (char === 'E') {
      end = point;
    }
    return point;
  }));
  if (!start || !end) {
    throw new Error('start or end not found');
  }
  return [map, start, end];
}

// Optimisation knowing that our answer in part 1 was around 100k we can discard longer paths
let lowestCostFinalPath = 200000;
function step(map: Map, point: Point, currentDirection: Direction, direction: Direction, totalCost: number, path: Point[]): number | 'deadEnd' {
  const nextCoord = add(point, directionToCoord(direction));
  const next = map[nextCoord.row]?.[nextCoord.col];
  if (!next) return 'deadEnd';
  path.push(next);
  const cost = getCost(currentDirection, direction);
  const distanceFromStart = totalCost + cost;
  if (distanceFromStart > lowestCostFinalPath) {
    return 'deadEnd';
  }
  const existingVisit = next.visits[direction];
  if (existingVisit && existingVisit.distanceFromStart < distanceFromStart) {
    return 'deadEnd';
  }
  next.visits[direction] = {
    distanceFromStart,
    direction,
    previous: point,
  };
  // We found the exit!
  if (next.contents === 'E') {
    // mark all points as having a path of this cost 
    for (const point of path) {
      point.onCompletePaths.add(distanceFromStart);
    }
    if (distanceFromStart < lowestCostFinalPath) {
      lowestCostFinalPath = distanceFromStart;
    }
    return distanceFromStart;
  }
  // Otherwise propagate from the next point
  const costs = getNeighbours(map, next)
    .map(neighbour => {
      return step(map, next, direction, neighbour, distanceFromStart, [...path])
    })
    .filter(cost => cost !== 'deadEnd')
    .sort((a, b) => a - b);
  if (costs.length === 0) {
    return 'deadEnd';
  }
  return costs[0];
}

function getNeighbours(map: Map, point: Point): Direction[] {
  const directions: Direction[] = ['^', 'v', '>', '<'];
  return directions.flatMap(direction => {
    const coord = add(point, directionToCoord(direction));
    const nextPoint = map[coord.row]?.[coord.col];
    if (nextPoint?.contents && nextPoint.contents !== '#') {
      return [direction];
    }
    return [];
  });
}

function getCost(current: Direction, next: Direction): number {
  // Straight
  if (current === next) {
    return 1;
  }
  // 180 deg turn
  if (
    current === '^' && next === 'v'
    || current === 'v' && next === '^'
    || current === '>' && next === '<'
    || current === '<' && next === '>'
  ) {
    return 2001;
  }
  // 90 deg turn
  return 1001;
}

function tracePath(map: Map, start: Point, end: Point) {
  let current = end;
  while (current !== start) {
    const direction = getCheapestVisit(current);
    if (!direction) {
      console.log(current);
      console.error('path ended unexpectedly');
      return;
    }
    const nextCoord = add(current, directionToCoord(reverse(direction)));
    const next = map[nextCoord.row]?.[nextCoord.col];
    if (!next) {
      console.error('path ended unexpectedly');
      return;
    }
    current.onFinalPath = true;
    current = next;
  }
  return [start];
}

function reverse(direction: Direction): Direction {
  switch (direction) {
    case '^': return 'v';
    case 'v': return '^';
    case '>': return '<';
    case '<': return '>';
  }
}
