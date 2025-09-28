/**
 * Clean Cache Management System for CodeQuest Extension
 * Provides:
 * 1. Dropdown options cache (independent of sheet)
 * 2. Temporary question storage with background sync
 * 3. Performance-focused, minimal API
 */

class CacheManager {
  constructor() {
    this.initialized = false;
    this.defaultDropdownOptions = {
      folders: [],
      patterns: [],
      tags: [],
    };
  }

  async getCanonicalTags() {
    try {
      // Import tagMapper if not available
      if (typeof tagMapper === 'undefined') {
        // Try to get canonical tags from tagMapper
        const script = document.createElement('script');
        script.src = 'tagMapper.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      
      if (typeof tagMapper !== 'undefined' && tagMapper.getCanonicalTags) {
        return tagMapper.getCanonicalTags();
      }
    } catch (error) {
      // Could not load canonical tags from tagMapper
    }
    
    // Fallback canonical tags if tagMapper fails
    return [
      "array", "string", "hash", "dynamic-programming", "math", "sorting", 
      "greedy", "dfs", "bfs", "binary-search", "two-pointers", "graph", 
      "tree", "stack", "queue", "heap", "linked-list", "binary-tree", 
      "backtracking", "divide-and-conquer", "sliding-window", "prefix-sum",
      "bit-manipulation", "recursion", "memoization", "trie", "union-find",
      "shortest-path", "topological-sort", "game-theory", "number-theory",
      "combinatorics", "geometry", "implementation"
    ].sort();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Get canonical tags as default tags
      const canonicalTags = await this.getCanonicalTags();
      this.defaultDropdownOptions.tags = canonicalTags;

      // Initialize dropdown options if not exist
      const { dropdownOptions } = await chrome.storage.local.get([
        "dropdownOptions",
      ]);
      if (!dropdownOptions) {
        await chrome.storage.local.set({
          dropdownOptions: this.defaultDropdownOptions,
        });
      } else {
        // Ensure tags always include canonical forms (merge with existing)
        const mergedTags = [...new Set([...canonicalTags, ...(dropdownOptions.tags || [])])].sort();
        const updatedOptions = {
          ...dropdownOptions,
          tags: mergedTags
        };
        await chrome.storage.local.set({
          dropdownOptions: updatedOptions,
        });
      }

      // Initialize temporary questions queue if not exist
      const { temporaryQuestions } = await chrome.storage.local.get([
        "temporaryQuestions",
      ]);
      if (!temporaryQuestions) {
        await chrome.storage.local.set({
          temporaryQuestions: [],
        });
      }

      this.initialized = true;
    } catch (error) {
      this.initialized = true; // Prevent infinite loops
    }
  }

  /**
   * Get dropdown options (instant)
   * Returns cached dropdown options map
   */
  async getDropdownOptions() {
    await this.initialize();

    try {
      const { dropdownOptions } = await chrome.storage.local.get([
        "dropdownOptions",
      ]);
      const options = dropdownOptions || this.defaultDropdownOptions;

      return options;
    } catch (error) {
      return this.defaultDropdownOptions;
    }
  }

