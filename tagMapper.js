/**
 * Tag Mapper for CodeQuest Extension
 * Normalizes tags from different platforms to canonical forms
 */

class TagMapper {
  constructor() {
    this.defaultTagMap = {
      "bfs": ["BFS", "Bfs", "Breadth-First Search", "Breadth First Search", "breadth-first search", "breadth first search", "BFS"],
      "dfs": ["DFS", "Dfs", "Depth-First Search", "Depth First Search", "depth-first search", "depth first search", "dfs and similar"],
      "dp": ["DP", "Dp", "Dynamic Programming", "dynamic programming", "dp"],
      "greedy": ["Greedy", "greedy"],
      "binary-search": ["Binary Search", "binary search", "binary-search"],
      "graph": ["Graph", "graph", "Graphs", "graphs", "graph matchings", "graph-matchings"],
      "tree": ["Tree", "tree", "Trees", "trees", "Binary Tree", "binary tree"],
      "array": ["Array", "array", "Arrays", "arrays"],
      "string": ["String", "string", "Strings", "strings", "string suffix structures", "string-suffix-structures", "String Matching", "string matching"],
      "hash-table": ["Hash Table", "Hash", "hash", "hashing", "Hashing", "hash function"],
      "math": ["Math", "math", "Mathematics", "mathematical", "Number Theory", "number-theory", "number theory", "Numbers", "Prime Number"],
      "sorting": ["Sorting", "sortings", "Sort", "sort", "Merge Sort", "merge sort", "Counting Sort", "counting sort", "Radix Sort", "radix sort", "Bucket Sort", "bucket sort", "Shell", "Quickselect"],
      "two-pointers": ["Two Pointers", "two pointers", "two-pointer-algorithm", "two-pointer", "two pointers technique"],
      "bit-manipulation": ["Bit Manipulation", "bit manipulation", "Bit Magic", "Bitmask", "Bitmask(s)", "bitmasks", "bitmask", "Bit Masks"],
      "heap": ["Heap", "heap", "Heap (Priority Queue)", "priority-queue", "Heaps And Maps"],
      "stack": ["Stack", "stack", "Stacks And Queues"],
      "queue": ["Queue", "queue", "Queues"],
      "linked-list": ["Linked List", "LinkedList", "linked-list", "doubly-linked-list", "circular-linked-list", "circular linked list", "doubly linked list"],
      "matrix": ["Matrix", "matrix", "Matrices", "matrices", "Binary Indexed Tree", "matrix-related"],
      "prefix-sum": ["Prefix Sum", "prefix-sum"],
      "sliding-window": ["sliding-window", "Sliding Window"],
      "two-sat": ["2-sat", "two-sat"],
      "brute-force": ["brute force", "Brute Force", "bruteforce"],
      "combinatorics": ["Combinatorics", "combinatorics", "permutation", "permutation & combination", "permutation", "Combinatorial"],
      "constructive": ["constructive algorithms", "constructive algo", "constructive"],
      "data-structures": ["Data Structures", "data-structures", "Data Structures", "Advanced Data Structure"],
      "divide-and-conquer": ["Divide and Conquer", "divide-and-conquer", "divide and conquer"],
      "dsu": ["DSU", "dsu", "Disjoint Set", "union-find", "Disjoint Set Union", "union find"],
      "expression-parsing": ["expression parsing", "Expression Parsing"],
      "fft": ["fft"],
      "flows": ["flows", "flow", "max flow"],
      "games": ["games", "Game Theory"],
      "geometry": ["geometry", "Geometric", "Geometry"],
      "implementation": ["implementation", "Implementation"],
      "interactive": ["interactive", "Interactive"],
      "matrices": ["matrices", "Matrices"],
      "meet-in-the-middle": ["meet-in-the-middle", "meet in the middle", "meet in the middle"],
      "probabilities": ["probabilities", "Probability and Statistics", "Probability and Statistics", "probability"],
      "schedules": ["schedules"],
      "shortest-paths": ["shortest paths", "shortest-paths", "Shortest Path", "Shortest Path"],
      "string-suffix-structures": ["string suffix structures", "String Suffix Structures", "Suffix Array"],
      "ternary-search": ["ternary search", "ternary-search"],
      "graph-matchings": ["graph matchings", "graph-matchings"],
      "trees": ["trees", "Trees"],
      "bitmask": ["Bitmask", "Bitmask(s)", "bitmasks", "bitmask"],
      "hashing": ["hashing", "Hashing"],
      "database": ["Database", "database"],
      "design": ["Design", "design"],
      "simulation": ["Simulation", "simulation"],
      "backtracking": ["Backtracking", "backtracking"],
      "union-find": ["Union Find", "union-find", "union find", "Disjoint Set", "disjoint-set"],
      "number-theory": ["Number Theory", "number-theory", "number theory", "sieve", "Prime Number", "Factorization"],
      "ordered-set": ["Ordered Set", "ordered set"],
      "monotonic-stack": ["Monotonic Stack", "monotonic stack"],
      "segment-tree": ["Segment Tree", "segment-tree", "Range Minimum Query", "Binary Indexed Tree", "Binary Indexed Tree", "Fenwick", "BIT"],
      "trie": ["Trie", "trie"],
      "recursion": ["Recursion", "recursion"],
      "memoization": ["Memoization", "memoization"],
      "hash-function": ["Hash Function", "hash function"],
      "binary-search-tree": ["Binary Search Tree", "binary search tree", "Binary Search Tree"],
      "shortest-path": ["Shortest Path", "shortest path", "Shortest Path"],
      "topological-sort": ["Topological Sort", "topological sort"],
      "scc": ["Strongly Connected Component", "SCC", "strongly connected component", "Biconnected Component"],
      "eulerian-circuit": ["Eulerian Circuit", "EULERIAN CIRCUIT", "eulerian circuit"],
      "radix-sort": ["Radix Sort", "radix sort"],
      "graph-algorithms": ["graphs", "graph", "Graph", "graph algorithms"],
      "probability": ["Probability and Statistics", "Probability", "probabilities"],
      "bitmasking": ["Bitmask", "bitmask", "bit masks"],
      "kadanes": ["Kadane", "Kadane's algorithm", "kadane"],
      "lcs": ["LCS", "lcs", "Longest Common Subsequence"],
      "stl": ["STL", "stl", "Java-Collections", "Java-Strings"],
      "language-tags": ["CPP", "C/C++", "Java", "python", "python-loops", "python-strings", "python-io", "python-dict"],
      "oop": ["OOP", "Class", "Java-Class and Object", "Java-Class", "Java Class"],
      "design-patterns": ["Design-Pattern", "Design Pattern", "design-pattern"],
      "pattern-printing": ["pattern-printing", "Pattern Printing", "pattern printing"],
      "approximation": ["approximation", "rejection sampling", "reservoir sampling"],
      "misc": ["Misc", "Practice-Problems", "Practice Problems", "Practice-Problems"],
      "searching": ["Searching", "searching"],
      "pointers": ["Pointers", "pointers", "cpp-pointers"],
      "operators": ["Operators", "operator", "cpp-operator", "Java-Operators"],
      "regex": ["Regular Expression", "regex", "regular expression"],
      "factorial": ["factorial"],
      "sqrt-decomposition": ["Sqrt Decomposition", "sqrt decomposition"],
      "range-min-query": ["Range Minimum Query", "range minimum query", "RMQ"],
      "ml": ["Machine Learning", "machine learning"],
      "strings-advanced": ["String Matching", "Rolling Hash", "rolling hash", "Suffix Array", "Suffix Tree"],
      "graph-components": ["Biconnected Component", "biconnected component"],
      "iterators": ["Iterator", "iterator"],
      "concurrency": ["Concurrency", "concurrent"],
      "probability-statistics": ["Probability and Statistics", "Probability", "probabilities"],
      "search-algorithms": ["Binary Search", "binary search", "ternary search", "ternary-search"],
      "tree-traversal": ["Traversal", "Traversal Algorithms", "Traversal"],
      "kadane": ["Kadane", "kadane", "Maximum subarray"],
      "lcs": ["LCS", "lcs", "Longest Common Subsequence"]
    };
    this.tagMap = null;
    this.reverseMap = null;
  }

