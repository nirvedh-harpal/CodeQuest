/**
 * Google Sheets API Service for CodeQuest Extension
 * Handles all communication with Google Apps Script web app with cache-first approach
 */

class GoogleSheetsAPI {
  constructor() {
    this.webAppUrl = null;
    this.configLoaded = false;
    this.cacheManager = null;
  }

  async loadConfig() {
    try {
      const result = await chrome.storage.sync.get(["googleAppsScriptUrl"]);
      this.webAppUrl = result.googleAppsScriptUrl;
      this.configLoaded = true;

      // Initialize cache manager if not already done
      if (!this.cacheManager && typeof cacheManager !== "undefined") {
        this.cacheManager = cacheManager;
        await this.cacheManager.initialize();
      }
    } catch (error) {
      this.configLoaded = true; // Mark as loaded even on error
    }
  }

  async setWebAppUrl(url) {
    this.webAppUrl = url;
    await chrome.storage.sync.set({ googleAppsScriptUrl: url });

    // Pre-populate dropdown cache for faster first-time popup loading
    if (this.cacheManager) {
      try {
        await this.cacheManager.initialize();
        // Try to fetch dropdown options in background to cache them
        this.getDropdownOptions().catch((error) => {
          // Don't fail the configuration save if cache population fails
        });
      } catch (error) {
        // Cache initialization during setup failed
      }
    }
  }

  async ensureConfigLoaded() {
    if (!this.configLoaded) {
      await this.loadConfig();
    }
  }

  async makeRequest(data) {
    await this.ensureConfigLoaded();

    if (!this.webAppUrl) {
      throw new Error(
        "Google Apps Script URL not configured. Please set it in the options page."
      );
    }

    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(this.webAppUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();

          if (response.status >= 500 && attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }

          throw new Error(
            `HTTP error! status: ${response.status}. Response: ${errorText}`
          );
        }

        const result = await response.json();

        // More flexible success checking
        if (result.success === false) {
          throw new Error(result.message || "Request failed");
        }

        // If success is not explicitly false, treat as success
        // This handles cases where success property might be missing but operation worked
        if (result.success === undefined && result.message && !result.error) {
          return result.data || result;
        }

        return result.data || result;
      } catch (error) {
        if (error.name === "AbortError") {
          if (attempt < maxRetries) {
            continue;
          }
          throw new Error(
            "Request timed out after 30 seconds. Please check your internet connection and try again."
          );
        }

        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
          throw new Error(
            "Network error. Please check your internet connection and try again."
          );
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }

