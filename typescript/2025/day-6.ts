import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day6: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 6);
  const problems = parseInput(input);
  return problems.reduce((acc, problem) => {
    const answer = solveProblem(problem);
    return answer + acc;
  }, 0);
}

function part2(): number {
  const input = readInput(2025, 6);
  const problems = parseCephalopodInput(input);
  return problems.reduce((acc, problem) => {
    const answer = solveProblem(problem);
    return answer + acc;
  }, 0);
}

type Problem = {
  numbers: number[];
  operator: "+" | "*";
};

function solveProblem(problem: Problem): number {
  return problem.operator === "*"
    ? problem.numbers.reduce((acc, val) => acc * val, 1)
    : problem.numbers.reduce((acc, val) => acc + val, 0);
}

function parseInput(input: string): Problem[] {
  const rows = input.split("\n").map((line) => line.trim().split(/\s+/));
  const cols = _.zip(...rows);
  return cols.map((col) => {
    const operator = col.pop() as "*" | "+";
    return {
      numbers: col.map((str) => Number.parseInt(str ?? "")),
      operator,
    };
  });
}

function parseCephalopodInput(input: string): Problem[] {
  const characterGrid = input.split("\n").map((line) => line.split(""));
  const operatorLine = characterGrid.pop();
  if (!operatorLine) throw "expected an operator line to exist";
  const problems: Problem[] = [];
  let problem: Problem = {
    operator: '+',
    numbers: [],
  };
  for (let i = 0; i < characterGrid[0].length; i++){
    if (operatorLine[i] === ' ' && characterGrid.every(line => line[i] === " ")) {
      problems.push(problem);
      problem = {
        operator: '+',
        numbers: [],
      };
      continue;
    }
    if (operatorLine[i] === "+" || operatorLine[i] === "*") {
      problem.operator = operatorLine[i] as "*" | "+";
    }
    const number = Number.parseInt(characterGrid.map(line => line[i]).join(''));
    problem.numbers.push(number);
  }
  problems.push(problem);
  return problems;
}
