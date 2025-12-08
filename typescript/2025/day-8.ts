import { assert } from "@std/assert/assert";
import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day8: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 8);
  const junctions = parseInput(input);
  const pairs = getPairs(junctions);
  // Keep a set of circuits, which are themselves sets of junctions
  const circuits = new Set<Circuit>(junctions.map((j) => new Set([j])));
  function circuitWith(j: Junction) {
    for (const c of circuits) {
      if (c.has(j)) return c;
    }
    throw new Error("Did not find circuit with junction", { cause: j });
  }
  for (let i = 0; i < 1000; i++) {
    const { a, b } = pairs[i];
    assert(a !== b);
    // Get the circuits these junctions belong to
    const aCircuit = circuitWith(a);
    const bCircuit = circuitWith(b);
    // If they are already in the same circuit, carry on
    if (aCircuit === bCircuit) continue;
    // Otherwise merge the circuits
    circuits.delete(aCircuit);
    circuits.delete(bCircuit);
    const newCircuit = aCircuit.union(bCircuit);
    circuits.add(newCircuit);
  }
  const bigCircuits = Array.from(circuits).sort((a, b) => b.size - a.size);

  let mul = 1;
  for (let i = 0; i < 3; i++) {
    mul *= bigCircuits[i].size;
  }
  return mul;
}

function part2(): number {
  const input = readInput(2025, 8);
  const junctions = parseInput(input);
  const pairs = getPairs(junctions);
  const circuits = new Set<Circuit>(junctions.map((j) => new Set([j])));
  function circuitWith(j: Junction): Circuit {
    for (const c of circuits) {
      if (c.has(j)) return c;
    }
    throw new Error("Did not find circuit with junction", { cause: j });
  }
  // Same as part 1, but we carry on until fully connected
  for (let i = 0; i < pairs.length; i++) {
    const { a, b } = pairs[i];
    assert(a !== b);
    const aCircuit = circuitWith(a);
    const bCircuit = circuitWith(b);
    if (aCircuit === bCircuit) continue;
    circuits.delete(aCircuit);
    circuits.delete(bCircuit);
    if (circuits.size === 0) {
      // We have deleted all the circuits, and will add a single one next line, so we are done
      return a.x * b.x;
    }
    const newCircuit = aCircuit.union(bCircuit);
    circuits.add(newCircuit);
  }
  throw "Could not connect everything";
}

type Junction = {
  x: number;
  y: number;
  z: number;
};

type Circuit = Set<Junction>;

function parseInput(input: string): Junction[] {
  return input.split("\n").map((line) => {
    const [x, y, z] = line.split(",").map((str) => Number.parseInt(str));
    return { x, y, z };
  });
}

/**
 * Get the euclidean distance squared. We are only using it to sort, so skipping the sqrt saves time
 * without changing the order
 */
function distanceSq(a: Junction, b: Junction): number {
  if (a === b) return 0;
  return (b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2;
}

type Pair = {
  a: Junction;
  b: Junction;
  dist: number;
};

/**
 * Get all the pairs of junctions ϴ(n log n)
 */
function getPairs(junctions: Junction[]): Pair[] {
  const pairs: Pair[] = [];
  for (let i = 0; i < junctions.length; i++) {
    for (let j = i + 1; j < junctions.length; j++) {
      const a = junctions[i];
      const b = junctions[j];
      const dist = distanceSq(a, b);
      pairs.push({ a, b, dist });
    }
  }
  return pairs.sort((a, b) => Number(a.dist - b.dist));
}
