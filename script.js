// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
//     iconUrl: 'leaflet/images/marker-icon.png',
//     shadowUrl: 'leaflet/images/marker-shadow.png',
// });

const map = L.map('map', { zoomControl: false }).setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

let locations = [];
let currentMarker = null;
let searchHistory = JSON.parse(localStorage.getItem('mapHistory')) || [];

const continentViews = {
    "Europe": { center: [50, 15], zoom: 4 },
    "Asia": { center: [34, 100], zoom: 3 },
    "Americas": { center: [15, -85], zoom: 3 },
    "Africa": { center: [2, 20], zoom: 3 },
    "Oceania": { center: [-25, 135], zoom: 4 }
};

fetch('locations.json')
    .then(res => res.json())
    .then(data => {
        locations = data;
        renderHistory();
    });

function handleSearch(queryOverride = null) {
    const query = (queryOverride || document.getElementById('search-input').value).toLowerCase().trim();
    if (!query) return;
    const result = locations.find(loc => 
        loc.keyword.includes(query) || 
        loc.name.toLowerCase().includes(query)
    );
    if (result) {
        focusOnLocation(result);
        addToHistory(result.name);
        document.getElementById('history-container').style.display = 'none';
    } else {
        const input = document.getElementById('search-input');
        input.style.border = "2px solid #ea4335";
        setTimeout(() => input.style.border = "none", 2000);
    }
}

function focusOnLocation(loc) {
    const locImg = document.getElementById('loc-img');
    
    document.getElementById('loc-title').innerText = loc.name;
    document.getElementById('loc-desc').innerText = loc.desc;
    locImg.src = loc.img;
    locImg.onerror = function() {
        this.src = 'assets/default.jpeg';
    };
    document.getElementById('info-card').classList.add('active');
    if (currentMarker) map.removeLayer(currentMarker);
    currentMarker = L.marker([loc.lat, loc.lng]).addTo(map);
    map.flyTo([loc.lat, loc.lng], 10, { duration: 2 });
}

function addToHistory(name) {
    searchHistory = searchHistory.filter(item => item !== name);
    searchHistory.unshift(name);
    if (searchHistory.length > 5) searchHistory.pop();
    localStorage.setItem('mapHistory', JSON.stringify(searchHistory));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const container = document.getElementById('history-container');
    
    if (searchHistory.length === 0) {
        container.style.display = 'none';
        return;
    }

    list.innerHTML = searchHistory.map(name => `⁠ <li>${name}</li> ⁠`).join('');
    list.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => handleSearch(li.innerText));
    });
}

document.getElementById('clear-history').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    searchHistory = [];
    localStorage.removeItem('mapHistory');
    renderHistory();
});

document.querySelectorAll('.cont-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const continent = chip.getAttribute('data-continent');
        const view = continentViews[continent];

        document.querySelectorAll('.cont-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        closeCard();

        map.flyTo(view.center, view.zoom, { duration: 1.5 });
    });
});

document.getElementById('search-button').addEventListener('click', () => handleSearch());
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
document.getElementById('search-input').addEventListener('focus', () => {
    if (searchHistory.length > 0) document.getElementById('history-container').style.display = 'block';
});

document.addEventListener('click', (e) => {
    if (!document.querySelector('.search-container').contains(e.target)) {
        document.getElementById('history-container').style.display = 'none';
    }
});

function closeCard() {
    document.getElementById('info-card').classList.remove('active');
    if (currentMarker) map.removeLayer(currentMarker);
}

document.querySelectorAll('.poi-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const type = chip.getAttribute('data-type');
        alert(`Searching for ${type}s near current view... (Feature coming soon!)`);
    });
});
