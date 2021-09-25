import { distance } from "fastest-levenshtein";
import { groupSimilar } from "../src/index";

function identityMapper<T>(i: T): T {
  return i;
}

function nestedMapper(object: { a: { b: { value: string } } }): string {
  return object.a.b.value;
}

function equalitySimilarityFunction<T>(a: T, b: T): number {
  return Number(a === b);
}

function evenOddSimilarityFunction(a: number, b: number): number {
  return Number(a % 2 === b % 2);
}

function levenshteinSimilarityFunction(a: string, b: string): number {
  return a.length === 0 && b.length === 0
    ? 1
    : 1 - distance(a, b) / Math.max(a.length, b.length);
}

describe("groupSimilar function", () => {
  test.each([
    [
      [],
      {
        items: [],
        mapper: identityMapper,
        similarityFunction: equalitySimilarityFunction,
        similarityThreshold: 1,
      },
    ],
    [
      [["a"]],
      {
        items: ["a"],
        mapper: identityMapper,
        similarityFunction: equalitySimilarityFunction,
        similarityThreshold: 1,
      },
    ],
    [
      [["a", "a"], ["b"]],
      {
        items: ["a", "b", "a"],
        mapper: identityMapper,
        similarityFunction: equalitySimilarityFunction,
        similarityThreshold: 1,
      },
    ],
    [
      [["cat", "bat"], ["kitten", "sitting"], ["dog"]],
      {
        items: ["cat", "bat", "kitten", "dog", "sitting"],
        mapper: identityMapper,
        similarityFunction: levenshteinSimilarityFunction,
        similarityThreshold: 0.5,
      },
    ],
  ])(`should return %j given %j`, (expected, options) => {
    expect(groupSimilar(options)).toStrictEqual(expected);
  });

  test.each([
    [
      [
        [1, 5, 123],
        [10, 0, 2],
      ],
      {
        items: [1, 5, 10, 0, 2, 123],
        mapper: identityMapper,
        similarityFunction: evenOddSimilarityFunction,
        similarityThreshold: 1,
      },
    ],
  ])(`should return %j given %j`, (expected, options) => {
    expect(groupSimilar(options)).toStrictEqual(expected);
  });

  test.each([
    [
      [
        [{ a: { b: { value: "sitting" } } }, { a: { b: { value: "kitten" } } }],
        [{ a: { b: { value: "dog" } } }],
        [{ a: { b: { value: "bat" } } }, { a: { b: { value: "cat" } } }],
      ],
      {
        items: [
          { a: { b: { value: "sitting" } } },
          { a: { b: { value: "dog" } } },
          { a: { b: { value: "kitten" } } },
          { a: { b: { value: "bat" } } },
          { a: { b: { value: "cat" } } },
        ],
        mapper: nestedMapper,
        similarityFunction: levenshteinSimilarityFunction,
        similarityThreshold: 0.5,
      },
    ],
  ])(`should return %j given %j`, (expected, options) => {
    expect(groupSimilar(options)).toStrictEqual(expected);
  });
});
