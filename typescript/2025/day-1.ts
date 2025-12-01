import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day1: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const input = readInput(2025, 1);
  const rotations = input.split('\n').map(line => ({
    direction: line[0] as 'L' | 'R',
    clicks: Number.parseInt(line.slice(1)),
  }));
  let position = 50;
  let numZeroes = 0;
  rotations.forEach((rotation) => {
    position = rotate(position, rotation.direction, rotation.clicks);
    console.log(position);
    if (position === 0) numZeroes += 1;
  });
  return numZeroes;
}

function part2(): number {
const input = readInput(2025, 1);
  const rotations = input.split('\n').map(line => ({
    direction: line[0] as 'L' | 'R',
    clicks: Number.parseInt(line.slice(1)),
  }));
  let position = 50;
  let numZeroes = 0;
  rotations.forEach((rotation) => {
    const [newPosition, passesOfZero] = rotateCountingZeroes(position, rotation.direction, rotation.clicks);
    position = newPosition;
    numZeroes += passesOfZero;
  });
  return numZeroes;
}

function rotate(position: number, direction: 'L' | 'R', clicks: number) {
  const rotation = direction === "L" ? -clicks : clicks;
  let result = position + rotation;
  while (result < 0) {
    result += 100
  }
  while (result > 99) {
    result -= 100
  }
  return result;
}

function rotateCountingZeroes(position: number, direction: 'L' | 'R', clicks: number): [number, number] {
  let unwoundClicks = clicks;
  let passesOfZero = 0;
  // First unwind it and count zeroes passed unwinding
  while (unwoundClicks > 99) {
    unwoundClicks -= 100;
    passesOfZero += 1;
  }
  const rotation = direction === "L" ? -unwoundClicks : unwoundClicks;
  let result = position + rotation;
  while (result < 0) {
    result += 100
  }
  while (result > 99) {
    result -= 100
  }
  const passedZero = direction === 'L' ? (position !== 0 && unwoundClicks >= position) : unwoundClicks > 99 - position;
  if (passedZero) passesOfZero += 1;
  return [result, passesOfZero];
}
