import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";
import { kCombinations } from "./util/combinations.ts";

export const day24: Day = {
  '1': part1,
  '2': part2,
};

type Wire = {
  name: string;
  value: boolean | undefined;
  gateIn?: Gate;
  gatesOut: Gate[];
}

type Gate = {
  key: string;
  inputs: [Wire, Wire];
  output: Wire;
  operation: 'AND' | 'OR' | 'XOR';
  suspicion: number;
}

function part1() {
  const [wiresById] = parseInput();
  const binary = Object.values(wiresById)
    .filter(wire => wire.name.startsWith('z'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .reverse()
    .map(wire => resolveWire(wire, wiresById))
    .map(result => result ? '1' : '0')
    .join('');
  return parseInt(binary, 2);
}

/**
 * This is not a solution per-se, but I did run it a bunch of time, and append the possible swaps
 * to the top of the function until all suspicious gates were eliminated
 */
function part2() {
  const [wiresById, gates] = parseInput();
  // Apply the best swaps we've found before 
  swapWires('nqk', 'z07', wiresById);
  swapWires('fpq', 'z24', wiresById);
  swapWires('fgt', 'pcp', wiresById);
  swapWires('srn', 'z32', wiresById);

  scoreAccuracy(wiresById, true);
  // Get a list of all the suspicious gates
  const susGates = gates.sort((a, b) => b.suspicion - a.suspicion).filter(gate => gate.suspicion > 0)

  const baseAccuracy = scoreAccuracy(wiresById);
  console.log(`Base accuracy: ${baseAccuracy}\n`);
  if (!susGates.length) {
    console.log('No suspicious gates found');
    return ['nqk', 'z07', 'fpq', 'z24', 'fgt', 'pcp', 'srn', 'z32'].sort().join(',');
  }
  console.log('sus gates:');
  console.log(susGates.map(gate => `${gate.output.name}: ${gate.suspicion}`).join('\n'));
  const goodSwaps: { swap: [string, string], accuracyGain: bigint }[] = [];
  // get all possible sets of 8 wires in the sus set
  const allSwaps = kCombinations(susGates.map(gate => gate.output.name), 2);
  let progress = 0;
  const total = allSwaps.length;
  for (const swap of allSwaps) {
    swapWires(swap[0], swap[1], wiresById);
    const newAccuracy = scoreAccuracy(wiresById);
    // un-swap the wires again
    swapWires(swap[0], swap[1], wiresById);
    // console.log(`New accuracy: ${newAccuracy}`);
    progress++;
    if (progress % 100 === 0) {
      console.log(`${progress}/${total}  ${Math.round(progress / total * 100)}% `);
    }
    if (newAccuracy > baseAccuracy) {
      console.log(swap.join(',') + '  ' + (newAccuracy - baseAccuracy));
      goodSwaps.push({ swap: [swap[0], swap[1]], accuracyGain: newAccuracy - baseAccuracy });
    }
  }
  goodSwaps.sort((a, b) => Number(b.accuracyGain - a.accuracyGain));
  return goodSwaps.map(swap => swap.swap.join(',') + '  ' + swap.accuracyGain).join('\n');
}

const testSet = (() => {
  const set = [0n];
  let number = 1n;
  for (let i = 0; i < 44; i++) {
    set.push(number);
    number *= 2n;
  }
  return set;
})();

function scoreAccuracy(wiresById: { [key: string]: Wire }, markSus = false): bigint {
  let accuracy = 0n;
  for (let i = 0; i < testSet.length; i++) {
    [
      { left: testSet[i], right: testSet[i] },
      { left: testSet[i], right: 0n },
      { left: 0n, right: testSet[i] },
      { left: 0n, right: testSet[i] + testSet[i] * 2n },
    ].forEach(({ left, right }) => {
      setInputs(wiresById, left, right);
      let x, y, z;
      try {
        x = wiresToNumber(wiresById, 'x');
        y = wiresToNumber(wiresById, 'y');
        z = wiresToNumber(wiresById, 'z');
      } catch (_e) {
        return 0n;
      }
      const expected = x + y;
      const incorrectBits = expected ^ z;
      if (incorrectBits == 0n) {
        accuracy++;
      } else {
        // console.log('exp: ' + toBinary(expected));
        // console.log('got: ' + toBinary(z));
        // console.log('err: ' + toBinary(incorrectBits));
        if (markSus) {
          const incorrectBitsBin = toBinary(incorrectBits);
          for (let i = 0; i < incorrectBitsBin.length; i++) {
            if (incorrectBitsBin[i] === '1') {
              const gateIndex = `${incorrectBitsBin.length - i - 1}`.padStart(2, '0');
              console.log(`Gate z${gateIndex} is sus`);
              const gates = getAllDependencies(wiresById[`z${gateIndex}`]);
              gates.forEach(gate => gate.suspicion++);
            }
          }
        }
      }
      if (x !== left) throw new Error('x is wrong');
      if (y !== right) throw new Error('y is wrong');
    });
  }
  return accuracy;
}

function swapWires(left: string, right: string, wiresById: { [key: string]: Wire }) {
  const leftWire = wiresById[left];
  const rightWire = wiresById[right];
  if (!leftWire || !rightWire) throw new Error('Wire not found');
  const [leftGate, rightGate] = [wiresById[left].gateIn, wiresById[right].gateIn];
  if (!leftGate || !rightGate) return;
  leftWire.gateIn = rightGate;
  rightWire.gateIn = leftGate;
  rightGate.output = leftWire;
  leftGate.output = rightWire;
}

/**
 * We know that
 * - when the answer is wrong the swapped gates will have different outputs
 * - if a given bit in the answer is wrong, one of the swapped gates will be in the chain of gates that feed into it
 * 
 * Strategy 1: test a lot of answers, and for all incorrect bits, increase our suspicion on the gates
 * that bits depend on
 */

function wiresToNumber(wiresById: { [key: string]: Wire }, prefix: string): bigint {
  const binary = Object.values(wiresById)
    .filter(wire => wire.name.startsWith(prefix))
    .sort((a, b) => a.name.localeCompare(b.name))
    .reverse()
    .map(wire => resolveWire(wire, wiresById))
    .map(result => result ? '1' : '0')
    .join('');
  return BigInt(parseInt(binary, 2));
}

function toBinary(dec: bigint): string {
  return dec.toString(2).padStart(45, '0');
}

function getAllDependencies(wire: Wire): Gate[] {
  if (!wire) throw new Error('Wire not found');
  const gates: Gate[] = [];
  const queue: Wire[] = [wire];
  while (queue.length) {
    const wire = queue.pop()!;
    if (wire.gateIn) gates.push(wire.gateIn);
    queue.push(...(wire.gateIn?.inputs ?? []));
  }
  return gates;
}

function setInputs(wiresById: { [key: string]: Wire }, x: bigint, y: bigint) {
  clearState(wiresById);
  setInput(wiresById, 'x', x);
  setInput(wiresById, 'y', y);
}

function clearState(wiresById: { [key: string]: Wire }) {
  Object.values(wiresById).forEach(wire => wire.value = undefined);
}

function setInput(wiresById: { [key: string]: Wire }, prefix: 'x' | 'y', value: bigint) {
  const binary = toBinary(value);
  const wires = Object.values(wiresById)
    .filter(wire => wire.name.startsWith(prefix))
    .sort((a, b) => a.name.localeCompare(b.name))
  // .reverse();
  if (binary.length > wires.length) {
    throw new Error('Too many bits');
  }
  for (let i = 0; i < wires.length; i++) {
    const bit = binary[binary.length - i - 1];
    const wire = wires[i];
    if (bit === '1') {
      wire.value = true;
    } else {
      wire.value = false;
    }
  }
}

function resolveWire(wire: Wire, wiresById: { [key: string]: Wire }, wiresInProgress: Set<string> = new Set()): boolean {
  if (wire.value !== undefined) {
    return wire.value;
  }
  if (wiresInProgress.has(wire.name)) {
    throw new Error('Circular dependency');
  }
  wiresInProgress.add(wire.name);
  wire.value = resolveGate(wire.gateIn!, wiresById, wiresInProgress);
  wiresInProgress.delete(wire.name);
  return wire.value;
}

function resolveGate(gate: Gate, wiresById: { [key: string]: Wire }, wiresInProgress: Set<string>): boolean {
  const [wire1, wire2] = gate.inputs;
  const wire1Value = resolveWire(wire1, wiresById, wiresInProgress);
  const wire2Value = resolveWire(wire2, wiresById, wiresInProgress);
  switch (gate.operation) {
    case 'AND':
      return wire1Value && wire2Value;
    case 'OR':
      return wire1Value || wire2Value;
    case 'XOR':
      return wire1Value !== wire2Value;
  }
}

const _exampleInput = `
x00: 1
x01: 0
x02: 1
x03: 1
x04: 0
y00: 1
y01: 1
y02: 1
y03: 1
y04: 1

ntg XOR fgs -> mjb
y02 OR x01 -> tnw
kwq OR kpj -> z05
x00 OR x03 -> fst
tgd XOR rvg -> z01
vdt OR tnw -> bfw
bfw AND frj -> z10
ffh OR nrd -> bqk
y00 AND y03 -> djm
y03 OR y00 -> psh
bqk OR frj -> z08
tnw OR fst -> frj
gnj AND tgd -> z11
bfw XOR mjb -> z00
x03 OR x00 -> vdt
gnj AND wpb -> z02
x04 AND y00 -> kjc
djm OR pbm -> qhw
nrd AND vdt -> hwm
kjc AND fst -> rvg
y04 OR y02 -> fgs
y01 AND x02 -> pbm
ntg OR kjc -> kwq
psh XOR fgs -> tgd
qhw XOR tgd -> z09
pbm OR djm -> kpj
x03 XOR y03 -> ffh
x00 XOR y04 -> ntg
bfw OR bqk -> z06
nrd XOR fgs -> wpb
frj XOR qhw -> z04
bqk OR frj -> z07
y03 OR x01 -> nrd
hwm AND bqk -> z03
tgd XOR rvg -> z12
tnw OR pbm -> gnj
`.trim();

const _exampleInput2 = `
x00: 0
x01: 1
x02: 0
x03: 1
x04: 0
x05: 1
y00: 0
y01: 0
y02: 1
y03: 1
y04: 0
y05: 1

x00 AND y00 -> z05
x01 AND y01 -> z02
x02 AND y02 -> z01
x03 AND y03 -> z03
x04 AND y04 -> z04
x05 AND y05 -> z00
`.trim();

function parseInput(): [{ [key: string]: Wire }, Gate[]] {
  const input = readInput(2024, 24);
  // const input = _exampleInput;
  const [startingValues, gatesInput] = input.split('\n\n').map(str => str.trim());
  const startingValuesDict: { [key: string]: boolean } = {};
  startingValues.split('\n').map(line => line.split(': ')).forEach(([key, value]) => {
    startingValuesDict[key] = Boolean(value === '1');
  });
  const wiresById: { [key: string]: Wire } = {};
  const gates = gatesInput.split('\n').map(line => {
    const [wire1, op, wire2, _arrrow, wire3] = line.split(' ').map(str => str.trim());
    wiresById[wire1] ??= { name: wire1, value: startingValuesDict[wire1], gatesOut: [] };
    wiresById[wire2] ??= { name: wire2, value: startingValuesDict[wire2], gatesOut: [] };
    wiresById[wire3] ??= { name: wire3, value: startingValuesDict[wire3], gatesOut: [] };
    const gate: Gate = {
      key: line,
      inputs: [wiresById[wire1], wiresById[wire2]],
      output: wiresById[wire3],
      operation: op as 'AND' | 'OR' | 'XOR',
      suspicion: 0,
    }
    wiresById[wire1].gatesOut.push(gate);
    wiresById[wire2].gatesOut.push(gate);
    if (wiresById[wire3].gateIn && wiresById[wire3].gateIn !== gate) {
      throw new Error('Multiple gates feeding into the same wire');
    }
    wiresById[wire3].gateIn = gate;
    return gate;
  });
  return [wiresById, gates];
}
