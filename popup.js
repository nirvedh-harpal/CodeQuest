document.addEventListener("DOMContentLoaded", function () {
  const folderSelectContainer = document.getElementById(
    "folderSelectContainer"
  );
  const newFolderNameInput = document.getElementById("newFolderName");
  const tagsInput = document.getElementById("tags");

  if (!folderSelectContainer || !newFolderNameInput || !tagsInput) {
    console.error(
      "Folder select container, new folder name input, or tags input field not found"
    );
    return;
  }

  // Check if the current tab is a Codeforces problem page
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;

    const isProblemPage = url.startsWith(
      "https://codeforces.com/problemset/problem/"
    );

    if (!isProblemPage) {
      document.body.innerHTML =
        "<p>You are not on a Codeforces problem page.</p>";
      return;
    }

    // Load existing folders into the container
    chrome.storage.sync.get({ questions: {} }, function (data) {
      const questions = data.questions;

      // Add the "Create new folder" checkbox
      const newFolderLabel = document.createElement("label");
      const newFolderCheckbox = document.createElement("input");
      newFolderCheckbox.type = "checkbox";
      newFolderCheckbox.value = "new";
      newFolderLabel.appendChild(newFolderCheckbox);
      newFolderLabel.appendChild(document.createTextNode("Create new folder"));
      folderSelectContainer.appendChild(newFolderLabel);

      let hasFolders = false;
      for (const folder in questions) {
        hasFolders = true;
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = folder;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(folder));
        folderSelectContainer.appendChild(label);
      }

      // If no folders exist, show the input field for new folder name
      if (!hasFolders) {
        newFolderNameInput.style.display = "block";
        newFolderCheckbox.checked = true;
      }

      // Toggle new folder input visibility based on checkbox selection
      newFolderCheckbox.addEventListener("change", function () {
        if (newFolderCheckbox.checked) {
          newFolderNameInput.style.display = "block";
        } else {
          newFolderNameInput.style.display = "none";
        }
      });
    });

    // Save button click handler
    document
      .getElementById("saveButton")
      .addEventListener("click", function () {
        const checkboxes = folderSelectContainer.querySelectorAll(
          "input[type=checkbox]"
        );
        const selectedFolders = [];
        checkboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            selectedFolders.push(checkbox.value);
          }
        });

        if (selectedFolders.includes("new")) {
          const newFolderName = newFolderNameInput.value.trim();
          if (newFolderName) {
            selectedFolders[selectedFolders.indexOf("new")] = newFolderName;
          } else {
            console.error("New folder name is required");
            return;
          }
        }

        const note = document.getElementById("note").value;
        const tags = tagsInput.value.split(",").map((tag) => tag.trim());

        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            const url = tabs[0].url;
            const title = tabs[0].title;

            chrome.storage.sync.get({ questions: {} }, function (data) {
              const questions = data.questions;

              selectedFolders.forEach((folderName) => {
                if (!questions[folderName]) {
                  questions[folderName] = [];
                }

                questions[folderName].push({ url, title, note, tags });
              });

              chrome.storage.sync.set({ questions }, function () {
                // Close popup after saving
                window.close();
              });
            });
          }
        );
      });

    // View saved questions button click handler
    document
      .getElementById("viewSavedQuestionsButton")
      .addEventListener("click", function () {
        chrome.runtime.openOptionsPage();
      });
  });
});
