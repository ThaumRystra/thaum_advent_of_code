import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day17: Day = {
  '1': part1,
  '2': part2,
}

function part1(): string {
  const computer = parseInput();
  compute(computer);
  return computer.output.join(',');
}

/*
  We know that on every loop of our program, A is divided by 8 until A is 0, and the program must
  eventually loop exactly 16 times, thus we have bounds for possible values of A.
  A >=  35_184_372_088_832
  A < 281_474_976_710_656
  These bounds are very wide
  If we consider A as a base 8 number, we can see that each output of the program is controlled
  by a single digit of A
  Using this, we roll the lowest significant bit of A until the output matches the partial program
  output, then we move up the bits.
  There might be dead ends, so we store all candidate solutions and iterate through them
*/

function part2(): string {
  const computer = parseInput();
  const resetComputer = (a: bigint) => {
    computer.A = a;
    computer.B = 0n;
    computer.C = 0n;
    computer.instructionPointer = 0n;
    computer.output = [];
  }
  const answers = [];
  let iteration = 0;
  const candidateTumblers: number[][] = [[]];
  while (true) {
    iteration += 1;
    const tumbler = candidateTumblers.pop();
    if (!tumbler) {
      break;
    }
    testI: for (let i = 0; i < 8; i++) {
      const newTumbler = [...tumbler, i];
      if (newTumbler.length > 16) continue;
      const a = BigInt(Number.parseInt(newTumbler.join(''), 8));
      if (i === 0 && a === 0n) continue;
      // alert();
      console.log(`[${newTumbler.join(',')}]: ${a.toString()}`);
      resetComputer(a);
      compute(computer);
      const lengthDiff = computer.program.length - computer.output.length;
      if (lengthDiff < 0) continue;
      console.log(computer.program.join(','));
      console.log([...new Array(lengthDiff).fill(' '), computer.output].join(' '));
      if (computer.output[0] !== computer.program[lengthDiff]) {
        continue testI;
      }
      if (lengthDiff === 0 && _.isEqual(computer.output, computer.program)) {
        answers.push(Number(a));
      } else {
        candidateTumblers.push(newTumbler);
      }
    }
  }
  return answers.sort((a, b) => a - b).join(',');
}

function compute(computer: Computer) {
  while (computer.instructionPointer < computer.program.length && computer.instructionPointer >= 0) {
    const instructionPointer = Number(computer.instructionPointer);
    const opCode = computer.program[instructionPointer];
    const operand = computer.program[instructionPointer + 1];
    const opCodeFunction = getOpCodeFunction(opCode);
    opCodeFunction(computer, operand);
  }
}

const _exampleInput = `
Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0
`.trim();

const _exampleInput2 = `
Register A: 2024
Register B: 0
Register C: 0

Program: 0,3,5,4,3,0
`.trim();

const _exampleInput3 = `
Register A: 35184372088831
Register B: 0
Register C: 0

Program: 2,4,1,7,7,5,1,7,0,3,4,1,5,5,3,0
`.trim();

/*
bst A // B = A % 8      B = A % 8  which the last value of A in base 8
bxl 7 // B = B XOR 7    B = 7 - B  which is how much we need to add to A to get to the next multiple of 8
cdv B // C = A / 2^B    C is some division of A
bxl 7 // B = B XOR 7    B = A % 8 (the last digit of A in base 8)
adv 3 // A = A / 8      Remove the last digit of A in base 8
bxc 1 // B = B XOR C    B the last digit of A XOR'd with the (7-B)'th bits of A
out B // Output B % 8   Output the last digit of B in base 8
jnz 0 // If A !== 0, jump to 0
*/

/* running the program backwards from the output, working in base 8
B = 0 XOR C


*/


const re = /Register A: (\d+)\nRegister B: (\d+)\nRegister C: (\d+)\n\nProgram: (.+)/;

function parseInput(): Computer {
  const input = readInput(2024, 17);
  // const input = _exampleInput;
  // const input = _exampleInput2;
  // const input = _exampleInput3;
  const [_str, aInput, bInput, cInput, programInput] = input.match(re)!;
  return makeComputer({
    program: programInput.split(',').map(str => BigInt(str) as number3),
    A: BigInt(aInput),
    B: BigInt(bInput),
    C: BigInt(cInput),
  });
}