  async initialize() {
    await this.loadTagMap();
    this.buildReverseMap();
  }

  async loadTagMap() {
    try {
      const result = await chrome.storage.sync.get(['customTagMap']);
      this.tagMap = result.customTagMap || this.defaultTagMap;
    } catch (error) {
      console.error('Error loading tag map:', error);
      this.tagMap = this.defaultTagMap;
    }
  }

  buildReverseMap() {
    this.reverseMap = new Map();
    for (const [canonical, variants] of Object.entries(this.tagMap)) {
      // Add canonical form
      this.reverseMap.set(canonical.toLowerCase(), canonical);
      // Add all variants
      variants.forEach(variant => {
        this.reverseMap.set(variant.toLowerCase(), canonical);
      });
    }
  }

  /**
   * Normalize a single tag to its canonical form
   */
  normalizeTag(tag) {
    if (!tag || typeof tag !== 'string') return tag;
    
    const normalized = this.reverseMap.get(tag.toLowerCase().trim());
    return normalized || tag; // Return original if no mapping found
  }

  /**
   * Normalize an array of tags
   */
  normalizeTags(tags) {
    if (!Array.isArray(tags)) return [];
    
    const normalizedTags = new Set(); // Use Set to avoid duplicates
    
    tags.forEach(tag => {
      const normalized = this.normalizeTag(tag);
      if (normalized && normalized.trim()) {
        normalizedTags.add(normalized);
      }
    });
    
    return Array.from(normalizedTags).sort();
  }

