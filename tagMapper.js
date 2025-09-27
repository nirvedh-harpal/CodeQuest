class TagMapper {
  constructor() {
    this.defaultTagMap = {
      // Core Data Structures
      "array": ["array", "arrays", "Array", "Arrays"],
      "string": ["string", "strings", "String", "Strings"],
      "matrix": ["matrix", "matrices", "Matrix", "Matrices"],
      "linked-list": ["linked list", "linked lists", "Linked List", "Linked Lists"],
      "doubly-linked-list": ["doubly-linked list", "doubly linked list", "Doubly-Linked List"],
      "circular-linked-list": ["circular-linked-list", "circular linked list"],
      "stack": ["stack", "Stack", "stacks and queues", "Stacks And Queues"],
      "queue": ["queue", "Queue"],
      "deque": ["deque", "Deque"],
      "heap": ["heap", "Heap", "heap (priority queue)", "Heap (Priority Queue)", "heaps and maps", "Heaps And Maps"],
      "priority-queue": ["priority queue", "priority-queue", "Priority Queue"],
      "tree": ["tree", "Tree", "trees", "Trees", "tree data structure", "Tree Data Structure"],
      "binary-tree": ["binary tree", "Binary Tree"],
      "binary-search-tree": ["binary search tree", "Binary Search Tree", "BST"],
      "avl-tree": ["avl-tree", "AVL-Tree", "AVL Tree"],
      "trie": ["trie", "Trie"],
      "segment-tree": ["segment tree", "segment-tree", "Segment-Tree", "Segment Tree"],
      "binary-indexed-tree": ["binary indexed tree", "Binary Indexed Tree", "BIT", "Fenwick"],

      // Hash & Map Related
      "hash": ["hash", "Hash", "hash table", "Hash Table", "hashing", "Hashing"],
      "map": ["map", "Map"],
      "set": ["set", "Set", "ordered set", "Ordered Set"],

      // Graph Algorithms
      "graph": ["graph", "Graph", "graphs", "Graphs", "graph data structure & algorithms", "Graph Data Structure & Algorithms"],
      "dfs": ["dfs", "DFS", "depth-first search", "Depth-First Search", "dfs and similar"],
      "bfs": ["bfs", "BFS", "breadth-first search", "Breadth-First Search"],
      "shortest-path": ["shortest path", "shortest paths", "Shortest Path"],
      "topological-sort": ["topological sort", "Topological Sort"],
      "graph-matchings": ["graph matchings", "Graph Matchings"],
      "union-find": ["union find", "union-find", "Union Find", "dsu", "disjoint set", "Disjoint Set"],
      "minimum-spanning-tree": ["minimum spanning tree", "Minimum Spanning Tree", "MST"],
      "strongly-connected-component": ["strongly connected component", "Strongly Connected Component", "SCC"],
      "biconnected-component": ["biconnected component", "Biconnected Component"],
      "eulerian-circuit": ["eulerian circuit", "Eulerian Circuit"],
      "flows": ["flows", "Flows", "max flow", "network flow"],

      // Algorithmic Techniques
      "dynamic-programming": ["dynamic programming", "dp", "Dynamic Programming", "DP"],
      "greedy": ["greedy", "Greedy", "greedy algorithm", "Greedy Algorithm"],
      "divide-and-conquer": ["divide and conquer", "Divide and Conquer"],
      "backtracking": ["backtracking", "Backtracking"],
      "brute-force": ["brute force", "Brute Force"],
      "two-pointers": ["two pointers", "Two Pointers", "two-pointer-algorithm"],
      "sliding-window": ["sliding window", "sliding-window", "Sliding Window"],
      "binary-search": ["binary search", "Binary Search"],
      "ternary-search": ["ternary search", "Ternary Search"],
      "meet-in-the-middle": ["meet-in-the-middle", "meet in the middle"],

      // Mathematical Concepts
      "math": ["math", "Math", "mathematical", "Mathematical", "numbers", "Numbers"],
      "number-theory": ["number theory", "number-theory", "Number Theory"],
      "combinatorics": ["combinatorics", "Combinatorics", "combinatorial", "Combinatorial", "permutation & combination"],
      "probability": ["probabilities", "probability and statistics", "Probability and Statistics"],
      "geometry": ["geometry", "Geometry", "geometric", "Geometric"],
      "game-theory": ["game theory", "Game Theory", "games", "Games"],

      // Bit Manipulation
      "bitmask": ["bitmask", "Bitmask", "bitmasks", "bit manipulation", "Bit Manipulation", "bit magic", "Bit Magic"],
      "binary-representation": ["binary representation", "Binary Representation"],

      // String Algorithms
      "string-suffix-structures": ["string suffix structures", "String Suffix Structures"],
      "string-matching": ["string matching", "String Matching", "pattern searching", "Pattern Searching"],
      "rolling-hash": ["rolling hash", "Rolling Hash"],
      "suffix-array": ["suffix array", "Suffix Array"],

      // Sorting & Searching
      "sorting": ["sorting", "sortings", "Sorting", "Sort", "sort"],
      "merge-sort": ["merge sort", "Merge Sort"],
      "counting-sort": ["counting sort", "Counting Sort"],
      "radix-sort": ["radix sort", "Radix Sort"],
      "bucket-sort": ["bucket sort", "Bucket Sort"],
      "quickselect": ["quickselect", "Quickselect"],
      "searching": ["searching", "Searching"],

      // Special Techniques
      "memoization": ["memoization", "Memoization"],
      "recursion": ["recursion", "Recursion"],
      "simulation": ["simulation", "Simulation"],
      "enumeration": ["enumeration", "Enumeration"],
      "counting": ["counting", "Counting"],
      "prefix-sum": ["prefix sum", "prefix-sum", "Prefix Sum"],
      "monotonic-stack": ["monotonic stack", "Monotonic Stack"],
      "monotonic-queue": ["monotonic queue", "Monotonic Queue"],
      "line-sweep": ["line sweep", "Line Sweep"],

      // Advanced Topics
      "2-sat": ["2-sat", "2-SAT"],
      "chinese-remainder-theorem": ["chinese remainder theorem", "Chinese Remainder Theorem"],
      "expression-parsing": ["expression parsing", "Expression Parsing"],
      "fft": ["fft", "FFT"],
      "sqrt-decomposition": ["sqrt decomposition", "Sqrt Decomposition"],
      "range-minimum-query": ["range minimum query", "Range Minimum Query", "RMQ"],
      "inclusion-exclusion": ["inclusion-exclusion", "inclusion exclusion"],

      // Implementation & Design
      "implementation": ["implementation", "Implementation"],
      "constructive-algorithms": ["constructive algorithms", "Constructive Algorithms", "constructive algo"],
      "design": ["design", "Design"],
      "data-stream": ["data stream", "Data Stream"],
      "iterator": ["iterator", "Iterator"],
      "interactive": ["interactive", "Interactive"],

      // Specialized Algorithms
      "kadane": ["kadane", "Kadane"],
      "lcs": ["lcs", "LCS"],
      "sieve": ["sieve", "Sieve"],
      "factorial": ["factorial", "Factorial"],
      "fibonacci": ["fibonacci", "Fibonacci"],
      "palindrome": ["palindrome", "Palindrome"],
      "anagram": ["anagram", "Anagram"],
      "permutation": ["permutation", "Permutation"],
      "subset": ["subset", "Subset"],

      // Concurrency & Parallel
      "concurrency": ["concurrency", "Concurrency"],
      "randomized": ["randomized", "Randomized"],
      "reservoir-sampling": ["reservoir sampling", "Reservoir Sampling"],
      "rejection-sampling": ["rejection sampling", "Rejection Sampling"],

      // Special Categories
      "brainteaser": ["brainteaser", "Brainteaser"],
      "puzzles": ["puzzles", "Puzzles"],
      "schedules": ["schedules", "Schedules"],

      // Programming Languages & Concepts
      "c-cpp": ["c/c++", "C/C++", "c", "C", "cpp", "CPP"],
      "java": ["java", "Java"],
      "python": ["python", "Python"],
      "stl": ["stl", "STL"],
      "oop": ["oop", "OOP"],
      "class": ["class", "Class"],
      "functions": ["functions", "Functions"],
      "operators": ["operators", "Operators"],
      "data-type": ["data type", "Data Type"],
      "time-complexity": ["time complexity", "Time Complexity"],

      // Database
      "database": ["database", "Database"],

      // Shell
      "shell": ["shell", "Shell"],

      // Machine Learning
      "machine-learning": ["machine learning", "Machine Learning"],

      // Misc Categories
      "hash-function": ["hash function", "Hash Function"],
      "regular-expression": ["regular expression", "Regular Expression"],
      "pattern-printing": ["pattern-printing", "Pattern Printing"],
      "logical-thinking": ["logical-thinking", "Logical Thinking"],
      "traversal": ["traversal", "Traversal"],
      "reverse": ["reverse", "Reverse"],
      "alphabets": ["alphabets", "Alphabets"],
      "date-time": ["date-time", "Date-Time"],
      "modular-arithmetic": ["modular arithmetic", "Modular Arithmetic"],
      "prime-number": ["prime number", "Prime Number"],
      "factorization": ["factorization", "Factorization"],
      "series": ["series", "Series"],
      "quantifiers": ["quantifiers", "Quantifiers"],
      "division": ["division", "Division"],
      "problem-solving": ["problem solving", "Problem Solving"],
      "practice-problems": ["practice-problems", "Practice-Problems"],
      "computer-science-basics": ["computer science basics", "Computer Science Basics"],
      "advanced-data-structure": ["advanced data structure", "Advanced Data Structure"],
      "data-structures": ["data structures", "Data Structures"],
      "algorithms": ["algorithms", "Algorithms"],
      "misc": ["misc", "Misc"],

      // Platform-specific (if needed)
      "codersbit": ["codersbit", "Codersbit"],
      "ninja": ["ninja", "Ninja"],
      "more": ["more", "More"]
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

  normalizeTag(tag) {
    if (!tag || typeof tag !== 'string') return tag;
    const normalized = this.reverseMap.get(tag.toLowerCase().trim());
    return normalized || tag;
  }

  normalizeTags(tags) {
    if (!Array.isArray(tags)) return [];
    const normalizedTags = new Set();
    tags.forEach(tag => {
      const normalized = this.normalizeTag(tag);
      if (normalized && normalized.trim()) {
        normalizedTags.add(normalized);
      }
    });
    return Array.from(normalizedTags).sort();
  }

  getTagMap() {
    return { ...this.tagMap };
  }

  async updateTagMap(newTagMap) {
    try {
      if (!newTagMap || typeof newTagMap !== 'object') {
        return { success: false, error: 'Invalid tag map provided' };
      }
      
      const cleanedTagMap = {};
      for (const [canonical, variants] of Object.entries(newTagMap)) {
        const cleanKey = canonical.toLowerCase().trim();
        if (cleanKey && variants) {
          const cleanVariants = Array.isArray(variants) ? variants : [variants];
          const processedVariants = cleanVariants
            .map(v => v.toString().trim())
            .filter(v => v.length > 0)
            .filter((v, i, arr) => arr.indexOf(v) === i);
          
          if (processedVariants.length > 0) {
            cleanedTagMap[cleanKey] = processedVariants;
          }
        }
      }
      
      await chrome.storage.sync.set({ customTagMap: cleanedTagMap });
      this.tagMap = cleanedTagMap;
      this.buildReverseMap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetToDefault() {
    try {
      await chrome.storage.sync.remove(['customTagMap']);
      this.tagMap = this.defaultTagMap;
      this.buildReverseMap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getCanonicalTags() {
    return Object.keys(this.tagMap).sort();
  }

  async addTagMapping(canonical, variants) {
    try {
      const canonicalLower = canonical.toLowerCase().trim();
      const currentMap = this.getTagMap();
      const cleanVariants = Array.isArray(variants) ? variants : [variants];
      const processedVariants = cleanVariants
        .map(v => v.toString().trim())
        .filter(v => v.length > 0)
        .filter((v, i, arr) => arr.indexOf(v) === i);
      
      if (processedVariants.length === 0) {
        return { success: false, error: 'No valid variants provided' };
      }
      
      currentMap[canonicalLower] = processedVariants;
      return await this.updateTagMap(currentMap);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeTagMapping(canonical) {
    const currentMap = this.getTagMap();
    delete currentMap[canonical.toLowerCase()];
    return await this.updateTagMap(currentMap);
  }
}

const tagMapper = new TagMapper();

if (typeof chrome !== 'undefined' && chrome.storage) {
  tagMapper.initialize();
}