function buildAdjacencyMap(edges = []) {
  const graph = new Map();

  for (const edge of edges) {
    const { from, to } = edge;

    if (!from || !to) continue;

    if (!graph.has(from)) {
      graph.set(from, new Set());
    }

    graph.get(from).add(to);
  }

  return graph;
}
function getBlastRadius(targetSymbol, edges = [], maxDepth = 3) {
  const adjacencyMap = buildAdjacencyMap(edges);

  const downstreamSet = new Set();
  const executionChains = [];
  const visited = new Set();
  const queue = [{ symbol: targetSymbol, depth: 0, path: [targetSymbol] }];
  visited.add(targetSymbol);

  while (queue.length > 0) {
    const { symbol, depth, path } = queue.shift();

    if (depth >= maxDepth) continue;

    const neighbors = adjacencyMap.get(symbol);
    if (!neighbors || neighbors.size === 0) continue;

    for (const neighbor of neighbors) {
      const nextPath = [...path, neighbor];
      downstreamSet.add(neighbor);
      executionChains.push(nextPath);

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          symbol: neighbor,
          depth: depth + 1,
          path: nextPath,
        });
      }
    }
  }

  return {
    target: targetSymbol,
    blastRadiusCount: downstreamSet.size,
    maxDepth,
    downstreamNodes: Array.from(downstreamSet),
    executionChains,
  };
}

module.exports = {
  buildAdjacencyMap,
  getBlastRadius,
};