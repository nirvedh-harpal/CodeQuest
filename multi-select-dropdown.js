/**
 * Multi-Select Dropdown Component for CodeQuest Extension
 * Supports selecting multiple options and adding new custom items
 */

class MultiSelectDropdown {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      placeholder: options.placeholder || "Select or type...",
      allowCustom: options.allowCustom !== false,
      maxHeight: options.maxHeight || "200px",
      separator: options.separator || ", ",
      multiSelect: options.multiSelect !== false, // Allow single select
      ...options,
    };

    this.items = options.items || [];
    this.selectedValues = new Set();
    this.isOpen = false;

    this.init();
  }

  init() {
    this.createStructure();
    this.bindEvents();
    this.updatePlaceholderVisibility();
  }

  createStructure() {
    this.container.innerHTML = "";
    this.container.className = `multi-select-dropdown ${
      !this.options.multiSelect ? "single-select" : ""
    }`;

    // Main input area
    this.inputArea = document.createElement("div");
    this.inputArea.className = "msd-input-area";

    // Placeholder element
    this.placeholderElement = document.createElement("div");
    this.placeholderElement.className = "msd-placeholder";
    this.placeholderElement.textContent = this.options.placeholder;

    // Selected tags container
    this.tagsContainer = document.createElement("div");
    this.tagsContainer.className = "msd-tags";

    // Input field
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "msd-input";
    this.input.placeholder = "";

    // Dropdown arrow
    this.arrow = document.createElement("div");
    this.arrow.className = "msd-arrow";
    this.arrow.textContent = "\u25BC"; // Use Unicode directly and set font for reliability
    this.arrow.style.fontFamily = "Arial, sans-serif";

    this.inputArea.appendChild(this.placeholderElement);
    this.inputArea.appendChild(this.tagsContainer);
    this.inputArea.appendChild(this.input);
    this.inputArea.appendChild(this.arrow);

    // Dropdown list
    this.dropdown = document.createElement("div");
    this.dropdown.className = "msd-dropdown";
    this.dropdown.style.maxHeight = this.options.maxHeight;

    this.container.appendChild(this.inputArea);
    this.container.appendChild(this.dropdown);

    // Add CSS if not already added
    this.addCSS();
  }

  addCSS() {
    if (document.getElementById("multi-select-dropdown-css")) return;

    const style = document.createElement("style");
    style.id = "multi-select-dropdown-css";
    style.textContent = `
      .multi-select-dropdown {
        position: relative;
        width: 100%;
        font-family: inherit;
      }
      
      .msd-input-area {
        border: 1px solid #ced4da;
        border-radius: 4px;
        padding: 6px 40px 6px 12px;
        min-height: 36px;
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        background: white;
        cursor: text;
        position: relative;
        width: 100%;
        box-sizing: border-box;
      }
      
      .msd-input-area:focus-within {
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
      }
      
      .msd-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        flex-grow: 0;
      }

      .multi-select-dropdown.single-select .msd-tags {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .multi-select-dropdown.single-select .msd-tag {
        background: transparent;
        color: #495057;
        padding: 0;
        border-radius: 0;
        font-size: 14px;
        display: inline;
        margin-right: 0;
      }

      .multi-select-dropdown.single-select .msd-tag-remove {
        display: none;
      }
      
      .msd-tag {
        background: #007bff;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .msd-tag-remove {
        cursor: pointer;
        font-weight: bold;
        opacity: 0.7;
      }
      
      .msd-tag-remove:hover {
        opacity: 1;
      }
      
      .msd-input {
        border: none;
        outline: none;
        flex: 1 1 auto;
        min-width: 60px;
        width: auto;
        height: 20px;
        font-size: 14px;
        background: transparent;
      }

      .msd-input::placeholder {
        color: #6c757d;
        font-style: italic;
      }

      .msd-placeholder {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
        font-style: italic;
        pointer-events: none;
        z-index: 1;
      }

      .msd-input-area.has-content .msd-placeholder,
      .msd-input-area:focus-within .msd-placeholder {
        display: none;
      }
      
      .msd-arrow {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        font-size: 14px;
        color: #888;
        transition: transform 0.2s;
        font-family: Arial, sans-serif;
      }
      
      .msd-arrow.open {
        transform: translateY(-50%) rotate(180deg);
      }
      
      .msd-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ced4da;
        border-top: none;
        border-radius: 0 0 4px 4px;
        max-height: 150px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      }
      
      .msd-dropdown.open {
        display: block;
      }
      
      .msd-option {
        padding: 6px 12px;
        cursor: pointer;
        border-bottom: 1px solid #f8f9fa;
        font-size: 13px;
      }
      
      .msd-option:hover {
        background: #f8f9fa;
      }
      
      .msd-option.selected {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      .msd-option.add-new {
        background: #e8f5e8;
        color: #2e7d32;
        font-style: italic;
      }
      
      .msd-option.add-new:hover {
        background: #c8e6c9;
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    // Click to focus/toggle
    this.inputArea.addEventListener("click", (e) => {
      if (e.target === this.inputArea || e.target === this.tagsContainer) {
        this.input.focus();
      }
    });

    // Arrow click
    this.arrow.addEventListener("click", () => {
      this.toggle();
    });

    // Input events
    this.input.addEventListener("input", () => {
      this.filterOptions();
      this.updatePlaceholderVisibility();
    });

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleEnter();
      } else if (e.key === "Backspace" && this.input.value === "") {
        this.removeLastTag();
      } else if (e.key === "Escape") {
        this.close();
      }
    });

    this.input.addEventListener("focus", () => {
      this.open();
      this.updatePlaceholderVisibility();
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.dropdown.classList.add("open");
    this.arrow.classList.add("open");
    this.renderOptions();
  }

  close() {
    this.isOpen = false;
    this.dropdown.classList.remove("open");
    this.arrow.classList.remove("open");
    this.input.value = "";
    this.updatePlaceholderVisibility();
  }

  renderOptions() {
    const query = this.input.value.trim();
    this.dropdown.innerHTML = "";

    const filteredItems = this.items.filter(
      (item) =>
        item.toLowerCase().includes(query.toLowerCase()) &&
        !this.selectedValues.has(item)
    );

    // Show existing options
    filteredItems.forEach((item) => {
      const option = document.createElement("div");
      option.className = "msd-option";
      option.textContent = item;
      option.addEventListener("click", () => {
        this.selectItem(item);
      });
      this.dropdown.appendChild(option);
    });

    // Show "Add new" option if custom entries allowed and query is not empty
    if (
      this.options.allowCustom &&
      query &&
      !this.items.includes(query) &&
      !this.selectedValues.has(query)
    ) {
      const addNewOption = document.createElement("div");
      addNewOption.className = "msd-option add-new";
      addNewOption.textContent = `Add "${query}"`;
      addNewOption.addEventListener("click", () => {
        this.addNewItem(query);
      });
      this.dropdown.appendChild(addNewOption);
    }

    // Show message if no options
    if (this.dropdown.children.length === 0) {
      const noOptions = document.createElement("div");
      noOptions.className = "msd-option";
      noOptions.style.color = "#6c757d";
      noOptions.style.fontStyle = "italic";
      noOptions.textContent = query
        ? "No matching options"
        : "No options available";
      this.dropdown.appendChild(noOptions);
    }
  }

  filterOptions() {
    if (this.isOpen) {
      this.renderOptions();
    }
  }

  handleEnter() {
    const query = this.input.value.trim();
    if (!query) return;

    // Check if input contains commas - split into multiple items
    if (query.includes(",")) {
      const items = query
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
      items.forEach((item) => {
        // Check if there's an exact match in the existing items
        const exactMatch = this.items.find(
          (existingItem) =>
            existingItem.toLowerCase() === item.toLowerCase() &&
            !this.selectedValues.has(existingItem)
        );

        if (exactMatch) {
          this.selectItem(exactMatch);
        } else if (this.options.allowCustom && !this.selectedValues.has(item)) {
          this.addNewItem(item);
        }
      });
    } else {
      // Handle single item (original logic)
      // Check if there's an exact match in the filtered list
      const exactMatch = this.items.find(
        (item) =>
          item.toLowerCase() === query.toLowerCase() &&
          !this.selectedValues.has(item)
      );

      if (exactMatch) {
        this.selectItem(exactMatch);
      } else if (this.options.allowCustom && !this.selectedValues.has(query)) {
        this.addNewItem(query);
      }
    }
  }

  selectItem(item) {
    if (!this.selectedValues.has(item)) {
      if (!this.options.multiSelect) {
        // For single select, clear existing selection
        this.selectedValues.clear();
      }
      this.selectedValues.add(item);
      this.updateTags();
      this.input.value = "";
      this.renderOptions();
      this.triggerChange();

      // Close dropdown for single select
      if (!this.options.multiSelect) {
        this.close();
      }
    }
  }

  addNewItem(item) {
    if (!this.items.includes(item)) {
      this.items.push(item);
    }
    this.selectItem(item);
  }

  removeItem(item) {
    this.selectedValues.delete(item);
    this.updateTags();
    this.renderOptions();
    this.triggerChange();
  }

  removeLastTag() {
    const values = Array.from(this.selectedValues);
    if (values.length > 0) {
      this.removeItem(values[values.length - 1]);
    }
  }

  updateTags() {
    this.tagsContainer.innerHTML = "";

    Array.from(this.selectedValues).forEach((value) => {
      const tag = document.createElement("div");
      tag.className = "msd-tag";

      const text = document.createElement("span");
      text.textContent = value;

      const remove = document.createElement("span");
      remove.className = "msd-tag-remove";
      remove.textContent = "\u00D7"; // Multiplication sign
      remove.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeItem(value);
      });

      tag.appendChild(text);
      tag.appendChild(remove);
      this.tagsContainer.appendChild(tag);
    });

    // Update placeholder visibility
    this.updatePlaceholderVisibility();
  }

  updatePlaceholderVisibility() {
    if (this.selectedValues.size > 0 || this.input.value.trim() !== "") {
      this.inputArea.classList.add("has-content");
    } else {
      this.inputArea.classList.remove("has-content");
    }
  }

  triggerChange() {
    const event = new CustomEvent("change", {
      detail: {
        values: Array.from(this.selectedValues),
        items: this.items,
      },
    });
    this.container.dispatchEvent(event);
  }

  // Public methods
  setItems(items) {
    this.items = [...items];
    if (this.isOpen) {
      this.renderOptions();
    }
  }

  addItems(newItems) {
    newItems.forEach((item) => {
      if (!this.items.includes(item)) {
        this.items.push(item);
      }
    });
    if (this.isOpen) {
      this.renderOptions();
    }
  }

  getValues() {
    return Array.from(this.selectedValues);
  }

  setValues(values) {
    this.selectedValues = new Set(values);
    this.updateTags();
    if (this.isOpen) {
      this.renderOptions();
    }
    this.updatePlaceholderVisibility();
  }

  clear() {
    this.selectedValues.clear();
    this.updateTags();
    if (this.isOpen) {
      this.renderOptions();
    }
    this.updatePlaceholderVisibility();
  }

  getValuesAsString() {
    return Array.from(this.selectedValues).join(this.options.separator);
  }

  updateItems(newItems) {
    this.items = newItems || [];
    if (this.isOpen) {
      this.renderOptions();
    }
  }

  destroy() {
    this.container.innerHTML = "";
  }
}

// Export for use in popup
if (typeof module !== "undefined" && module.exports) {
  module.exports = MultiSelectDropdown;
} else if (typeof window !== "undefined") {
  window.MultiSelectDropdown = MultiSelectDropdown;
}
