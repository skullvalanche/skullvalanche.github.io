document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element Caching ---
  const metaTitle = document.getElementById('meta-title');
  const metaDescription = document.getElementById('meta-description');
  const categoriesContainer = document.getElementById('categories-container');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const generateJsonBtn = document.getElementById('generate-json-btn');
  const jsonOutput = document.getElementById('json-output');
  const copyJsonBtn = document.getElementById('copy-json-btn');

  // --- Core Functions ---

  /**
   * Creates and appends a new category card to the container.
   */
  const addCategory = () => {
    const categoryId = `category-${Date.now()}`;
    const categoryCard = document.createElement('div');
    categoryCard.className = 'card category-card';
    categoryCard.id = categoryId;
    categoryCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <input type="text" class="input !w-1/2 category-name" placeholder="Category Name (e.g., Events)">
                <div class="flex items-center gap-4">
                    <label class="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" class="is-bonus-category w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600">
                        Is Bonus Category?
                    </label>
                    <button class="btn btn-danger btn-sm delete-category-btn">Delete Category</button>
                </div>
            </div>
            <div class="space-y-3 items-container">
                <!-- Items will be added here -->
            </div>
            <button class="btn btn-secondary btn-sm mt-4 add-item-btn">Add Item</button>
        `;
    categoriesContainer.appendChild(categoryCard);
    updateAllTargetCategoryDropdowns();
  };

  /**
   * Creates and appends a new item row to a category's item container.
   * @param {HTMLElement} itemsContainer - The container to append the new item to.
   * @param {boolean} isBonus - Whether the parent category is a bonus category.
   */
  const addItem = (itemsContainer, isBonus) => {
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
            <input type="text" class="input item-name" placeholder="Item Name">
            <input type="number" class="input item-points w-28" placeholder="Points" value="10">
            <div class="condition-section flex-grow grid grid-cols-4 gap-2 ${isBonus ? '' : 'hidden'}">
                <select class="input condition-type">
                    <option value="everyItem">All Match</option>
                    <option value="countMatchingItems">Count Matches</option>
                </select>
                <select class="input condition-target" title="Target Category">
                    <!-- Options will be populated dynamically -->
                </select>
                <select class="input condition-operator">
                    <option value=">">&gt;</option>
                    <option value=">=">&ge;</option>
                    <option value="===">=</option>
                </select>
                <input type="number" class="input condition-value" placeholder="Value" value="0">
            </div>
            <button class="btn btn-danger btn-sm delete-item-btn ml-auto">X</button>
        `;
    itemsContainer.appendChild(itemRow);
    updateAllTargetCategoryDropdowns();
  };

  /**
   * Updates all target category dropdowns with the current list of categories.
   */
  const updateAllTargetCategoryDropdowns = () => {
    const categoryNames = [...document.querySelectorAll('.category-name')].map(input => input.value || 'Unnamed').filter(name => name);
    const allDropdowns = document.querySelectorAll('.condition-target');

    allDropdowns.forEach(dropdown => {
      const currentValue = dropdown.value;
      dropdown.innerHTML = categoryNames.map(name => `<option value="${name}">${name}</option>`).join('');
      dropdown.value = currentValue; // Preserve selection if possible
    });
  };

  /**
   * Parses the entire form and generates the final JSON object.
   */
  const generateJson = () => {
    try {
      const output = {
        meta: {
          title: metaTitle.value,
          description: metaDescription.value,
          bonusCategories: []
        },
        groups: {}
      };

      const categoryCards = document.querySelectorAll('.category-card');
      categoryCards.forEach(card => {
        const categoryNameInput = card.querySelector('.category-name');
        const categoryName = categoryNameInput.value.trim();
        if (!categoryName) return; // Skip empty categories

        const isBonus = card.querySelector('.is-bonus-category').checked;
        if (isBonus) {
          output.meta.bonusCategories.push(categoryName);
        }

        output.groups[categoryName] = [];

        const itemRows = card.querySelectorAll('.item-row');
        itemRows.forEach(row => {
          const itemName = row.querySelector('.item-name').value.trim();
          const itemPoints = parseInt(row.querySelector('.item-points').value, 10);
          if (!itemName) return; // Skip empty items

          const item = { name: itemName, points: isNaN(itemPoints) ? 0 : itemPoints };

          if (isBonus) {
            item.condition = {
              type: row.querySelector('.condition-type').value,
              targetCategory: row.querySelector('.condition-target').value,
              property: 'count', // Hardcoded as per app logic
              operator: row.querySelector('.condition-operator').value,
              value: parseInt(row.querySelector('.condition-value').value, 10) || 0
            };
          }
          output.groups[categoryName].push(item);
        });
      });

      jsonOutput.value = JSON.stringify(output, null, 2);
      jsonOutput.classList.remove('border-red-500');
    } catch (error) {
      console.error("Error generating JSON:", error);
      jsonOutput.value = `Error: ${error.message}`;
      jsonOutput.classList.add('border-red-500');
    }
  };

  // --- Event Listeners ---

  // Add initial category
  addCategory();

  addCategoryBtn.addEventListener('click', addCategory);
  generateJsonBtn.addEventListener('click', generateJson);

  copyJsonBtn.addEventListener('click', () => {
    jsonOutput.select();
    navigator.clipboard.writeText(jsonOutput.value).then(() => {
      alert('JSON copied to clipboard!');
    });
  });

  // Delegated event listener for dynamic elements
  categoriesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-item-btn')) {
      const card = e.target.closest('.category-card');
      const itemsContainer = card.querySelector('.items-container');
      const isBonus = card.querySelector('.is-bonus-category').checked;
      addItem(itemsContainer, isBonus);
    }
    if (e.target.classList.contains('delete-item-btn')) {
      e.target.closest('.item-row').remove();
    }
    if (e.target.classList.contains('delete-category-btn')) {
      e.target.closest('.category-card').remove();
      updateAllTargetCategoryDropdowns();
    }
  });

  categoriesContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('is-bonus-category')) {
      const card = e.target.closest('.category-card');
      const conditionSections = card.querySelectorAll('.condition-section');
      conditionSections.forEach(section => {
        section.classList.toggle('hidden', !e.target.checked);
      });
    }
  });

  // Update dropdowns whenever a category name is changed
  categoriesContainer.addEventListener('keyup', (e) => {
    if (e.target.classList.contains('category-name')) {
      updateAllTargetCategoryDropdowns();
    }
  });
});