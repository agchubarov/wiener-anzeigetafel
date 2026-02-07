// Wien U-Bahn Anzeigetafel — Main Entry Point

import './style.css';
import { lines } from './stations';
import { fetchDepartures } from './api';
import type { DisplayDeparture } from './types';

// =============================================================================
// DOM Elements
// =============================================================================

const elements = {
    departures: document.querySelector('.tafel__departures') as HTMLElement,
    rows: document.querySelectorAll('.led-row') as NodeListOf<HTMLElement>,
    gleisNumber: document.querySelector('.tafel__gleis-number') as HTMLElement,
    hourHand: document.getElementById('hour-hand') as unknown as SVGLineElement,
    minuteHand: document.getElementById('minute-hand') as unknown as SVGLineElement,
    sidebarToggle: document.getElementById('sidebar-toggle') as HTMLButtonElement,
    sidebar: document.getElementById('sidebar') as HTMLElement,
    sidebarOverlay: document.getElementById('sidebar-overlay') as HTMLElement,
    stationList: document.getElementById('station-list') as HTMLElement,
};

// =============================================================================
// State
// =============================================================================

let currentRblIds: number[] = [];
let pollInterval: ReturnType<typeof setInterval> | null = null;
let terminusMessageInterval: ReturnType<typeof setInterval> | null = null;
let isTerminusDirection = false; // True when at terminus and selected direction towards same terminus
const POLL_INTERVAL_MS = 30_000;
const TERMINUS_MESSAGE_INTERVAL_MS = 2500; // Alternate message every 2.5 seconds

// =============================================================================
// Clock
// =============================================================================

function updateClock(): void {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();

    const hourAngle = (hours + minutes / 60) * 30; // 360/12 = 30 degrees per hour
    const minuteAngle = minutes * 6; // 360/60 = 6 degrees per minute

    elements.hourHand.setAttribute('transform', `rotate(${hourAngle} 50 50)`);
    elements.minuteHand.setAttribute('transform', `rotate(${minuteAngle} 50 50)`);
}

// =============================================================================
// LED Row Rendering - 20 cells per row
// =============================================================================

const STATION_CELLS = 17;  // Cells 0-16 for station name

/**
 * Create a full 20-cell LED row
 * Layout: [17 station chars] [1 gap] [2 time digits]
 */
function createLedRow(destination: string, countdown: number | string): string {
    const cells: string[] = [];

    // Prepare station text (left-aligned, 17 chars)
    const stationText = destination.toUpperCase().padEnd(STATION_CELLS, ' ').slice(0, STATION_CELLS);

    // Prepare time text (right-aligned, 2 chars)
    const isArriving = countdown === 'arriving' || countdown === 0;
    const timeText = isArriving ? ' ★' : String(countdown).padStart(2, ' ');
    const blinkClass = isArriving ? ' arriving' : '';

    // Build station cells (0-16)
    for (let i = 0; i < STATION_CELLS; i++) {
        const char = stationText[i];
        cells.push(`<span class="led-cell">${char === ' ' ? '&nbsp;' : char}</span>`);
    }

    // Build gap cell (17)
    cells.push(`<span class="led-cell">&nbsp;</span>`);

    // Build time cells (18-19)
    for (let i = 0; i < 2; i++) {
        const char = timeText[i];
        cells.push(`<span class="led-cell${blinkClass}">${char === ' ' ? '&nbsp;' : char}</span>`);
    }

    return cells.join('');
}

// =============================================================================
// Tafel Rendering
// =============================================================================

function renderDepartures(departures: DisplayDeparture[]): void {
    elements.rows.forEach((row, index) => {
        const dep = departures[index];
        if (dep) {
            row.innerHTML = createLedRow(dep.destination, dep.countdown);
        } else {
            row.innerHTML = createLedRow('---', '--');
        }
    });
}

function setLoading(loading: boolean): void {
    document.querySelector('.tafel')?.classList.toggle('tafel--loading', loading);
}

function setError(error: boolean): void {
    document.querySelector('.tafel')?.classList.toggle('tafel--error', error);
}

// =============================================================================
// Data Fetching
// =============================================================================

async function loadDepartures(): Promise<void> {
    if (currentRblIds.length === 0) return;

    setLoading(true);
    setError(false);

    try {
        const departures = await fetchDepartures(currentRblIds);
        renderDepartures(departures);
    } catch {
        setError(true);
        renderDepartures([]);
    } finally {
        setLoading(false);
    }
}

function startPolling(): void {
    stopPolling();
    loadDepartures();
    pollInterval = setInterval(loadDepartures, POLL_INTERVAL_MS);
}

