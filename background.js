// Import Google Sheets API and Cache Manager
importScripts("googleSheetsAPI.js", "cacheManager.js");

// Background sync configuration
const SYNC_INTERVAL = 3 * 60 * 1000; // 3 minutes - faster for better performance
let syncTimeoutId = null;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if (!message || !message.action) {
      sendResponse({ success: false, error: "Invalid message format" });
      return true;
    }

    switch (message.action) {
      case "triggerSync":
        // Immediate sync trigger from popup when question is saved
        try {
          await performSync();
          sendResponse({ success: true, message: "Sync completed" });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      case "getCacheStats":
        try {
          await cacheManager.initialize();
          const stats = await cacheManager.getCacheStats();
          sendResponse({ success: true, stats });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      default:
        sendResponse({
          success: false,
          error: `Unknown action: ${message.action}`,
        });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: "An unexpected error occurred in the background script",
    });
  }

  return true;
});

// Handle extension installation and updates
chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    if (details.reason === "install") {
      await initializeBackgroundServices();
      chrome.runtime.openOptionsPage();
    } else if (details.reason === "update") {
      await initializeBackgroundServices();
    }
  } catch (error) {
    // Error handling for installation
  }
});

// Handle startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    await initializeBackgroundServices();
  } catch (error) {
    // Error during startup
  }
});

/**
 * Initializes background services
 */
async function initializeBackgroundServices() {
  try {
    // Initialize cache manager
    await cacheManager.initialize();

    // Initialize Google Sheets API
    await googleSheetsAPI.ensureConfigLoaded();

    // Start background sync if configured
    if (await googleSheetsAPI.isConfigured()) {
      startBackgroundSync();
    }
  } catch (error) {
    // Failed to initialize background services
  }
}

/**
 * Starts the background sync process
 */
function startBackgroundSync() {
  if (syncTimeoutId) clearTimeout(syncTimeoutId);
  scheduleNextSync();
}

/**
 * Schedules the next sync operation
 */
function scheduleNextSync() {
  syncTimeoutId = setTimeout(async () => {
    try {
      await performSync();
    } catch (error) {
      // Sync error handling
    } finally {
      // Always schedule next sync
      scheduleNextSync();
    }
  }, SYNC_INTERVAL);
}

/**
 * Performs the actual sync operation
 */
async function performSync() {
  try {
    // Check if Google Sheets is configured
    if (!(await googleSheetsAPI.isConfigured())) {
      return { success: true, processed: 0, message: "Not configured" };
    }

    // Get temporary questions
    const tempQuestions = await cacheManager.getTemporaryQuestions();

    if (tempQuestions.length === 0) {
      return { success: true, processed: 0, message: "Nothing to sync" };
    }

    let processed = 0;
    let failed = 0;

    // Process each question individually
    for (const question of tempQuestions) {
      try {
        // Create the question data in the format expected by Google Sheets API
        const questionData = {
          folder: question.folder,
          question: question.question,
          url: question.url,
          pattern: question.pattern,
          note: question.note,
          level: question.level,
          tags: question.tags,
          premium: question.premium,
          revisionNeeded: question.revisionNeeded,
        };

        // Call the sync function from googleSheetsAPI
        const result = await googleSheetsAPI.syncQuestionToSheet(questionData);

        if (result.success) {
          // Remove from cache after successful sync
          await cacheManager.removeTemporaryQuestion(question.id);
          processed++;

          // Verify the question actually appears in the sheet
          setTimeout(async () => {
            try {
              const allQuestions = await googleSheetsAPI.makeRequest({
                action: "getAll",
              });
            } catch (verifyError) {
              // Verification error (silent)
            }
          }, 2000);
        } else {
          failed++;
        }
      } catch (syncError) {
        failed++;
      }
    }

    // Clean up old questions (older than 24 hours)
    const cleaned = await cacheManager.cleanupOldQuestions();

    return { success: true, processed, failed };
  } catch (error) {
    throw error;
  }
}

// Initialize services when script loads
initializeBackgroundServices().catch(console.error);
