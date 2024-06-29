document.addEventListener("DOMContentLoaded", function () {
  const questionsContainer = document.getElementById("questionsContainer");

  if (!questionsContainer) {
    console.error("Questions container not found");
    return;
  }

  // Function to render questions and folders
  function renderQuestions() {
    chrome.storage.sync.get({ questions: {} }, function (data) {
      const questions = data.questions;
      questionsContainer.innerHTML = ""; // Clear existing content

      for (const folder in questions) {
        const folderDiv = document.createElement("div");
        folderDiv.className = "folder";

        const folderTitle = document.createElement("h2");
        folderTitle.innerText = folder;
        folderTitle.classList.add("folderTitle");

        // Show questions for this folder on clicking the folder title
        folderTitle.addEventListener("click", function () {
          const questionsList = folderDiv.querySelector(".questionsList");
          questionsList.classList.toggle("hidden");
        });

        // Delete folder button
        const deleteFolderButton = document.createElement("button");
        deleteFolderButton.className = "deleteFolderButton";
        deleteFolderButton.textContent = "Delete Folder";
        deleteFolderButton.setAttribute("data-folder", folder);
        deleteFolderButton.addEventListener("click", function (event) {
          event.stopPropagation(); // Prevent collapsing folder
          deleteFolder(folder);
        });
        folderTitle.appendChild(deleteFolderButton);

        folderDiv.appendChild(folderTitle);

        const questionsList = document.createElement("ul");
        questionsList.className = "questionsList hidden";

        questions[folder].forEach((question, index) => {
          const questionItem = document.createElement("li");
          questionItem.className = "questionItem";

          const questionTitle = document.createElement("div");
          questionTitle.className = "questionTitle";
          questionTitle.innerHTML = `
                <a href="${question.url}" target="_blank">${question.title}</a>
                <span class="noteIcon" data-note="${
                  question.note || ""
                }">📝</span>
                <button class="deleteButton">Delete</button>
              `;

          // Open modal on clicking the note icon
          questionTitle
            .querySelector(".noteIcon")
            .addEventListener("click", function () {
              const note = question.note || "";
              openNoteModal(note, (newNote) => {
                question.note = newNote;
                chrome.storage.sync.set({ questions }, function () {
                  renderQuestions(); // Refresh the questions view after note update
                });
              });
            });

          // Delete question on clicking the delete button
          questionTitle
            .querySelector(".deleteButton")
            .addEventListener("click", function (event) {
              event.stopPropagation(); // Prevent the folder from collapsing
              questions[folder].splice(index, 1);
              chrome.storage.sync.set({ questions }, function () {
                renderQuestions(); // Refresh the questions view
              });
            });

          questionItem.appendChild(questionTitle);

          if (question.tags && question.tags.length > 0) {
            const tagsDiv = document.createElement("div");
            tagsDiv.className = "tags";
            question.tags.forEach((tag) => {
              const tagSpan = document.createElement("span");
              tagSpan.textContent = tag;
              tagsDiv.appendChild(tagSpan);
            });
            questionItem.appendChild(tagsDiv);
          }

          questionsList.appendChild(questionItem);
        });

        folderDiv.appendChild(questionsList);
        questionsContainer.appendChild(folderDiv);
      }
    });
  }

  // Initial render of questions
  renderQuestions();

  // Function to handle deleting a folder
  function deleteFolder(folder) {
    chrome.storage.sync.get({ questions: {} }, function (data) {
      const questions = data.questions;

      if (questions[folder]) {
        delete questions[folder];

        chrome.storage.sync.set({ questions }, function () {
          renderQuestions(); // Refresh the questions view after deletion
        });
      }
    });
  }

  // Open modal dialog to edit note
  function openNoteModal(initialNote, onSave) {
    const modalHtml = `
        <div id="noteModal" class="modal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <textarea id="noteInput" rows="5">${initialNote}</textarea>
            <button id="saveNoteButton">Save Note</button>
          </div>
        </div>
      `;

    // Append modal to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Get modal element
    const modal = document.getElementById("noteModal");

    // Get close button
    const closeBtn = modal.querySelector(".close");

    // Close modal on click on close button
    closeBtn.onclick = function () {
      modal.remove();
    };

    // Get save note button
    const saveNoteBtn = modal.querySelector("#saveNoteButton");

    // Save note and close modal on click on save note button
    saveNoteBtn.onclick = function () {
      const newNote = document.getElementById("noteInput").value;
      onSave(newNote);
      modal.remove();
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.remove();
      }
    };
  }

  // Event delegation for delete folder and delete question buttons
  questionsContainer.addEventListener("click", function (event) {
    const target = event.target;

    // Handle delete folder button
    if (target.classList.contains("deleteFolderButton")) {
      const folderName = target.dataset.folder;
      if (
        confirm(`Are you sure you want to delete the folder "${folderName}"?`)
      ) {
        deleteFolder(folderName);
      }
    }

    // Handle delete question button
    if (target.classList.contains("deleteButton")) {
      const questionItem = target.closest(".questionItem");
      const folderTitle =
        questionItem.parentNode.parentNode.querySelector(".folderTitle");

      const folderName = folderTitle.innerText.trim();
      const questionIndex = Array.from(
        questionItem.parentNode.children
      ).indexOf(questionItem);

      chrome.storage.sync.get({ questions: {} }, function (data) {
        const questions = data.questions;

        if (questions[folderName]) {
          questions[folderName].splice(questionIndex, 1);

          chrome.storage.sync.set({ questions }, function () {
            renderQuestions(); // Refresh the questions view after deletion
          });
        }
      });
    }
  });
});
