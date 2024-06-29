chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_options_page") {
    chrome.runtime.openOptionsPage();
  } else if (request.action === "save_question") {
    // Add logic to save the question
    console.log("Save question action received");
    // For demonstration purposes, let's log a message
    alert("Save Question clicked");
  }
});
