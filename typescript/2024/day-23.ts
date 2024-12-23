import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";
import { kCombinations } from "./util/combinations.ts";

export const day23: Day = {
  '1': part1,
  '2': part2,
};

function part1() {
  const graph = parseInput();
  return getTriplets(graph).filter(triplet => triplet.match(/^t|-t/)).length;
}

function part2(): string {
  const graph = parseInput();
  return bronK(graph).sort((a, b) => b.length - a.length)[0];
}

// Bron–Kerbosch algorithm
function bronK(graph: Graph) {
  const groups: string[] = [];
  const bk1 = (R: Set<Node>, P: Set<Node>, X: Set<Node>) => {
    if (P.size === 0 && X.size === 0) {
      return R;
    }
    for (const v of P) {
      const result = bk1(R.union(new Set([v])), P.intersection(v.neighbours), X.intersection(v.neighbours));
      if (result) {
        groups.push(Array.from(result).map(node => node.name).sort().join(','));
      }
      P.delete(v);
      X.add(v);
    }
  };

  const r: Set<Node> = new Set();
  const x: Set<Node> = new Set();
  const p: Set<Node> = new Set(Object.values(graph.nodes));
  bk1(r, p, x);
  return groups;
}

function getTriplets(graph: Graph): string[] {
  const visited = new Set<string>();
  const triplets: Set<string> = new Set();
  function visitNode(node: Node): Set<Node> | undefined {
    if (visited.has(node.name)) return;
    visited.add(node.name);
    // for each combination of 2 neighbours, check if they are connected to each other
    for (const [a, b] of kCombinations(Array.from(node.neighbours), 2)) {
      if (a.neighbours.has(b)) {
        triplets.add([a.name, b.name, node.name].sort().join('-'));
      }
    }
  }
  Object.values(graph.nodes).forEach(node => visitNode(node));
  return Array.from(triplets);
}

type Node = {
  name: string;
  neighbours: Set<Node>;
  component?: Set<string>;
}

type Graph = {
  nodes: { [key: string]: Node };
  edgeSet: Set<[string, string]>;
}

const _exampleInput = `
kh-tc
qp-kh
de-cg
ka-co
yn-aq
qp-ub
cg-tb
vc-aq
tb-ka
wh-tc
yn-cg
kh-ub
ta-co
de-co
tc-td
tb-wq
wh-td
ta-ka
td-qp
aq-cg
wq-ub
ub-vc
de-ta
wq-aq
wq-vc
wh-yn
ka-de
kh-ta
co-tc
wh-qp
tb-vc
td-yn
`.trim();

function parseInput(): Graph {
  const input = readInput(2024, 23);
  // const input = _exampleInput;

  const graph: Graph = {
    nodes: {},
    edgeSet: new Set(),
  };
  for (const line of input.split('\n')) {
    const [a, b] = line.split('-').sort();
    graph.nodes[a] ??= { name: a, neighbours: new Set() };
    graph.nodes[b] ??= { name: b, neighbours: new Set() };
    graph.edgeSet.add([a, b]);
    graph.nodes[a].neighbours.add(graph.nodes[b]);
    graph.nodes[b].neighbours.add(graph.nodes[a]);
  }
  return graph;
}
