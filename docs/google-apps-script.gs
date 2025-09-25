// IMPORTANT: Replace with your actual Google Sheet ID from the URL
const SHEET_ID = "your-sheet-id-here"; // Get this from your sheet URL: /spreadsheets/d/SHEET_ID_HERE/edit
const SHEET_NAME = "Questions"; // Name of the sheet tab

// Helper function to validate SHEET_ID configuration
function validateSheetId() {
  if (!SHEET_ID || SHEET_ID === "your-sheet-id-here") {
    throw new Error(
      "SHEET_ID is not configured. Please replace 'your-sheet-id-here' with your actual Google Sheet ID from the URL."
    );
  }
}

// Enhanced field structure to match the new UI
const HEADERS = [
  "Folder",
  "Question",
  "Pattern",
  "Note",
  "Level",
  "Topic / tag",
  "Premium",
  "Revision Needed",
];
const LEVEL_OPTIONS = ["Easy", "Medium", "Hard"];
const PREMIUM_OPTIONS = ["Yes", "No"];
const REVISION_OPTIONS = ["Yes", "No"];

/**
 * Handle HTTP requests
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    switch (action) {
      case "save":
        return saveQuestion(requestData.data);
      case "get":
        return getQuestions(requestData.folder);
      case "getAll":
        return getAllQuestions();
      case "update":
        return updateQuestion(requestData.data);
      case "delete":
        return deleteQuestion(requestData.data);
      case "deleteFolder":
        return deleteFolder(requestData.folder);
      case "getDropdownOptions":
        return getDropdownOptions();
      case "initializeSheet":
        return initializeSheet();
      case "refreshDropdowns":
        // First refresh the dropdown validation rules
        refreshDropdowns();
        // Then return the updated dropdown options
        return getDropdownOptions();
      default:
        return createResponse(false, "Unknown action");
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case "getAll":
        return getAllQuestions();
      case "get":
        return getQuestions(e.parameter.folder);
      default:
        return createResponse(false, "Unknown action");
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Save a question to the sheet
 */
