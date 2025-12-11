import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day11: Day = {
  "1": part1,
  "2": part2,
};

function part1(): number {
  const input = readInput(2025, 11);
  const { start, end } = parseInput(input);
  return pathsBetween(start, end);
}

// Insight:
// The number of paths to the end that go via dac and fft
// = (start to dac) * (dac to fft) * (fft to end) + (the same in the other order)
function part2(): number {
  const input = readInput(2025, 11);
  const { start, nodes, end } = parseInput(input, "svr");
  const fft = nodes.find((n) => n.id === "fft");
  const dac = nodes.find((n) => n.id === "dac");
  if (!fft) throw "no fft";
  if (!dac) throw "no dac";
  return (
    pathsBetween(start, dac) * pathsBetween(dac, fft) * pathsBetween(fft, end) +
    pathsBetween(start, fft) * pathsBetween(fft, dac) * pathsBetween(dac, end)
  );
}

// Wrap the creation and execution of the path counter so that the ergonomics are start -> end
function pathsBetween(start: Node, end: Node) {
  return pathCounter(end)(start);
}

// Create a path counter that will return a function that can count how far some node is from the end
function pathCounter(end: Node) {
  const memo = new Map<string, number>();
  const busyExploringIds = new Set<string>();
  // Memoized recursive function to count the number of paths to the end
  return function pathsToEnd(node: Node): number {
    // If we already found the number of paths from here to the end, return that
    if (memo.has(node.id)) return memo.get(node.id)!;
    // Base case, we are at the end, there is only 1 possibility
    if (node.id === end.id) return 1;
    // If we already visited this node, and we got back to it before finding an answer, there is
    // no possible path to the end, this is a loop
    if (busyExploringIds.has(node.id)) return 0;
    // Start exploring this node
    busyExploringIds.add(node.id);
    // The number of possible paths from here to the end is the sum of the possible paths to the end
    // from all the nodes we can visit from here
    const result = node.children.reduce(
      (acc, child) => acc + pathsToEnd(child),
      0
    );
    // Save the number of paths we've found
    memo.set(node.id, result);
    // Remove this node from the list of nodes we are exploring, we're done
    busyExploringIds.delete(node.id);
    return result;
  };
}

type Node = {
  id: string;
  children: Node[];
};

type NodesWithChildIds = Node & {
  childIds: string[];
};

// Take the input string and turn it into a graph
function parseInput(
  input: string,
  startId = "you"
): { start: Node; nodes: Node[]; end: Node } {
  let start;
  // Get the nodes and a map of nodeIds to nodes
  const nodesById = new Map<string, NodesWithChildIds>();
  const nodes: NodesWithChildIds[] = input.split("\n").map((line) => {
    const [id, childrenStr] = line.split(": ");
    const node = { id, childIds: childrenStr.split(" "), children: [] };
    nodesById.set(id, node);
    if (node.id === startId) {
      start = node;
    }
    return node;
  });
  if (!start) throw `No ${startId} node found`;
  // Add the out node, it is not in the given input
  const end: NodesWithChildIds = { id: "out", childIds: [], children: [] };
  nodes.push(end);
  nodesById.set("out", end);
  // Link the nodes to each other using child Ids
  for (const node of nodes) {
    node.children = node.childIds.map((id) => {
      const child = nodesById.get(id);
      if (!child) throw `can't find ${id}`;
      return child;
    });
  }
  return { start, nodes, end };
}