  /**
   * Get current tag map for editing
   */
  getTagMap() {
    return { ...this.tagMap };
  }

  /**
   * Update tag map with new mappings
   */
  async updateTagMap(newTagMap) {
    try {
      // Validate the new tag map
      if (!newTagMap || typeof newTagMap !== 'object') {
        return { success: false, error: 'Invalid tag map provided' };
      }
      
      // Clean up the tag map before saving
      const cleanedTagMap = {};
      for (const [canonical, variants] of Object.entries(newTagMap)) {
        const cleanKey = canonical.toLowerCase().trim();
        if (cleanKey && variants) {
          const cleanVariants = Array.isArray(variants) ? variants : [variants];
          const processedVariants = cleanVariants
            .map(v => v.toString().trim())
            .filter(v => v.length > 0)
            .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
          
          if (processedVariants.length > 0) {
            cleanedTagMap[cleanKey] = processedVariants;
          }
        }
      }
      
      console.log('Saving cleaned tag map:', cleanedTagMap);
      
      // Save to chrome storage
      await chrome.storage.sync.set({ customTagMap: cleanedTagMap });
      
      // Update local copy
      this.tagMap = cleanedTagMap;
      this.buildReverseMap();
      
      console.log('Tag map updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating tag map:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset to default tag map
   */
  async resetToDefault() {
    try {
      await chrome.storage.sync.remove(['customTagMap']);
      this.tagMap = this.defaultTagMap;
      this.buildReverseMap();
      return { success: true };
    } catch (error) {
      console.error('Error resetting tag map:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get canonical tags (list of all possible canonical forms)
   */
  getCanonicalTags() {
    return Object.keys(this.tagMap).sort();
  }

  /**
   * Add a new tag mapping or update existing one
   */
  async addTagMapping(canonical, variants) {
    try {
      const canonicalLower = canonical.toLowerCase().trim();
      const currentMap = this.getTagMap();
      
      // Ensure variants is an array and clean it
      const cleanVariants = Array.isArray(variants) ? variants : [variants];
      const processedVariants = cleanVariants
        .map(v => v.toString().trim())
        .filter(v => v.length > 0)
        .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
      
      if (processedVariants.length === 0) {
        return { success: false, error: 'No valid variants provided' };
      }
      
      // Update or add the mapping
      currentMap[canonicalLower] = processedVariants;
      
      const result = await this.updateTagMap(currentMap);
      
      if (result.success) {
        console.log(`Tag mapping updated: ${canonicalLower} -> [${processedVariants.join(', ')}]`);
      }
      
      return result;
    } catch (error) {
      console.error('Error adding tag mapping:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove a tag mapping
   */
  async removeTagMapping(canonical) {
    const currentMap = this.getTagMap();
    delete currentMap[canonical.toLowerCase()];
    return await this.updateTagMap(currentMap);
  }
}

// Create global instance
const tagMapper = new TagMapper();

// Auto-initialize when script loads
if (typeof chrome !== 'undefined' && chrome.storage) {
  tagMapper.initialize().catch(console.error);
}