function saveQuestion(questionData) {
  try {
    const sheet = getSheet();

    // Prepare the question text with hyperlink if URL is provided
    let questionCell;
    const questionText = questionData.question || questionData.title || "";
    const questionUrl = questionData.url || "";

    if (questionUrl && questionText) {
      // Create hyperlink formula: =HYPERLINK("url", "display text")
      questionCell = `=HYPERLINK("${questionUrl}", "${questionText}")`;
    } else {
      // Just the text if no URL provided
      questionCell = questionText;
    }

    // Add new row with enhanced question data structure
    const newRow = [
      questionData.folder || "",
      questionCell, // This will be either hyperlink or plain text
      questionData.pattern || "",
      questionData.note || "",
      questionData.level || "Medium",
      questionData.tags
        ? Array.isArray(questionData.tags)
          ? questionData.tags.join(", ")
          : questionData.tags
        : "",
      questionData.premium || "No",
      questionData.revisionNeeded || "No",
    ];

    sheet.appendRow(newRow);

    // Only add the NEW entries to existing dropdowns (preserves all styling)
    try {
      // Extract new values from this question
      const newFolder = questionData.folder;
      const newPattern = questionData.pattern;
      const newTags = questionData.tags
        ? Array.isArray(questionData.tags)
          ? questionData.tags
          : questionData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
        : [];

      // Only add these specific new values to dropdowns
      addNewEntriesToDropdowns(sheet, newFolder, newPattern, newTags);
    } catch (refreshError) {
      // Don't fail the entire save operation if dropdown update fails
    }

    return createResponse(true, "Question saved successfully");
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Get all questions from the sheet
 */
function getAllQuestions() {
  try {
    const sheet = getSheet();

    // Check if sheet is properly initialized
    if (!sheet) {
      return createResponse(false, "Sheet not found or not initialized");
    }

    // Check if sheet has any data
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      return createResponse(true, { questions: {} });
    }

    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return createResponse(true, { questions: {} });
    }

    const questions = {};

    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const folder = row[0] || "Default";

      // Extract question text and URL from hyperlink formula if present
      let questionText = row[1] || "";
      let questionUrl = "";

      // Check if the question cell contains a hyperlink formula
      if (
        typeof questionText === "string" &&
        questionText.startsWith("=HYPERLINK(")
      ) {
        // Parse the HYPERLINK formula: =HYPERLINK("url", "text")
        const hyperlinkMatch = questionText.match(
          /=HYPERLINK\("([^"]+)",\s*"([^"]+)"\)/
        );
        if (hyperlinkMatch) {
          questionUrl = hyperlinkMatch[1];
          questionText = hyperlinkMatch[2];
        }
      }

      const question = {
        question: questionText,
        url: questionUrl, // Include URL in the response
        pattern: row[2] || "",
        note: row[3] || "",
        level: row[4] || "Medium",
        tags: row[5] ? row[5].split(", ").filter((tag) => tag.trim()) : [],
        premium: row[6] || "No",
        revisionNeeded: row[7] || "No",
        rowIndex: i + 1, // Store row index for updates/deletes
      };

      if (!questions[folder]) {
        questions[folder] = [];
      }

      questions[folder].push(question);
    }

    return createResponse(true, { questions });
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Get questions from a specific folder
 */
function getQuestions(folder) {
  try {
    const allQuestions = getAllQuestions();
    if (!allQuestions.success) {
      return allQuestions;
    }

    const folderQuestions = allQuestions.data.questions[folder] || [];
    return createResponse(true, { questions: folderQuestions });
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Update a question
 */
function updateQuestion(questionData) {
  try {
    const sheet = getSheet();
    const rowIndex = questionData.rowIndex;

    if (!rowIndex || rowIndex < 2) {
      return createResponse(false, "Invalid row index");
    }

    // Prepare the question text with hyperlink if URL is provided
    let questionCell;
    const questionText = questionData.question || questionData.title || "";

    if (questionData.url && questionText) {
      // Create hyperlink formula: =HYPERLINK("url", "display text")
      questionCell = `=HYPERLINK("${questionData.url}", "${questionText}")`;
    } else {
      // Just the text if no URL provided
      questionCell = questionText;
    }

    const updatedRow = [
      questionData.folder || "",
      questionCell, // This will be either hyperlink or plain text
      questionData.pattern || "",
      questionData.note || "",
      questionData.level || "Medium",
      questionData.tags
        ? Array.isArray(questionData.tags)
          ? questionData.tags.join(", ")
          : questionData.tags
        : "",
      questionData.premium || "No",
      questionData.revisionNeeded || "No",
    ];

    // Update the specific row
    const range = sheet.getRange(rowIndex, 1, 1, updatedRow.length);
    range.setValues([updatedRow]);

    return createResponse(true, "Question updated successfully");
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Delete a question
 */
function deleteQuestion(questionData) {
  try {
    const sheet = getSheet();
    const rowIndex = questionData.rowIndex;

    if (!rowIndex || rowIndex < 2) {
      return createResponse(false, "Invalid row index");
    }

    sheet.deleteRow(rowIndex);

    return createResponse(true, "Question deleted successfully");
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Delete all questions from a folder
 */
function deleteFolder(folderName) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    // Find rows to delete (in reverse order to avoid index shifting)
    const rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === folderName) {
        rowsToDelete.push(i + 1); // +1 because sheet rows are 1-indexed
      }
    }

    // Delete rows
    rowsToDelete.forEach((rowIndex) => {
      sheet.deleteRow(rowIndex);
    });

    return createResponse(true, `Folder "${folderName}" deleted successfully`);
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Get or create the sheet with enhanced formatting and dropdowns
 */
function getSheet() {
  try {
    // Validate SHEET_ID is configured
    validateSheetId();

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      return initializeSheetStructure(sheet);
    }

    return sheet;
  } catch (error) {
    if (error.toString().includes("SHEET_ID is not configured")) {
      throw new Error(
        "Sheet ID not configured. Please set your actual Google Sheet ID in the SHEET_ID constant."
      );
    } else if (error.toString().includes("not found")) {
      throw new Error(
        "Google Sheet not found. Please check: 1) SHEET_ID is correct 2) Sheet exists 3) You have access permissions"
      );
    } else if (error.toString().includes("permission")) {
      throw new Error(
        "Permission denied. Please share the Google Sheet with this Apps Script project or check your access rights."
      );
    }

    throw error;
  }
}

/**
 * Initialize sheet structure with headers and dropdowns
 */
function initializeSheet() {
  try {
    // Validate SHEET_ID first
    validateSheetId();

    const sheet = getSheet();
    const result = initializeSheetStructure(sheet);

    return result;
  } catch (error) {
    const errorMsg = "Error initializing sheet: " + error.toString();
    return createResponse(false, errorMsg);
  }
}

/**
 * Set up sheet with headers, formatting, and dropdowns
 */
function initializeSheetStructure(sheet) {
  try {
    // Clear existing content
    sheet.clear();

    // Try to clear data validations with error handling
    try {
      sheet.clearDataValidations();
    } catch (validationError) {
      // Note: clearDataValidations not available, skipping validation clearing
    }

    // Add headers
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

    // Format headers with better styling
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1a73e8");
    headerRange.setFontColor("white");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    headerRange.setFontSize(12);
    headerRange.setFontFamily("Google Sans");

    // Set column widths
    sheet.setColumnWidth(1, 120); // Folder
    sheet.setColumnWidth(2, 280); // Question
    sheet.setColumnWidth(3, 150); // Pattern
    sheet.setColumnWidth(4, 300); // Note
    sheet.setColumnWidth(5, 100); // Level
    sheet.setColumnWidth(6, 150); // Topic/tag
    sheet.setColumnWidth(7, 100); // Premium
    sheet.setColumnWidth(8, 130); // Revision Needed

    // Set up dropdown validations for better user experience
    setupAllDropdowns(sheet);

    // Force-apply the critical strict dropdowns (Level/Premium/Revision) so the arrow is visible
    setupCriticalDropdowns(sheet);

    // Apply conditional formatting for all columns
    applyAllFormatting(sheet);

    // Set default font for the entire sheet
    const wholeSheet = sheet.getRange(1, 1, 1000, HEADERS.length);
    wholeSheet.setFontFamily("Google Sans");
    wholeSheet.setFontSize(11);

    return createResponse(
      true,
      "Sheet initialized successfully with enhanced styling and dropdown validations"
    );
  } catch (error) {
    return createResponse(
      false,
      "Error initializing sheet structure: " + error.toString()
    );
  }
}

/**
 * Set up all dropdown validations with proper data validation rules
 */
function setupAllDropdowns(sheet) {
  try {
    // Get existing data to build comprehensive dropdown options
    const data = sheet.getDataRange().getValues();
    const existingFolders = new Set();
    const existingPatterns = new Set();
    const existingTags = new Set();

    // Collect existing values (skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) existingFolders.add(row[0]); // Folder
      if (row[2]) {
        // Patterns - split by comma like tags
        row[2].split(",").forEach((pattern) => {
          const trimmed = pattern.trim();
          if (trimmed) existingPatterns.add(trimmed);
        });
      }
      if (row[5]) {
        // Tags - split by comma and add each tag
        row[5].split(",").forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) existingTags.add(trimmed);
        });
      }
    }

    // Default options
    const defaultFolders = [];
    const defaultPatterns = [];
    const defaultTags = [];

    // Combine existing and default options
    const allFolders = [
      ...new Set([...existingFolders, ...defaultFolders]),
    ].sort();
    const allPatterns = [
      ...new Set([...existingPatterns, ...defaultPatterns]),
    ].sort();
    const allTags = [...new Set([...existingTags, ...defaultTags])].sort();

    // Set up data validation for each column

    // Column A: Folder dropdown (with custom entry allowed)
    const folderRange = sheet.getRange("A2:A1000");
    const folderValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(allFolders, true) // show dropdown and allow custom entries
      .setAllowInvalid(true)
      .setHelpText("Select a folder or enter a custom folder name")
      .build();
    folderRange.setDataValidation(folderValidation);

    // Column C: Pattern dropdown (with custom entry allowed)
    const patternRange = sheet.getRange("C2:C1000");
    const patternValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(allPatterns, true) // show dropdown and allow custom entries
      .setAllowInvalid(true)
      .setHelpText("Select a pattern or enter a custom pattern")
      .build();
    patternRange.setDataValidation(patternValidation);

    // Column E: Level dropdown (strict - only predefined values)
    const levelRange = sheet.getRange("E2:E1000");
    const levelValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(LEVEL_OPTIONS, true) // show dropdown (true)
      .setAllowInvalid(false)
      .setHelpText("Select: Easy, Medium, or Hard")
      .build();
    levelRange.setDataValidation(levelValidation);

    // Column F: Topic/Tag dropdown (with custom entry allowed for multiple tags)
    const tagRange = sheet.getRange("F2:F1000");
    const tagValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(allTags, true) // show dropdown and allow custom entries
      .setAllowInvalid(true)
      .setHelpText(
        "Select tags or enter custom tags (separate multiple tags with commas)"
      )
      .build();
    tagRange.setDataValidation(tagValidation);

    // Column G: Premium dropdown (strict)
    const premiumRange = sheet.getRange("G2:G1000");
    const premiumValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(PREMIUM_OPTIONS, true) // show dropdown (true) and enforce values with setAllowInvalid(false)
      .setAllowInvalid(false)
      .setHelpText("Select: Yes or No")
      .build();
    premiumRange.setDataValidation(premiumValidation);

    // Column H: Revision Needed dropdown (strict)
    const revisionRange = sheet.getRange("H2:H1000");
    const revisionValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(REVISION_OPTIONS, true) // show dropdown (true)
      .setAllowInvalid(false)
      .setHelpText("Select: Yes or No")
      .build();
    revisionRange.setDataValidation(revisionValidation);
  } catch (error) {
    throw error; // Re-throw to prevent silent failures
  }
}

