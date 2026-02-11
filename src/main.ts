// Wien U-Bahn Anzeigetafel — Main Entry Point

import './style.css';
import { lines } from './stations';
import { fetchDepartures } from './api';
import { POLL_INTERVAL_MS } from './constants';
import { initClock } from './clock';
import { renderDepartures } from './led-row';
import { startTerminusDisplay, stopTerminusDisplay } from './terminus';
import { buildStationList, closeSidebar, toggleSidebar } from './sidebar';
import { saveStation, loadStation } from './storage';

// =============================================================================
// DOM Elements
// =============================================================================

const el = {
    rows: document.querySelectorAll('.led-row') as NodeListOf<HTMLElement>,
    gleisNumber: document.querySelector('.tafel__gleis-number') as HTMLElement,
    hourHand: document.querySelector<SVGLineElement>('#hour-hand')!,
    minuteHand: document.querySelector<SVGLineElement>('#minute-hand')!,
    sidebarToggle: document.getElementById('sidebar-toggle') as HTMLButtonElement,
    sidebar: document.getElementById('sidebar') as HTMLElement,
    sidebarOverlay: document.getElementById('sidebar-overlay') as HTMLElement,
    stationList: document.getElementById('station-list') as HTMLElement,
    debugToggle: document.getElementById('debug-toggle') as HTMLButtonElement,
};

const sidebarEl = {
    sidebar: el.sidebar,
    sidebarOverlay: el.sidebarOverlay,
    sidebarToggle: el.sidebarToggle,
    stationList: el.stationList,
};

// =============================================================================
// State
// =============================================================================

let currentRblIds: number[] = [];
let pollInterval: ReturnType<typeof setInterval> | null = null;

// =============================================================================
// Data Fetching
// =============================================================================

async function loadDepartures(): Promise<void> {
    if (currentRblIds.length === 0) return;

    document.querySelector('.tafel')?.classList.toggle('tafel--loading', true);
    document.querySelector('.tafel')?.classList.toggle('tafel--error', false);

    try {
        const departures = await fetchDepartures(currentRblIds);
        renderDepartures(el.rows, departures);
    } catch {
        document.querySelector('.tafel')?.classList.toggle('tafel--error', true);
        renderDepartures(el.rows, []);
    } finally {
        document.querySelector('.tafel')?.classList.toggle('tafel--loading', false);
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
// Station Selection
// =============================================================================

function selectStation(name: string, rblId: number, gleisNum: number, atTerminus: boolean): void {
    currentRblIds = [rblId];
    stopTerminusDisplay();

    document.querySelectorAll('.station-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.textContent === name);
    });

    el.gleisNumber.textContent = String(gleisNum);

    saveStation({ name, rblId, gleisNum, atTerminus });

    if (atTerminus) {
        stopPolling();
        startTerminusDisplay(el.rows);
    } else {
        startPolling();
    }
}

// =============================================================================
// Initialization
// =============================================================================

function init(): void {
    buildStationList(
        el.stationList,
        selectStation,
        () => closeSidebar(sidebarEl),
    );

    const saved = loadStation();
    if (saved) {
        selectStation(saved.name, saved.rblId, saved.gleisNum, saved.atTerminus);
    } else {
        const defaultStation = lines[0].stations.find((s) => s.name === 'Stephansplatz');
        if (defaultStation) {
            selectStation(defaultStation.name, defaultStation.rblIds[0], 1, false);
        }
    }

    initClock(el.hourHand, el.minuteHand);

    el.sidebarToggle.addEventListener('click', () => toggleSidebar(sidebarEl));
    el.sidebarOverlay.addEventListener('click', () => closeSidebar(sidebarEl));

    document.body.classList.add('debug-mode');
    el.debugToggle.addEventListener('click', () => {
        document.body.classList.toggle('debug-mode');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar(sidebarEl);
    });
}

init();
