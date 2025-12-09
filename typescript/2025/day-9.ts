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
  let left: Point, right: Point;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = getArea(points[i], points[j]);
      if (a > largestArea) {
        largestArea = a;
        left = points[i];
        right = points[j];
      }
    }
  }
  console.log({ left: left!, right: right! });
  return largestArea;
}

//1410501884 is correct
function part2(): number {
  //   const input = `\
  // 7,1
  // 11,1
  // 11,7
  // 9,7
  // 9,5
  // 2,5
  // 2,3
  // 7,3`;
  const input = readInput(2025, 9);
  const points = parseInput(input);
  // const grid = new Array(20).fill([]).map(() => new Array(20).fill("."));
  const edges = buildEdges(points);
  const isInsideMemo = _.memoize(
    (point: Point) => isPointInEdges(edges, point),
    ({ x, y }) => `${x},${y}`
  );

  // const logGrid = () =>
  //   console.log(
  //     grid
  //       .map((row, i) =>
  //         row
  //           .map((cell, j) =>
  //             isPointInEdges(edges, { x: j, y: i }) ? "X" : "."
  //           )
  //           .join("")
  //       )
  //       .join("\n")
  //   );
  // logGrid();

  const potentialAreas = new Heap<Rect>((a, b) => b.area - a.area);

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const area = getArea(a, b);
      const rect: Rect = {
        top: Math.max(a.y, b.y),
        bottom: Math.min(a.y, b.y),
        left: Math.min(a.x, b.x),
        right: Math.max(a.x, b.x),
        area,
      };
      potentialAreas.push(rect);
    }
  }
  let a: Rect;
  valid: while ((a = potentialAreas.pop()!)) {
    // console.log(a.area);
    // Check all corners
    const cornersInside =
      isInsideMemo({ x: a.left, y: a.top }) &&
      isInsideMemo({ x: a.right, y: a.top }) &&
      isInsideMemo({ x: a.left, y: a.bottom }) &&
      isInsideMemo({ x: a.right, y: a.bottom });
    if (!cornersInside) continue;

    // Check around each point
    const pointInvalidatesRect = (point: Point) => {
      return isPointInRect(a, point) && !isInsideMemo(point);
    };
    for (const point of points) {
      if (pointInvalidatesRect(point)) continue valid;
      if (pointInvalidatesRect({ x: point.x - 1, y: point.y })) continue valid;
      if (pointInvalidatesRect({ x: point.x + 1, y: point.y })) continue valid;
      if (pointInvalidatesRect({ x: point.x, y: point.y + 1 })) continue valid;
      if (pointInvalidatesRect({ x: point.x, y: point.y - 1 })) continue valid;
    }
    // Check perimeter
    for (let x = a.left; x <= a.right; x++) {
      if (
        !isPointInEdges(edges, { x, y: a.bottom }) ||
        !isPointInEdges(edges, { x, y: a.top })
      )
        continue valid;
      if (x === a.left || x === a.right) {
        for (let y = a.bottom; y <= a.top; y++) {
          if (!isPointInEdges(edges, { x, y })) continue valid;
        }
      }
    }
    return a.area;
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

// Project a horizontal ray from x = 0 => x = point, counting the vertical edges crossed
function isPointInEdges(edges: Edge[], point: Point) {
  let windingNumber = 0;
  for (const edge of edges) {
    // If the point is on an edge, early success
    const onEdge = isPointInRect(buildRect(edge), point);
    if (onEdge) return true;
    const [a, b] = edge;
    // Skip horizontal edges
    if (a.y === b.y) continue;
    if (a.x !== b.x)
      throw new Error(
        `Didn't expect angled edge ${a.x},${a.y} -> ${b.x},${b.y}`
      );
    const upwards = a.y < b.y;
    const doesCross =
      point.x >= a.x &&
      Math.min(a.y, b.y) < point.y &&
      Math.max(a.y, b.y) >= point.y;
    if (doesCross) {
      windingNumber += upwards ? 1 : -1;
    }
  }
  return windingNumber !== 0;
}

function isPointInRect(rect: Rect, point: Point) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.bottom &&
    point.y <= rect.top
  );
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
