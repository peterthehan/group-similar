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

function randomString(stringLength: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const chars = [];
  for (let i = 0; i < stringLength; ++i) {
    chars.push(
      characters.charAt(Math.floor(Math.random() * characters.length))
    );
  }
  return chars.join("");
}

function randomStrings(stringLength, arrayLength) {
  const strings = [];
  for (let i = 0; i < arrayLength; ++i) {
    strings.push(randomString(stringLength));
  }
  return strings;
}

const similarityThreshold = 0.5;
const stringLength = 5;

let data: string[][];
if (fs.existsSync("./test/data.json")) {
  data = JSON.parse(fs.readFileSync("./test/data.json", "utf8"));
} else {
  data = [
    randomStrings(stringLength, 4),
    randomStrings(stringLength, 8),
    randomStrings(stringLength, 16),
    randomStrings(stringLength, 32),
    randomStrings(stringLength, 64),
    randomStrings(stringLength, 128),
    randomStrings(stringLength, 256),
    randomStrings(stringLength, 512),
    randomStrings(stringLength, 1024),
  ];

  fs.writeFileSync("./test/data.json", JSON.stringify(data));
}

const suite = new Benchmark.Suite();

data.forEach((d) => {
  suite
    .add(`group-similar (N = ${d.length})`, () => {
      groupSimilar({
        items: d,
        mapper: identityMapper,
        similarityFunction: levenshteinSimilarityFunction,
        similarityThreshold,
      });
    })
    .add(`set-clustering (N = ${d.length})`, () => {
      cluster(d, levenshteinSimilarityFunction).similarGroups(
        similarityThreshold
      );
    });
});

suite
  .on("cycle", (event) => console.log(String(event.target)))
  .on("complete", () =>
    console.log(
      `\nBenchmark test results where \`N\` is the length of the string array and \`${stringLength}\` is the length of every string in the array, higher \`ops/sec\` is better.`
    )
  )
  .run({ async: true });