/**
 * Add new entries to existing dropdown lists WITHOUT touching validation rules
 * This preserves ALL manual styling and only adds new values to the lists
 */
function addNewEntriesToDropdowns(sheet, newFolder, newPattern, newTags) {
  try {
    // Get current validation rules and their existing values
    const folderRange = sheet.getRange("A2:A1000");
    const patternRange = sheet.getRange("C2:C1000");
    const tagRange = sheet.getRange("F2:F1000");

    const currentFolderValidation = folderRange.getDataValidation();
    const currentPatternValidation = patternRange.getDataValidation();
    const currentTagValidation = tagRange.getDataValidation();

    // Only update if we have new values and existing validations
    if (newFolder && currentFolderValidation) {
      // Get current allowed values from the validation
      const currentFolderValues =
        currentFolderValidation.getCriteriaValues()[0] || [];
      const updatedFolders = [
        ...new Set([...currentFolderValues, newFolder]),
      ].sort();

      // Create new validation with updated list but same settings
      const newFolderValidation = SpreadsheetApp.newDataValidation()
        .requireValueInList(updatedFolders, true)
        .setAllowInvalid(currentFolderValidation.getAllowInvalid())
        .setHelpText(
          currentFolderValidation.getHelpText() ||
            "Select a folder or enter a custom folder name"
        )
        .build();
      folderRange.setDataValidation(newFolderValidation);
    }

    if (newPattern && currentPatternValidation) {
      const currentPatternValues =
        currentPatternValidation.getCriteriaValues()[0] || [];
      // Split comma-separated patterns into individual items
      const patternItems = newPattern
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
      const updatedPatterns = [
        ...new Set([...currentPatternValues, ...patternItems]),
      ].sort();

      const newPatternValidation = SpreadsheetApp.newDataValidation()
        .requireValueInList(updatedPatterns, true)
        .setAllowInvalid(currentPatternValidation.getAllowInvalid())
        .setHelpText(
          currentPatternValidation.getHelpText() ||
            "Select a pattern or enter a custom pattern"
        )
        .build();
      patternRange.setDataValidation(newPatternValidation);
    }

    if (newTags && newTags.length > 0 && currentTagValidation) {
      const currentTagValues =
        currentTagValidation.getCriteriaValues()[0] || [];
      const updatedTags = [
        ...new Set([...currentTagValues, ...newTags]),
      ].sort();

      const newTagValidation = SpreadsheetApp.newDataValidation()
        .requireValueInList(updatedTags, true)
        .setAllowInvalid(currentTagValidation.getAllowInvalid())
        .setHelpText(
          currentTagValidation.getHelpText() ||
            "Select tags or enter custom tags"
        )
        .build();
      tagRange.setDataValidation(newTagValidation);
    }
  } catch (error) {
    // Error adding new entries to dropdowns
  }
}

