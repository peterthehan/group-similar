# Group Similar

[![Discord](https://discord.com/api/guilds/258167954913361930/embed.png)](https://discord.gg/WjEFnzC) [![Twitter Follow](https://img.shields.io/twitter/follow/peterthehan.svg?style=social)](https://twitter.com/peterthehan)

Group similar items together.

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

```js
groupSimilar(options);
```

### Parameters

| Parameter           | Type     | Required | Default | Description                       |
| ------------------- | -------- | -------- | ------- | --------------------------------- |
| [options](#options) | `Object` | Yes      | _none_  | Arguments to pass to the function |

#### Options

| Parameter           | Type                     | Required | Default | Description                                                                        |
| ------------------- | ------------------------ | -------- | ------- | ---------------------------------------------------------------------------------- |
| items               | `T[]`                    | Yes      | _none_  | List of items                                                                      |
| mapper              | `(t: T) => K`            | Yes      | _none_  | Function to apply to each element in items                                         |
| similarityFunction  | `(a: K, b: K) => number` | Yes      | _none_  | Function to compare mapped items                                                   |
| similarityThreshold | `number`                 | Yes      | _none_  | Similar items that are greater than or equal to the threshold are grouped together |
