import { Day } from "../structure-types.ts";

export const day3: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const decoder = new TextDecoder("utf-8");
  const input = decoder.decode(Deno.readFileSync('./2023/day-3-input.txt'));
  const parsedInput: Input = parseInput(input);
  let total = 0;
  for (const symbol of parsedInput.symbols) {
    for (const number of symbol.connectedNumbers) {
      total += number.value;
    }
  }
  return total;
}

function part2(): number {
  //   const input = `467..114..
  // ...*......
  // ..35..633.
  // ......#...
  // 617*......
  // .....+.58.
  // ..592.....
  // ......755.
  // ...$.*....
  // .664.598..`
  const decoder = new TextDecoder("utf-8");
  const input = decoder.decode(Deno.readFileSync('./2023/day-3-input.txt'));
  const parsedInput: Input = parseInput(input);
  let total = 0;
  for (const symbol of parsedInput.symbols) {
    if (symbol.content === '*' && symbol.connectedNumbers.length === 2) {
      total += symbol.connectedNumbers[0].value * symbol.connectedNumbers[1].value;
    }
  }
  return total;
}

type Number = {
  value: number;
  location: [number, number];
}

type Symbol = {
  index: number;
  content: string;
  connectedNumbers: Number[];
}

type Input = {
  rowLength: number;
  // string indexes of all symbols
  symbols: Symbol[];
}

function parseInput(input: string): Input {
  const rowLength = input.indexOf('\n');
  const inputLength = input.length;
  let currentNumberCandidate: string = '';
  const numbers: Number[] = [];
  const symbols: Symbol[] = [];
  for (let i = 0; i < inputLength; i++) {
    const char = input.charCodeAt(i);
    const isDot = char === 46;
    // const isNewline = char === 10;
    const isNumber = char >= 48 && char <= 57;
    const isSymbol = !isNumber && !isDot && (char >= 30 && char <= 47) || char > 57;
    if (isNumber) {
      currentNumberCandidate += String.fromCharCode(char);
    } else if (currentNumberCandidate) {
      const value = parseInt(currentNumberCandidate);
      numbers.push({
        value,
        location: [i - currentNumberCandidate.length, i],
      });
    }
    if (isSymbol) {
      symbols.push({
        index: i,
        content: String.fromCharCode(char),
        connectedNumbers: findConnectedNumbers(input, i, rowLength),
      });
    }
  }
  return {
    rowLength,
    symbols,
  }
}

function findConnectedNumbers(input: string, symbolIndex: number, rowLength: number): Number[] {
  const numbers: Number[] = [];
  const indicesToScan = [
    symbolIndex - rowLength - 2, symbolIndex - rowLength - 1, symbolIndex - rowLength,
    symbolIndex - 1, symbolIndex + 1,
    symbolIndex + rowLength, symbolIndex + rowLength + 1, symbolIndex + rowLength + 2,
  ];
  const scannedIndices = new Set<number>();
  for (const index of indicesToScan) {
    if (scannedIndices.has(index)) continue;
    const char = input.charCodeAt(index);
    scannedIndices.add(index);
    const isNumber = char >= 48 && char <= 57;
    if (isNumber) {
      let candidateNumber: string = '';
      let numberSearchIndex = index;
      let isNumber: boolean;
      // Search from character backward for more numbers
      numberSearchIndex = index - 1;
      while (true) {
        const char = input.charCodeAt(numberSearchIndex);
        scannedIndices.add(numberSearchIndex);
        isNumber = char >= 48 && char <= 57;
        if (isNumber) {
          candidateNumber = String.fromCharCode(char) + candidateNumber;
          numberSearchIndex--;
        } else {
          break;
        }
      }
      // Search from character forward for more numbers
      numberSearchIndex = index;
      while (true) {
        const char = input.charCodeAt(numberSearchIndex);
        scannedIndices.add(numberSearchIndex);
        isNumber = char >= 48 && char <= 57;
        if (isNumber) {
          candidateNumber += String.fromCharCode(char);
          numberSearchIndex++;
        } else {
          break;
        }
      }
      const value = parseInt(candidateNumber);
      numbers.push({
        value,
        location: [numberSearchIndex - candidateNumber.length, numberSearchIndex + 1],
      });
    }
  }
  return numbers;
}
