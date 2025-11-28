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

const mergeData = (freshGroups, savedData) => {
    const merged = {};
    for (const groupName in freshGroups) {
        merged[groupName] = freshGroups[groupName].map(freshItem => {
            const item = { ...freshItem };
            // Default state
            item.count = 0;

            // Restore state from saved data if it exists
            if (savedData && savedData[groupName]) {
                const savedItem = savedData[groupName].find(si => si.name === freshItem.name);
                if (savedItem) {
                    item.count = savedItem.count || 0;
                    if (savedItem.awarded !== undefined) item.awarded = savedItem.awarded;
                }
            }
            return item;
        });
    }
    return merged;
};

const saveData = () => localStorage.setItem(localStorageKey, JSON.stringify(pointsData));
const loadData = () => {
    const d = localStorage.getItem(localStorageKey);
    const savedData = d ? JSON.parse(d) : null;
    pointsData = mergeData(defaultData.groups, savedData);
};

const evaluateBonusConditions = () => {
    bonusCategories.forEach(groupName => {
        const bonusGroup = pointsData[groupName];
        if (!bonusGroup) return;

        bonusGroup.forEach(bonus => {
            let bonusPoints = 0;
            const { type, points, targetCategory, threshold } = bonus;

            if (!targetCategory) {
                bonus.count = 0;
                return;
            }
            const targetItems = pointsData[targetCategory];
            if (!targetItems) {
                bonus.count = 0;
                return;
            }

            if (type === 'everyItem') {
                if (bonus.awarded) {
                    bonusPoints = points;
                } else if (targetItems.every(item => item.count > 0)) {
                    bonusPoints = points;
                    bonus.awarded = true;
                }
            } else if (type === 'threshold') {
                targetItems.forEach(item => {
                    if (item.count >= threshold) {
                        bonusPoints += (item.count - (threshold - 1)) * points;
                    }
                });
            }
            bonus.count = bonusPoints;
        });
    });
};

const updateGlobalTotal = () => {
    evaluateBonusConditions();
    let regularTotal = 0;
    const bonusDetails = [];

    for (const groupName in pointsData) {
        if (bonusCategories.includes(groupName)) {
            pointsData[groupName].forEach(bonus => {
                if (bonus.count > 0) {
                    bonusDetails.push({ name: bonus.name, points: bonus.count });
                }
            });
        } else {
            pointsData[groupName].forEach(item => {
                regularTotal += (item.points || 0) * (item.count || 0);
            });
        }
    }

    const bonusTotal = bonusDetails.reduce((sum, bonus) => sum + bonus.points, 0);
    const grandTotal = regularTotal + bonusTotal;

    let bonusHtml = bonusDetails.map(b => `<div class="text-sm">${b.name}: +${b.points}</div>`).join('');
    globalTotalDisplay.innerHTML = `
        <div class="text-4xl font-bold">${grandTotal}</div>
        <div class="mt-2">${bonusHtml}</div>
    `;

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

    const pointsDisplay = `<span class="font-bold text-blue-300">${item.points || 0}</span>`;

    itemCard.innerHTML = `
        <div class="mb-2">
            <h3 class="text-xl font-semibold text-white leading-tight">${item.name}</h3>
            <p class="text-sm text-gray-400">Value: ${pointsDisplay}</p>
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
        if (bonusCategories.includes(groupName)) continue;
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

const attachEventListeners = () => {
    pointsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.points-btn'); if (!button) return;
        const itemCard = button.closest('.item-card'); if (!itemCard) return;
        const { group, index } = itemCard.dataset;
        const isIncrement = button.classList.contains('points-plus-btn');
        handlePointsUpdate(group, parseInt(index, 10), isIncrement);
    });
};

exportBtn.addEventListener('click', () => {
    let exportString = "Category\tItem\tCount\tPoints\tTotal\n";
    let regularTotal = 0;
    const bonusDetails = [];

    for (const groupName in pointsData) {
        if (bonusCategories.includes(groupName)) {
            pointsData[groupName].forEach(bonus => {
                if (bonus.count > 0) {
                    bonusDetails.push({ name: bonus.name, points: bonus.count });
                }
            });
        } else {
            pointsData[groupName].forEach(item => {
                if (item.count > 0) {
                    const itemTotal = (item.points || 0) * (item.count || 0);
                    exportString += `${groupName}\t${item.name}\t${item.count}\t${item.points || 0}\t${itemTotal}\n`;
                    regularTotal += itemTotal;
                }
            });
        }
    }

    const bonusTotal = bonusDetails.reduce((sum, bonus) => sum + bonus.points, 0);
    bonusDetails.forEach(b => {
        exportString += `Bonuses\t${b.name}\t1\t${b.points}\t${b.points}\n`;
    });

    const grandTotal = regularTotal + bonusTotal;
    exportString += `\nTotal\t\t\t\t${grandTotal}`;
    navigator.clipboard.writeText(exportString).then(() => { alert("Score data copied to clipboard!"); }).catch(err => console.error('Failed to copy points: ', err));
});

resetBtn.addEventListener('click', () => confirmationModal.classList.remove('hidden'));
cancelResetBtn.addEventListener('click', () => confirmationModal.classList.add('hidden'));
confirmResetBtn.addEventListener('click', () => { localStorage.removeItem(localStorageKey); pointsData = initializeDataWithCounts(defaultData.groups); confirmationModal.classList.add('hidden'); updateGlobalTotal(); renderPointsGroups(); });

const init = async () => { try { let dataFile = 'points'; const hashString = window.location.hash; if (hashString.length > 1) { dataFile = hashString.substring(1); } const jsonFileName = `${dataFile}.json`; localStorageKey = `PointsData-${dataFile}`; const response = await fetch(jsonFileName); if (!response.ok) throw new Error(`Could not load '${jsonFileName}'.`); defaultData = await response.json(); document.title = defaultData.meta.title; appTitle.textContent = defaultData.meta.title; appDescription.textContent = defaultData.meta.description; bonusCategories = defaultData.meta.bonusCategories || []; attachEventListeners(); loadData(); updateGlobalTotal(); renderPointsGroups(); } catch (error) { console.error("Initialization Error:", error); appTitle.textContent = 'Error'; appDescription.textContent = error.message; } };
init();
