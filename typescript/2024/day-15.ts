import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day15: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const [map, instructions, robot] = parseInput();
  for (const instruction of instructions) {
    move(map, instruction, robot);
  }
  return map.reduce((acc, row) => acc + row.reduce((acc, cell) => cell.contents === 'box' ? boxGPS(cell) + acc : acc, 0), 0);
}

function part2(): number {
  const [map1, instructions, robotOriginal] = parseInput();
  const map = widenMap(map1);
  const startingBoxCount = countBoxes(map);
  const robot = {
    row: robotOriginal.row,
    col: robotOriginal.col * 2,
  }
  for (const instruction of instructions) {
    move2(map, instruction, robot);
    const boxCount = countBoxes(map);
    if (boxCount < startingBoxCount) {
      throw new Error('A box has gone missing');
    } else if (boxCount > startingBoxCount) {
      throw new Error('A box has gone extra');
    }
  }
  return sumBoxGPS(map);
}

function countBoxes(map: Point2[][]): number {
  let total = 0;
  for (const row of map) {
    for (const cell of row) {
      if (cell.contents === '[') {
        total++;
      }
    }
  }
  return total;
}

function sumBoxGPS(map: Point2[][]): number {
  let total = 0;
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col].contents === '[') {
        total += boxGPS(map[row][col]);
      }
    }
  }
  return total;
}

type Point = Coordinate & {
  contents: 'box' | 'wall' | 'empty' | 'robot';
}

type Coordinate = {
  row: number;
  col: number;
}

function boxGPS(coord: Coordinate): number {
  return coord.row * 100 + coord.col;
}

type Instruction = '<' | 'v' | '^' | '>';

const _exampleInput = `
##########
#..O..O.O#
#......O.#
#.OO..O.O#
#..O@..O.#
#O#..O...#
#O..O..O.#
#.OO.O.OO#
#....O...#
##########

<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
`

function parseInput(): [Point[][], Instruction[], Coordinate] {
  const input = readInput(2024, 15);
  // const input = _exampleInput.trim();
  const [mapString, instructionsString] = input.split('\n\n').map(str => str.trim());
  let robot: Coordinate | undefined;
  const map: Point[][] = mapString
    .split('\n')
    .map((line, row) => line
      .split('')
      .map((char, col) => {
        if (char === '@') {
          robot = { row, col };
        }
        return {
          row,
          col,
          contents: char === '#' ? 'wall' : char === 'O' ? 'box' : char === '@' ? 'robot' : 'empty'
        }
      })
    );
  if (!robot) {
    throw new Error('robot not found');
  }
  const instructions: Instruction[] = instructionsString
    .split('\n')
    .flatMap(line => line
      .split('')
      .map(char => char as Instruction)
    );
  return [map, instructions, robot];
}

function contentsToString(contents: Point['contents']): string {
  switch (contents) {
    case 'box': return 'O';
    case 'wall': return '#';
    case 'empty': return '.';
    case 'robot': return '@';
  }
}

function _printMap(map: Point[][]) {
  console.log(map.map(row => row.map(cell => contentsToString(cell.contents)).join('')).join('\n'));
}

function _printMap2(map: Point2[][], instruction?: Instruction) {
  console.log(map.map(row => row.map(
    cell => {
      if (instruction && cell.contents === '@') {
        return instruction;
      }
      if (cell.contents === '.') {
        return ' '
      }
      return cell.contents
    }
  ).join('')).join('\n'));
}

/**
 * Move (or attempt to move) the robot using the instruction
 * this alters the map and robot
 */
function move(map: Point[][], instruction: Instruction, robot: Coordinate) {
  // Find the first non-box space in the direction of the instruction from the robot
  const direction: Coordinate = getDirection(instruction);
  let point: Point = map[robot.row + direction.row][robot.col + direction.col];
  let boxCount = 0;
  let firstBox: Point | undefined;
  while (point.contents === 'box') {
    boxCount++;
    if (!firstBox) firstBox = point;
    point = map[point.row + direction.row][point.col + direction.col];
  }
  // If we hit a wall or the edge of the map without finding a space, do nothing
  if (!point || point.contents === 'wall') {
    return;
  }
  // If we hit a robot, something went wrong
  if (point.contents === 'robot') {
    throw new Error('Sir, a second robot has hit the warehouse');
  }
  // If we hit an empty space, move a box if there is one
  if (boxCount > 0) {
    map[point.row][point.col].contents = 'box';
  }
  // Move the robot one space
  map[robot.row][robot.col].contents = 'empty';
  robot.row += direction.row;
  robot.col += direction.col;
  map[robot.row][robot.col].contents = 'robot';
}

