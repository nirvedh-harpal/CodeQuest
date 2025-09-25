document.addEventListener("DOMContentLoaded", async function () {
  // Toaster notification function
  function showToaster(message, type = "success") {
    // Remove any existing toaster
    const oldToaster = document.getElementById("cq-toaster");
    if (oldToaster) oldToaster.remove();

    const toaster = document.createElement("div");
    toaster.id = "cq-toaster";
    toaster.style.position = "fixed";
    toaster.style.top = "24px";
    toaster.style.right = "32px";
    toaster.style.zIndex = "9999";
    toaster.style.minWidth = "220px";
    toaster.style.maxWidth = "350px";
    toaster.style.padding = "14px 22px";
    toaster.style.borderRadius = "8px";
    toaster.style.fontSize = "1rem";
    toaster.style.boxShadow = "0 2px 12px rgba(0,0,0,0.12)";
    toaster.style.transition = "opacity 0.3s";
    toaster.style.opacity = "1";
    toaster.style.pointerEvents = "none";
    toaster.style.color = type === "error" ? "#721c24" : "#155724";
    toaster.style.background = type === "error" ? "#f8d7da" : "#d4edda";
    toaster.style.border =
      type === "error" ? "1px solid #f5c6cb" : "1px solid #c3e6cb";
    toaster.textContent = message;
    document.body.appendChild(toaster);
    setTimeout(() => {
      toaster.style.opacity = "0";
      setTimeout(() => toaster.remove(), 600);
    }, 3500);
  }
  try {
    const configSection = document.getElementById("configSection");
    const googleAppsScriptUrlInput = document.getElementById(
      "googleAppsScriptUrl"
    );
    const saveConfigButton = document.getElementById("saveConfig");
    const copyScriptButton = document.getElementById("copyScriptButton");
    const configStatus = document.getElementById("configStatus");

    // Check required elements exist
    if (!googleAppsScriptUrlInput || !saveConfigButton) {
      showError(
        "Critical error: Configuration elements not found. Please refresh the page."
      );
      return;
    }

    await loadConfiguration();

    // Fetch the Google Apps Script code from the file
    fetch("docs/google-apps-script.gs")
      .then((response) => response.text())
      .then((text) => {
        // Store the fetched content in a variable
        const GOOGLE_APPS_SCRIPT_CODE = text;

        // Copy script button functionality
        const copyScriptButton = document.getElementById("copyScriptButton");
        copyScriptButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
            showToaster(
              "Google Apps Script code copied to clipboard!",
              "success"
            );
          } catch (error) {
            // Fallback for browsers that don't support clipboard API
            const textarea = document.createElement("textarea");
            textarea.value = GOOGLE_APPS_SCRIPT_CODE;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            showToaster(
              "Google Apps Script code copied to clipboard!",
              "success"
            );
          }
        });
      })
      .catch((err) => console.error("Failed to load GAS code file: ", err));

    // Example success message function
    function showSuccess(message) {
      alert(message);
    }

    // Save configuration functionality
    saveConfigButton.addEventListener("click", async () => {
      const webAppUrl = googleAppsScriptUrlInput.value.trim();

      if (!webAppUrl) {
        showConfigStatus(
          "Please enter a Google Apps Script Web App URL",
          "error"
        );
        showToaster("Please enter a Google Apps Script Web App URL", "error");
        return;
      }

      // Basic URL validation
      if (!webAppUrl.startsWith("https://script.google.com/")) {
        showConfigStatus(
          "Please enter a valid Google Apps Script Web App URL (must start with https://script.google.com/)",
          "error"
        );
        showToaster(
          "Please enter a valid Google Apps Script Web App URL",
          "error"
        );
        return;
      }

      // Disable button during save
      saveConfigButton.disabled = true;
      saveConfigButton.textContent = "Saving...";

      try {
        try {
          // Save configuration to chrome storage
          await chrome.storage.sync.set({
            googleAppsScriptUrl: webAppUrl,
          });

          // Test the connection by setting the URL in googleSheetsAPI
          await googleSheetsAPI.setWebAppUrl(webAppUrl);

          showConfigStatus(
            "Testing connection and checking sheet status...",
            "success"
          );

          // Test if we can connect and check if sheet needs initialization
          try {
            const questionsResult = await googleSheetsAPI.getAllQuestions();
            const hasQuestions =
              questionsResult?.data?.questions &&
              Object.keys(questionsResult.data.questions).some(
                (folder) => questionsResult.data.questions[folder].length > 0
              );

            if (!hasQuestions) {
              showConfigStatus(
                "Sheet is empty. Initializing with headers and structure...",
                "success"
              );

              const initResult = await googleSheetsAPI.initializeSheet();
              if (
                initResult.success ||
                (!initResult.success && !initResult.message)
              ) {
                // Treat as success if success is true, or if no error message is present
                showConfigStatus(
                  "Configuration saved and sheet initialized successfully! You can now start saving questions.",
                  "success"
                );
              } else {
                // Only show error if there is a clear error message
                const errorMsg = initResult.message
                  ? initResult.message
                  : "Sheet initialization may have succeeded, but no confirmation was received.";
                showConfigStatus(
                  `Configuration saved, but sheet initialization failed: ${errorMsg}`,
                  "error"
                );
              }
            } else {
              showConfigStatus(
                " Configuration saved successfully! Sheet already has data.",
                "success"
              );
            }
          } catch (error) {
            showConfigStatus(
              "Configuration saved, but automatic initialization failed. You may need to initialize manually.",
              "error"
            );
          }
        } catch (error) {
          showConfigStatus(
            `Error saving configuration: ${error.message}`,
            "error"
          );
        }
      } catch (error) {
        showConfigStatus(
          "An unexpected error occurred while saving configuration.",
          "error"
        );
      } finally {
        // Re-enable button
        saveConfigButton.disabled = false;
        saveConfigButton.textContent = "Save Configuration";
      }
    });

    function showConfigStatus(message, type) {
      showToaster(message, type);
      // Only show toaster, do not show message below button
      showToaster(message, type);
    }

    async function loadConfiguration() {
      try {
        const result = await chrome.storage.sync.get(["googleAppsScriptUrl"]);
        if (result.googleAppsScriptUrl) {
          googleAppsScriptUrlInput.value = result.googleAppsScriptUrl;
          await googleSheetsAPI.setWebAppUrl(result.googleAppsScriptUrl);
        }
      } catch (error) {
        showError(
          "Failed to load configuration. Some features may not work properly."
        );
      }
    }

    function showError(message) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "alert alert-danger";
      errorDiv.style =
        "margin: 20px 0; padding: 15px; background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; border-radius: 4px;";
      errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
      configSection.insertAdjacentElement("afterend", errorDiv);

      // Remove after 10 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 10000);
    }

    function showSuccess(message) {
      const successDiv = document.createElement("div");
      successDiv.className = "alert alert-success";
      successDiv.style =
        "margin: 20px 0; padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; border-radius: 4px;";
      successDiv.innerHTML = `<strong>Success:</strong> ${message}`;
      configSection.insertAdjacentElement("afterend", successDiv);

      // Remove after 5 seconds
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.remove();
        }
      }, 5000);
    }
  } catch (error) {
    // Fallback error display
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #dc3545;">Error</h2>
        <p>A critical error occurred while loading the options page.</p>
        <p>Please refresh the page and try again.</p>
        <button onclick="location.reload()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
});
