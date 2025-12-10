import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
import { init } from "dtk-z3-solver-deno-v2";

export const day10: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 10);
  const machines = parseInput(input);
  return machines.reduce((acc, machine) => {
    const startingState: MachineState = {
      indicators: new Array(machine.indicators.length).fill(false),
      buttonsPushed: 0,
    };
    const statesChecked = new Set([hashState(startingState)]);
    let statesToCheck = [startingState];
    while (true) {
      const newStates: MachineState[] = [];
      for (const state of statesToCheck) {
        for (const button of machine.buttons) {
          const nextState = pushButton(state, button);
          if (isEqual(machine.indicators, nextState.indicators)) {
            console.log(nextState.buttonsPushed);
            return nextState.buttonsPushed + acc;
          }
          const key = hashState(nextState);
          if (!statesChecked.has(key)) {
            statesChecked.add(key);
            newStates.push(nextState);
          }
        }
      }
      statesToCheck = newStates;
    }
  }, 0);
}

// 17970 - Right answer!
// Total runtime: 4_688_465 ms -> 1h 18m
function _part2(): number {
  const input = readInput(2025, 10);
  const machines = parseInput(input);
  return machines.reduce((acc, machine, i) => {
    const num = search2(
      new Array(machine.buttons.length).fill(0),
      buildConstraints(machine),
      new Array(machine.buttons.length).fill(0).map((_, i) => i)
    );
    console.log(`Machine ${i + 1}:\t${num}`);
    if (!num) throw "No valid combo";
    return num + acc;
  }, 0);
}

type Button = number[];

type Machine = {
  indicators: boolean[];
  buttons: Button[];
  joltages: number[];
};

type MachineState = {
  indicators: boolean[];
  buttonsPushed: number;
};

