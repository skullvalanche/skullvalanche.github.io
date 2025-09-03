// --- Global State Variables ---
let defaultData = {};
let pointsData = {};
let bonusCategories = [];
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

const initializeDataWithCounts = (sourceGroups) => { const i = JSON.parse(JSON.stringify(sourceGroups)); for (const g in i) { i[g].forEach(item => { if (item.count === undefined) item.count = 0; }); } return i; };
const saveData = () => localStorage.setItem(localStorageKey, JSON.stringify(pointsData));
const loadData = () => { const d = localStorage.getItem(localStorageKey); pointsData = d ? JSON.parse(d) : initializeDataWithCounts(defaultData.groups); };

const evaluateBonusConditions = () => {
    bonusCategories.forEach(groupName => {
        const bonusGroup = pointsData[groupName];
        if (!bonusGroup) return;

        bonusGroup.forEach(bonus => {
            // Each bonus item is a self-contained rule.
            // We calculate the points it awards and store it in `bonus.count`.
            let bonusPoints = 0;
            const { type, points, targetCategory } = bonus;

            // All bonus types need a target category. If it's missing or invalid, no points are awarded.
            if (!targetCategory) {
                bonus.count = 0;
                return; // continue to next bonus
            }
            const targetItems = pointsData[targetCategory];
            if (!targetItems) {
                bonus.count = 0;
                return; // continue to next bonus
            }

            switch (type) {
                case 'everyItem': {
                    // This bonus is awarded once when the condition is met and is not removed.
                    if (bonus.awarded) {
                        bonusPoints = points;
                        break;
                    }
                    if (targetItems.every(item => item.count > 0)) {
                        bonusPoints = points;
                        bonus.awarded = true; // Mark as awarded for the session.
                    }
                    break;
                }
                case 'between': {
                    // This bonus awards points for each item with a count within a specified range.
                    const { lower, upper } = bonus;
                    targetItems.forEach(item => {
                        if (item.count >= lower && item.count < upper) {
                            bonusPoints += points;
                        }
                    });
                    break;
                }
            }
            bonus.count = bonusPoints;
        });
    });
};

const updateGlobalTotal = () => {
    evaluateBonusConditions();
    let total = 0;
    for (const groupName in pointsData) {
        pointsData[groupName].forEach(item => {
            if (bonusCategories.includes(groupName)) {
                // For bonuses, 'count' already holds the total calculated points.
                total += item.count || 0;
            } else {
                // For regular items, it's points * count.
                total += (item.points || 0) * (item.count || 0);
            }
        });
    }
    globalTotalDisplay.textContent = total;
    saveData();
};

const handlePointsUpdate = (groupName, itemIndex, isIncrement) => { const item = pointsData[groupName][itemIndex]; if (isIncrement) { item.count++; } else if (item.count > 0) { item.count--; } updateGlobalTotal(); renderPointsGroups(); };

const createItemCard = (item, groupName) => {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card p-4 rounded-xl shadow-md border border-gray-700 flex flex-col justify-between';
    const isBonusCategory = bonusCategories.includes(groupName);
    let buttonHtml = '';

    if (!isBonusCategory) {
        buttonHtml = `<button class="points-btn points-minus-btn button-minus"><i class="fas fa-minus"></i></button><button class="points-btn points-plus-btn button-plus"><i class="fas fa-plus"></i></button>`;
    }

    const pointsDisplay = isBonusCategory ? `(Conditional)` : `<span class="font-bold text-blue-300">${item.points || 0}</span>`;

    itemCard.innerHTML = `
        <div class="mb-2">
            <h3 class="text-xl font-semibold text-white leading-tight">${item.name}</h3>
            <p class="text-sm text-gray-400">Points: ${pointsDisplay}</p>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-400">
                ${isBonusCategory ? 'Points Earned' : 'Count'}: 
                <span class="count-display text-lg font-bold text-white">${item.count || 0}</span>
            </span>
            <div class="flex gap-2 button-container">${buttonHtml}</div>
        </div>
    `;
    itemCard.querySelectorAll('.points-btn').forEach(btn => { btn.classList.add('text-white', 'text-2xl', 'rounded-full', 'flex', 'items-center', 'justify-center', 'hover:bg-opacity-80', 'transition', 'duration-200', 'transform', 'hover:scale-110'); });
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
        pointsData[groupName].forEach((item, itemIndex) => { const itemCard = createItemCard(item, groupName); itemCard.dataset.group = groupName; itemCard.dataset.index = itemIndex; itemsGrid.appendChild(itemCard); });
        groupCard.appendChild(itemsGrid);
        pointsContainer.appendChild(groupCard);
    }
};

const attachEventListeners = () => { pointsContainer.addEventListener('click', (event) => { const button = event.target.closest('.points-btn'); if (!button) return; const itemCard = button.closest('.item-card'); if (!itemCard) return; const { group, index } = itemCard.dataset; const isIncrement = button.classList.contains('points-plus-btn'); handlePointsUpdate(group, parseInt(index, 10), isIncrement); }); };

exportBtn.addEventListener('click', () => {
    let exportString = "Category\tItem\tCount\tPoints\tTotal\n";
    for (const groupName in pointsData) {
        const itemsWithCount = pointsData[groupName].filter(item => item.count > 0);
        if (itemsWithCount.length === 0) continue;
        itemsWithCount.forEach(item => {
            const isBonus = bonusCategories.includes(groupName);
            const points = isBonus ? 1 : (item.points || 0);
            const total = item.count * points;
            exportString += `${groupName}\t${item.name}\t${item.count}\t${points}\t${total}\n`;
        });
    }
    exportString += `\nTotal\t\t\t\t${globalTotalDisplay.textContent}`;
    navigator.clipboard.writeText(exportString).then(() => { alert("Score data copied to clipboard!"); }).catch(err => console.error('Failed to copy points: ', err));
});

resetBtn.addEventListener('click', () => confirmationModal.classList.remove('hidden'));
cancelResetBtn.addEventListener('click', () => confirmationModal.classList.add('hidden'));
confirmResetBtn.addEventListener('click', () => { localStorage.removeItem(localStorageKey); pointsData = initializeDataWithCounts(defaultData.groups); confirmationModal.classList.add('hidden'); updateGlobalTotal(); renderPointsGroups(); });

const init = async () => { try { let dataFile = 'points_v2'; const hashString = window.location.hash; if (hashString.length > 1) { dataFile = hashString.substring(1); } const jsonFileName = `${dataFile}.json`; localStorageKey = `PointsData-${dataFile}`; const response = await fetch(jsonFileName); if (!response.ok) throw new Error(`Could not load '${jsonFileName}'.`); defaultData = await response.json(); document.title = defaultData.meta.title; appTitle.textContent = defaultData.meta.title; appDescription.textContent = defaultData.meta.description; bonusCategories = defaultData.meta.bonusCategories || []; attachEventListeners(); loadData(); updateGlobalTotal(); renderPointsGroups(); } catch (error) { console.error("Initialization Error:", error); appTitle.textContent = 'Error'; appDescription.textContent = error.message; } };
init();