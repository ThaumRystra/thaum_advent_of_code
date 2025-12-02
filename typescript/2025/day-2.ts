import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day2: Day = {
  "1": part1,
  "2": part2,
};

const int = Number.parseInt;

function part1(): number {
  const input = readInput(2025, 2);

  const ranges = parseInput(input);
  let sumDoubles = 0;
  ranges.forEach(([low, high]) => {
    // Get the digits that make up the lowest and highest double number
    const lowD = nextDouble(low);
    const highD = prevDouble(high);
    // Iterate through the doubled numbers and add them
    for (let d = lowD; d <= highD; d++) {
      const double = int(`${d}${d}`);
      sumDoubles += double;
    }
  });
  return sumDoubles;
}

function part2(): number {
  const input = readInput(2025, 2);
  const ranges = parseInput(input);
  let sumComposites = 0;
  ranges.forEach(([low, high]) => {
    const invalidIdsFound = new Set<number>();
    const highLength = high.toString().length;
    // Make composites that split the number in 2, 3, ..., n pieces
    // We only need as many pieces as the length of the highest number
    for (let i = 2; i <= highLength; i++) {
      const lowD = nextComposite(low, i);
      const highD = prevComposite(high, i);
      // Iterate through all the composites in the range
      for (let d = lowD; d <= highD; d++) {
        const composite = repeatNum(d, i);
        // Only sum the composite if we've never seen it before
        // Since 2222 is 22 repeated twice and 2 repeated 4 times
        if (!invalidIdsFound.has(composite)) {
          invalidIdsFound.add(composite);
          sumComposites += composite;
        }
      }
    }
  });
  return sumComposites;
}

function parseInput(input: string): [number, number][] {
  return input.split(",").map((range) => {
    const [left, right] = range.split("-");
    return [int(left), int(right)] as [number, number];
  });
}

function splitInHalves(strInput: string): [string, string] {
  let str = strInput;
  while (str.length % 2 !== 0) {
    str = "0" + str;
  }
  const left = str.slice(0, str.length / 2);
  const right = str.slice(str.length / 2, str.length);
  return [left, right];
}

/**
 * Find lowest the number (n) that when its characters are doubled (nn) it is greater than the input
 */
function nextDouble(num: number): number {
  const str = num.toString();
  // Odd length string, next double is 1000..
  if (str.length % 2 !== 0) {
    return 10 ** ((str.length - 1) / 2);
  }
  // Otherwise the start sequence doubled is a nearby double
  const [leftStr] = splitInHalves(str);
  const left = int(leftStr);
  const nearbyDouble = int(`${left}${left}`);
  // If the nearby double is already greater than or eq to the number, it is the next double
  if (nearbyDouble >= num) {
    return left;
  } else {
    // Otherwise the very next double
    return left + 1;
  }
}

/**
 * Find the highest number (n) that when its characters are doubled (nn) it is less than the input
 */
function prevDouble(num: number): number {
  const str = num.toString();
  // Odd length string, previous double is 9999..
  if (str.length % 2 !== 0) {
    return int(new Array((str.length - 1) / 2).fill(9).join(""));
  }
  // Duplicate the start sequence to get a nearby double
  const [leftStr] = splitInHalves(str);
  const left = int(leftStr);
  const nearbyDouble = int(`${left}${left}`);
  // If that's already less than or eq to the number, it is the previous double
  if (nearbyDouble <= num) {
    return left;
  } else {
    // Otherwise the double right before it
    return left - 1;
  }
}

/**
 * Find the lowest number (n) that when its characters are repeated some amount of times (nnnn),
 * it is greater than the input
 */
function nextComposite(num: number, repeats: number): number {
  const str = num.toString();
  // If the number isn't divisible by this many repeats go up to 10...
  const remainder = str.length % repeats;
  if (remainder !== 0) {
    return 10 ** ((str.length - remainder) / repeats);
  }
  // Otherwise get the first chunk
  const left = str.slice(0, str.length / repeats);
  // And repeat it n times
  const nearbyComposite = repeatNum(left, repeats);
  // if that is already next, return it, otherwise return the next one
  if (nearbyComposite >= num) {
    return int(left);
  } else {
    return int(left) + 1;
  }
}

/**
 * Find the highest number (n) that when its characters are repeated some amount of times (nnnn),
 * it is lower than the input
 */
function prevComposite(num: number, repeats: number): number {
  const str = num.toString();
  // If the number isn't divisible by this many repeats go down to nearest 9999...
  const remainder = str.length % repeats;
  if (remainder !== 0) {
    return int(new Array((str.length - remainder) / repeats).fill(9).join(""));
  }
  // Otherwise get the first chunk
  const left = str.slice(0, str.length / repeats);
  // and repeat it n times
  const nearbyComposite = repeatNum(left, repeats);
  // if that is already prev return it otherwise return the previous one
  if (nearbyComposite <= num) {
    return int(left);
  } else {
    return int(left) - 1;
  }
}

/**
 * Take a number or string and repeat it some amount of times to make a new number
 * (4, 3) => 444
 */
function repeatNum(num: number | string, repeats: number): number {
  return int(new Array(repeats).fill(num).join(""));
}
