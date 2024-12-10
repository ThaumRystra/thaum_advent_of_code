import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day10: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const [grid, trailHeads] = parseInput();
  let totalScore = 0;
  for (const trailHead of trailHeads) {
    advanceTrail({
      trailHead,
      currentPoint: trailHead.startPoint,
    }, grid);
    const score = trailHead.visitedSummits.size;
    totalScore += score;
  }
  return totalScore;
}

function part2(): number {
  const [grid, trailHeads] = parseInput();
  let totalScore = 0;
  for (const trailHead of trailHeads) {
    advanceTrail({
      trailHead,
      currentPoint: trailHead.startPoint,
    }, grid);
    const score = trailHead.trailsFinished;
    totalScore += score;
  }
  return totalScore;
}

type Grid = Point[][];

type Point = {
  row: number;
  col: number;
  height: number;
  visited: boolean;
}

type TrailHead = {
  startPoint: Point;
  visitedSummits: Set<Point>;
  trailsFinished: number;
}

type Trail = {
  trailHead: TrailHead;
  currentPoint: Point;
}

function advanceTrail(trail: Trail, grid: Grid) {
  const { trailHead, currentPoint } = trail;
  const { height } = currentPoint;
  // If we have arrived at the summit, yay we're done
  if (height === 9) {
    trailHead.visitedSummits.add(currentPoint);
    trailHead.trailsFinished++;
    return;
  }
  // Otherwise advance the trail along all possible paths
  const nextHeight = height + 1;
  for (const adjacentPoint of adjacentPoints(currentPoint, grid)) {
    if (adjacentPoint.height === nextHeight) {
      advanceTrail({
        trailHead,
        currentPoint: adjacentPoint,
      }, grid);
    }
  }
}

function adjacentPoints(point: Point, grid: Grid): Point[] {
  const { row, col } = point;
  return [
    grid[row - 1]?.[col],
    grid[row]?.[col - 1],
    grid[row]?.[col + 1],
    grid[row + 1]?.[col],
  ].filter(Boolean);
}

function parseInput(): [Grid, TrailHead[], Set<Point>] {
  const input = readInput(2024, 10);
  const trailHeads: TrailHead[] = [];
  const summits = new Set<Point>();
  const grid = input.split('\n').map((line, row) => line.split('').map((char, col) => {
    const height = parseInt(char);
    const point: Point = { row, col, height, visited: false };
    if (height === 0) trailHeads.push({
      startPoint: point,
      visitedSummits: new Set(),
      trailsFinished: 0,
    } as TrailHead);
    if (height === 9) summits.add(point);
    return point;
  }));
  return [grid, trailHeads, summits];
}
