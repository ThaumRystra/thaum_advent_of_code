import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day12: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 12);
  const { gifts, trees } = parseInput(input);
  const fillRatios = trees.map((tree) => fillRatio(tree, gifts));
  // Guess a ratio that we can't fill
  const fillRatioCutoff = 0.8;
  return fillRatios.reduce(
    (acc, ratio) => (ratio < fillRatioCutoff ? acc + 1 : acc),
    0
  );
}

function part2(): string {
  return "There is no part 2";
}

type B = "#" | ".";

type Gift = {
  id: string;
  shape: [[B, B, B], [B, B, B], [B, B, B]];
  size: number;
};

type Tree = {
  x: number;
  y: number;
  gifts: number[];
};

const int = (s: string) => Number.parseInt(s);

function fillRatio(tree: Tree, gifts: Gift[]): number {
  const space = tree.x * tree.y;
  const fill = tree.gifts.reduce((acc, num, i) => gifts[i].size * num + acc, 0);
  return fill / space;
}

function parseInput(input: string): { gifts: Gift[]; trees: Tree[] } {
  const blocks = input.split("\n\n");
  const treesInput = blocks.pop();
  const trees: Tree[] = treesInput!.split("\n").map((line) => {
    const [sizeInput, numsInput] = line.split(": ");
    const [x, y] = sizeInput.split("x").map(int);
    const gifts = numsInput.split(" ").map(int);
    return { x, y, gifts };
  });
  const gifts = blocks.map((block) => {
    const [id, squares] = block.split(":\n");
    const shape = squares.split("\n").map((line) => line.split(""));
    const size = shape.reduce(
      (acc, val) =>
        acc + val.reduce((acc2, val2) => (val2 === "#" ? acc2 + 1 : acc2), 0),
      0
    );
    return { id, shape, size };
  }) as Gift[];

  return { trees, gifts };
}
