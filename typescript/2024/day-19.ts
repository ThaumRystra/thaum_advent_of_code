import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day19: Day = {
  '1': part1,
  '2': part2,
};

function part1(): number {
  const [towelsInput, designs] = parseInput();
  const towels = keyMap(towelsInput);
  const towelLengths: number[] = Object.keys(towels).map(Number).sort((a, b) => a - b);
  const maxTowelLength = towelLengths[towelLengths.length - 1];
  /**
   * Get all valid towels that can be used to make the start of a substring
   */
  const getValidTowels = _.memoize((subString: string): string[] => {
    const validTowels: string[] = []
    for (const length of towelLengths) {
      const towelToFind = subString.slice(0, length);
      if (towels[length].has(towelToFind)) {
        validTowels.push(towelToFind);
      }
    }
    return validTowels;
  });

  let totalValidDesigns = 0;
  for (const design of designs) {
    const candidates: string[] = [''];
    let isValid = false;
    const visitedCandidates = new Set<string>();
    testCandidates: while (candidates.length) {
      const candidate = candidates.pop()!;
      visitedCandidates.add(candidate);
      const subString = design.slice(candidate.length, candidate.length + maxTowelLength);
      const nextTowels = getValidTowels(subString);
      for (const towel of nextTowels) {
        const newCandidate = candidate + towel;
        if (newCandidate.length > design.length) {
          continue;
        }
        if (newCandidate === design) {
          isValid = true;
          break testCandidates;
        }
        if (visitedCandidates.has(newCandidate)) {
          continue;
        }
        candidates.push(candidate + towel);
      }
    }
    totalValidDesigns += isValid ? 1 : 0;
  }
  return totalValidDesigns;
}

function part2(): number {
  const [towelsInput, designs] = parseInput();
  const towels = keyMap(towelsInput);
  const towelLengths: number[] = Object.keys(towels).map(Number).sort((a, b) => a - b);
  const maxTowelLength = towelLengths[towelLengths.length - 1];
  /**
   * Get all valid towels that can be used to make the start of a substring
   */
  const getValidTowels = _.memoize((subString: string): string[] => {
    const validTowels: string[] = []
    for (const length of towelLengths) {
      const towelToFind = subString.slice(0, length);
      if (towels[length].has(towelToFind)) {
        validTowels.push(towelToFind);
      }
    }
    return validTowels;
  });
  const countValidCombinations = _.memoize((design: string): number => {
    // There is only one way to make the empty string
    if (design === '') {
      return 1;
    }
    const subString = design.slice(0, maxTowelLength);
    const nextTowels = getValidTowels(subString);
    return nextTowels.reduce((count, towel) => {
      // remove the towel from the front of the design
      const newDesign = design.slice(towel.length);
      // And count the number of combinations the resulting string can be made of
      return count + countValidCombinations(newDesign);
    }, 0);
  })

  return designs.reduce((count, design) => count + countValidCombinations(design), 0);
}

/**
 * Naive approach, depth first search of all possible combinations
 * Too slow on actual input
 */
function _stepDesign(
  targetDesign: string, designSoFar: string[], towels: string[]
): string[][] {
  const newCandidates: string[][] = [];
  checkTowel: for (const towel of towels) {
    const candidateDesign = [...designSoFar, towel];
    const candidateStr = candidateDesign.join('');
    // check if the next few characters match this towel
    for (let i = targetDesign.length - candidateStr.length; i < candidateStr.length; i++) {
      if (targetDesign[i] !== candidateStr[i]) {
        continue checkTowel;
      }
    }
    if (candidateStr === targetDesign) {
      return [candidateDesign];
    }
    newCandidates.push(candidateDesign);
  }
  return newCandidates.flatMap(candidateDesign => _stepDesign(targetDesign, candidateDesign, towels));
}

type SetsByLength = { [key: number]: Set<string> };

function keyMap(towels: string[]): SetsByLength {
  const arraysByLength = _.groupBy(towels, towel => towel.length);
  return _.mapValues(arraysByLength, array => new Set(array));
}

const _exampleInput = `
r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb
`

const _exampleInput2 = `
r, rb, rbub, bu, bur

burg
`

function parseInput(): [string[], string[]] {
  const input = readInput(2024, 19);
  // const input = _exampleInput;
  const [towelsInput, designsInput] = input.split('\n\n');
  const towels = towelsInput.trim().split(', ').map(towel => towel.trim());
  const designs = designsInput.trim().split('\n').map(design => design.trim());
  return [towels, designs];
}
