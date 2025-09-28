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

// Auto-populate functions for different platforms
async function getAutoPopulateData() {
  try {
    const url = window.location.href;
    let data = { tags: [], difficulty: "", rating: null };

    if (url.startsWith("https://leetcode.com")) {
      data = await getLeetCodeData();
    } else if (url.startsWith("https://codeforces.com")) {
      data = await getCodeforcesData();
    } else if (url.startsWith("https://www.geeksforgeeks.org")) {
      data = await getGFGData();
    } else if (url.startsWith("https://www.interviewbit.com")) {
      data = await getInterviewBitData();
    } else if (url.startsWith("https://www.codechef.com")) {
      data = await getCodeChefData();
    }

    return data;
  } catch (error) {
    return { tags: [], difficulty: "", rating: null };
  }
}

async function getLeetCodeData() {
  try {
    const slug = window.location.pathname.split("/")[2]; // Extract slug like "two-sum"
    if (!slug) return { tags: [], difficulty: "", rating: null };

    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          difficulty
          topicTags { name }
        }
      }`;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { titleSlug: slug } })
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    if (!data.data?.question) throw new Error("Invalid response data");

    return {
      difficulty: data.data.question.difficulty || "",
      tags: data.data.question.topicTags?.map(tag => tag.name) || [],
      rating: null
    };
  } catch (error) {
    return { tags: [], difficulty: "", rating: null };
  }
}

async function getCodeforcesData() {
  try {
    // Check if we're on a problem page first
    const path = window.location.pathname.split("/");
    if (path.length < 5 || !path.includes("problem")) {
      return { tags: [], difficulty: "", rating: null };
    }

    const contestId = path[3]; // "2143"
    const index = path[4];     // "D2"

    if (!contestId || !index) {
      return { tags: [], difficulty: "", rating: null };
    }

    // Use Codeforces API to get problem data
    const response = await fetch("https://codeforces.com/api/problemset.problems");
    if (!response.ok) throw new Error("Failed to fetch from Codeforces API");

    const data = await response.json();
    if (data.status !== "OK") throw new Error("API returned error status");

    // Find the specific problem
    const problem = data.result.problems.find(
      p => String(p.contestId) === contestId && p.index === index
    );

      if (!problem) {
        return { tags: [], difficulty: "", rating: null };
      }    return {
      difficulty: "", // Will be mapped from rating
      tags: problem.tags || [],
      rating: problem.rating || null
    };
  } catch (error) {
    return await getCodeforcesDataFromDOM();
  }
}

// Fallback method for Codeforces when API fails
async function getCodeforcesDataFromDOM() {
  try {
    // Extract rating from tag-box elements as fallback
    const tagElements = document.querySelectorAll(".tag-box");
    let rating = null;
    const tags = [];

    tagElements.forEach(tagEl => {
      const tagText = tagEl.innerText.trim();
      
      // Check if this is a rating tag (contains *)
      const ratingMatch = tagText.match(/\*(\d+)/);
      if (ratingMatch) {
        rating = parseInt(ratingMatch[1]);
      } else if (tagText && !tagText.includes('*')) {
        // This is a topic tag
        tags.push(tagText);
      }
    });

    // Also try to get tags from .roundbox .tag elements
    const roundboxTags = document.querySelectorAll(".roundbox .tag");
    roundboxTags.forEach(tagEl => {
      const tagText = tagEl.innerText.trim();
      if (tagText && !tagText.includes('*') && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    });

    return {
      difficulty: "",
      tags,
      rating
    };
  } catch (error) {
    return { tags: [], difficulty: "", rating: null };
  }
}

async function getGFGData() {
  try {
    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get Topic Tags using the exact selector from your script
    const topicSection = [...document.querySelectorAll(".problems_accordion_tags__JJ2DX")]
      .find(sec => sec.querySelector("strong")?.innerText.trim() === "Topic Tags");

    const tags = topicSection
      ? [...topicSection.querySelectorAll(".ui.labels a")].map(el => el.innerText.trim())
      : [];

    // Get Difficulty from the header description div
    const difficulty = document.querySelector(
      ".problems_header_description__t_8PB span strong"
    )?.innerText.trim() || "";

    return {
      difficulty,
      tags,
      rating: null
    };
  } catch (error) {
    return { tags: [], difficulty: "", rating: null };
  }
}

async function getInterviewBitData() {
  try {
    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get Topic Tags from breadcrumb using the exact selector from your script
    const tags = [...document.querySelectorAll(".ib-breadcrumb__item--link")]
      .map(el => el.innerText.trim())
      .filter(t => t !== "Programming"); // Filter out generic "Programming" tag

    // Get Difficulty
    const difficultyEl = document.querySelector(".p-difficulty-level");
    const difficulty = difficultyEl ? difficultyEl.innerText.trim() : "";

    return {
      difficulty,
      tags,
      rating: null
    };
  } catch (error) {
    return { tags: [], difficulty: "", rating: null };
  }
}

async function getCodeChefData() {
  try {
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get Difficulty (rating) using the exact selector from your script
    const difficultyEl = document.querySelector("._difficulty-ratings__box_a2x1m_503 ._value_a2x1m_395");
    let rating = null;

    if (difficultyEl) {
      const ratingText = difficultyEl.innerText.trim();
      const ratingMatch = ratingText.match(/(\d+)/);
      if (ratingMatch) {
        rating = parseInt(ratingMatch[1]);
      }
    }

    // Click expand button if collapsed (exact logic from your script)
    const expandBtn = document.querySelector("._expand__container_a2x1m_756");
    if (expandBtn && expandBtn.innerText.includes("Expand")) {
      expandBtn.click();
    }

    // Wait for tags to render (matching your 300ms delay)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Extract tags using the exact selector from your script
    const tags = [...document.querySelectorAll("._tag-list-map__box_a2x1m_527 ._tagList__item_a2x1m_539")]
      .map(el => el.innerText.trim());

    return {
      difficulty: "", // Will be mapped from rating
      tags,
      rating
    };
  } catch (error) {
    return { tags: [], difficulty: "", rating: null };
  }
}

// Helper function to map rating to difficulty level
function mapRatingToDifficulty(rating, settings) {
  if (!rating || !settings) return "";
  
  // Determine platform from URL
  const url = window.location.href;
  let easyMax, mediumMax;
  
  if (url.includes("codeforces.com")) {
    easyMax = settings.codeforcesEasyMax || 1200;
    mediumMax = settings.codeforcesMediumMax || 1800;
  } else if (url.includes("codechef.com")) {
    easyMax = settings.codechefEasyMax || 1200;
    mediumMax = settings.codechefMediumMax || 1800;
  } else {
    // Fallback to general settings or defaults
    easyMax = settings.easyMaxRating || 1200;
    mediumMax = settings.mediumMaxRating || 1800;
  }
  
  if (rating <= easyMax) {
    return "Easy";
  } else if (rating <= mediumMax) {
    return "Medium";
  } else {
    return "Hard";
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

      case "getAutoPopulateData":
        // Handle async auto-populate data extraction
        (async () => {
          try {
            const data = await getAutoPopulateData();
            
            // Normalize tags using tag mapper if available
            if (data.tags && data.tags.length > 0) {
              try {
                if (typeof tagMapper !== 'undefined' && tagMapper.normalizeTags) {
                  await tagMapper.initialize(); // Ensure tag mapper is ready
                  data.tags = tagMapper.normalizeTags(data.tags);
                }
              } catch (tagError) {
                // Tag normalization failed - use original tags
                // Continue with original tags if normalization fails
              }
            }
            
            // If we have a rating but no difficulty, map it using settings
            if (data.rating && !data.difficulty && request.settings) {
              data.difficulty = mapRatingToDifficulty(data.rating, request.settings);
            }
            
            sendResponse({ 
              success: true, 
              data: data
            });
          } catch (error) {
            sendResponse({
              error: "Failed to extract auto-populate data from page",
              success: false,
            });
          }
        })();
        return true; // Indicate asynchronous response
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
