// content.js

// Listen for messages from the extension background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "show_notification") {
    const notification = document.createElement("div");
    notification.classList.add("cf-notification");
    notification.textContent = message.text;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(function () {
      notification.remove();
    }, 3000);

    // Remove notification on click anywhere on the page
    document.addEventListener("click", function removeNotification() {
      notification.remove();
      document.removeEventListener("click", removeNotification);
    });
  }
});
