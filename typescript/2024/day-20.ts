import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day20: Day = {
  '1': part1,
  '2': part2,
};

function part1(): number {
  const [map, start, end] = parseInput();
  _printMap(map, end);
  dijkstra(map, start, end);
  _printMap(map, end);
  return scanForCheats(map, start, end, 100);
}

function part2(): number {
  const [map, start, end] = parseInput();
  dijkstra(map, start, end);
  let cheatsOverThreshold = 0;
  const originalPath = buildForwardPath(end);
  for (const point of originalPath) {
    const cheats = wallDijkstra(map, point);
    cheatsOverThreshold += cheats.length;
  }
  return cheatsOverThreshold;
}

type Coordinate = {
  row: number;
  col: number;
}

type Point = Coordinate & {
  contents: ' ' | '#';
  distanceToStart: number;
  distanceToCheatStart: number;
  prev?: Point;
  prevCheat?: Point;
}

type Map = Point[][];

// For part 1 we naively scan for cheats that go through 1 wall
function scanForCheats(map: Map, raceStart: Point, raceEnd: Point, threshold = 0) {
  let end = raceEnd;
  const cheatsOverThreshold = new Set<string>();
  while (end !== raceStart) {
    const walls = getNeighbours(map, end, '#');
    for (const wall of walls) {
      const cheatStarts = getNeighbours(map, wall, ' ');
      for (const start of cheatStarts) {
        const cheatEffectiveness = end.distanceToStart - start.distanceToStart - 2;
        if (cheatEffectiveness < threshold) {
          continue;
        }
        const cheatString = `${wall.row},${wall.col} -> ${end.row},${end.col}`;
        if (cheatsOverThreshold.has(cheatString)) {
          continue;
        }
        // console.log(`${cheatString} saves ${cheatEffectiveness}`);
        // _printCheat(map, wall, end);
        cheatsOverThreshold.add(cheatString);
      }
    }
    end = end.prev!;
  }
  return cheatsOverThreshold.size;
}

function buildForwardPath(endPoint: Point): Point[] {
  const path = [];
  let point: Point | undefined = endPoint;
  while (point) {
    path.unshift(point);
    point = point.prev;
  }
  return path;
}

type Cheat = {
  timeSaved: number;
  cheatStart: Point;
  cheatEnd: Point;
}

function wallDijkstra(map: Map, start: Point): Cheat[] {
  // start is the cheat start Point
  // Don't start with a full unvisited set, only add things to the unvisited set when they are 
  // seen as a neighbour, this reduces runtime by an order of magnitude
  const unvisited = new Set<Point>([start]);
  const visited = new Set<Point>();
  const reachablePathPoints = new Set<Point>();
  start.distanceToCheatStart = 0;
  while (unvisited.size) {
    // Get the point with the shortest distance to the start of the cheat
    let shortest: Point | undefined;
    unvisited.forEach(point => {
      if (!shortest || point.distanceToCheatStart < shortest.distanceToCheatStart) {
        shortest = point;
      }
    });
    if (!shortest || shortest.distanceToCheatStart === Infinity) {
      break;
    }
    const current = shortest;
    // Mark it as visited
    unvisited.delete(current);
    visited.add(current);

    // If we found a different point in the original path, save it but ignore its neighbours
    if (current !== start && current.contents === ' ') {
      reachablePathPoints.add(current);
    }

    // Get the cost to move to the next point from this point, if it is too high, stop tunnelling
    const cost = current.distanceToCheatStart + 1;
    if (cost > 20) continue;

    // Otherwise keep tunnelling
    const neighbours = getAllNeighbours(map, current).filter(neighbour => !visited.has(neighbour));
    for (const neighbour of neighbours) {
      if (neighbour.distanceToCheatStart > cost) {
        if (neighbour.distanceToCheatStart === Infinity) {
          unvisited.add(neighbour);
        }
        neighbour.distanceToCheatStart = cost;
        neighbour.prevCheat = current;
      }
    }
  }
  // _printMap(map);
  // Once we are done, we have a list of all reachable path points from this cheat start point
  const result = Array
    .from(reachablePathPoints)
    .map(point => ({
      timeSaved: point.distanceToStart - start.distanceToStart - point.distanceToCheatStart,
      cheatStart: start,
      cheatEnd: point,
    }))
    .filter(cheat => cheat.timeSaved >= 100);
  // Clean up
  for (const point of visited) {
    point.prevCheat = undefined;
    point.distanceToCheatStart = Infinity;
  }
  return result;
}

function getAllNeighbours(map: Map, point: Coordinate): Point[] {
  return [
    map[point.row - 1]?.[point.col],
    map[point.row + 1]?.[point.col],
    map[point.row][point.col - 1],
    map[point.row][point.col + 1],
  ].filter(point => point !== undefined);
}

// #region Pathfinding
function dijkstra(map: Map, start: Point, end: Point) {
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
    // _printMap(map, current);
    if (current === end) {
      return;
    }
    const neighbours = getNeighbours(map, current).filter(neighbour => !visited.has(neighbour));
    for (const neighbour of neighbours) {
      const cost = current.distanceToStart + 1;
      if (neighbour.distanceToStart > cost) {
        if (neighbour.distanceToStart === Infinity) {
          unvisited.add(neighbour);
        }
        neighbour.distanceToStart = cost;
        neighbour.prev = current;
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

function getNeighbours(map: Map, point: Coordinate, contents = ' '): Point[] {
  return [
    map[point.row - 1]?.[point.col],
    map[point.row + 1]?.[point.col],
    map[point.row][point.col - 1],
    map[point.row][point.col + 1],
  ].filter(point => point?.contents === contents);
}

const _exampleInput = `
###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############
`

function parseInput(): [Map, Point, Point] {
  const input = readInput(2024, 20);
  // const input = _exampleInput;
  let start: Point | undefined;
  let end: Point | undefined;
  const map: Map = input.split('\n').map((line, row) => line.split('').map((char, col): Point => {
    const point: Point = {
      row,
      col,
      contents: char === '#' ? '#' : ' ',
      distanceToStart: Infinity,
      distanceToCheatStart: Infinity,
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

function buildPath(endPoint: Point): Set<Point> {
  const path = new Set<Point>();
  let point: Point | undefined = endPoint;
  while (point) {
    path.add(point);
    point = point.prev;
  }
  return path;
}

function _printMap(map: Point[][], endPoint?: Point) {
  const path = endPoint ? buildPath(endPoint) : new Set();
  console.log(map.map(
    row => row.map(cell => {
      if (path.has(cell)) {
        return 'O';
      }
      if (cell.contents === '#' && cell.prevCheat) {
        if (cell.prevCheat.row < cell.row) {
          return '↑';
        }
        if (cell.prevCheat.col > cell.col) {
          return '→';
        }
        if (cell.prevCheat.row > cell.row) {
          return '↓';
        }
        if (cell.prevCheat.col < cell.col) {
          return '←';
        }
      }
      switch (cell.contents) {
        case ' ': return ' ';
        case '#': return '#';
      }
    }).join('')
  ).join('\n'));
}

function _printCheat(map: Point[][], start: Coordinate, end: Coordinate) {
  console.log(map.map(
    row => row.map(cell => {
      if (cell.row === start.row && cell.col === start.col) {
        return '1';
      }
      if (cell.row === end.row && cell.col === end.col) {
        return '2';
      }
      switch (cell.contents) {
        case ' ': return ' ';
        case '#': return '#';
      }
    }).join('')
  ).join('\n'));
}
