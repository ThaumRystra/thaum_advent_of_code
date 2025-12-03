import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day3: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  //   const input = `\
  // 987654321111111
  // 811111111111119
  // 234234234234278
  // 818181911112111`;
  const input = readInput(2025, 3);
  const banks = parseInput(input);
  const joltages = banks.map((bank) => {
    let highestValue = 0;
    let highIndex = bank.length;
    // Find the highest value batteries in the bank that isn't in the last position
    // We only care about the earliest instance
    for (let i = 0; i < bank.length - 1; i++) {
      const battery = bank[i];
      if (battery > highestValue) {
        highestValue = battery;
        highIndex = i;
      }
    }
    // Find the highest value after that battery
    let highestNextBattery = 0;
    for (let i = highIndex + 1; i < bank.length; i++) {
      const battery = bank[i];
      if (battery > highestNextBattery) {
        highestNextBattery = battery;
      }
    }
    const joltage = highestValue * 10 + highestNextBattery;
    console.log(joltage);
    return joltage;
  });
  return joltages.reduce((a, b) => a + b, 0);
}

function part2(): number {
//   const input = `\
// 987654321111111
// 811111111111119
// 234234234234278
// 818181911112111`;
  const input = readInput(2025, 3);
  const banks = parseInput(input);
  const joltages = banks.map((bank) => {
    let joltage = 0;
    let consumedIndex = -1;
    for (let digit = 11; digit >= 0; digit--){
      let highestBattery = 0;
      for (let i = consumedIndex + 1; i < bank.length - digit; i++){
        const battery = bank[i];
        if (battery > highestBattery) {
          highestBattery = battery;
          consumedIndex = i;
        }
      }
      joltage = joltage * 10 + highestBattery;
    }
    return joltage;
  });
  return joltages.reduce((a, b) => a + b, 0);
}

type Battery = number;
type Bank = Battery[];

function parseInput(input: string): Bank[] {
  return input.split("\n").map((line) =>
    line.split("").map((char) => Number.parseInt(char))
  );
}

part2();
