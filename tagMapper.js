class TagMapper {
  constructor() {
    this.defaultTagMap = {
      "array": [
        "array",
        "arrays",
        "Array",
        "Arrays"
      ],
      "string": [
        "string",
        "strings",
        "String",
        "Strings"
      ],
      "matrix": [
        "matrix",
        "matrices",
        "Matrix",
        "Matrices"
      ],
      "linked-list": [
        "linked list",
        "linked lists",
        "linked-list",
        "linked-lists",
        "Linked List",
        "Linked Lists",
        "Linked-List",
        "Linked-Lists"
      ],
      "doubly-linked-list": [
        "doubly linked list",
        "doubly linked lists",
        "doubly-linked list",
        "doubly-linked lists",
        "Doubly Linked List",
        "Doubly Linked Lists",
        "Doubly-Linked List",
        "Doubly-Linked Lists"
      ],
      "circular-linked-list": [
        "circular linked list",
        "circular linked lists",
        "circular-linked list",
        "circular-linked lists",
        "Circular Linked List",
        "Circular Linked Lists",
        "Circular-Linked List",
        "Circular-Linked Lists"
      ],
      "stack": [
        "stack",
        "stacks",
        "Stack",
        "Stacks"
      ],
      "queue": [
        "queue",
        "queues",
        "Queue",
        "Queues"
      ],
      "stack-and-queue": [
        "stack and queue",
        "stacks and queues",
        "Stack And Queue",
        "Stacks And Queues",
        "stack & queue",
        "Stack & Queue"
      ],
      "deque": [
        "deque",
        "deques",
        "Deque",
        "Deques"
      ],
        "double-ended queue": [
        "double-ended queue",
        "double ended queue",
        "double-ended-queue",
        "Double-Ended Queue"
      ],
      "heap": [
        "heap",
        "heaps",
        "Heap",
        "Heaps",
        "heaps and maps",
        "Heaps And Maps"
      ],
      "priority-queue": [
        "priority queue",
        "priority queues",
        "priority-queue",
        "priority-queues",
        "Priority Queue",
        "Priority Queues",
        "priorityqueue",
        "Priorityqueue",
        "heap (priority queue)",
        "heap priority queue",
        "Heap (Priority Queue)",
        "Heap (Priority Queues)"
      ],
      "tree": [
        "tree",
        "trees",
        "Tree",
        "Trees",
        "tree data structure",
        "tree data structures",
        "Tree Data Structure",
        "Tree Data Structures"
      ],
      "binary-tree": [
        "binary tree",
        "binary trees",
        "binary-tree",
        "binary-trees",
        "Binary Tree",
        "Binary Trees"
      ],
      "binary-search-tree": [
        "binary search tree",
        "binary search trees",
        "binary-tree search",
        "binary-search-tree",
        "Binary Search Tree",
        "Binary Search Trees",
        "BST",
        "bst"
      ],
      "avl-tree": [
        "avl tree",
        "avl trees",
        "avl-tree",
        "avl-trees",
        "AVL Tree",
        "AVL Trees",
        "AVL-Tree"
      ],
      "trie": [
        "trie",
        "tries",
        "Trie",
        "Tries"],
        "prefix tree": [
        "prefix tree",
        "prefix trees",
        "Prefix Tree",
        "Prefix Trees"
      ],
      "segment-tree": [
        "segment tree",
        "segment trees",
        "segment-tree",
        "segment-trees",
        "Segment Tree",
        "Segment Trees",
        "Segment-Tree"
      ],
      "binary-indexed-tree": [
        "binary indexed tree",
        "binary indexed trees",
        "binary-indexed tree",
        "binary-indexed trees",
        "Binary Indexed Tree",
        "Binary Indexed Trees",
        "BIT"],
        "Fenwick Tree": [
        "Fenwick",
        "Fenwick Tree",
        "Fenwick Trees"
      ],
      "hash": [
        "hash",
        "hashes",
        "Hash",
        "Hashes",
        "hash table",
        "hash tables",
        "Hash Table",
        "Hash Tables",
        "hashing",
        "Hashing"
      ],
      "map": [
        "map",
        "maps",
        "Map",
        "Maps",
        "hash map",
        "hash maps",
        "Hash Map",
        "Hash Maps",
        "ordered map",
        "Ordered Map"
      ],
      "set": [
        "set",
        "sets",
        "Set",
        "Sets",
        "ordered set",
        "ordered sets",
        "Ordered Set",
        "Ordered Sets"
      ],
      "graph": [
        "graph",
        "graphs",
        "Graph",
        "Graphs",
        "graph data structure & algorithms",
        "graph data structure and algorithms",
        "Graph Data Structure & Algorithms",
        "Graph Data Structure and Algorithms"
      ],
      "dfs": [
        "dfs",
        "DFS",
        "depth first search",
        "depth-first search",
        "Depth First Search",
        "Depth-First Search",
        "dfs and similar"
      ],
      "bfs": [
        "bfs",
        "BFS",
        "breadth first search",
        "breadth-first search",
        "Breadth First Search",
        "Breadth-First Search",
        "bfs and similar"
      ],
      "shortest-path": [
        "shortest path",
        "shortest paths",
        "shortest-path",
        "shortest-paths",
        "Shortest Path",
        "Shortest Paths",
        "single source shortest path",
        "all pairs shortest path",
        "shortest-path problem"
      ],
      "topological-sort": [
        "topological sort",
        "topological sorting",
        "topological-sort",
        "Topological Sort",
        "Topological Sorting"
      ],
      "graph-matchings": [
        "graph matchings",
        "graph-matching",
        "graph-matching problems",
        "Graph Matchings",
        "Graph Matching"
      ],
      "union-find": [
        "union find",
        "union-find",
        "union finds",
        "Union Find",
        "Union-Find",
        "dsu",
        "DSU",
        "disjoint set",
        "disjoint sets",
        "disjoint-set",
        "Disjoint Set",
        "Disjoint Sets",
        "disjoint-set union",
        "Disjoint-Set Union"
      ],
      "minimum-spanning-tree": [
        "minimum spanning tree",
        "minimum spanning trees",
        "minimum-spanning-tree",
        "minimum-spanning-trees",
        "Minimum Spanning Tree",
        "Minimum Spanning Trees",
        "MST",
        "mst"
      ],
      "strongly-connected-component": [
        "strongly connected component",
        "strongly connected components",
        "strongly-connected-component",
        "strongly-connected-components",
        "Strongly Connected Component",
        "Strongly Connected Components",
        "SCC",
        "scc"
      ],
      "biconnected-component": [
        "biconnected component",
        "biconnected components",
        "biconnected-component",
        "biconnected-components",
        "Biconnected Component",
        "Biconnected Components"
      ],
      "eulerian-circuit": [
        "eulerian circuit",
        "eulerian circuits",
        "eulerian-circuit",
        "eulerian-circuits",
        "Eulerian Circuit",
        "Eulerian Circuits"
      ],
      "flows": [
        "flows",
        "Flows",
        "max flow",
        "max-flow",
        "maximum flow",
        "network flow",
        "Network Flow",
        "Max Flow",
        "Maximum Flow"
      ],
      "dynamic-programming": [
        "dynamic programming",
        "dynamic-programming",
        "dynamic-program",
        "dp",
        "DP",
        "Dynamic Programming",
        "Dynamic-Programming",
        "dynamic programmes",
        "memoized dp"
      ],
      "greedy": [
        "greedy",
        "Greedy",
        "greedy algorithm",
        "greedy-algorithm",
        "Greedy Algorithm",
        "Greedy-Algorithm"
      ],
      "divide-and-conquer": [
        "divide and conquer",
        "divide-and-conquer",
        "Divide and Conquer",
        "Divide-And-Conquer",
        "divide & conquer"
      ],
      "backtracking": [
        "backtracking",
        "Backtracking",
        "back track",
        "back-tracking",
        "Back-Tracking"
      ],
      "brute-force": [
        "brute force",
        "brute-force",
        "Brute Force",
        "Brute-Force"
      ],
      "two-pointers": [
        "two pointers",
        "two-pointers",
        "two pointer",
        "two-pointer",
        "Two Pointers",
        "Two-Pointers",
        "two-pointer-algorithm"
      ],
      "sliding-window": [
        "sliding window",
        "sliding-window",
        "sliding windows",
        "Sliding Window",
        "Sliding-Window"
      ],
      "binary-search": [
        "binary search",
        "binary-search",
        "Binary Search",
        "Binary-Search"
      ],
      "ternary-search": [
        "ternary search",
        "ternary-search",
        "Ternary Search",
        "Ternary-Search"
      ],
      "meet-in-the-middle": [
        "meet in the middle",
        "meet-in-the-middle",
        "Meet In The Middle",
        "Meet-In-The-Middle",
        "meet-in-the-middle technique"
      ],
      "math": [
        "math",
        "Math",
        "mathematical",
        "Mathematical",
        "numbers",
        "Numbers",
        "mathematics",
        "Mathematics"
      ],
      "number-theory": [
        "number theory",
        "number-theories",
        "number-theory",
        "Number Theory",
        "Number-Theory"
      ],
      "combinatorics": [
        "combinatorics",
        "Combinatorics",
        "combinatorial",
        "Combinatorial"
      ],
      "permutation": [
        "permutation",
        "permutations",
        "Permutation",
        "Permutations"
      ],
      "combination": [
        "combination",
        "combinations",
        "Combination",
        "Combinations"
      ],
      "permutation-and-combination": [
        "permutation & combination",
        "permutation and combination",
        "Permutation & Combination",
        "Permutation and Combination",
        "permutations & combinations",
        "permutations and combinations",
        "Permutations & Combinations",
        "Permutations and Combinations"
      ],
      "probability": [
        "probability",
        "probabilities",
        "Probability"
      ],
      "statistics": [
        "statistics",
        "Statistics",
        "statistical",
        "Statistical"
      ],
      "probability-and-statistics": [
        "probability and statistics",
        "Probability and Statistics",
        "probability & statistics",
        "Probability & Statistics"
      ],
      "geometry": [
        "geometry",
        "Geometry",
        "geometric",
        "Geometric",
        "computational geometry",
        "Computational Geometry"
      ],
      "game-theory": [
        "game theory",
        "game-theory",
        "Game Theory",
        "games",
        "Games"
      ],
      "bitmask": [
        "bitmask",
        "bitmasks",
        "Bitmask",
        "Bitmasks",
        "bit mask",
        "bit masks"
      ],
      "bit-manipulation": [
        "bit manipulation",
        "bit-manipulation",
        "Bit Manipulation",
        "Bit-Manipulation",
        "bit magic",
        "Bit Magic",
        "bitwise operations",
        "Bitwise Operations",
        "bitwise",
        "Bitwise"
      ],
      "binary-representation": [
        "binary representation",
        "binary representations",
        "Binary Representation",
        "Binary Representations"
      ],
      "string-suffix-structures": [
        "string suffix structures",
        "string-suffix-structures",
        "String Suffix Structures",
        "suffix structures",
        "Suffix Structures"
      ],
      "string-matching": [
        "string matching",
        "string-matching",
        "String Matching",
        "pattern searching",
        "pattern-searching",
        "Pattern Searching"
      ],
      "rolling-hash": [
        "rolling hash",
        "rolling-hash",
        "Rolling Hash",
        "Rolling-Hash",
        "Rabin-Karp",
        "rabin karp"
      ],
      "suffix-array": [
        "suffix array",
        "suffix-array",
        "Suffix Array",
        "Suffix-Array"
      ],
      "sorting": [
        "sorting",
        "sortings",
        "Sorting",
        "Sort",
        "sort"
      ],
      "merge-sort": [
        "merge sort",
        "merge-sort",
        "Merge Sort",
        "Merge-Sort"
      ],
      "counting-sort": [
        "counting sort",
        "counting-sort",
        "Counting Sort",
        "Counting-Sort"
      ],
      "radix-sort": [
        "radix sort",
        "radix-sort",
        "Radix Sort",
        "Radix-Sort"
      ],
      "bucket-sort": [
        "bucket sort",
        "bucket-sort",
        "Bucket Sort",
        "Bucket-Sort"
      ],
      "quickselect": [
        "quickselect",
        "Quickselect",
        "quick select",
        "Quick Select"
      ],
      "searching": [
        "searching",
        "Searching",
        "search algorithms",
        "Search Algorithms"
      ],
      "memoization": [
        "memoization",
        "Memoization",
        "memoize",
        "Memoize"
      ],
      "recursion": [
        "recursion",
        "Recursion",
        "recursive",
        "Recursive"
      ],
      "simulation": [
        "simulation",
        "Simulation",
        "simulations",
        "Simulations"
      ],
      "enumeration": [
        "enumeration",
        "Enumeration",
        "enumerate",
        "Enumerate"
      ],
      "counting": [
        "counting",
        "Counting",
        "count",
        "Count"
      ],
      "prefix-sum": [
        "prefix sum",
        "prefix-sums",
        "prefix-sum",
        "Prefix Sum",
        "Prefix Sums"
      ],
      "monotonic-stack": [
        "monotonic stack",
        "monotonic-stack",
        "Monotonic Stack",
        "Monotonic-Stack"
      ],
      "monotonic-queue": [
        "monotonic queue",
        "monotonic-queue",
        "Monotonic Queue",
        "Monotonic-Queue"
      ],
      "line-sweep": [
        "line sweep",
        "line-sweeping",
        "line-sweep",
        "Line Sweep",
        "Line-Sweep"
      ],
      "2-sat": [
        "2-sat",
        "2-sat problem",
        "2-SAT",
        "2 SAT",
        "2 sat",
        "Two-SAT",
        "Two SAT",
        "two sat"
      ],
      "chinese-remainder-theorem": [
        "chinese remainder theorem",
        "chinese-remainder-theorem",
        "Chinese Remainder Theorem",
        "Chinese-Remainder Theorem",
        "CRT",
        "crt"
      ],
      "expression-parsing": [
        "expression parsing",
        "expression-parsing",
        "Expression Parsing",
        "Expression-Parsing",
        "parser",
        "parsing expressions"
      ],
      "fft": [
        "fft",
        "FFT",
        "fast fourier transform",
        "fast-fourier-transform",
        "Fast Fourier Transform",
        "Fast-Fourier-Transform"
      ],
      "sqrt-decomposition": [
        "sqrt decomposition",
        "sqrt-decomposition",
        "Sqrt Decomposition",
        "Sqrt-Decomposition",
        "square root decomposition",
        "square-root-decomposition"
      ],
      "range-minimum-query": [
        "range minimum query",
        "range-minimum-query",
        "Range Minimum Query",
        "Range-Minimum-Query",
        "RMQ",
        "rmq"
      ],
      "inclusion-exclusion": [
        "inclusion-exclusion",
        "inclusion exclusion",
        "Inclusion-Exclusion",
        "Inclusion Exclusion"
      ],
      "implementation": [
        "implementation",
        "Implementation",
        "implementations",
        "Implementations"
      ],
      "constructive-algorithms": [
        "constructive algorithms",
        "constructive-algorithms",
        "Constructive Algorithms",
        "Constructive-Algorithms",
        "constructive algo",
        "Constructive Algo"
      ],
      "design": [
        "design",
        "Design"
      ],
      "system-design": [
        "system design",
        "System Design",
        "system-design",
        "System-Design"
      ],
      "data-stream": [
        "data stream",
        "data-stream",
        "Data Stream",
        "Data-Stream",
        "streaming",
        "Streaming"
      ],
      "iterator": [
        "iterator",
        "iterators",
        "Iterator",
        "Iterators"
      ],
      "interactive": [
        "interactive",
        "Interactive",
        "interactive problems",
        "Interactive Problems"
      ],
      "kadane": [
        "kadane",
        "Kadane",
        "kadane's algorithm",
        "Kadane's Algorithm",
        "maximum subarray",
        "Maximum Subarray"
      ],
      "lcs": [
        "lcs",
        "LCS",
        "longest common subsequence",
        "longest-common-subsequence",
        "Longest Common Subsequence"
      ],
      "sieve": [
        "sieve",
        "Sieve",
        "sieve of eratosthenes",
        "Sieve of Eratosthenes",
        "sieves"
      ],
      "factorial": [
        "factorial",
        "Factorial",
        "factorials"
      ],
      "fibonacci": [
        "fibonacci",
        "Fibonacci",
        "fibonacci sequence",
        "Fibonacci Sequence"
      ],
      "palindrome": [
        "palindrome",
        "palindromes",
        "Palindrome",
        "Palindromes"
      ],
      "anagram": [
        "anagram",
        "anagrams",
        "Anagram",
        "Anagrams"
      ],
      "subset": [
        "subset",
        "subsets",
        "Subset",
        "Subsets"
      ],
      "concurrency": [
        "concurrency",
        "Concurrency",
        "parallel",
        "Parallel",
        "parallelism",
        "Parallelism"
      ],
      "randomized": [
        "randomized",
        "Randomized",
        "randomised",
        "Randomised",
        "randomized algorithms",
        "Randomized Algorithms"
      ],
      "reservoir-sampling": [
        "reservoir sampling",
        "reservoir-sampling",
        "Reservoir Sampling",
        "Reservoir-Sampling"
      ],
      "rejection-sampling": [
        "rejection sampling",
        "rejection-sampling",
        "Rejection Sampling",
        "Rejection-Sampling"
      ],
      "brainteaser": [
        "brainteaser",
        "brainteasers",
        "Brainteaser",
        "Brainteasers"
      ],
      "puzzles": [
        "puzzles",
        "puzzle",
        "Puzzles",
        "Puzzle"
      ],
      "schedules": [
        "schedules",
        "schedule",
        "Schedules",
        "Schedule"
      ],
      "c": [
        "c",
        "C"
      ],
      "cpp": [
        "cpp",
        "CPP",
        "c++",
        "C++",
        "c plus plus",
        "C Plus Plus"
      ],
      "c-and-cpp": [
        "c/c++",
        "C/C++",
        "c and c++",
        "C and C++",
        "c & c++",
        "C & C++"
      ],
      "java": [
        "java",
        "Java",
        "java8",
        "Java8",
        "java11",
        "Java11"
      ],
      "python": [
        "python",
        "Python",
        "python3",
        "Python3",
        "py",
        "Py"
      ],
      "stl": [
        "stl",
        "STL",
        "standard template library",
        "Standard Template Library",
        "std"
      ],
      "oop": [
        "oop",
        "OOP",
        "object oriented programming",
        "object-oriented programming",
        "Object Oriented Programming",
        "Object-Oriented Programming"
      ],
      "class": [
        "class",
        "classes",
        "Class",
        "Classes",
        "class definition",
        "Class Definition"
      ],
      "functions": [
        "functions",
        "function",
        "Functions",
        "Function"
      ],
      "methods": [
        "methods",
        "method",
        "Methods",
        "Method"
      ],
      "operators": [
        "operators",
        "operator",
        "Operators",
        "Operator"
      ],
      "data-type": [
        "data type",
        "data types",
        "data-type",
        "data-types",
        "Data Type",
        "Data Types"
      ],
      "time-complexity": [
        "time complexity",
        "time-complexities",
        "Time Complexity",
        "Time Complexities",
        "complexity",
        "Complexity"
      ],
      "database": [
        "database",
        "databases",
        "Database",
        "Databases",
        "sql",
        "SQL",
        "nosql",
        "NoSQL"
      ],
      "shell": [
        "shell",
        "Shell",
        "bash",
        "Bash",
        "shell scripting",
        "Shell Scripting"
      ],
      "machine-learning": [
        "machine learning",
        "machine-learning",
        "Machine Learning",
        "Machine-Learning",
        "ml",
        "ML"
      ],
      "hash-function": [
        "hash function",
        "hash functions",
        "Hash Function",
        "Hash Functions"
      ],
      "regular-expression": [
        "regular expression",
        "regular expressions",
        "regular-expression",
        "Regular Expression",
        "Regex",
        "regex"
      ],
      "pattern-printing": [
        "pattern printing",
        "pattern-printing",
        "Pattern Printing",
        "Pattern-Printing"
      ],
      "logical-thinking": [
        "logical thinking",
        "logical-thinking",
        "Logical Thinking",
        "Logical-Thinking",
        "logic",
        "Logic"
      ],
      "traversal": [
        "traversal",
        "traversals",
        "Traversal",
        "Traversals",
        "tree traversal",
        "graph traversal",
        "Tree Traversal",
        "Graph Traversal"
      ],
      "reverse": [
        "reverse",
        "Reverse",
        "reversal",
        "Reversal"
      ],
      "alphabets": [
        "alphabets",
        "alphabet",
        "Alphabets",
        "Alphabet"
      ],
      "date-time": [
        "date-time",
        "date time",
        "Date-Time",
        "Date Time",
        "datetime",
        "date time handling"
      ],
      "modular-arithmetic": [
        "modular arithmetic",
        "modular-arithmetic",
        "Modular Arithmetic",
        "Modular-Arithmetic"
      ],
      "prime-number": [
        "prime number",
        "prime numbers",
        "Prime Number",
        "Prime Numbers"
      ],
      "factorization": [
        "factorization",
        "factorisation",
        "Factorization",
        "Factorisation"
      ],
      "series": [
        "series",
        "Series",
        "number series",
        "Number Series"
      ],
      "quantifiers": [
        "quantifiers",
        "Quantifiers",
        "quantifier"
      ],
      "division": [
        "division",
        "Division",
        "divide",
        "Divide"
      ],
      "problem-solving": [
        "problem solving",
        "problem-solving",
        "Problem Solving",
        "Problem-Solving"
      ],
      "practice-problems": [
        "practice problems",
        "practice-problems",
        "Practice Problems",
        "Practice-Problems"
      ],
      "computer-science-basics": [
        "computer science basics",
        "computer-science-basics",
        "Computer Science Basics",
        "Computer-Science-Basics"
      ],
      "advanced-data-structure": [
        "advanced data structure",
        "advanced-data-structure",
        "Advanced Data Structure",
        "Advanced-Data-Structure",
        "advanced data structures"
      ],
      "data-structures": [
        "data structures",
        "data-structures",
        "Data Structures",
        "Data-Structures"
      ],
      "algorithms": [
        "algorithms",
        "algorithm",
        "Algorithms",
        "Algorithm"
      ],
      "misc": [
        "misc",
        "Misc",
        "miscellaneous",
        "Miscellaneous"
      ],
      "codersbit": [
        "codersbit",
        "Codersbit"
      ],
      "ninja": [
        "ninja",
        "Ninja"
      ],
      "more": [
        "more",
        "More"
      ]
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

  // Get canonical form preview for user input
  getCanonicalFormPreview(userInput) {
    if (!userInput || typeof userInput !== 'string') {
      return null;
    }
    
    const normalized = this.normalizeTag(userInput);
    const input = userInput.trim();
    
    // If input is already canonical or maps to a canonical form
    if (normalized && normalized !== input) {
      return {
        input: input,
        canonical: normalized,
        isCanonical: false,
        message: `"${input}" will be normalized to "${normalized}"`
      };
    } else if (normalized === input && this.tagMap[input.toLowerCase()]) {
      return {
        input: input,
        canonical: normalized,
        isCanonical: true,
        message: `"${input}" is already in canonical form`
      };
    } else {
      return {
        input: input,
        canonical: input,
        isCanonical: false,
        message: `"${input}" will be used as-is (no mapping found)`
      };
    }
  }

  // Get suggestions for partial input
  getCanonicalSuggestions(partialInput, maxSuggestions = 10) {
    if (!partialInput || typeof partialInput !== 'string') {
      return [];
    }
    
    const input = partialInput.toLowerCase().trim();
    const canonicals = this.getCanonicalTags();
    
    const suggestions = canonicals
      .filter(canonical => canonical.toLowerCase().includes(input))
      .slice(0, maxSuggestions);
    
    return suggestions;
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