function parseInput(input: string): Machine[] {
  return input.split("\n").map((line) => {
    const indicators = line.match(/[/.#]/g)!.map((s) => s === "#");
    const buttons = line.match(/\([^\)]+\)/g)!.map((buttonInput) =>
      buttonInput
        .slice(1, -1)
        .split(",")
        .map((s) => Number.parseInt(s))
    );
    const joltages = line
      .match(/\{.+\}/)![0]
      .slice(1, -1)
      .split(",")
      .map((s) => Number.parseInt(s));
    return { indicators, buttons, joltages };
  });
}

function pushButton(state: MachineState, button: Button): MachineState {
  const newState: MachineState = {
    indicators: [...state.indicators],
    buttonsPushed: state.buttonsPushed + 1,
  };
  for (const i of button) {
    newState.indicators[i] = !state.indicators[i];
  }
  return newState;
}

function hashState(state: MachineState): string {
  return state.indicators.map((val) => (val ? "#" : ".")).join("");
}

function isEqual<T>(a: T[], b: T[]) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

type Constraint = {
  sum: number;
  buttonIndices: number[];
};

function buildConstraints(machine: Machine): Constraint[] {
  return machine.joltages.map((joltage, j) => {
    const buttonIndices: number[] = [];
    machine.buttons.forEach((button, i) => {
      if (button.includes(j)) buttonIndices.push(i);
    });
    return {
      sum: joltage,
      buttonIndices,
    };
  });
}

function validateConstraints(
  constraints: Constraint[],
  buttonPushes: number[]
): boolean {
  return constraints.every((constraint) =>
    validateConstraint(constraint, buttonPushes)
  );
}

function validateConstraint(
  constraint: Constraint,
  buttonPushes: number[]
): boolean {
  return (
    constraint.sum ===
    constraint.buttonIndices.reduce((acc, i) => acc + buttonPushes[i], 0)
  );
}

/**
Start with [0, 0, 0, ...]
find the most constrained button index
iterate through the range of values of that button
recurse, keeping track of which buttons are constrained
 */
function search2(
  current: number[],
  constraints: Constraint[],
  unconstrainedButtonIndices: number[],
  lowest: number | null = null
): number | null {
  console.log(current.join("\t"));
  if (!unconstrainedButtonIndices.length) {
    if (!validateConstraints(constraints, current)) throw "NO!";
    return current.reduce((acc, val) => acc + val, 0);
  }
  // Get the constrained button
  const mostConstrainedButtons = unconstrainedButtonIndices
    .map((i) => {
      const { min, max, ...rest } = getButtonRangeByIndex(
        current,
        constraints,
        i,
        unconstrainedButtonIndices
      );
      return { index: i, min, max, range: max - min, ...rest };
    })
    .sort(
      (a, b) =>
        a.range - b.range ||
        a.max - b.max ||
        b.numConstraints - a.numConstraints
    );
  if (mostConstrainedButtons.some((b) => b.max < b.min)) {
    // Some overconstrained button has no valid presses, give up
    return null;
  }
  const mostConstrainedButton = mostConstrainedButtons[0];
  let { min, max } = mostConstrainedButton;
  const newUnconstrained = unconstrainedButtonIndices.filter(
    (i) => i !== mostConstrainedButton.index
  );
  if (lowest) {
    const currentSum = current.reduce((acc, val) => acc + val, 0);
    const maxWithoutGoingOverLowest = lowest - currentSum;
    if (maxWithoutGoingOverLowest < max) {
      max = maxWithoutGoingOverLowest;
    }
  }

  for (let i = max; i >= min; i--) {
    const candidate = [...current];
    candidate[mostConstrainedButton.index] = i;
    const result = search2(candidate, constraints, newUnconstrained, lowest);
    if (result !== null && (lowest === null || result < lowest)) {
      lowest = result;
    }
  }
  return lowest;
}

function getButtonRangeByIndex(
  current: number[],
  constraints: Constraint[],
  buttonIndex: number,
  unconstrainedButtonIndices: number[]
) {
  let totalMax = Number.POSITIVE_INFINITY;
  let totalMin = 0;
  let numConstraints = 0;
  for (const constraint of constraints) {
    if (!constraint.buttonIndices.includes(buttonIndex)) {
      // This constraint does not apply to this button
      continue;
    }
    numConstraints += 1;
    // Find the existing sum, excluding this button
    const existingSum = constraint.buttonIndices.reduce((acc, i) => {
      if (i === buttonIndex) return acc;
      return acc + (current[i] ?? 0);
    }, 0);
    const sumRemaining = constraint.sum - existingSum;
    if (totalMax > sumRemaining) totalMax = sumRemaining;
    // The number of buttons excluding this one constrained by this
    let extraUnconstrained = 0;
    for (const i of unconstrainedButtonIndices) {
      if (i !== buttonIndex && constraint.buttonIndices.includes(i)) {
        extraUnconstrained += 1;
      }
    }
    if (extraUnconstrained === 0) {
      // This is the last button, it must consume the rest of the sum
      const min = sumRemaining;
      // console.log({ current, constraint, sumRemaining });
      if (min > totalMin) {
        totalMin = min;
      }
    }
  }
  return { min: totalMin, max: totalMax, numConstraints };
}

/**
 * Using Z3 solver with some help from examples
 * 3_333 ms
 */
export async function part2() {
  const input = readInput(2025, 10);
  const machines = parseInput(input);
  let sum = 0;
  const { Context } = await init();
  for (const machine of machines) {
    // @ts-expect-error Z3 types aren't working
    const { Optimize, Int } = new Context("main");

    const vars = [];

    const solver = new Optimize();

    for (let i = 0; i < machine.buttons.length; i++) {
      const alpha = iToAlpha(i);
      const v = Int.const(alpha);
      solver.add(v.ge(0));
      vars.push(v);
    }

    for (let j = 0; j < machine.joltages.length; j++) {
      let condition = Int.val(0);
      for (const [i, btn] of machine.buttons.entries()) {
        if (btn.includes(j)) {
          condition = condition.add(vars[i]);
        }
      }
      condition = condition.eq(Int.val(machine.joltages[j]));
      solver.add(condition);
    }

    const sumVars = vars.reduce((a, v) => a.add(v), Int.val(0));

    solver.minimize(sumVars);

    const result = await solver.check();
    if (result === "sat") {
      sum += +solver.model().eval(sumVars).toString();
    } else {
      throw result;
    }
  }
  return sum;
}

function iToAlpha(i: number) {
  return String.fromCharCode(i + 97);
}
