export default function readInput(year: number, day: number): string {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(Deno.readFileSync(`./${year}/day-${day}-input.txt`));
}
