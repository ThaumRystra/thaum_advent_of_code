import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

/**
 * Modelling the problem as a system of 2 equations where A is how many times A need to be pushed
 * and B is how many times B need to be pushed to get the prize. ax, ay, bx, by are the distances 
 * button A and B move in the x and y directions respectively.
 * px, py are the prize's x and y coordinates.
 * 
 * Left hand side (lhs)
 * A(ax) + B(bx) = px
 * 
 * Right hand side (rhs)
 * A(ay) + B(by) = py
 * 
 * Solving for A from lhs
 * A = (px - B(bx))/ax // implemented as solveA
 * 
 * Substituting A into rhs
 * (px - B(bx))ay/ax + B(by) = py
 * 
 * and solving for B
 * px*ay - B(bx)*ay + B(by)*ax = py*ax
 * B(by)*ax - B(bx)*ay = py*ax - px*ay
 * B = (py*ax - px*ay)/(by*ax - bx*ay) // implemented as solveB
 * 
 * It follows that there is a unique solution for A and B, however that solution
 * is only valid if it's an integer solution, otherwise the prize is unreachable
 */

export const day13: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const machines = parseInput();
  return machines.map(machine => {
    // Solve
    const B = solveB(machine);
    const A = solveA(machine, B);
    // Discard non-integer solutions
    if (A % 1 !== 0 || B % 1 !== 0) return 0;
    // Sum price according to token cost
    return A * 3 + B;
  }).reduce((acc, val) => acc + val, 0);
}

function part2(): number {
  const machines = parseInput();
  return machines.map(machine => {
    // Add error factor
    machine.px += 10000000000000;
    machine.py += 10000000000000;
    // Solve
    const B = solveB(machine);
    const A = solveA(machine, B);
    // Discard non-integer solutions
    if (A % 1 !== 0 || B % 1 !== 0) return 0;
    // Sum price according to token cost
    return A * 3 + B;
  }).reduce((acc, val) => acc + val, 0);
}

function solveB({ ax, bx, ay, by, px, py }: ClawMachine): number {
  return (py * ax - px * ay) / (by * ax - bx * ay)
}

function solveA({ ax, bx, px }: ClawMachine, B: number): number {
  return (px - (B * bx)) / ax
}

const _exampleInput = `
  Button A: X+94, Y+34
  Button B: X+22, Y+67
  Prize: X=8400, Y=5400

  Button A: X+26, Y+66
  Button B: X+67, Y+21
  Prize: X=12748, Y=12176

  Button A: X+17, Y+86
  Button B: X+84, Y+37
  Prize: X=7870, Y=6450

  Button A: X+69, Y+23
  Button B: X+27, Y+71
  Prize: X=18641, Y=10279
`;

const re = /\s*Button A: X(.+), Y(.+)\s+Button B: X(.+), Y(.+)\s+Prize: X=(.+), Y=(.+)/;

type ClawMachine = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  px: number;
  py: number;
}

function parseInput(): ClawMachine[] {
  const input = readInput(2024, 13);
  // const input = _exampleInput.trim();
  return input.split('\n\n').map(block => {
    const [_blockText, ax, ay, bx, by, px, py] = re.exec(block) ?? [];
    return {
      ax: parseInt(ax),
      ay: parseInt(ay),
      bx: parseInt(bx),
      by: parseInt(by),
      px: parseInt(px),
      py: parseInt(py),
    }
  })
}