  /**
   * Add new dropdown option to cache
   * Dynamically updates dropdown options when user creates new ones
   */
  async addDropdownOption(type, value) {
    await this.initialize();

    try {
      const currentOptions = await this.getDropdownOptions();

      if (!currentOptions[type]) {
        currentOptions[type] = [];
      }

      // Add if not already exists
      if (!currentOptions[type].includes(value)) {
        currentOptions[type].push(value);
        currentOptions[type].sort(); // Keep sorted for better UX

        await chrome.storage.local.set({ dropdownOptions: currentOptions });
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save question temporarily (instant)
   * Questions are stored temporarily and synced in background
   */
  async saveQuestionToCache(questionData) {
    await this.initialize();

    try {
      const tempQuestion = {
        ...questionData,
        id: this.generateQuestionId(),
        timestamp: Date.now(),
        status: "pending",
      };

      // Get current temporary questions
      const { temporaryQuestions = [] } = await chrome.storage.local.get([
        "temporaryQuestions",
      ]);
      temporaryQuestions.push(tempQuestion);

      await chrome.storage.local.set({ temporaryQuestions });

      // Auto-add new dropdown options if present
      if (questionData.folder) {
        await this.addDropdownOption("folders", questionData.folder);
      }
      if (questionData.pattern) {
        // Handle pattern as array (like tags)
        if (Array.isArray(questionData.pattern)) {
          for (const pattern of questionData.pattern) {
            if (pattern) await this.addDropdownOption("patterns", pattern);
          }
        } else {
          // Fallback for string patterns - split by comma
          const patterns = questionData.pattern
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p);
          for (const pattern of patterns) {
            await this.addDropdownOption("patterns", pattern);
          }
        }
      }
      if (questionData.tags && Array.isArray(questionData.tags)) {
        for (const tag of questionData.tags) {
          if (tag) {
            // Normalize tag using tagMapper before adding to cache
            let normalizedTag = tag;
            try {
              if (typeof tagMapper !== 'undefined' && tagMapper.normalizeTag) {
                normalizedTag = tagMapper.normalizeTag(tag);
              }
            } catch (error) {
              // Use original tag if normalization fails
            }
            await this.addDropdownOption("tags", normalizedTag);
          }
        }
      }

      // Notify background script to sync
      try {
        chrome.runtime.sendMessage({ action: "triggerSync" });
      } catch (error) {
        // Ignore errors if background script not reachable
      }

      return { success: true, id: tempQuestion.id, cached: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get temporary questions for background sync
   */
  async getTemporaryQuestions() {
    await this.initialize();

    try {
      const { temporaryQuestions = [] } = await chrome.storage.local.get([
        "temporaryQuestions",
      ]);
      return temporaryQuestions;
    } catch (error) {
      return [];
    }
  }

  /**
   * Remove question from temporary cache after successful sync
   */
  async removeTemporaryQuestion(questionId) {
    await this.initialize();

    try {
      const { temporaryQuestions = [] } = await chrome.storage.local.get([
        "temporaryQuestions",
      ]);
      const filteredQuestions = temporaryQuestions.filter(
        (q) => q.id !== questionId
      );

      await chrome.storage.local.set({ temporaryQuestions: filteredQuestions });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear only temporary questions (for testing)
   */
  async clearTemporaryQuestions() {
    await this.initialize();

    try {
      await chrome.storage.local.set({ temporaryQuestions: [] });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache statistics for debugging
   */
  async getCacheStats() {
    await this.initialize();

    try {
      const { temporaryQuestions = [], dropdownOptions } =
        await chrome.storage.local.get([
          "temporaryQuestions",
          "dropdownOptions",
        ]);

      const options = dropdownOptions || this.defaultDropdownOptions;

      return {
        temporaryQuestionsCount: temporaryQuestions.length,
        foldersCount: options.folders?.length || 0,
        patternsCount: options.patterns?.length || 0,
        tagsCount: options.tags?.length || 0,
        oldestQuestion:
          temporaryQuestions.length > 0
            ? Math.min(...temporaryQuestions.map((q) => q.timestamp))
            : null,
      };
    } catch (error) {
      return {
        temporaryQuestionsCount: 0,
        foldersCount: 0,
        patternsCount: 0,
        tagsCount: 0,
        oldestQuestion: null,
      };
    }
  }

  /**
   * Reset dropdown options to defaults (for troubleshooting)
   */
  async resetDropdownOptions() {
    await this.initialize();

    try {
      await chrome.storage.local.set({
        dropdownOptions: { ...this.defaultDropdownOptions },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique question ID
   */
  generateQuestionId() {
    return "temp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Check if there are questions pending sync
   */
  async hasPendingQuestions() {
    const questions = await this.getTemporaryQuestions();
    return questions.length > 0;
  }

  /**
   * Clean up old temporary questions (older than 24 hours)
   * Called by background script periodically
   */
  async cleanupOldQuestions() {
    await this.initialize();

    try {
      const { temporaryQuestions = [] } = await chrome.storage.local.get([
        "temporaryQuestions",
      ]);
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

      const validQuestions = temporaryQuestions.filter(
        (q) => q.timestamp > dayAgo
      );
      const removedCount = temporaryQuestions.length - validQuestions.length;

      if (removedCount > 0) {
        await chrome.storage.local.set({ temporaryQuestions: validQuestions });
      }

      return removedCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Refresh canonical tags in cache when tag mappings change
   */
  async refreshCanonicalTags() {
    try {
      // Get fresh canonical tags
      const canonicalTags = await this.getCanonicalTags();
      
      // Get current dropdown options
      const currentOptions = await this.getDropdownOptions();
      
      // Merge canonical tags with existing tags (canonical tags take priority)
      const mergedTags = [...new Set([...canonicalTags, ...currentOptions.tags])].sort();
      
      // Update dropdown options
      const updatedOptions = {
        ...currentOptions,
        tags: mergedTags
      };
      
      await chrome.storage.local.set({ dropdownOptions: updatedOptions });
      
      return { success: true, tagsCount: mergedTags.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache() {
    try {
      // Remove all cache-related data from storage
      await chrome.storage.local.remove([
        "dropdownOptions",
        "temporaryQuestions",
        "lastCacheUpdate",
      ]);

      // Reset to uninitialized state
      this.initialized = false;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh dropdown options from Google Sheets
   */
  async refreshDropdownOptions() {
    try {
      // Clear existing cached dropdown options
      await chrome.storage.local.remove(["dropdownOptions"]);

      // Force re-initialization and fetch from Google Sheets
      this.initialized = false;

      // Try to get fresh options from Google Sheets
      try {
        // Import googleSheetsAPI if not available
        if (typeof googleSheetsAPI === "undefined") {
          importScripts("googleSheetsAPI.js");
        }

        const freshOptions = await googleSheetsAPI.getDropdownOptions();

        if (
          freshOptions &&
          (freshOptions.folders?.length ||
            freshOptions.patterns?.length ||
            freshOptions.tags?.length)
        ) {
          // Fix pattern splitting issue: patterns from Google Sheets might be comma-separated strings
          const processedOptions = {
            folders: freshOptions.folders || [],
            patterns: [],
            tags: freshOptions.tags || [],
          };

          // Process patterns to split comma-separated values
          if (freshOptions.patterns && freshOptions.patterns.length > 0) {
            const patternSet = new Set();
            freshOptions.patterns.forEach((pattern) => {
              if (pattern && typeof pattern === "string") {
                // Split by comma and add each individual pattern
                pattern.split(",").forEach((p) => {
                  const trimmed = p.trim();
                  if (trimmed) patternSet.add(trimmed);
                });
              } else if (pattern) {
                patternSet.add(pattern);
              }
            });
            processedOptions.patterns = Array.from(patternSet).sort();
          }

          // Add default options if none exist or merge canonical tags
          if (processedOptions.patterns.length === 0) {
            processedOptions.patterns = this.defaultDropdownOptions.patterns;
          }
          if (processedOptions.folders.length === 0) {
            processedOptions.folders = this.defaultDropdownOptions.folders;
          }
          
          // Always ensure canonical tags are available
          const canonicalTags = await this.getCanonicalTags();
          const mergedTags = [...new Set([...canonicalTags, ...processedOptions.tags])].sort();
          processedOptions.tags = mergedTags;

          // Save processed options to cache
          await chrome.storage.local.set({ dropdownOptions: processedOptions });
          this.initialized = true;

          return processedOptions;
        }
      } catch (sheetsError) {}

      // Fallback to default options with canonical tags
      const canonicalTags = await this.getCanonicalTags();
      const defaultWithCanonical = {
        ...this.defaultDropdownOptions,
        tags: canonicalTags
      };
      
      await chrome.storage.local.set({
        dropdownOptions: defaultWithCanonical,
      });
      this.initialized = true;

      return defaultWithCanonical;
    } catch (error) {
      // Return default options as fallback
      return this.defaultDropdownOptions;
    }
  }
}

// Create global instance
const cacheManager = new CacheManager();

// Auto-initialize when script loads
cacheManager.initialize().catch(() => {
  // Silent initialization failure
});
