import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day9: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const disk = parseInput();
  // find spaces from the left and numbers from the right, swap them until left == right
  let left = 0;
  let right = disk.length - 1;
  while (left < right) {
    // Advance left until we find a '.'
    let leftSpace = disk[left] === '.';
    while (!leftSpace) {
      left++;
      leftSpace = disk[left] === '.';
    }
    // Advance right backwards until we find a number
    let rightNumber = disk[right] !== '.';
    while (!rightNumber) {
      right--;
      rightNumber = disk[right] !== '.';
    }
    if (left >= right) break;
    [disk[left], disk[right]] = [disk[right], disk[left]];
    left++;
    right--;
  }
  return checkSum(disk);
}

function part2(): number {
  const disk = parseInput2();
  // iterate through data from the right
  for (let i = disk.length - 1; i >= 0; i--) {
    const block = disk[i];
    if (block.type !== 'data') continue;
    // find the first space from the left that is big enough
    for (let j = 0; j < disk.length; j++) {
      // If we go past the data block, give up
      if (j >= i) break;
      const space = disk[j];
      if (space.type !== 'space') continue;
      if (space.size < block.size) continue;
      // swap the data and the space
      [disk[i], disk[j]] = [disk[j], disk[i]];
      // If they were the same size, we're done
      if (space.size === block.size) {
        break;
      }
      // otherwise we have extra space
      const extraSpace = space.size - block.size;
      // Shrink the space
      space.size = block.size;
      // Append the extra space to the end of the data
      disk.splice(j + 1, 0, {
        size: extraSpace,
        type: 'space'
      });
      break;
    }
  }
  const realDisk = realiseDisk2(disk);
  // printDisk(realDisk);
  return checkSum(realDisk);
}

const exampleInput = `2333133121414131402`;

function checkSum(disk: Disk): number {
  let sum = 0;
  for (let i = 0; i < disk.length; i++) {
    const num = disk[i]
    if (num === '.') continue;
    sum += num * i;
  }
  return sum;
}

type Disk = (number | '.')[];

function parseInput(): Disk {
  // const input = exampleInput.trim().split('');
  const input = readInput(2024, 9);
  return _.chunk(input, 2).flatMap(([block, space], index) => {
    return [
      ...new Array(parseInt(block ?? 0)).fill(index),
      ...new Array(parseInt(space ?? 0)).fill('.')
    ];
  });
}

type Space = { size: number, type: 'space' }
type Data = { size: number, dataIndex: number, type: 'data' }

type Disk2 = (Data | Space)[];

function parseInput2(): Disk2 {
  // const input = exampleInput.trim().split('');
  const input = readInput(2024, 9);
  let currentIndex = 0;
  return _.chunk(input, 2).flatMap(([block, space], index) => {
    const blockNum = parseInt(block ?? 0);
    const spaceNum = parseInt(space ?? 0);
    const content = [
      { size: blockNum, dataIndex: index, type: 'data' } as Data,
      { size: spaceNum, type: 'space' } as Space
    ];
    currentIndex += blockNum + spaceNum;
    return content;
  });
}

function realiseDisk2(disk: Disk2): Disk {
  return disk.flatMap(block => {
    if (block.type === 'space') return new Array(block.size ?? 0).fill('.');
    return new Array(block.size ?? 0).fill(block.dataIndex);
  });
}

function printDisk(disk: Disk) {
  console.log(disk.join(''));
}