function getDirection(instruction: Instruction): Coordinate {
  return instruction === '<'
    ? { row: 0, col: -1 }
    : instruction === '>'
      ? { row: 0, col: 1 }
      : instruction === '^'
        ? { row: -1, col: 0 }
        : { row: 1, col: 0 };
}

type Point2 = Coordinate & {
  contents: '#' | '.' | '@' | '[' | ']'
};

function widenMap(map: Point[][]): Point2[][] {
  return map.map((line, row) => line.flatMap((cell, oldCol): [Point2, Point2] => {
    const col = oldCol * 2;
    switch (cell.contents) {
      case 'box': return [{ row, col, contents: '[' }, { row, col: col + 1, contents: ']' }];
      case 'wall': return [{ row, col, contents: '#' }, { row, col: col + 1, contents: '#' }];
      case 'empty': return [{ row, col, contents: '.' }, { row, col: col + 1, contents: '.' }];
      case 'robot': return [{ row, col, contents: '@' }, { row, col: col + 1, contents: '.' }];
    }
  }));
}

type Box = [Point2, Point2];

/**
 * Get all the boxes that would have to be moved to move this box
 */
function getBoxesToMove(map: Point2[][], instruction: Instruction, box: Box): Box[] | 'notPossible' {
  let nextPoints: Point2[] = [];
  const [left, right] = box;
  switch (instruction) {
    case '^': nextPoints = [map[left.row - 1][left.col], map[right.row - 1][right.col]]; break;
    case '<': nextPoints = [map[left.row][left.col - 1]]; break;
    case 'v': nextPoints = [map[left.row + 1][left.col], map[right.row + 1][right.col]]; break;
    case '>': nextPoints = [map[right.row][right.col + 1]]; break;
  }
  let nextBoxes: Box[] = [];
  for (const point of nextPoints) {
    if (point.contents === '[') {
      nextBoxes.push([point, map[point.row][point.col + 1]]);
    }
    if (point.contents === ']') {
      nextBoxes.push([map[point.row][point.col - 1], point]);
    }
    if (point.contents === '@') {
      throw new Error('Sir, a second robot has hit the warehouse');
    }
    if (point.contents === '#') {
      return 'notPossible';
    }
  }
  // deduplicate new boxes
  nextBoxes = _.uniqBy(nextBoxes, ([left, right]) => 10000 * boxGPS(left) + boxGPS(right));
  const boxesToMove: Box[] = [box];
  for (const nextBox of nextBoxes) {
    const result = getBoxesToMove(map, instruction, nextBox);
    if (result === 'notPossible') {
      return 'notPossible';
    }
    boxesToMove.push(...result);
  }
  return boxesToMove;
}

function move2(map: Point2[][], instruction: Instruction, robot: Coordinate) {
  const direction = getDirection(instruction);
  const currentSquare = map[robot.row][robot.col];
  const nextSquare = map[robot.row + direction.row][robot.col + direction.col];
  // Free space
  if (nextSquare.contents === '.') {
    nextSquare.contents = '@';
    currentSquare.contents = '.';
    robot.row += direction.row;
    robot.col += direction.col;
    return;
  }
  // Wall
  if (nextSquare.contents === '#') {
    return;
  }
  // Other robot
  if (nextSquare.contents === '@') {
    throw new Error('Sir, a second robot has hit the warehouse');
  }
  // Box
  let box: Box
  if (nextSquare.contents === '[') {
    box = [nextSquare, map[nextSquare.row][nextSquare.col + 1]];
  } else {
    box = [map[nextSquare.row][nextSquare.col - 1], nextSquare];
  }
  const boxesToMove = getBoxesToMove(map, instruction, box);
  if (boxesToMove === 'notPossible') {
    return;
  }
  // Sort the boxes to move so that we move the ones that are furthest away from the robot first
  boxesToMove
    .sort(([a], [b]) => (b.row * direction.row + b.col * direction.col) - (a.row * direction.row + a.col * direction.col))
    .forEach(box => moveBox(map, box, direction));
  // move the robot
  nextSquare.contents = '@';
  currentSquare.contents = '.';
  robot.row += direction.row;
  robot.col += direction.col;
}

// We have already confirmed that the next square is safe to place a box
// So long as we move the boxes in the right order
function moveBox(map: Point2[][], box: Box, direction: Coordinate) {
  const [left, right] = box;
  const nextLeft = map[left.row + direction.row][left.col + direction.col];
  const nextRight = map[right.row + direction.row][right.col + direction.col];
  left.contents = '.';
  right.contents = '.';
  nextLeft.contents = '[';
  nextRight.contents = ']';
}