type number3 = 0n | 1n | 2n | 3n | 4n | 5n | 6n | 7n;

type Computer = {
  A: bigint;
  B: bigint;
  C: bigint;
  program: number3[];
  output: bigint[];
  instructionPointer: bigint;
}

function makeComputer(computer: Partial<Computer>): Computer {
  return {
    A: 0n,
    B: 0n,
    C: 0n,
    program: [],
    output: [],
    instructionPointer: 0n,
    ...computer,
  }
}

function getOpCodeFunction(opCode: number3): (computer: Computer, operand: number3) => void {
  switch (opCode) {
    case 0n: return adv;
    case 1n: return bxl;
    case 2n: return bst;
    case 3n: return jnz;
    case 4n: return bxc;
    case 5n: return out;
    case 6n: return bdv;
    case 7n: return cdv;
  }
}

function comboOperand(computer: Computer, operand: number3) {
  switch (operand) {
    case 0n:
      return 0n;
    case 1n:
      return 1n;
    case 2n:
      return 2n;
    case 3n:
      return 3n;
    case 4n:
      return computer.A;
    case 5n:
      return computer.B;
    case 6n:
      return computer.C;
    case 7n:
      throw new Error('Reserved operand');
  }
}

function adv(computer: Computer, operand: number3) {
  const result = division(computer, operand);
  computer.A = result;
  computer.instructionPointer += 2n;
}

function bdv(computer: Computer, operand: number3) {
  const result = division(computer, operand);
  computer.B = result;
  computer.instructionPointer += 2n;
}

function cdv(computer: Computer, operand: number3) {
  const result = division(computer, operand);
  computer.C = result;
  computer.instructionPointer += 2n;
}

function division(computer: Computer, operand: number3): bigint {
  const numerator = computer.A;
  const denominator = 2n ** comboOperand(computer, operand);
  return numerator / denominator;
}

function bxl(computer: Computer, operand: number3) {
  computer.B = computer.B ^ operand;
  computer.instructionPointer += 2n;
}

function bst(computer: Computer, operand: number3) {
  computer.B = comboOperand(computer, operand) % 8n;
  computer.instructionPointer += 2n;
}

function jnz(computer: Computer, operand: number3) {
  if (computer.A > 0) {
    computer.instructionPointer = operand;
  } else {
    computer.instructionPointer += 2n;
  }
}

function bxc(computer: Computer, _operand: number3) {
  computer.B = computer.B ^ computer.C;
  computer.instructionPointer += 2n;
}

function out(computer: Computer, operand: number3) {
  const result = comboOperand(computer, operand) % 8n;
  computer.output.push(result);
  computer.instructionPointer += 2n;
}

function _printProgram(computer: Computer) {
  console.log('\n');
  for (let i = 0; i < computer.program.length; i += 2) {
    const opCode = computer.program[i];
    const operand = computer.program[i + 1];
    const opCodeFunction = getOpCodeFunction(opCode);
    if ([bxl, jnz, bxc].includes(opCodeFunction)) {
      console.log(`${opCodeFunction.name} ${operand} // ${comment(opCodeFunction.name, operand.toString())}`);
    } else {
      const combo = comboToString(operand);
      console.log(`${opCodeFunction.name} ${combo} // ${comment(opCodeFunction.name, combo)}`);
    }
  }
  console.log('\n');
}

function comboToString(operand: number3): string {
  switch (operand) {
    case 0n:
      return '0';
    case 1n:
      return '1';
    case 2n:
      return '2';
    case 3n:
      return '3';
    case 4n:
      return 'A';
    case 5n:
      return 'B';
    case 6n:
      return 'C';
    case 7n:
      throw new Error('Reserved operand');
  }
}

function comment(fnName: string, opString: string): string {
  switch (fnName) {
    case 'adv': return `A = A / 2^${opString}`;
    case 'bdv': return `B = A / 2^${opString}`;
    case 'cdv': return `C = A / 2^${opString}`;
    case 'bxl': return `B = B XOR ${opString}`;
    case 'bst': return `B = ${opString} % 8`;
    case 'jnz': return `If A !== 0, jump to ${opString}`;
    case 'bxc': return 'B = B XOR C';
    case 'out': return 'Output B % 8';
  }
  throw new Error('Unknown function: ' + fnName);
}
