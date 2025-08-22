// --- Global State Variables ---
let defaultData = {};
let pointsData = {};
let bonusCategories = [];
// CHANGE: Renamed localStorage key prefix.
let localStorageKey = 'PointsData-default';

// --- DOM Element Caching ---
const appTitle = document.getElementById('app-title');
const appDescription = document.getElementById('app-description');
const pointsContainer = document.getElementById('points-container');
const globalTotalDisplay = document.getElementById('global-total');
const exportBtn = document.getElementById('export-btn');
const resetBtn = document.getElementById('reset-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmResetBtn = document.getElementById('confirm-reset-btn');
const cancelResetBtn = document.getElementById('cancel-reset-btn');

/**
 * Initializes app state by adding 'count' properties to all items in point groups.
 */
const initializeDataWithCounts = (sourceGroups) => {
    const initialized = JSON.parse(JSON.stringify(sourceGroups));
    for (const groupName in initialized) {
        initialized[groupName].forEach(item => {
            if (item.count === undefined) item.count = 0;
        });
    }
    return initialized;
};

// --- Data Persistence ---
const saveData = () => localStorage.setItem(localStorageKey, JSON.stringify(pointsData));
const loadData = () => {
    const storedData = localStorage.getItem(localStorageKey);
    pointsData = storedData ? JSON.parse(storedData) : initializeDataWithCounts(defaultData.groups);
};

// --- Core Game Logic ---
const compare = (val1, op, val2) => {
    switch (op) {
        case '>': return val1 > val2;
        case '<': return val1 < val2;
        case '>=': return val1 >= val2;
        case '<=': return val1 <= val2;
        case '===': return val1 === val2;
        case '!==': return val1 !== val2;
        default: return false;
    }
};

const evaluateBonusConditions = () => {
    bonusCategories.forEach(groupName => {
        const bonusGroup = pointsData[groupName];
        if (!bonusGroup) return;

        bonusGroup.forEach(bonus => {
            const { condition } = bonus;
            if (!condition) return;
            const targetItems = pointsData[condition.targetCategory];
            if (!targetItems) return;

            switch (condition.type) {
                case 'everyItem':
                    bonus.count = targetItems.every(item => compare(item[condition.property], condition.operator, condition.value)) ? 1 : 0;
                    break;
                case 'countMatchingItems':
                    bonus.count = targetItems.filter(item => compare(item[condition.property], condition.operator, condition.value)).length;
                    break;
            }
        });
    });
};

const updateGlobalTotal = () => {
    evaluateBonusConditions();
    let total = 0;
    for (const groupName in pointsData) {
        pointsData[groupName].forEach(item => {
            total += item.points * item.count;
        });
    }
    globalTotalDisplay.textContent = total;
    saveData();
};

// --- UI Rendering and Event Handling ---
const handlePointsUpdate = (groupName, itemIndex, isIncrement) => {
    const item = pointsData[groupName][itemIndex];
    if (isIncrement) {
        item.count++;
    } else if (item.count > 0) {
        item.count--;
    }
    updateGlobalTotal();
    renderPointsGroups();
};

const createItemCard = (item, groupName) => {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card p-4 rounded-xl shadow-md border border-gray-700 flex flex-col justify-between';

    const isBonusCategory = bonusCategories.includes(groupName);
    let buttonHtml = '';

    if (!isBonusCategory) {
        buttonHtml = `
            <button class="points-btn points-minus-btn button-minus"><i class="fas fa-minus"></i></button>
            <button class="points-btn points-plus-btn button-plus"><i class="fas fa-plus"></i></button>
        `;
    }

    itemCard.innerHTML = `
        <div class="mb-2">
            <h3 class="text-xl font-semibold text-white leading-tight">${item.name}</h3>
            <p class="text-sm text-gray-400">Points: <span class="font-bold text-blue-300">${item.points}</span></p>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-400">
                ${isBonusCategory ? 'Earned' : 'Count'}: 
                <span class="count-display text-lg font-bold text-white">${item.count}</span>
            </span>
            <div class="flex gap-2 button-container">${buttonHtml}</div>
        </div>
    `;
    itemCard.querySelectorAll('.points-btn').forEach(btn => {
        btn.classList.add('text-white', 'text-2xl', 'rounded-full', 'flex', 'items-center', 'justify-center', 'hover:bg-opacity-80', 'transition', 'duration-200', 'transform', 'hover:scale-110');
    });
    return itemCard;
};

const renderPointsGroups = () => {
    pointsContainer.innerHTML = '';
    for (const groupName in pointsData) {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card p-6 rounded-2xl shadow-lg border border-gray-600';
        const groupTitle = document.createElement('h2');
        groupTitle.className = 'text-3xl font-bold text-blue-400 mb-6';
        groupTitle.textContent = groupName;
        groupCard.appendChild(groupTitle);
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';
        pointsData[groupName].forEach((item, itemIndex) => {
            const itemCard = createItemCard(item, groupName);
            itemCard.dataset.group = groupName;
            itemCard.dataset.index = itemIndex;
            itemsGrid.appendChild(itemCard);
        });
        groupCard.appendChild(itemsGrid);
        pointsContainer.appendChild(groupCard);
    }
};

const attachEventListeners = () => {
    pointsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.points-btn');
        if (!button) return;
        const itemCard = button.closest('.item-card');
        if (!itemCard) return;
        const { group, index } = itemCard.dataset;
        const isIncrement = button.classList.contains('points-plus-btn');
        handlePointsUpdate(group, parseInt(index, 10), isIncrement);
    });
};

