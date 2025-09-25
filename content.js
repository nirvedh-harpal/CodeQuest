// Content script to extract the title of the question
function getTitle() {
  try {
    let title = "";
    const url = window.location.href;

    if (url.startsWith("https://leetcode.com")) {
      const selector = ".text-title-large, .text-lg";
      const element = document.querySelector(selector);
      if (element) {
        title = element.innerText.trim();
      }
    } else if (url.startsWith("https://atcoder.jp")) {
      const selector = ".h2, h2";
      const element = document.querySelector(selector);
      if (element) {
        title = element.innerText.trim();
      }
    } else if (url.startsWith("https://codeforces.com")) {
      const selector = ".title, .problem-statement .title";
      const element = document.querySelector(selector);
      if (element) {
        title = element.innerText.trim();
      }
    } else if (url.startsWith("https://www.interviewbit.com")) {
      const selector = ".p-tile__title, .problem-title";
      const element = document.querySelector(selector);
      if (element) {
        title = element.innerText.trim();
      }
    } else if (url.startsWith("https://www.hackerrank.com")) {
      const selector = ".ui-icon-label, .problem-title, h1";
      const element = document.querySelector(selector);
      if (element) {
        title = element.innerText.trim();
      }
    } else if (url.startsWith("https://www.geeksforgeeks.org")) {
      const selector = ".g-m-0, .problems_problem_content__title__P7ooj, h1";
      const element = document.querySelector(selector);
      if (element) {
        title = element.innerText.trim();
      }
    } else if (url.startsWith("https://www.codechef.com/")) {
      // For CodeChef, try to get from page title or specific elements
      const selector = ".problem-title, h1, .prob-title";
      const element = document.querySelector(selector);
      if (element) {
        title = element.innerText.trim();
      } else {
        // Fall back to document title
        title = document.title.replace(/\s*-\s*CodeChef.*$/i, "").trim();
      }
    } else {
      // Unsupported site
    }

    // Clean up the title
    if (title) {
      // Remove common prefixes and suffixes
      title = title.replace(/^\d+\.\s*/, ""); // Remove leading numbers like "1. "
      title = title.replace(
        /\s*-\s*(LeetCode|AtCoder|Codeforces|InterviewBit|HackerRank|GeeksforGeeks|CodeChef).*$/i,
        ""
      );
      title = title.trim();
    }

    return title || "";
  } catch (error) {
    return "";
  }
}

// Enhanced message listener with error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (!request || !request.action) {
      sendResponse({ error: "Invalid message format" });
      return true; // Indicate asynchronous response
    }

    switch (request.action) {
      case "getTitle":
        try {
          const title = getTitle();
          sendResponse({ title: title, success: true });
        } catch (error) {
          sendResponse({
            error: "Failed to extract title from page",
            success: false,
          });
        }
        break;

      case "ping":
        // Health check
        sendResponse({
          success: true,
          message: "Content script is active",
          url: window.location.href,
        });
        break;

      default:
        sendResponse({
          error: `Unknown action: ${request.action}`,
          success: false,
        });
    }
  } catch (error) {
    sendResponse({
      error: "An unexpected error occurred in the content script",
      success: false,
    });
  }

  // Return true to indicate we will respond asynchronously
  return true;
});

// Handle page navigation and content changes
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  try {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
    }
  } catch (error) {
    // Error in mutation observer
  }
});

// Start observing
try {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
} catch (error) {
  // Failed to start mutation observer
}

// Add error handling for unhandled errors in content script
window.addEventListener("error", (event) => {
  // Handle uncaught errors
});

window.addEventListener("unhandledrejection", (event) => {
  // Handle unhandled promise rejections
});
