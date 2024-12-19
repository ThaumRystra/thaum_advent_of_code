import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day18: Day = {
  '1': part1,
  '2': part2,
}

type Coordinate = {
  row: number;
  col: number;
}

type Point = Coordinate & {
  contents: ' ' | '#';
  distanceToStart: number;
  prev?: Point;
}

function part1() {
  const size: Coordinate = { row: 71, col: 71 };
  const map = new Array(size.row).fill(0).map(() => new Array(size.col).fill(0))
    .map((r, row) => r
      .map((_c, col): Point => ({ row, col, contents: ' ', distanceToStart: Infinity }))
    );
  const walls = parseInput();
  for (let i = 0; i < 1024 && i < walls.length; i++) {
    addWall(map, walls[i]);
  }
  _printMap(map);
  const start = map[0][0];
  const end = map[size.row - 1][size.col - 1];
  dijkstra(map, start, end);
  _printMap(map, end);
  return end.distanceToStart;
}

function part2() {
  const size: Coordinate = { row: 71, col: 71 };
  const map = new Array(size.row).fill(0).map(() => new Array(size.col).fill(0))
    .map((r, row) => r
      .map((_c, col): Point => ({ row, col, contents: ' ', distanceToStart: Infinity }))
    );
  const walls = parseInput();
  // We know we had a path at 1024, so add those walls already
  for (let i = 0; i < 1024; i++) {
    addWall(map, walls[i]);
  }
  const start = map[0][0];
  const end = map[size.row - 1][size.col - 1];
  dijkstra(map, start, end);
  let path = buildPath(end);
  for (let i = 1024; i < walls.length; i++) {
    // Add walls
    const wall = walls[i];
    addWall(map, wall);
    const wallPoint = map[wall.row][wall.col];
    // If the wall intersect the current path, find a new path
    if (path.has(wallPoint)) {
      try {
        resetMap(map);
        dijkstra(map, start, end);
        path = buildPath(end);
      } catch (e) {
        console.log(e);
        return `${wall.col},${wall.row}`
      }
    }
    _printMap(map, end);
  }
  return 'No walls block the exit';
}

function resetMap(map: Point[][]) {
  for (const row of map) {
    for (const cell of row) {
      cell.distanceToStart = Infinity;
      cell.prev = undefined;
    }
  }
}

function dijkstra(map: Point[][], start: Point, end: Point) {
  const unvisited = new Set(map.flat());
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

// Get all neighbours of a point with empty space
function getNeighbours(map: Point[][], point: Coordinate): Point[] {
  return [
    map[point.row - 1]?.[point.col],
    map[point.row + 1]?.[point.col],
    map[point.row][point.col - 1],
    map[point.row][point.col + 1],
  ].filter(point => point?.contents === ' ');
}

function addWall(map: Point[][], wall: Coordinate) {
  const point = map[wall.row]?.[wall.col];
  if (point) {
    point.contents = '#';
  }
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
      switch (cell.contents) {
        case ' ': return ' ';
        case '#': return '#';
      }
    }).join('')
  ).join('\n'));
}

const _exampleInput = `
5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0
`.trim();

function parseInput(): Coordinate[] {
  const input = readInput(2024, 18);
  // const input = _exampleInput;
  return input.split('\n').map(line => {
    const [col, row] = line.trim().split(',').map(str => Number(str));
    return { row, col };
  });
}
