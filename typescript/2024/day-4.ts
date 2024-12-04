import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day4: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const input = readInput(2024, 4).split('\n');
  const xLocations = findAllInstancesOfLetter(input, 'X');
  let wordCount = 0;
  for (const XLocation of xLocations) {
    const potentialWords = findSecondLetters(input, XLocation, 'M');
    for (const potentialWord of potentialWords) {
      const mIndex = potentialWord.index;
      const aIndex = findNextLetter(input, mIndex, 'A', potentialWord.direction);
      if (aIndex === null) continue;
      const sIndex = findNextLetter(input, aIndex, 'S', potentialWord.direction);
      if (sIndex === null) continue;
      wordCount++;
    }
  }
  return wordCount;
}

function part2(): number {
  const input = readInput(2024, 4).split('\n');
  const aLocations = findAllInstancesOfLetter(input, 'A');
  let xMasCount = 0;
  for (const aLocation of aLocations) {
    if (isXMas(input, aLocation)) xMasCount++;
  }
  return xMasCount;
}

function isXMas(input: string[], index: [number, number]): boolean {
  const surroundingLetters = surroundingLetterIndices(index).map(letterIndex => input[letterIndex[0]]?.[letterIndex[1]]);
  return (
    (surroundingLetters[0] === 'M' && surroundingLetters[oppositeDirection(0)] === 'S')
    ||
    (surroundingLetters[0] === 'S' && surroundingLetters[oppositeDirection(0)] === 'M')
  ) && (
      (surroundingLetters[2] === 'M' && surroundingLetters[oppositeDirection(2)] === 'S')
      ||
      (surroundingLetters[2] === 'S' && surroundingLetters[oppositeDirection(2)] === 'M')
    );
}

/**
 * Characters can be connected in the 8 adjacent directions:
 * 0 1 2
 * 3 X 4
 * 5 6 7
 * If we find one character in a direction, the next character must be found in the same
 * direction
 * 
 * In this string with line length x:
 * 0123\n
 * 4567\n
 * The cells relative to some index i are given by the address
 * i-x-1, i-x, i-x+1
 * i-1,   i,   i+1
 * i+x-1, i+x, i+x+1
 */

/**
 * Finds the next letter and returns the index of the letter and the direction from the start letter
*/
function findSecondLetters(
  input: string[], index: [number, number], letterToFind: string): { index: [number, number], direction: number }[] {
  return surroundingLetterIndices(index).map((letterIndex, direction) => {
    const letter = input[letterIndex[0]]?.[letterIndex[1]];
    if (letter === letterToFind) {
      return { index: letterIndex, direction };
    }
    return null;
  }).filter(element => element !== null);
}

function findNextLetter(
  input: string[], index: [number, number], letter: string, direction: number): [number, number] | null {
  const [line, col] = directionToIndex(direction, index)
  if (input[line]?.[col] === letter) {
    return [line, col];
  }
  return null;
}

/**
 * 0 1 2
 * 3 X 4
 * 5 6 7
 */
function oppositeDirection(direction: number): number {
  switch (direction) {
    case 0:
      return 7;
    case 1:
      return 6;
    case 2:
      return 5;
    case 3:
      return 4;
    default:
      throw new Error('Invalid direction');
  }
}

function directionToIndex(direction: number, index: [number, number]): [number, number] {
  switch (direction) {
    case 0:
      return [index[0] - 1, index[1] - 1];
    case 1:
      return [index[0] - 1, index[1]];
    case 2:
      return [index[0] - 1, index[1] + 1];
    case 3:
      return [index[0], index[1] - 1];
    case 4:
      return [index[0], index[1] + 1];
    case 5:
      return [index[0] + 1, index[1] - 1];
    case 6:
      return [index[0] + 1, index[1]];
    case 7:
      return [index[0] + 1, index[1] + 1];
    default:
      throw new Error('Invalid direction');
  }
}

/**
 * Get the letters around the current index
 * In this string with line length x:
 * 0123\n
 * 4567\n
 * The cells relative to some index i are given by the address
 * i-x-1, i-x, i-x+1
 * i-1,   i,   i+1
 * i+x-1, i+x, i+x+1
 */
function surroundingLetterIndices(index: [number, number]) {
  return [0, 1, 2, 3, 4, 5, 6, 7].map(direction => directionToIndex(direction, index));
}

function findAllInstancesOfLetter(input: string[], letter: string): [number, number][] {
  const indices: [number, number][] = [];
  for (let row = 0; row < input.length; row++) {
    for (let col = 0; col < input[row].length; col++) {
      if (input[row]?.[col] === letter) {
        indices.push([row, col]);
      }
    }
  }
  return indices;
}
