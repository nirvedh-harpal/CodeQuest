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
    const defaultFolderNameInput = document.getElementById("defaultFolderName");
    const saveConfigButton = document.getElementById("saveConfig");
    const copyScriptButton = document.getElementById("copyScriptButton");
    const configStatus = document.getElementById("configStatus");

    // Check required elements exist
    if (!googleAppsScriptUrlInput || !defaultFolderNameInput || !saveConfigButton) {
      showError(
        "Critical error: Configuration elements not found. Please refresh the page."
      );
      return;
    }

    await loadConfiguration();

    // Load auto-populate settings
    await loadAutoPopulateSettings();

    // Load and setup tag mapping management
    await setupTagMappingManagement();

    // Add page unload handler to restore temporarily removed mappings
    window.addEventListener('beforeunload', async () => {
      if (temporarilyRemovedMapping) {
        try {
          await tagMapper.addTagMapping(temporarilyRemovedMapping.canonical, temporarilyRemovedMapping.variants);
        } catch (error) {
          // Silent error handling
        }
      }
    });

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
      .catch((err) => {});

    // Example success message function
    function showSuccess(message) {
      alert(message);
    }

    // Save configuration functionality
    saveConfigButton.addEventListener("click", async () => {
      const webAppUrl = googleAppsScriptUrlInput.value.trim();
      const defaultFolder = defaultFolderNameInput.value.trim() || "root";

      if (!webAppUrl) {
        showConfigStatus(
          "Please enter a Google Apps Script Web App URL",
          "error"
        );
        showToaster("Please enter a Google Apps Script Web App URL", "error");
        return;
      }

      // Validate default folder name
      if (!defaultFolder || defaultFolder.length === 0) {
        showConfigStatus(
          "Default folder name cannot be empty",
          "error"
        );
        showToaster("Default folder name cannot be empty", "error");
        return;
      }

      // Check for invalid characters in folder name
      const invalidChars = /[\/\\:*?"<>|]/;
      if (invalidChars.test(defaultFolder)) {
        showConfigStatus(
          "Default folder name contains invalid characters. Avoid: / \\ : * ? \" < > |",
          "error"
        );
        showToaster("Default folder name contains invalid characters", "error");
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
            defaultFolder: defaultFolder,
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
                  `Configuration saved and sheet initialized successfully! Default folder set to '${defaultFolder}'. You can now start saving questions.`,
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
                ` Configuration saved successfully! Default folder set to '${defaultFolder}'. Sheet already has data.`,
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

    // Save auto-populate settings functionality
    const saveAutoPopulateButton = document.getElementById("saveAutoPopulateSettings");
    const enableAutopopulate = document.getElementById("enableAutopopulate");
    const codeforcesEasyMax = document.getElementById("codeforcesEasyMax");
    const codeforcesMediumMax = document.getElementById("codeforcesMediumMax");
    const codechefEasyMax = document.getElementById("codechefEasyMax");
    const codechefMediumMax = document.getElementById("codechefMediumMax");

    saveAutoPopulateButton.addEventListener("click", async () => {
      const settings = {
        enableAutopopulate: enableAutopopulate.checked,
        codeforcesEasyMax: parseInt(codeforcesEasyMax.value) || 1200,
        codeforcesMediumMax: parseInt(codeforcesMediumMax.value) || 1800,
        codechefEasyMax: parseInt(codechefEasyMax.value) || 1200,
        codechefMediumMax: parseInt(codechefMediumMax.value) || 1800
      };

      // Validation for Codeforces
      if (settings.codeforcesEasyMax >= settings.codeforcesMediumMax) {
        showToaster("Codeforces Easy max rating must be less than Medium max rating", "error");
        return;
      }

      // Validation for CodeChef
      if (settings.codechefEasyMax >= settings.codechefMediumMax) {
        showToaster("CodeChef Easy max rating must be less than Medium max rating", "error");
        return;
      }

      try {
        // Save to chrome storage
        await chrome.storage.sync.set({ autoPopulateSettings: settings });
        showToaster("Auto-populate settings saved successfully!", "success");
      } catch (error) {
        showToaster("Failed to save auto-populate settings", "error");
      }
    });

    function showConfigStatus(message, type) {
      showToaster(message, type);
      // Only show toaster, do not show message below button
      showToaster(message, type);
    }

    async function loadConfiguration() {
      try {
        const result = await chrome.storage.sync.get(["googleAppsScriptUrl", "defaultFolder"]);
        if (result.googleAppsScriptUrl) {
          googleAppsScriptUrlInput.value = result.googleAppsScriptUrl;
          await googleSheetsAPI.setWebAppUrl(result.googleAppsScriptUrl);
        }
        if (result.defaultFolder) {
          defaultFolderNameInput.value = result.defaultFolder;
        }
      } catch (error) {
        showError(
          "Failed to load configuration. Some features may not work properly."
        );
      }
    }

    async function loadAutoPopulateSettings() {
      try {
        const result = await chrome.storage.sync.get(["autoPopulateSettings"]);
        const settings = result.autoPopulateSettings || {
          enableAutopopulate: false,
          codeforcesEasyMax: 1200,
          codeforcesMediumMax: 1800,
          codechefEasyMax: 1200,
          codechefMediumMax: 1800
        };

        document.getElementById("enableAutopopulate").checked = settings.enableAutopopulate;
        document.getElementById("codeforcesEasyMax").value = settings.codeforcesEasyMax;
        document.getElementById("codeforcesMediumMax").value = settings.codeforcesMediumMax;
        document.getElementById("codechefEasyMax").value = settings.codechefEasyMax;
        document.getElementById("codechefMediumMax").value = settings.codechefMediumMax;
      } catch (error) {
        // Use default values if loading fails
        document.getElementById("enableAutopopulate").checked = false;
        document.getElementById("codeforcesEasyMax").value = 1200;
        document.getElementById("codeforcesMediumMax").value = 1800;
        document.getElementById("codechefEasyMax").value = 1200;
        document.getElementById("codechefMediumMax").value = 1800;
      }
    }

    // Global variable to store temporarily removed mapping
    let temporarilyRemovedMapping = null;

    async function setupTagMappingManagement() {
      // Initialize tag mapper
      await tagMapper.initialize();
      
      // Load initial display
      await refreshTagMappingsDisplay();
      await populateDropdowns();
      
      // Setup event listeners for new UI
      setupAddNewMappingSection();
      setupUpdateMappingSection();
      setupRemoveMappingSection();
      setupManagementButtons();
    }

    function setupAddNewMappingSection() {
      const addButton = document.getElementById("addNewMappingButton");
      const canonicalInput = document.getElementById("newCanonicalTagInput");
      const variantsInput = document.getElementById("newTagVariantsInput");

      addButton.addEventListener("click", async () => {
        const canonical = canonicalInput.value.trim().toLowerCase();
        const variantsText = variantsInput.value.trim();
        
        if (!canonical) {
          showToaster("Please enter a canonical tag form", "error");
          return;
        }
        
        if (!variantsText) {
          showToaster("Please enter tag variants", "error");
          return;
        }

        // Check if mapping already exists
        const existingMap = tagMapper.getTagMap();
        if (existingMap[canonical]) {
          showToaster("Mapping already exists! Use the Update section to modify it.", "error");
          return;
        }
        
        const variants = variantsText.split(',').map(v => v.trim()).filter(v => v);
        
        try {
          addButton.disabled = true;
          addButton.textContent = "Adding...";
          
          const result = await tagMapper.addTagMapping(canonical, variants);
          
          if (result.success) {
            showToaster("New tag mapping added successfully!", "success");
            canonicalInput.value = "";
            variantsInput.value = "";
            
            setTimeout(async () => {
              await refreshTagMappingsDisplay();
              await populateDropdowns();
            }, 100);
          } else {
            showToaster("Failed to add tag mapping: " + result.error, "error");
          }
        } catch (error) {
          showToaster("Error adding tag mapping", "error");
        } finally {
          addButton.disabled = false;
          addButton.textContent = "✓ Add New Mapping";
        }
      });
    }

    function setupUpdateMappingSection() {
      const selectDropdown = document.getElementById("updateMappingSelect");
      const canonicalInput = document.getElementById("updateCanonicalInput");
      const variantsInput = document.getElementById("updateTagVariantsInput");
      const updateButton = document.getElementById("updateMappingButton");

      // Handle dropdown selection
      selectDropdown.addEventListener("change", async () => {
        const selectedCanonical = selectDropdown.value;
        
        if (!selectedCanonical) {
          canonicalInput.disabled = true;
          canonicalInput.value = "";
          variantsInput.disabled = true;
          variantsInput.value = "";
          updateButton.disabled = true;
          
          // Restore temporarily removed mapping if user deselects
          if (temporarilyRemovedMapping) {
            await restoreTemporaryMapping();
          }
          return;
        }

        try {
          // Get current mapping
          const tagMap = tagMapper.getTagMap();
          const variants = tagMap[selectedCanonical];
          
          if (!variants) {
            showToaster("Selected mapping not found", "error");
            return;
          }

          // Store temporarily removed mapping
          temporarilyRemovedMapping = {
            canonical: selectedCanonical,
            variants: variants
          };

          // Temporarily remove from display (but not from storage yet)
          await temporaryRemoveMapping(selectedCanonical);
          
          // Populate inputs
          canonicalInput.value = selectedCanonical;
          canonicalInput.disabled = false;
          variantsInput.value = variants.join(', ');
          variantsInput.disabled = false;
          updateButton.disabled = false;
          
          showToaster(`Mapping for "${selectedCanonical}" temporarily removed. Update or reload to restore.`, "info");
          
        } catch (error) {
          showToaster("Error loading mapping for update", "error");
        }
      });

      // Handle update button click
      updateButton.addEventListener("click", async () => {
        const selectedOriginalCanonical = selectDropdown.value;
        const newCanonical = canonicalInput.value.trim().toLowerCase();
        const newVariantsText = variantsInput.value.trim();
        
        if (!selectedOriginalCanonical || !newCanonical || !newVariantsText) {
          showToaster("Please select a mapping and enter both canonical form and variants", "error");
          return;
        }
        
        const newVariants = newVariantsText.split(',').map(v => v.trim()).filter(v => v);
        
        if (newVariants.length === 0) {
          showToaster("Please enter at least one variant", "error");
          return;
        }

        // Check if new canonical form already exists (and it's different from original)
        if (newCanonical !== selectedOriginalCanonical) {
          const existingMap = tagMapper.getTagMap();
          if (existingMap[newCanonical]) {
            showToaster("New canonical form already exists! Choose a different name.", "error");
            return;
          }
        }

        try {
          updateButton.disabled = true;
          updateButton.textContent = "Updating...";
          
          // First permanently remove the old mapping
          await tagMapper.removeTagMapping(selectedOriginalCanonical);
          
          // Then add the new mapping with potentially new canonical form
          const result = await tagMapper.addTagMapping(newCanonical, newVariants);
          
          if (result.success) {
            showToaster("Tag mapping updated successfully!", "success");
            
            // Clear temporary state
            temporarilyRemovedMapping = null;
            selectDropdown.value = "";
            canonicalInput.value = "";
            canonicalInput.disabled = true;
            variantsInput.value = "";
            variantsInput.disabled = true;
            updateButton.disabled = true;
            
            setTimeout(async () => {
              await refreshTagMappingsDisplay();
              await populateDropdowns();
            }, 100);
          } else {
            showToaster("Failed to update mapping: " + result.error, "error");
            // Restore the temporarily removed mapping on failure
            await restoreTemporaryMapping();
          }
        } catch (error) {
          showToaster("Error updating tag mapping", "error");
          await restoreTemporaryMapping();
        } finally {
          updateButton.disabled = false;
          updateButton.textContent = "Update Mapping";
        }
      });
    }

    function setupRemoveMappingSection() {
      const selectDropdown = document.getElementById("removeMappingSelect");
      const removeButton = document.getElementById("removeMappingButton");

      selectDropdown.addEventListener("change", () => {
        removeButton.disabled = !selectDropdown.value;
      });

      removeButton.addEventListener("click", async () => {
        const selectedCanonical = selectDropdown.value;
        
        if (!selectedCanonical) {
          showToaster("Please select a mapping to remove", "error");
          return;
        }
        
        const confirmed = confirm(`Are you sure you want to permanently remove the mapping for "${selectedCanonical}"?`);
        if (!confirmed) return;
        
        try {
          removeButton.disabled = true;
          removeButton.textContent = "Removing...";
          
          const result = await tagMapper.removeTagMapping(selectedCanonical);
          
          if (result.success) {
            showToaster("Tag mapping removed successfully!", "success");
            selectDropdown.value = "";
            removeButton.disabled = true;
            
            setTimeout(async () => {
              await refreshTagMappingsDisplay();
              await populateDropdowns();
            }, 100);
          } else {
            showToaster("Failed to remove tag mapping: " + result.error, "error");
          }
        } catch (error) {
          showToaster("Error removing tag mapping", "error");
        } finally {
          removeButton.disabled = false;
          removeButton.textContent = "Remove";
        }
      });
    }

    function setupManagementButtons() {
      const refreshButton = document.getElementById("refreshTagMappingsButton");
      const resetButton = document.getElementById("resetTagMappingsButton");

      refreshButton.addEventListener("click", async () => {
        // Restore any temporarily removed mapping before refresh
        if (temporarilyRemovedMapping) {
          await restoreTemporaryMapping();
        }
        
        await refreshTagMappingsDisplay();
        await populateDropdowns();
        showToaster("Tag mappings refreshed", "success");
      });

      resetButton.addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to reset all tag mappings to defaults? This will remove any custom mappings you've added.");
        if (!confirmed) return;
        
        try {
          resetButton.disabled = true;
          resetButton.textContent = "Resetting...";
          
          const result = await tagMapper.resetToDefault();
          
          if (result.success) {
            showToaster("Tag mappings reset to defaults successfully!", "success");
            temporarilyRemovedMapping = null;
            
            // Clear all inputs
            document.getElementById("newCanonicalTagInput").value = "";
            document.getElementById("newTagVariantsInput").value = "";
            document.getElementById("updateMappingSelect").value = "";
            document.getElementById("updateCanonicalInput").value = "";
            document.getElementById("updateCanonicalInput").disabled = true;
            document.getElementById("updateTagVariantsInput").value = "";
            document.getElementById("updateTagVariantsInput").disabled = true;
            document.getElementById("updateMappingButton").disabled = true;
            document.getElementById("removeMappingSelect").value = "";
            document.getElementById("removeMappingButton").disabled = true;
            
            setTimeout(async () => {
              await refreshTagMappingsDisplay();
              await populateDropdowns();
            }, 100);
          } else {
            showToaster("Failed to reset tag mappings: " + result.error, "error");
          }
        } catch (error) {
          showToaster("Error resetting tag mappings", "error");
        } finally {
          resetButton.disabled = false;
          resetButton.textContent = "Reset to Defaults";
        }
      });
    }

    async function populateDropdowns() {
      const updateSelect = document.getElementById("updateMappingSelect");
      const removeSelect = document.getElementById("removeMappingSelect");
      
      try {
        const tagMap = tagMapper.getTagMap();
        const sortedMappings = Object.entries(tagMap).sort();
        
        // Clear existing options (except the default ones)
        updateSelect.innerHTML = '<option value="">-- Select a mapping --</option>';
        removeSelect.innerHTML = '<option value="">-- Select a mapping to remove --</option>';
        
        // Add options for each mapping
        sortedMappings.forEach(([canonical, variants]) => {
          const variantsPreview = variants.slice(0, 3).join(', ') + (variants.length > 3 ? '...' : '');
          
          const updateOption = document.createElement('option');
          updateOption.value = canonical;
          updateOption.textContent = `${canonical} → ${variantsPreview}`;
          updateSelect.appendChild(updateOption);
          
          const removeOption = document.createElement('option');
          removeOption.value = canonical;
          removeOption.textContent = `${canonical} → ${variantsPreview}`;
          removeSelect.appendChild(removeOption);
        });
        
      } catch (error) {
        // Silent error handling
      }
    }

    async function temporaryRemoveMapping(canonical) {
      // This just updates the display, not the actual storage
      const displayDiv = document.getElementById("tagMappingsDisplay");
      const currentHTML = displayDiv.innerHTML;
      
      // Create a temporary display that excludes the selected mapping
      const tagMap = tagMapper.getTagMap();
      const tempMap = { ...tagMap };
      delete tempMap[canonical];
      
      await displayMappings(tempMap);
    }

    async function restoreTemporaryMapping() {
      if (!temporarilyRemovedMapping) return;
      
      try {
        // Re-add the temporarily removed mapping
        await tagMapper.addTagMapping(temporarilyRemovedMapping.canonical, temporarilyRemovedMapping.variants);
        
        // Clear temporary state
        temporarilyRemovedMapping = null;
        
        // Reset update section UI
        document.getElementById("updateMappingSelect").value = "";
        document.getElementById("updateCanonicalInput").value = "";
        document.getElementById("updateCanonicalInput").disabled = true;
        document.getElementById("updateTagVariantsInput").value = "";
        document.getElementById("updateTagVariantsInput").disabled = true;
        document.getElementById("updateMappingButton").disabled = true;
        
        // Refresh display
        await refreshTagMappingsDisplay();
        await populateDropdowns();
        
        showToaster("Temporarily removed mapping restored", "info");
      } catch (error) {
        // Silent error handling
      }
    }

    async function displayMappings(mappings) {
      const displayDiv = document.getElementById("tagMappingsDisplay");
      const sortedMappings = Object.entries(mappings).sort();
      
      if (sortedMappings.length === 0) {
        displayDiv.innerHTML = '<p style="color: #666;">No tag mappings found.</p>';
        return;
      }
      
      let html = '<div style="font-size: 14px;">';
      sortedMappings.forEach(([canonical, variants]) => {
        const variantsText = Array.isArray(variants) ? variants.join(', ') : variants.toString();
        html += `
          <div class="tag-mapping-item" 
               data-canonical="${canonical}" 
               data-variants="${variantsText}"
               style="margin-bottom: 8px; padding: 8px; border: 1px solid #eee; border-radius: 4px; background: white;">
            <strong style="color: #0056b3;">${canonical}</strong> → 
            <span style="color: #666;">${variantsText}</span>
          </div>
        `;
      });
      html += '</div>';
      
      displayDiv.innerHTML = html;
    }

    async function refreshTagMappingsDisplay() {
      try {
        await tagMapper.initialize();
        const tagMap = tagMapper.getTagMap();
        await displayMappings(tagMap);
      } catch (error) {
        const displayDiv = document.getElementById("tagMappingsDisplay");
        displayDiv.innerHTML = '<p style="color: #dc3545;">Error loading tag mappings.</p>';
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
