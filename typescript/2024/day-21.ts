import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day21: Day = {
  '1': part1,
  '2': part2,
};

const keypad: Map = mapFromArray([
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  [null, '0', 'A']
]);
const keypadA = keypad[3][2];

const remote: Map = mapFromArray([
  [null, '^', 'A'],
  ['<', 'v', '>'],
]);
const remoteA = remote[0][2];

const _exampleInput = `
029A
980A
179A
456A
379A
`.trim();

// const input = _exampleInput;
const input = readInput(2024, 21);
// const input = '029A'

function _unoptimizedPart1() {
  return input.split('\n').reduce((acc, line) => {
    console.log(`${getShortestPathLength(line)} * ${inputToNumber(line)}`);
    return acc + getShortestPathLength(line) * inputToNumber(line)
  }, 0);
}

const remoteKeyPresses = _.memoize((str: string) => {
  return toKeyPresses(str, remoteA, remote);
});

const costFnForRobotCount = (robotCount: number) => {
  const costOfSubstring = _.memoize((substring: string, level: number): number => {
    if (level >= robotCount) {
      return substring.length;
    }
    // Get all possible paths we could take at the next highest level to make this substring
    const paths = remoteKeyPresses(substring);
    // Covert paths to their costs
    return paths.map(path => {
      return path
        .match(/([^A]*A)/g)!
        .reduce((acc, str) => {
          return acc + costOfSubstring(str, level + 1)
        }, 0)
      // and get the lowest cost
    }).sort((a, b) => a - b)[0];
  }, (substring, level) => `${substring}:${level}`);
  return costOfSubstring;
}

function part1(): number {
  const costOfSubstring = costFnForRobotCount(2);
  return input.split('\n').reduce((acc, line) => {
    const staticPaths = toKeyPresses(line, keypadA, keypad);
    const lowestCost = staticPaths.map(path => costOfSubstring(path, 0)).sort((a, b) => a - b)[0];
    // console.log(`${lowestCost} * ${inputToNumber(line)}`);
    return acc + lowestCost * inputToNumber(line)
  }, 0);
}

function part2(): number {
  const costOfSubstring = costFnForRobotCount(25);
  return input.split('\n').reduce((acc, line) => {
    const staticPaths = toKeyPresses(line, keypadA, keypad);
    const lowestCost = staticPaths.map(path => costOfSubstring(path, 0)).sort((a, b) => a - b)[0];
    // console.log(`${lowestCost} * ${inputToNumber(line)}`);
    return acc + lowestCost * inputToNumber(line)
  }, 0);
}

function getShortestPathLength(input: string): number {
  const levelsOfAbstraction = 3;
  let result = [input];
  // Get all paths
  for (let i = 0; i < levelsOfAbstraction; i++) {
    const map = i === 0 ? keypad : remote;
    result = result.flatMap(result => toKeyPresses(result, findButton(map, 'A'), map));
  }
  // find short path
  let shortestLength = Infinity;
  for (const path of result) {
    const length = path.length;
    if (length < shortestLength) {
      shortestLength = length;
    }
  }
  return shortestLength;
}

function inputToNumber(input: string): number {
  return Number(input.slice(0, -1));
}

function toKeyPresses(input: string, start: Point, map: Map): string[] {
  let results = [''];
  let current = start;
  for (const char of input) {
    const end = findButton(map, char);
    multiDijkstra(map, current, end);
    const paths = buildPath([[end]]).map(path => path.reverse());
    results = results.flatMap(
      result => paths.map(path => `${result}${pathToInstructions(path)}A`)
    );
    resetMap(map);
    current = end;
  }
  return results;
}

function findButton(map: Map, button: string): Point {
  for (const row of map) {
    for (const cell of row) {
      if (cell.contents === button) {
        return cell;
      }
    }
  }
  throw new Error(`Button ${button} not found`);
}

type Coordinate = {
  row: number;
  col: number;
}

type Point = Coordinate & {
  contents: string | null; // Never travel to a null point
  distanceToStart: number;
  prev: Set<Point>;
}

type Map = Point[][];

function mapFromArray(input: (string | null)[][]): Map {
  return input.map((row, rowIndex) => row.map((cell, colIndex): Point => ({
    row: rowIndex,
    col: colIndex,
    contents: cell,
    distanceToStart: Infinity,
    prev: new Set(),
  })));
}

function resetMap(map: Map) {
  for (const row of map) {
    for (const cell of row) {
      cell.distanceToStart = Infinity;
      cell.prev = new Set();
    }
  }
}

function buildPath(currentPaths: Point[][]): Point[][] {
  return currentPaths.flatMap(path => {
    const nextPoints = Array.from(path[path.length - 1].prev);
    if (!nextPoints.length) {
      return [path];
    }
    return nextPoints.flatMap(nextPoint => {
      const newPath = [...path, nextPoint];
      return buildPath([newPath]);
    });
  });
}

function pathToInstructions(path: Point[]): string {
  let result = '';
  for (let i = 0; i < path.length - 1; i++) {
    const point = path[i];
    const nextPoint = path[i + 1];
    if (nextPoint.row < point.row) {
      result += '^';
    } else if (nextPoint.row > point.row) {
      result += 'v';
    } else if (nextPoint.col < point.col) {
      result += '<';
    } else if (nextPoint.col > point.col) {
      result += '>';
    }
  }
  return result;
}

function multiDijkstra(map: Map, start: Point, end: Point) {
  const unvisited = new Set([start]);
  const visited = new Set<Point>();
  start.distanceToStart = 0;
  while (unvisited.size) {
    const current = getShortestInSet(unvisited);
    if (!current) {
      throw new Error('No path found');
    }
    unvisited.delete(current);
    visited.add(current);
    // alert();
    // _printMap(map);
    if (current === end) {
      return;
    }
    const neighbours = getNeighbours(map, current).filter(neighbour => !visited.has(neighbour));
    for (const neighbour of neighbours) {
      const cost = current.distanceToStart + 1;
      if (neighbour.distanceToStart >= cost) {
        if (neighbour.distanceToStart === Infinity) {
          unvisited.add(neighbour);
        }
        neighbour.distanceToStart = cost;
        neighbour.prev.add(current);
      }
    }
  }
}

function getShortestInSet(set: Set<Point>): Point | undefined {
  let shortest: Point | undefined;
  set.forEach(point => {
    if (!shortest || point.distanceToStart < shortest.distanceToStart) {
      shortest = point;
    }
  });
  if (shortest?.distanceToStart === Infinity) {
    return undefined;
  }
  return shortest;
}

function getNeighbours(map: Map, point: Coordinate): Point[] {
  return [
    map[point.row - 1]?.[point.col],
    map[point.row + 1]?.[point.col],
    map[point.row][point.col - 1],
    map[point.row][point.col + 1],
  ].filter(point => point && point.contents !== null);
}