/**
 * Refresh dropdown lists to include any new values added by users
 * Call this function periodically or after adding new data
 * Now uses a safer approach that preserves manual styling
 */
function refreshDropdowns() {
  try {
    const sheet = getSheet();

    // Get all existing data to find what might be missing from dropdowns
    const data = sheet.getDataRange().getValues();
    const existingFolders = new Set();
    const existingPatterns = new Set();
    const existingTags = new Set();

    // Collect ALL values currently in the sheet (skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) existingFolders.add(row[0]); // Folder
      if (row[2]) {
        // Patterns - split by comma like tags
        row[2].split(",").forEach((pattern) => {
          const trimmed = pattern.trim();
          if (trimmed) existingPatterns.add(trimmed);
        });
      }
      if (row[5]) {
        // Tags - split by comma and add each tag
        row[5].split(",").forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) existingTags.add(trimmed);
        });
      }
    }

    // Add all found values to dropdowns (this will only add missing ones)
    if (existingFolders.size > 0) {
      Array.from(existingFolders).forEach((folder) => {
        addNewEntriesToDropdowns(sheet, folder, null, null);
      });
    }

    if (existingPatterns.size > 0) {
      Array.from(existingPatterns).forEach((pattern) => {
        addNewEntriesToDropdowns(sheet, null, pattern, null);
      });
    }

    if (existingTags.size > 0) {
      addNewEntriesToDropdowns(sheet, null, null, Array.from(existingTags));
    }
  } catch (error) {
    // Error refreshing dropdowns
  }
}

