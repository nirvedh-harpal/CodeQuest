document.addEventListener("DOMContentLoaded", async function () {
  try {
    showLoadingState();

    // Ensure configuration is loaded first
    await googleSheetsAPI.ensureConfigLoaded();
    const isConfigured = await googleSheetsAPI.isConfigured();

    if (!isConfigured) {
      showConfigurationRequired();
      return;
    }

    // Check if the current tab is a supported problem page
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        try {
          if (!tabs || tabs.length === 0) {
            showError("Unable to get current tab information.");
            return;
          }

          const url = tabs[0].url;
          const isProblemPage = isSupportedProblemPage(url);

          if (!isProblemPage) {
            showUnsupportedPage();
            return;
          }

          // Initialize interface with cache-first approach
          await initializeInterface(tabs[0]);
          hideLoadingState();
        } catch (error) {
          showError("An error occurred while initializing.");
        }
      }
    );
  } catch (error) {
    showError("An error occurred while loading the extension.");
  }

  async function initializeInterface(currentTab) {
    try {
      // Load dropdown options from cache first (instant)
      const options = await cacheManager.getDropdownOptions();

      // Initialize multi-select dropdowns immediately
      initializeDropdowns(options);

      // Setup event listeners
      setupEventListeners(currentTab);

      // Automatically populate if enabled (no button needed)
      await attemptAutoPopulate(currentTab);

      // Get current page title
      // Get current page title
      chrome.tabs.sendMessage(
        currentTab.id,
        { action: "getTitle" },
        function (response) {
          const questionTitleInput = document.getElementById("questionTitle");
          if (
            !chrome.runtime.lastError &&
            response?.title &&
            questionTitleInput
          ) {
            questionTitleInput.value = response.title;
          }
        }
      );
    } catch (error) {
      showError("Failed to load interface options.");
    }
  }

  function initializeDropdowns(options) {
    // Initialize folder dropdown with search
    window.folderDropdown = new MultiSelectDropdown("folderDropdown", {
      placeholder: "Search folders or type to create new...",
      items: options.folders || [],
      allowCustom: true,
      maxHeight: "120px",
      multiSelect: false, // Single select for folders
    });

    // Initialize pattern dropdown
    window.patternDropdown = new MultiSelectDropdown("patternDropdown", {
      placeholder: "Select patterns or type new ones...",
      items: options.patterns || [],
      allowCustom: true,
      maxHeight: "120px",
    });

    // Initialize tags dropdown
    window.tagsDropdown = new MultiSelectDropdown("tagsDropdown", {
      placeholder: "Select tags or type new ones...",
      items: options.tags || [],
      allowCustom: true,
      maxHeight: "120px",
    });
  }

  function updateDropdowns(options) {
    // Update folder dropdown
    if (window.folderDropdown) {
      window.folderDropdown.updateItems(options.folders || []);
    }

    // Update pattern dropdown
    if (window.patternDropdown) {
      window.patternDropdown.updateItems(options.patterns || []);
    }

    // Update tags dropdown
    if (window.tagsDropdown) {
      window.tagsDropdown.updateItems(options.tags || []);
    }
  }

  async function attemptAutoPopulate(currentTab) {
    try {
      // Check if auto-populate is enabled
      const result = await chrome.storage.sync.get(["autoPopulateSettings"]);
      const settings = result.autoPopulateSettings || { enableAutopopulate: false };
      
      if (settings.enableAutopopulate && isAutoPopulateSupportedSite(currentTab.url)) {
        setTimeout(async () => {
          await handleAutoPopulate(currentTab, settings);
        }, 500);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  function isAutoPopulateSupportedSite(url) {
    const supportedSites = [
      "https://leetcode.com",
      "https://codeforces.com",
      "https://www.geeksforgeeks.org",
      "https://www.interviewbit.com",
      "https://www.codechef.com"
    ];
    
    return supportedSites.some(site => url.startsWith(site));
  }

  async function handleAutoPopulate(currentTab, settings) {
    try {
      // Send message to content script to extract data
      chrome.tabs.sendMessage(
        currentTab.id,
        { 
          action: "getAutoPopulateData",
          settings: settings
        },
        function (response) {
          try {
            if (!chrome.runtime.lastError && response?.success && response.data) {
              const { tags, difficulty, rating } = response.data;
              
              // Populate tags if available
              if (tags && tags.length > 0 && window.tagsDropdown) {
                window.tagsDropdown.clear();
                window.tagsDropdown.setValues(tags);
              }
              
              // Populate difficulty if available
              if ((difficulty || rating) && document.getElementById("level")) {
                let finalDifficulty = difficulty;
                
                // If we have rating but no difficulty, map it
                if (!difficulty && rating && settings) {
                  finalDifficulty = mapRatingToDifficulty(rating, settings, currentTab.url);
                }
                
                if (finalDifficulty) {
                  // Map difficulty to our values
                  const difficultyMapping = {
                    "Easy": "Easy", "Medium": "Medium", "Hard": "Hard",
                    "easy": "Easy", "medium": "Medium", "hard": "Hard",
                    "EASY": "Easy", "MEDIUM": "Medium", "HARD": "Hard"
                  };
                  
                  const mappedDifficulty = difficultyMapping[finalDifficulty] || finalDifficulty;
                  
                  if (["Easy", "Medium", "Hard"].includes(mappedDifficulty)) {
                    const difficultySelect = document.getElementById("level");
                    difficultySelect.value = mappedDifficulty;
                    
                    // Trigger change event
                    const changeEvent = new Event('change', { bubbles: true });
                    difficultySelect.dispatchEvent(changeEvent);
                  }
                }
              }
              
              showToast(successMessage, "success");
              
            } else if (chrome.runtime.lastError) {
              // Silent error handling
            }
          } catch (error) {
            // Silent error handling
          }
        }
      );
      
    } catch (error) {
      // Silent error handling
    }
  }

  function mapRatingToDifficulty(rating, settings, url) {
    if (!rating || !settings) {
      return "";
    }
    
    let easyMax, mediumMax;
    
    // Use platform-specific settings if available
    if (url.includes("codeforces.com")) {
      easyMax = settings.codeforcesEasyMax || settings.easyMaxRating || 1200;
      mediumMax = settings.codeforcesMediumMax || settings.mediumMaxRating || 1800;
    } else if (url.includes("codechef.com")) {
      easyMax = settings.codechefEasyMax || settings.easyMaxRating || 1200;
      mediumMax = settings.codechefMediumMax || settings.mediumMaxRating || 1800;
    } else {
      // Fallback to general settings
      easyMax = settings.easyMaxRating || 1200;
      mediumMax = settings.mediumMaxRating || 1800;
    }
    
    let result;
    if (rating <= easyMax) {
      result = "Easy";
    } else if (rating <= mediumMax) {
      result = "Medium";
    } else {
      result = "Hard";
    }
    
    return result;
  }

  async function loadDropdownOptionsFromCache() {
    try {
      // Use new cache manager for dropdown options
      const options = await cacheManager.getDropdownOptions();

      return options;
    } catch (error) {
      // Return empty options as fallback
      return { folders: [], patterns: [], tags: [] };
    }
  }

  function setupEventListeners(currentTab) {
    // Settings button handler
    const settingsButton = document.getElementById("settingsButton");
    settingsButton.addEventListener("click", function () {
      chrome.runtime.openOptionsPage();
      window.close();
    });

    // Save button handler
    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async function (event) {
      event.preventDefault();
      await handleSaveClick(this, currentTab);
    });

    // Refresh dropdowns button handler
    const refreshDropdownsButton = document.getElementById(
      "refreshDropdownsButton"
    );
    refreshDropdownsButton.addEventListener("click", async function () {
      try {
        refreshDropdownsButton.disabled = true;
        refreshDropdownsButton.innerHTML =
          '<i class="bi bi-arrow-clockwise" style="padding-right: 7px;"></i> Refreshing...';

        // Clear cache first
        await chrome.storage.local.remove(["dropdownOptions"]);

        // Force refresh from Google Sheets directly
        const newOptions = await googleSheetsAPI.forceRefreshDropdownOptions();

        // Update the dropdowns with fresh data
        await updateDropdowns(newOptions);

        refreshDropdownsButton.innerHTML =
          '<i class="bi bi-check-lg" style="padding-right: 7px;"></i> Refreshed!';
        setTimeout(() => {
          refreshDropdownsButton.innerHTML =
            '<i class="bi bi-arrow-clockwise" style="padding-right: 7px;"></i> Refresh Dropdowns';
          refreshDropdownsButton.disabled = false;
        }, 2000);
      } catch (error) {
        refreshDropdownsButton.innerHTML =
          '<i class="bi bi-x-lg" style="padding-right: 7px;"></i> Error';
        setTimeout(() => {
          refreshDropdownsButton.innerHTML =
            '<i class="bi bi-arrow-clockwise" style="padding-right: 7px;"></i> Refresh Dropdowns';
          refreshDropdownsButton.disabled = false;
        }, 2000);
      }
    });

    // Clear cache button handler
    const clearCacheButton = document.getElementById("clearCacheButton");
    clearCacheButton.addEventListener("click", async function () {
      try {
        const confirmed = confirm(
          "Are you sure you want to clear all cached data? This will remove cached dropdown options and temporary questions."
        );
        if (!confirmed) return;

        clearCacheButton.disabled = true;
        clearCacheButton.innerHTML =
          '<i class="bi bi-trash" style="padding-right: 7px;"></i> Clearing...';

        const success = await cacheManager.clearCache();

        if (success) {
          clearCacheButton.innerHTML =
            '<i class="bi bi-check-lg" style="padding-right: 7px;"></i> Cleared!';

          // Reset dropdowns to default options
          const defaultOptions = {
            folders: [],
            patterns: [],
            tags: [],
          };
          await updateDropdowns(defaultOptions);

          setTimeout(() => {
            clearCacheButton.innerHTML =
              '<i class="bi bi-trash" style="padding-right: 7px;"></i> Clear Cache';
            clearCacheButton.disabled = false;
          }, 2000);
        } else {
          clearCacheButton.innerHTML =
            '<i class="bi bi-x-lg" style="padding-right: 7px;"></i> Error';
          setTimeout(() => {
            clearCacheButton.innerHTML =
              '<i class="bi bi-trash" style="padding-right: 7px;"></i> Clear Cache';
            clearCacheButton.disabled = false;
          }, 2000);
        }
      } catch (error) {
        clearCacheButton.innerHTML =
          '<i class="bi bi-x-lg" style="padding-right: 7px;"></i> Error';
        setTimeout(() => {
          clearCacheButton.innerHTML =
            '<i class="bi bi-trash" style="padding-right: 7px;"></i> Clear Cache';
          clearCacheButton.disabled = false;
        }, 2000);
      }
    });
  }

  async function handleSaveClick(saveButton, currentTab) {
    if (saveButton.disabled) return;

    try {
      saveButton.disabled = true;
      saveButton.textContent = "Saving...";

      const formData = getFormData();

      const validationResult = validateFormData(formData);

      if (!validationResult.valid) {
        alert(validationResult.message);
        return;
      }

      // Add current URL to the form data
      formData.url = currentTab.url;

      // Save using new cache system for instant feedback
      const result = await cacheManager.saveQuestionToCache(formData);

      if (result.success) {
        showToast("Question saved !", "success");

        // Close popup after a brief delay to show the toast
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (error) {
      showToast(`Failed to save question: ${error.message}`, "error");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Save Question";
    }
  }

  function getFormData() {
    // Get folder from the folder dropdown (now optional)
    const folderValues = window.folderDropdown
      ? window.folderDropdown.getValues()
      : [];
    const folder = folderValues.length > 0 ? folderValues[0] : "General"; // Default to "General" if no folder selected

    return {
      folder: folder,
      question: document.getElementById("questionTitle").value.trim(),
      pattern: window.patternDropdown ? window.patternDropdown.getValues() : [],
      note: document.getElementById("note").value.trim(),
      level: document.getElementById("level").value,
      tags: window.tagsDropdown ? window.tagsDropdown.getValues() : [],
      premium: document.getElementById("premium").checked ? "Yes" : "No",
      revisionNeeded: document.getElementById("revisionNeeded").checked
        ? "Yes"
        : "No",
    };
  }

  function validateFormData(data) {
    if (!data.question) {
      return { valid: false, message: "Question title is required." };
    }
    return { valid: true };
  }

  // Helper functions
  function isSupportedProblemPage(url) {
    const supportedPlatforms = [
      { pattern: /^https:\/\/leetcode\.com\/problems\//, name: "LeetCode" },
      { pattern: /^https:\/\/atcoder\.jp\/contests\/[^\/]+\/tasks\//, name: "AtCoder" },
      { pattern: /^https:\/\/codeforces\.com\/(problemset\/problem|contest\/\d+\/problem)\//, name: "Codeforces" },
      { pattern: /^https:\/\/www\.interviewbit\.com\/problems\//, name: "InterviewBit" },
      { pattern: /^https:\/\/www\.hackerrank\.com\/challenges\//, name: "HackerRank" },
      { pattern: /^https:\/\/www\.geeksforgeeks\.org\/problems\//, name: "GeeksforGeeks" },
      { pattern: /^https:\/\/www\.codechef\.com\/(problems\/|ide)/, name: "CodeChef" }
    ];

    return supportedPlatforms.some(platform => platform.pattern.test(url));
  }

  function showLoadingState() {
    const loadingOverlay = document.createElement("div");
    loadingOverlay.id = "codequest-loading-overlay";
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    loadingOverlay.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 10px; font-size: 16px; font-weight: 500;">Loading...</div>
        <div style="color: #666; font-size: 12px;">Initializing CodeQuest Extension</div>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  }

  function hideLoadingState() {
    const loadingOverlay = document.getElementById("codequest-loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }

  function showError(message) {
    hideLoadingState();
    const errorOverlay = document.createElement("div");
    errorOverlay.id = "codequest-error-overlay";
    errorOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    errorOverlay.innerHTML = `
      <div style="padding: 20px; text-align: center; max-width: 350px;">
        <h3 style="color: #dc3545; margin-bottom: 10px;">Error</h3>
        <p style="margin-bottom: 15px; color: #333;">${message}</p>
        <button onclick="window.close()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(errorOverlay);
  }

  function showConfigurationRequired() {
    hideLoadingState();
    const configOverlay = document.createElement("div");
    configOverlay.id = "codequest-config-overlay";
    configOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    configOverlay.innerHTML = `
      <div style="padding: 20px; text-align: center; max-width: 350px;">
        <h3 style="color: #ffc107; margin-bottom: 10px;">Configuration Required</h3>
        <p style="margin-bottom: 15px; color: #333;">Google Apps Script URL not configured. Please set it in the options page.</p>
        <div>
          <button id="configureBtn" style="margin: 5px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Configure
          </button>
          <button onclick="window.close()" style="margin: 5px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(configOverlay);

    document
      .getElementById("configureBtn")
      .addEventListener("click", function () {
        chrome.runtime.openOptionsPage();
        window.close();
      });
  }

  function showUnsupportedPage() {
    hideLoadingState();
    const unsupportedOverlay = document.createElement("div");
    unsupportedOverlay.id = "codequest-unsupported-overlay";
    unsupportedOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    unsupportedOverlay.innerHTML = `
      <div style="padding: 20px; text-align: center; max-width: 350px;">
        <h3 style="color: #2563eb; margin-bottom: 10px; font-weight: 600;">Unsupported Page</h3>
        <p style="margin-bottom: 10px; color: #1f2937; font-weight: 500;">This extension works on:</p>
        <ul style="text-align: left; margin: 10px 0; padding-left: 20px; color: #1f2937; font-weight: 500;">
          <li>LeetCode</li>
          <li>AtCoder</li>
          <li>Codeforces</li>
          <li>InterviewBit</li>
          <li>HackerRank</li>
          <li>GeeksforGeeks</li>
          <li>CodeChef</li>
        </ul>
        <div style="margin-top: 15px;">
          <button id="settingsBtn" style="margin: 5px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
            Go to Settings
          </button>
          <button id="closeBtn" style="margin: 5px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(unsupportedOverlay);

    document.getElementById("closeBtn").addEventListener("click", function () {
      window.close();
    });

    document
      .getElementById("settingsBtn")
      .addEventListener("click", function () {
        chrome.runtime.openOptionsPage();
        window.close();
      });
  }

  function showToast(message, type = "info") {
    // Remove any existing toast
    const existingToast = document.getElementById("codequest-toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = "codequest-toast";
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease-out;
      ${
        type === "success"
          ? "background: #28a745; color: white;"
          : type === "error"
          ? "background: #dc3545; color: white;"
          : "background: #007bff; color: white;"
      }
    `;

    toast.textContent = message;
    document.body.appendChild(toast);

    // Add animation keyframes if not already added
    if (!document.getElementById("toast-animations")) {
      const style = document.createElement("style");
      style.id = "toast-animations";
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto remove after 2 seconds
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (toast && toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, 2000);
  }
});
