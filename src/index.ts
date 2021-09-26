import StaticDisjointSet from "mnemonist/static-disjoint-set";

type Options<T, K> = {
  items: T[];
  mapper: (t: T) => K;
  similarityFunction: (a: K, b: K) => number;
  similarityThreshold: number;
};

function groupSimilar<T, K>(options: Options<T, K>): T[][] {
  if (!options.items.length) {
    return [];
  }

  const sets = new StaticDisjointSet(options.items.length);
  const mappedItems = options.items.map(options.mapper);

  for (let i = 0; i < options.items.length - 1; ++i) {
    for (let j = i + 1; j < options.items.length; ++j) {
      if (sets.connected(i, j)) {
        continue;
      }

      if (
        options.similarityFunction(mappedItems[i], mappedItems[j]) >=
        options.similarityThreshold
      ) {
        sets.union(i, j);
      }
    }
  }

  return sets.compile().map((set) => set.map((index) => options.items[index]));
}

export { groupSimilar };