/**
 * Force apply only Level, Premium, and Revision dropdowns
 * Now accepts the sheet parameter to avoid relying on active sheet context
 */
function setupCriticalDropdowns(sheet) {
  try {
    // Clear any existing validations for these columns first
    sheet.getRange("E2:E1000").clearDataValidations();
    sheet.getRange("G2:G1000").clearDataValidations();
    sheet.getRange("H2:H1000").clearDataValidations();

    // Column E: Level dropdown (strict - only predefined values)
    const levelRange = sheet.getRange("E2:E1000");
    const levelValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(LEVEL_OPTIONS, true) // show dropdown (true)
      .setAllowInvalid(false)
      .setHelpText("Select: Easy, Medium, or Hard")
      .build();
    levelRange.setDataValidation(levelValidation);

    // Column G: Premium dropdown (strict)
    const premiumRange = sheet.getRange("G2:G1000");
    const premiumValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(PREMIUM_OPTIONS, true) // show dropdown (true)
      .setAllowInvalid(false)
      .setHelpText("Select: Yes or No")
      .build();
    premiumRange.setDataValidation(premiumValidation);

    // Column H: Revision Needed dropdown (strict)
    const revisionRange = sheet.getRange("H2:H1000");
    const revisionValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(REVISION_OPTIONS, true) // show dropdown (true)
      .setAllowInvalid(false)
      .setHelpText("Select: Yes or No")
      .build();
    revisionRange.setDataValidation(revisionValidation);
  } catch (error) {
    // Error setting up critical dropdowns
  }
}

/**
 * Apply all conditional formatting for better visual appearance
 */
function applyAllFormatting(sheet) {
  const rules = [];

  // No conditional formatting rules - keep dropdowns clean
  // All formatting removed per user request

  sheet.setConditionalFormatRules(rules);

  // Add borders for better readability
  const dataRange = sheet.getRange("A1:H1000");
  dataRange.setBorder(
    true,
    true,
    true,
    true,
    true,
    true,
    "#e0e0e0",
    SpreadsheetApp.BorderStyle.SOLID
  );
}

/**
 * Get dropdown options and existing values for autocomplete
 */
function getDropdownOptions() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    const existingFolders = new Set();
    const existingPatterns = new Set();
    const existingTags = new Set();

    // Skip header row and collect existing values
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) existingFolders.add(row[0]); // Folder
      if (row[2]) {
        // Patterns - split by comma like tags
        row[2].split(",").forEach((pattern) => {
          const trimmed = pattern.trim();
          if (trimmed) existingPatterns.add(trimmed);
        });
      }
      if (row[5]) {
        // Tags
        row[5].split(",").forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) existingTags.add(trimmed);
        });
      }
    }

    // Default suggestions for new users
    const defaultFolders = [];
    const defaultPatterns = [];
    const defaultTags = [];

    // Combine existing and default options for suggestions
    const allFolders = [
      ...new Set([...existingFolders, ...defaultFolders]),
    ].sort();
    const allPatterns = [
      ...new Set([...existingPatterns, ...defaultPatterns]),
    ].sort();
    const allTags = [...new Set([...existingTags, ...defaultTags])].sort();

    const options = {
      folders: allFolders,
      patterns: allPatterns,
      tags: allTags,
      levels: LEVEL_OPTIONS,
      premium: PREMIUM_OPTIONS,
      revision: REVISION_OPTIONS,
    };

    return createResponse(true, options);
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Create standardized response
 */
function createResponse(success, data, message) {
  const response = {
    success: success,
    data: data || null,
    message: message || null,
    timestamp: new Date().toISOString(),
  };

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON
  );
}
