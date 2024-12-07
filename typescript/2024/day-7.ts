import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day7: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const tests = parseInput();
  return totalPassingTests(tests, operatorCombinations);
}

function part2(): number {
  const tests = parseInput();
  return totalPassingTests(tests, operatorCombinationsWithConcat);
}

type Test = {
  result: number,
  values: number[],
}

function totalPassingTests(tests: Test[], getOpCombs: (length: number) => Operator[][]): number {
  return tests.reduce((total: number, test: Test): number => {
    for (const combination of getOpCombs(test.values.length - 1)) {
      const calculatedResult = combination.reduce((total, operator, index) => {
        switch (operator) {
          case '+':
            return total + test.values[index + 1];
          case '*':
            return total * test.values[index + 1];
          case '||':
            return Number('' + total + test.values[index + 1]);
        }
      }, test.values[0]);
      if (calculatedResult === test.result) {
        return total + calculatedResult;
      }
    }
    return total;
  }, 0);
}

function parseInput(): Test[] {
  const input = readInput(2024, 7);
  return input.split('\n').map(line => {
    const [result, values] = line.split(': ');
    return {
      result: parseInt(result.trim()),
      values: values.trim().split(' ').map(Number),
    };
  });
}

type Operator = '+' | '*' | '||';

// Memoize the combinations for various lengths
const operatorCombinations = _.memoize((length: number): Operator[][] => {
  return appendUntilLength([], length);
});

function appendUntilLength(combinations: Operator[][], length: number): Operator[][] {
  // Start case
  if (!combinations.length) {
    return appendUntilLength([appendAdd([]), appendMul([])], length);
  }
  // Base case
  if (combinations[0].length === length) {
    return combinations;
  }
  return appendUntilLength([
    ...combinations.map(appendAdd),
    ...combinations.map(appendMul),
  ], length);
}

function appendAdd(operators: Operator[]) {
  return operators.concat('+');
}

function appendMul(operators: Operator[]) {
  return operators.concat('*');
}

// Memoize the combinations for various lengths
const operatorCombinationsWithConcat = _.memoize((length: number): Operator[][] => {
  return appendWithConcatUntilLength([], length);
});

function appendWithConcatUntilLength(combinations: Operator[][], length: number): Operator[][] {
  // Start case
  if (!combinations.length) {
    return appendWithConcatUntilLength([appendAdd([]), appendMul([]), appendConcat([])], length);
  }
  // Base case
  if (combinations[0].length === length) {
    return combinations;
  }
  return appendWithConcatUntilLength([
    ...combinations.map(appendAdd),
    ...combinations.map(appendMul),
    ...combinations.map(appendConcat),
  ], length);
}

function appendConcat(operators: Operator[]) {
  return operators.concat('||');
}
