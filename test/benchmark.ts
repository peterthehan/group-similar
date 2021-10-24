import * as fs from "fs";
import * as Benchmark from "benchmark";
import { distance } from "fastest-levenshtein";
import * as cluster from "set-clustering";
import { groupSimilar } from "../dist/index";

function identityMapper<T>(i: T): T {
  return i;
}

function levenshteinSimilarityFunction(a: string, b: string): number {
  return a.length === 0 && b.length === 0
    ? 1
    : 1 - distance(a, b) / Math.max(a.length, b.length);
}

function getRandomString(stringLength: number): string {
  return Array(stringLength)
    .fill(0)
    .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
    .join("");
}

function getRandomStrings(stringLength: number, arrayLength: number): string[] {
  return Array(arrayLength)
    .fill(0)
    .map(() => getRandomString(stringLength));
}

function getData(stringLength: number, arrayLengths: number[]): string[][] {
  if (fs.existsSync("./test/data.json")) {
    return JSON.parse(fs.readFileSync("./test/data.json", "utf8"));
  }

  const data = arrayLengths.map((arrayLength) =>
    getRandomStrings(stringLength, arrayLength)
  );

  fs.writeFileSync("./test/data.json", JSON.stringify(data));

  return data;
}

const characters = "0123456789";
const similarityThreshold = 0.5;
const stringLength = 5;
const arrayLengths = [16, 32, 64, 128, 256, 512, 1024, 2048];

const suite = new Benchmark.Suite();

getData(stringLength, arrayLengths).forEach((data) => {
  suite
    .add(`(N=${data.length}) group-similar`, () => {
      groupSimilar({
        items: data,
        mapper: identityMapper,
        similarityFunction: levenshteinSimilarityFunction,
        similarityThreshold,
      });
    })
    .add(`(N=${data.length}) set-clustering`, () => {
      cluster(data, levenshteinSimilarityFunction).similarGroups(
        similarityThreshold
      );
    });
});

const results = {};
suite
  .on("cycle", (event) => {
    console.log(String(event.target));

    const name = event.target.name.replace(/^\(N=\d+\) +/, "");
    if (!(name in results)) {
      results[name] = [name];
    }

    results[name].push(Math.round(event.target.hz));
  })
  .on("complete", () => {
    const table = [
      ["Library", ...arrayLengths.map((arrayLength) => `N=${arrayLength}`)],
      Array(arrayLengths.length + 1).fill("-"),
      ...(Object.values(results) as string[][]),
    ]
      .map((row) => `|${row.join("|")}|`)
      .join("\n");

    console.log(table);
  })
  .run({ async: true });
