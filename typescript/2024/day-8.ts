import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day8: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const [grid, antennaList] = parseInput();
  let antiNodeCount = 0;
  for (const antennaChar in antennaList) {
    const antennaPoints = antennaList[antennaChar];
    for (const antennaPoint of antennaPoints) {
      for (const otherAntennaPoint of antennaPoints) {
        if (otherAntennaPoint === antennaPoint) continue;
        const relativePosition = [
          otherAntennaPoint.row - antennaPoint.row,
          otherAntennaPoint.col - antennaPoint.col
        ];
        const antiNodeRelativePosition = relativePosition.map(n => n * 2);
        const antiNodePosition = [
          antennaPoint.row + antiNodeRelativePosition[0],
          antennaPoint.col + antiNodeRelativePosition[1]
        ];
        const antiNodePoint = grid[antiNodePosition[0]]?.[antiNodePosition[1]];
        if (antiNodePoint) {
          if (antiNodePoint.antiNodes.size === 0) {
            antiNodeCount++;
          }
          antiNodePoint.antiNodes.add(antennaChar);
        }
      }
    }
  }
  printGrid(grid);
  return antiNodeCount;
}

function part2(): number {
  const [grid, antennaList] = parseInput();
  for (const antennaChar in antennaList) {
    const antennaPoints = antennaList[antennaChar];
    for (let i = 0; i < antennaPoints.length; i++) {
      for (let j = i + 1; j < antennaPoints.length; j++) {
        drawAntinodeLine(grid, antennaPoints[i], antennaPoints[j]);
      }
    }
  }
  printGrid(grid);
  return countAntiNodes(grid);
}

type Point = {
  row: number;
  col: number;
  antiNodes: Set<string>;
  antenna: string | null;
}

type AntennaList = Record<string, Point[]>;

function printGrid(grid: Point[][]) {
  console.log(
    grid.map(row => row.map(point =>
      point.antenna
        ? point.antenna
        : point.antiNodes.size
          ? '#'
          : '.'
    ).join('')).join('\n')
  );
}

function parseInput(): [Point[][], AntennaList] {
  const input = readInput(2024, 8);
  const antennaList: AntennaList = {};
  return [input
    .split('\n')
    .map((line, row) => line
      .split('')
      .map((char, col) => {
        if (char === '.') {
          return {
            row, col, antiNodes: new Set<string>(), antenna: null
          }
        } else {
          const point = {
            row, col, antiNodes: new Set<string>(), antenna: char
          };
          antennaList[char] ??= [];
          antennaList[char].push(point);
          return point;
        }
      })
    ),
    antennaList
  ];
}

function countAntiNodes(grid: Point[][]) {
  let antiNodeCount = 0;
  for (const row of grid) {
    for (const point of row) {
      if (point.antiNodes.size !== 0) {
        antiNodeCount++;
      }
    }
  }
  return antiNodeCount;
}

// Draw a line through the grid that passes through the two points
function drawAntinodeLine(grid: Point[][], a: Point, b: Point) {
  const relativePosition = [a.row - b.row, a.col - b.col];
  const divisor = gcd(relativePosition[0], relativePosition[1]);
  const step: [number, number] = [
    relativePosition[0] / divisor,
    relativePosition[1] / divisor
  ];
  const stepReverse: [number, number] = [
    -step[0],
    -step[1]
  ];
  // Draw from start to bounds going +step
  draw(grid, a, step);
  // Draw from start to bounds going -step
  draw(grid, a, stepReverse);
}

function draw(grid: Point[][], start: Point, step: [number, number]) {
  if (!start.antenna) {
    throw new Error('Expected start point to have an antenna')
  }
  let currentPoint = start;
  while (currentPoint) {
    currentPoint.antiNodes.add(start.antenna);
    currentPoint = grid[currentPoint.row + step[0]]?.[currentPoint.col + step[1]];
  }
}

// Euclid algorithm for Greatest Common Divisor
function gcd(a: number, b: number): number {
  return !b ? a : gcd(b, a % b);
} 
