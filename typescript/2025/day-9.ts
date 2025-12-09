import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
import { Heap } from "npm:heap-js";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day9: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 9);
  const points = parseInput(input);
  let largestArea = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = getArea(points[i], points[j]);
      if (a > largestArea) {
        largestArea = a;
      }
    }
  }
  return largestArea;
}

function part2(): number {
  const input = readInput(2025, 9);
  const points = parseInput(input);
  const edges = buildEdges(points);
  const potentialAreas = new Heap<Rect>((a, b) => b.area - a.area);

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      potentialAreas.push(buildRect([points[i], points[j]]));
    }
  }
  for (const rect of potentialAreas) {
    if (!edges.some((edge) => edgeIntersectsRect(edge, rect))) {
      return rect.area;
    }
  }
  throw "no answer found";
}

type Point = {
  x: number;
  y: number;
};

type Edge = [Point, Point];

type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  area: number;
};

function parseInput(input: string): Point[] {
  return input.split("\n").map((line) => {
    const [x, y] = line.split(",");
    return { x: Number.parseInt(x), y: Number.parseInt(y) };
  });
}

function getArea(a: Point, b: Point): number {
  const result = (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1);
  // console.log({ a, b, result });
  return result;
}

function buildEdges(points: Point[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    edges.push([a, b]);
  }
  edges.push([points[points.length - 1], points[0]]);
  return edges;
}

function buildRect([a, b]: Edge): Rect {
  return {
    top: Math.max(a.y, b.y),
    bottom: Math.min(a.y, b.y),
    left: Math.min(a.x, b.x),
    right: Math.max(a.x, b.x),
    area: getArea(a, b),
  };
}

function edgeIntersectsRect(edge: Edge, rect: Rect): boolean {
  const edgeRect = buildRect(edge);
  return (
    edgeRect.right > rect.left &&
    edgeRect.left < rect.right &&
    edgeRect.top > rect.bottom &&
    edgeRect.bottom < rect.top
  );
}
