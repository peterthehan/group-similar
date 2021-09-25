import disjointSet from "disjoint-set";

type ExtractedItem<T> = {
  item: T;
  _disjointSetId: number;
};

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

  const items = options.items.map((item) => ({ item }));
  const set = disjointSet();
  items.forEach((item) => set.add(item));

  const mappedItems = options.items.map((item) => options.mapper(item));

  for (let i = 0; i < items.length - 1; ++i) {
    for (let j = i + 1; j < items.length; ++j) {
      if (set.connected(items[i], items[j])) {
        continue;
      }

      if (
        options.similarityFunction(mappedItems[i], mappedItems[j]) >=
        options.similarityThreshold
      ) {
        set.union(items[i], items[j]);
      }
    }
  }

  return (set.extract() as ExtractedItem<T>[][]).map((group) =>
    group.map(({ item }) => item)
  );
}

export { groupSimilar };