        throw error;
      }
    }
  }

  async saveQuestion(questionData) {
    try {
      if (
        !questionData ||
        !questionData.folder ||
        !(questionData.question || questionData.title)
      ) {
        throw new Error(
          "Invalid question data: folder and question are required"
        );
      }

      // Transform data to match new structure
      const enhancedData = {
        folder: questionData.folder || "",
        question: questionData.question || questionData.title || "",
        url: questionData.url || "", // Include the URL field
        pattern: Array.isArray(questionData.pattern)
          ? questionData.pattern.join(", ")
          : questionData.pattern || "",
        note: questionData.note || "",
        level: questionData.level || "Medium",
        tags: Array.isArray(questionData.tags)
          ? questionData.tags.join(", ")
          : questionData.tags || "",
        premium: questionData.premium || "No",
        revisionNeeded: questionData.revisionNeeded || "No",
      };

      // CACHE-ONLY APPROACH: Save to cache first, let background sync handle sheet sync
      if (this.cacheManager) {
        const cacheResult = await this.cacheManager.saveQuestionToCache(
          enhancedData
        );
        if (cacheResult.success) {
          return { success: true, cached: true, id: cacheResult.id };
        }
      }

      // Fallback to direct save only if cache completely fails (should be rare)
      return await this.makeRequest({
        action: "save",
        data: enhancedData,
      });
    } catch (error) {
      throw new Error(`Failed to save question: ${error.message}`);
    }
  }

  /**
   * Background sync method for cached questions
   */
  async syncQuestionToSheet(questionData, cacheId) {
    try {
      // Transform data to match sheet structure (same as saveQuestion method)
      const enhancedData = {
        folder: questionData.folder || "",
        question: questionData.question || questionData.title || "",
        url: questionData.url || "",
        pattern: Array.isArray(questionData.pattern)
          ? questionData.pattern.join(", ")
          : questionData.pattern || "",
        note: questionData.note || "",
        level: questionData.level || "Medium",
        tags: Array.isArray(questionData.tags)
          ? questionData.tags.join(", ")
          : questionData.tags || "",
        premium: questionData.premium || "No",
        revisionNeeded: questionData.revisionNeeded || "No",
      };

      await this.makeRequest({
        action: "save",
        data: enhancedData,
      });

      // Remove from cache after successful sync
      if (this.cacheManager && cacheId) {
        await this.cacheManager.removeFromPendingQueue(cacheId);
      }

      return { success: true };
    } catch (error) {
      // Keep in cache for later retry
      if (this.cacheManager && cacheId) {
        const pendingQuestions = await this.cacheManager.getPendingQuestions();
        const failedQuestion = pendingQuestions.find((q) => q.id === cacheId);
        if (failedQuestion) {
          await this.cacheManager.moveToFailedQueue(failedQuestion);
          await this.cacheManager.removeFromPendingQueue(cacheId);
        }
      }
      throw error;
    }
  }

  async getAllQuestions() {
    try {
      const result = await this.makeRequest({
        action: "getAll",
      });

      // makeRequest returns result.data || result, so we need to wrap it properly
      if (result && typeof result === "object") {
        // If result has questions property, it's the data we want
        if (result.questions) {
          return {
            success: true,
            data: result,
          };
        }
        // If result looks like it has success property already, return as is
        if (result.hasOwnProperty("success")) {
          return result;
        }
        // Otherwise, treat it as successful data
        return {
          success: true,
          data: result,
        };
      }

      // Fallback
      return {
        success: false,
        message: "Invalid response format",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getQuestions(folder) {
    try {
      if (!folder) {
        throw new Error("Folder name is required");
      }

      const result = await this.makeRequest({
        action: "get",
        folder: folder,
      });
      return result.questions || [];
    } catch (error) {
      throw new Error(
        `Failed to retrieve questions for folder "${folder}": ${error.message}`
      );
    }
  }

  async updateQuestion(questionData) {
    try {
      if (
        !questionData ||
        !questionData.folder ||
        !(questionData.question || questionData.title)
      ) {
        throw new Error(
          "Invalid question data: folder and question are required"
        );
      }

      // Transform data to match new structure
      const enhancedData = {
        ...questionData,
        question: questionData.question || questionData.title || "",
        pattern: Array.isArray(questionData.pattern)
          ? questionData.pattern.join(", ")
          : questionData.pattern || "",
        level: questionData.level || "Medium",
        tags: Array.isArray(questionData.tags)
          ? questionData.tags.join(", ")
          : questionData.tags || "",
        premium: questionData.premium || "No",
        revisionNeeded: questionData.revisionNeeded || "No",
      };

      return await this.makeRequest({
        action: "update",
        data: enhancedData,
      });
    } catch (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }
  }

  async deleteQuestion(questionData) {
    try {
      if (!questionData || !questionData.rowIndex) {
        throw new Error(
          "Invalid question data: rowIndex is required for deletion"
        );
      }

      return await this.makeRequest({
        action: "delete",
        data: questionData,
      });
    } catch (error) {
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  }

  async deleteFolder(folderName) {
    try {
      if (!folderName) {
        throw new Error("Folder name is required");
      }

      return await this.makeRequest({
        action: "deleteFolder",
        folder: folderName,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete folder "${folderName}": ${error.message}`
      );
    }
  }

  async isConfigured() {
    await this.ensureConfigLoaded();
    return !!this.webAppUrl;
  }

  async testConnection() {
    try {
      const result = await this.makeRequest({
        action: "getAll",
      });
      return { success: true, message: "Connection successful!" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getDropdownOptions() {
    try {
      // Try cache first for instant loading
      if (this.cacheManager) {
        const cachedOptions = await this.cacheManager.getDropdownOptions();

        // Return cached data immediately if available
        if (
          cachedOptions.folders.length > 0 ||
          cachedOptions.patterns.length > 0 ||
          cachedOptions.tags.length > 0
        ) {
          // Check if cache needs refresh and update in background
          const shouldRefresh =
            await this.cacheManager.shouldRefreshDropdownOptions();
          if (shouldRefresh) {
            this.refreshDropdownOptionsFromSheet().catch((error) => {
              // Background dropdown refresh failed
            });
          }

          return cachedOptions;
        }
      }

      // Fetch from sheet if cache is empty
      const result = await this.makeRequest({
        action: "getDropdownOptions",
      });

      // Update cache with fresh data
      if (this.cacheManager && result) {
        await this.cacheManager.updateDropdownOptions(result);
      }

      return result || { folders: [], patterns: [], tags: [] };
    } catch (error) {
      // Return cached data as fallback even if stale
      if (this.cacheManager) {
        const fallbackOptions = await this.cacheManager.getDropdownOptions();
        if (
          fallbackOptions.folders.length > 0 ||
          fallbackOptions.patterns.length > 0 ||
          fallbackOptions.tags.length > 0
        ) {
          return fallbackOptions;
        }
      }

      throw new Error(`Failed to get dropdown options: ${error.message}`);
    }
  }

  /**
   * Background refresh of dropdown options
   */
  async refreshDropdownOptionsFromSheet() {
    try {
      const result = await this.makeRequest({
        action: "getDropdownOptions",
      });

      if (this.cacheManager && result) {
        await this.cacheManager.updateDropdownOptions(result);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Force refresh dropdown options (used by refresh button)
   */
  async forceRefreshDropdownOptions() {
    try {
      // Clear cache first
      if (this.cacheManager) {
        await chrome.storage.local.remove(["dropdownOptions"]);
      }

      // Fetch fresh data
      const result = await this.makeRequest({
        action: "getDropdownOptions",
      });

      // Update cache by saving the result directly to storage
      if (this.cacheManager && result) {
        await chrome.storage.local.set({ dropdownOptions: result });
      }

      return result || { folders: [], patterns: [], tags: [] };
    } catch (error) {
      throw error;
    }
  }

  async initializeSheet() {
    try {
      const result = await this.makeRequest({
        action: "initializeSheet",
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to initialize sheet: ${error.message}`);
    }
  }

  async refreshDropdowns() {
    try {
      const result = await this.forceRefreshDropdownOptions();
      return result;
    } catch (error) {
      throw new Error(`Failed to refresh dropdowns: ${error.message}`);
    }
  }

  /**
   * Syncs all pending questions from cache to Google Sheets
   */
  async syncPendingQuestions() {
    if (!this.cacheManager) {
      return { success: false, error: "Cache manager not available" };
    }

    try {
      const pendingQuestions = await this.cacheManager.getPendingQuestions();
      if (pendingQuestions.length === 0) {
        return { success: true, processed: 0 };
      }

      let successCount = 0;
      let failureCount = 0;

      for (const question of pendingQuestions) {
        try {
          await this.syncQuestionToSheet(question, question.id);
          successCount++;
        } catch (error) {
          failureCount++;
        }
      }

      // Update sync status
      await this.cacheManager.updateSyncStatus({
        lastSync: Date.now(),
        consecutiveFailures: failureCount > 0 ? 1 : 0,
        needsSync: failureCount > 0,
      });

      return {
        success: true,
        processed: pendingQuestions.length,
        successful: successCount,
        failed: failureCount,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
const googleSheetsAPI = new GoogleSheetsAPI();