// --- Button Event Listeners ---
// CHANGE: The export format is now Tab-Separated Values (TSV).
exportBtn.addEventListener('click', () => {
    // 1. Create the header row for the spreadsheet.
    let exportString = "Category\tItem\tCount\tPoints\tTotal\n";

    // 2. Loop through all data to build the rows.
    for (const groupName in pointsData) {
        const itemsWithCount = pointsData[groupName].filter(item => item.count > 0);
        if (itemsWithCount.length === 0) continue;

        itemsWithCount.forEach(item => {
            const totalPoints = item.count * item.points;
            exportString += `${groupName}\t${item.name}\t${item.count}\t${item.points}\t${totalPoints}\n`;
        });
    }

    // 3. Add a final row for the grand total.
    exportString += `\nTotal\t\t\t\t${globalTotalDisplay.textContent}`;

    // 4. Copy the TSV string to the clipboard.
    navigator.clipboard.writeText(exportString).then(() => {
        alert("Score data copied to clipboard!\nReady to paste into Google Sheets or Excel.");
    }).catch(err => {
        console.error('Failed to copy points: ', err);
    });
});

resetBtn.addEventListener('click', () => confirmationModal.classList.remove('hidden'));
cancelResetBtn.addEventListener('click', () => confirmationModal.classList.add('hidden'));
confirmResetBtn.addEventListener('click', () => {
    localStorage.removeItem(localStorageKey);
    pointsData = initializeDataWithCounts(defaultData.groups);
    confirmationModal.classList.add('hidden');
    updateGlobalTotal();
    renderPointsGroups();
});

// --- Application Initialization ---
const init = async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        // CHANGE: URL parameter is now 'data'.
        const dataFile = urlParams.get('data') || 'points';
        const jsonFileName = `${dataFile}.json`;

        // CHANGE: localStorageKey is now 'PointsData-...'
        localStorageKey = `PointsData-${dataFile}`;

        const response = await fetch(jsonFileName);
        if (!response.ok) throw new Error(`Could not load '${jsonFileName}'.`);

        defaultData = await response.json();

        document.title = defaultData.meta.title;
        appTitle.textContent = defaultData.meta.title;
        appDescription.textContent = defaultData.meta.description;
        bonusCategories = defaultData.meta.bonusCategories || [];

        attachEventListeners();
        loadData();
        updateGlobalTotal();
        renderPointsGroups();

    } catch (error) {
        console.error("Initialization Error:", error);
        appTitle.textContent = 'Error';
        appDescription.textContent = error.message;
    }
};

init();