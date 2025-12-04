import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day4: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 4);
  const map = parseInput(input);

  return map.reduce(
    (sum, row, rowNum) =>
      sum +
      row.reduce(
        (rowSum, cell, colNum) =>
          cell === "paper" && isAccessible(map, rowNum, colNum)
            ? rowSum + 1
            : rowSum,
        0
      ),
    0
  );
}

function part2(): number {
  const input = readInput(2025, 4);
  const map = parseInput(input);
  return map.reduce(
    (rowSum, row, rowNum) =>
      rowSum +
      row.reduce(
        (colSum, _cell, colNum) =>
          colSum + cascadeRemoveAccessiblePaper(map, rowNum, colNum),
        0
      ),
    0
  );
}

type Cell = "empty" | "paper";
type Map = Cell[][];

function parseInput(input: string): Map {
  return input
    .split("\n")
    .map((line) =>
      line.split("").map((character) => (character === "@" ? "paper" : "empty"))
    );
}

function printMap(map: Map) {
  const mapPrint = map
    .map((row, rowNum) =>
      row
        .map((cell, colNum) => {
          if (cell === "empty") return ".";
          // if (isAccessible(map, rowNum, colNum)) return "x";
          return "@";
        })
        .join("")
    )
    .join("\n");
  console.clear();
  console.log(mapPrint);
}

function neighboringCells(map: Map, row: number, col: number) {
  return [
    map[row - 1]?.[col - 1],
    map[row - 1]?.[col],
    map[row - 1]?.[col + 1],
    map[row]?.[col - 1],
    /* [row][col] is this cell*/
    map[row]?.[col + 1],
    map[row + 1]?.[col - 1],
    map[row + 1]?.[col],
    map[row + 1]?.[col + 1],
  ];
}

function isAccessible(map: Map, row: number, col: number): boolean {
  if (map[row]?.[col] !== "paper") return false;
  return (
    neighboringCells(map, row, col).reduce((acc, cell) => {
      return cell === "paper" ? acc + 1 : acc;
    }, 0) < 4
  );
}

function neighboringCellLocations(map: Map, row: number, col: number) {
  return [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    /* [row, col] is this cell*/
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];
}

function cascadeRemoveAccessiblePaper(
  map: Map,
  row: number,
  col: number
): number {
  let numRemoved = 0;
  if (isAccessible(map, row, col)) {
    map[row][col] = "empty";
    numRemoved += 1;
    // printMap(map);
    neighboringCellLocations(map, row, col).forEach(([i, j]) => {
      numRemoved += cascadeRemoveAccessiblePaper(map, i, j);
    });
  }
  return numRemoved;
}
