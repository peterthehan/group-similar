# Group Similar

[![Discord](https://discord.com/api/guilds/258167954913361930/embed.png)](https://discord.gg/WjEFnzC) [![Twitter Follow](https://img.shields.io/twitter/follow/peterthehan.svg?style=social)](https://twitter.com/peterthehan)

Group similar items together.

Runtime complexity is `O(N^2 * (M + α(N)))`, where `N` is the number of elements in `items`, `M` is the runtime complexity of the `similarityFunction`, and `α(N)` is the [inverse Ackermann function](https://en.wikipedia.org/wiki/Disjoint-set_data_structure#Time_complexity) (amortized constant time for all practical purposes).

Space complexity is `O(N)`.

## Getting started

```
npm i group-similar
```

## Examples

<details open>

<summary>Group similar strings</summary>

```ts
import { groupSimilar } from "group-similar";
import { distance } from "fastest-levenshtein";

function levenshteinSimilarityFunction(a: string, b: string): number {
  return a.length === 0 && b.length === 0
    ? 1
    : 1 - distance(a, b) / Math.max(a.length, b.length);
}

groupSimilar({
  items: ["cat", "bat", "kitten", "dog", "sitting"],
  mapper: (i) => i,
  similarityFunction: levenshteinSimilarityFunction,
  similarityThreshold: 0.5,
});

// [ [ 'cat', 'bat' ], [ 'kitten', 'sitting' ], [ 'dog' ] ]
```

</details>

<details>

<summary>Group similar numbers</summary>

```ts
import { groupSimilar } from "group-similar";

function evenOddSimilarityFunction(a: number, b: number): number {
  return Number(a % 2 === b % 2);
}

groupSimilar({
  items: [1, 5, 10, 0, 2, 123],
  mapper: (i) => i,
  similarityFunction: evenOddSimilarityFunction,
  similarityThreshold: 1,
});

// [ [ 1, 5, 123 ], [ 10, 0, 2 ] ]
```

</details>

<details>

<summary>Group similar objects</summary>

```ts
import { groupSimilar } from "group-similar";
import { distance } from "fastest-levenshtein";

function nestedMapper(object: { a: { b: { value: string } } }): string {
  return object.a.b.value;
}

function levenshteinSimilarityFunction(a: string, b: string): number {
  return a.length === 0 && b.length === 0
    ? 1
    : 1 - distance(a, b) / Math.max(a.length, b.length);
}

groupSimilar({
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
});

// [
//   [{ a: { b: { value: "sitting" } } }, { a: { b: { value: "kitten" } } }],
//   [{ a: { b: { value: "dog" } } }],
//   [{ a: { b: { value: "bat" } } }, { a: { b: { value: "cat" } } }],
// ]
```

</details>

## Syntax

```ts
groupSimilar(options);
groupSimilar({ items, mapper, similarityFunction, similarityThreshold });
```

### Parameters

| Parameter           | Type     | Required | Default | Description                       |
| ------------------- | -------- | -------- | ------- | --------------------------------- |
| [options](#options) | `Object` | Yes      | _none_  | Arguments to pass to the function |

#### Options

| Property            | Type                     | Required | Default | Description                                                                                         |
| ------------------- | ------------------------ | -------- | ------- | --------------------------------------------------------------------------------------------------- |
| items               | `T[]`                    | Yes      | _none_  | Array of items to group                                                                             |
| mapper              | `(t: T) => K`            | Yes      | _none_  | Function to apply to each element in items prior to measuring similarity                            |
| similarityFunction  | `(a: K, b: K) => number` | Yes      | _none_  | Function to measure similarity between mapped items                                                 |
| similarityThreshold | `number`                 | Yes      | _none_  | Threshold at which items whose similarity value is greater than or equal to it are grouped together |

### Return value

The **return value** is a new nested array of type `T[][]` containing elements of `items` grouped by similarity. If there are no elements in `items`, an empty array will be returned.

## Benchmarks

```
group-similar (N = 4) x 911,054 ops/sec ±2.28% (87 runs sampled)
set-clustering (N = 4) x 356,690 ops/sec ±2.09% (88 runs sampled)
group-similar (N = 8) x 326,711 ops/sec ±3.99% (81 runs sampled)
set-clustering (N = 8) x 122,177 ops/sec ±2.26% (86 runs sampled)
group-similar (N = 16) x 100,390 ops/sec ±3.50% (81 runs sampled)
set-clustering (N = 16) x 36,424 ops/sec ±2.86% (87 runs sampled)
group-similar (N = 32) x 30,904 ops/sec ±1.42% (89 runs sampled)
set-clustering (N = 32) x 7,998 ops/sec ±1.67% (88 runs sampled)
group-similar (N = 64) x 7,812 ops/sec ±1.76% (90 runs sampled)
set-clustering (N = 64) x 1,974 ops/sec ±2.37% (88 runs sampled)
group-similar (N = 128) x 1,983 ops/sec ±1.75% (93 runs sampled)
set-clustering (N = 128) x 523 ops/sec ±2.36% (88 runs sampled)
group-similar (N = 256) x 428 ops/sec ±2.35% (86 runs sampled)
set-clustering (N = 256) x 119 ops/sec ±3.79% (75 runs sampled)
group-similar (N = 512) x 110 ops/sec ±1.38% (80 runs sampled)
set-clustering (N = 512) x 32.84 ops/sec ±1.31% (57 runs sampled)
group-similar (N = 1024) x 25.60 ops/sec ±4.37% (45 runs sampled)
set-clustering (N = 1024) x 6.24 ops/sec ±7.46% (20 runs sampled)
```

Benchmark test results where `N` is the length of the string array and `5` is the length of every string in the array, higher `ops/sec` is better.
