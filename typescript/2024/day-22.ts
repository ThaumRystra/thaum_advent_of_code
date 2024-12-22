import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

const input = readInput(2024, 22);
const _exampleInput = `
1
10
100
2024
`.trim();
const _exampleInput2 = `
1
2
3
2024
`.trim();

const startingNumbers = input.split('\n').map(line => BigInt(line));

export const day22: Day = {
  '1': part1,
  '2': part2,
};

function part1(): bigint {
  let total = 0n;
  for (const num of startingNumbers) {
    let secret = num;
    for (let i = 0; i < 2000; i++) {
      secret = nextSecret(secret);
    }
    total += secret;
  }
  return total;
}

function part2(): bigint {
  // Store a map of sequences to the total price of the sequence for all monkeys
  const sequencePriceTotals: { [key: string]: bigint } = {};
  for (const num of startingNumbers) {
    // A monkey can only buy once, so store a set of sequences seen
    const sequencesSeen = new Set<string>();
    let secret = num;
    // Sequence of price changes
    const sequence: bigint[] = [];
    let lastPrice = secret % 10n;
    // <= here, because we want 2000 changes, not 2000 prices, this took me an hour to figure out
    for (let i = 1; i <= 2000; i++) {
      const price = secret % 10n;
      const priceChange = price - lastPrice;
      sequence.push(priceChange);
      if (i > 4) { // For smaller i we don't have enough changes to make a sequence
        // Remove the oldest price
        sequence.shift();
        const sequenceKey = sequence.join(',');
        // If this is the fist time this monkey is seeing this sequence
        if (!sequencesSeen.has(sequenceKey)) {
          // Mark seen
          sequencesSeen.add(sequenceKey);
          //  Add the price to the total
          sequencePriceTotals[sequenceKey] ??= 0n;
          sequencePriceTotals[sequenceKey] += price;
        }
      };
      lastPrice = price;
      secret = nextSecret(secret);
    }
  }
  // Get the sequence with the highest total
  let bestTotal = 0n;
  let bestSequence = '';
  for (const sequence in sequencePriceTotals) {
    const total = sequencePriceTotals[sequence];
    if (total > bestTotal) {
      bestTotal = total;
      bestSequence = sequence;
    }
  }
  console.log(bestSequence);
  return bestTotal;
}

function mixAndPrune(num: bigint, num2: bigint): bigint {
  return (num ^ num2) % 16777216n;
}

function nextSecret(startingNum: bigint): bigint {
  let num = startingNum;
  num = mixAndPrune(num, num * 64n);
  num = mixAndPrune(num, num / 32n);
  num = mixAndPrune(num, num * 2048n);
  return num;
}