function stopPolling(): void {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// =============================================================================
// Terminus Display
// =============================================================================

function renderTerminusMessage(showGerman: boolean): void {
    const rows = elements.rows;

    // First row: "NO DEPARTURE" or "NICHT EINSTEIGEN"
    if (rows[0]) {
        rows[0].innerHTML = createLedRow(
            showGerman ? 'NICHT EINSTEIG' : 'NO DEPARTURE',
            '--'
        );
    }

    // Second row: "PLATFORM" or "ENDSTATION"
    if (rows[1]) {
        rows[1].innerHTML = createLedRow(
            showGerman ? 'ENDSTATION' : 'PLATFORM',
            '--'
        );
    }
}

function startTerminusDisplay(): void {
    // Clear any existing terminus interval
    if (terminusMessageInterval) {
        clearInterval(terminusMessageInterval);
    }

    let showGerman = false;

    // Initial render
    renderTerminusMessage(showGerman);

    // Alternate every 2.5 seconds
    terminusMessageInterval = setInterval(() => {
        showGerman = !showGerman;
        renderTerminusMessage(showGerman);
    }, TERMINUS_MESSAGE_INTERVAL_MS);
}

// =============================================================================
// Station Selector
// =============================================================================

function buildStationList(): void {
    elements.stationList.innerHTML = '';

    for (const line of lines) {
        const group = document.createElement('div');
        group.className = 'line-group';

        const header = document.createElement('div');
        header.className = 'line-group__header';
        header.innerHTML = `
      <span class="line-badge line-badge--${line.id}">${line.name}</span>
      <span>${line.name} Linie</span>
    `;
        header.addEventListener('click', () => {
            group.classList.toggle('open');
        });

        const stationsList = document.createElement('div');
        stationsList.className = 'line-group__stations';

        // Get first and last station names for direction labels
        const firstStation = line.stations[0].name;
        const lastStation = line.stations[line.stations.length - 1].name;

        for (const station of line.stations) {
            const stationContainer = document.createElement('div');
            stationContainer.className = 'station-container';

            const btn = document.createElement('button');
            btn.className = 'station-btn';
            btn.textContent = station.name;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Toggle direction dropdown
                const wasExpanded = stationContainer.classList.contains('expanded');
                // Close all other expanded stations
                document.querySelectorAll('.station-container.expanded').forEach(c =>
                    c.classList.remove('expanded'));
                if (!wasExpanded) {
                    stationContainer.classList.add('expanded');
                }
            });

            // Direction dropdown
            const directionDropdown = document.createElement('div');
            directionDropdown.className = 'direction-dropdown';

            // Detect if this station is a terminus
            const isFirstStation = station.name === firstStation;
            const isLastStation = station.name === lastStation;

            // Direction 1 (towards last station)
            const dir1Btn = document.createElement('button');
            dir1Btn.className = 'direction-btn';
            dir1Btn.innerHTML = `<span class="direction-arrow">→</span> Richtung ${lastStation}`;
            dir1Btn.addEventListener('click', () => {
                // If at last station and selecting towards last station = terminus
                const atTerminus = isLastStation;
                selectStationWithDirection(station.name, station.rblIds[0], 1, atTerminus);
                closeSidebar();
            });

            // Direction 2 (towards first station)
            const dir2Btn = document.createElement('button');
            dir2Btn.className = 'direction-btn';
            dir2Btn.innerHTML = `<span class="direction-arrow">←</span> Richtung ${firstStation}`;
            dir2Btn.addEventListener('click', () => {
                // If at first station and selecting towards first station = terminus
                const atTerminus = isFirstStation;
                selectStationWithDirection(station.name, station.rblIds[1], 2, atTerminus);
                closeSidebar();
            });

            directionDropdown.appendChild(dir1Btn);
            directionDropdown.appendChild(dir2Btn);

            stationContainer.appendChild(btn);
            stationContainer.appendChild(directionDropdown);
            stationsList.appendChild(stationContainer);
        }

        group.appendChild(header);
        group.appendChild(stationsList);
        elements.stationList.appendChild(group);
    }
}

function selectStationWithDirection(name: string, rblId: number, gleisNum: number, atTerminus = false): void {
    currentRblIds = [rblId];
    isTerminusDirection = atTerminus;

    // Clear terminus message interval
    if (terminusMessageInterval) {
        clearInterval(terminusMessageInterval);
        terminusMessageInterval = null;
    }

    // Update active state
    document.querySelectorAll('.station-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.textContent === name);
    });

    // Set Gleis based on direction
    const gleisEl = document.getElementById('gleis-number');
    if (gleisEl) {
        gleisEl.textContent = String(gleisNum);
    }

    // Save to localStorage
    localStorage.setItem('wien-tafel-station', JSON.stringify({ name, rblId, gleisNum, atTerminus }));

    // If at terminus, show alternating message instead of fetching
    if (atTerminus) {
        stopPolling();
        startTerminusDisplay();
    } else {
        // Start fetching data
        startPolling();
    }
}

function selectStation(name: string, rblIds: number[]): void {
    currentRblIds = rblIds;

    // Update active state
    document.querySelectorAll('.station-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.textContent === name);
    });

    // Update Gleis (use first RBL ID modulo for demo)
    elements.gleisNumber.textContent = String((rblIds[0] % 4) + 1);

    // Save to localStorage
    localStorage.setItem('wien-tafel-station', JSON.stringify({ name, rblIds }));

    // Start fetching data
    startPolling();
}

function loadSavedStation(): void {
    try {
        const saved = localStorage.getItem('wien-tafel-station');
        if (saved) {
            const { name, rblIds } = JSON.parse(saved);
            selectStation(name, rblIds);
            return;
        }
    } catch {
        // Ignore parse errors
    }

    // Default to Stephansplatz (U1)
    const defaultStation = lines[0].stations.find((s) => s.name === 'Stephansplatz');
    if (defaultStation) {
        selectStation(defaultStation.name, defaultStation.rblIds);
    }
}

// =============================================================================
// Sidebar
// =============================================================================

function openSidebar(): void {
    elements.sidebar.classList.add('open');
    elements.sidebarOverlay.classList.add('visible');
    elements.sidebarToggle.classList.add('active');
}

function closeSidebar(): void {
    elements.sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('visible');
    elements.sidebarToggle.classList.remove('active');
}

function toggleSidebar(): void {
    if (elements.sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// =============================================================================
// Initialization
// =============================================================================

function init(): void {
    // Build station list
    buildStationList();

    // Load saved station or default
    loadSavedStation();

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Sidebar events
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    elements.sidebarOverlay.addEventListener('click', closeSidebar);

    // Keyboard escape to close sidebar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

// Start the app
init();
