// Wien U-Bahn Anzeigetafel — Sidebar & Station Selector

import { lines } from './stations';

interface SidebarElements {
    sidebar: HTMLElement;
    sidebarOverlay: HTMLElement;
    sidebarToggle: HTMLButtonElement;
    stationList: HTMLElement;
}

export function openSidebar(el: SidebarElements): void {
    el.sidebar.classList.add('open');
    el.sidebarOverlay.classList.add('visible');
    el.sidebarToggle.classList.add('active');
}

export function closeSidebar(el: SidebarElements): void {
    el.sidebar.classList.remove('open');
    el.sidebarOverlay.classList.remove('visible');
    el.sidebarToggle.classList.remove('active');
}

export function toggleSidebar(el: SidebarElements): void {
    if (el.sidebar.classList.contains('open')) {
        closeSidebar(el);
    } else {
        openSidebar(el);
    }
}

type OnSelectStation = (name: string, rblId: number, gleisNum: number, atTerminus: boolean) => void;

export function buildStationList(
    stationListEl: HTMLElement,
    onSelect: OnSelectStation,
    onClose: () => void,
): void {
    stationListEl.innerHTML = '';

    for (const line of lines) {
        const group = document.createElement('div');
        group.className = 'line-group';

        const header = document.createElement('div');
        header.className = 'line-group__header';
        header.innerHTML = `
      <span class="line-badge line-badge--${line.id}">${line.name}</span>
      <span>${line.name} Linie</span>
    `;
        header.addEventListener('click', () => group.classList.toggle('open'));

        const stationsList = document.createElement('div');
        stationsList.className = 'line-group__stations';

        const firstStation = line.stations[0].name;
        const lastStation = line.stations[line.stations.length - 1].name;

        for (const station of line.stations) {
            const container = document.createElement('div');
            container.className = 'station-container';

            const btn = document.createElement('button');
            btn.className = 'station-btn';
            btn.textContent = station.name;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasExpanded = container.classList.contains('expanded');
                document.querySelectorAll('.station-container.expanded').forEach(c =>
                    c.classList.remove('expanded'));
                if (!wasExpanded) {
                    container.classList.add('expanded');
                }
            });

            const dropdown = document.createElement('div');
            dropdown.className = 'direction-dropdown';

            const isFirstStation = station.name === firstStation;
            const isLastStation = station.name === lastStation;

            const dir1Btn = document.createElement('button');
            dir1Btn.className = 'direction-btn';
            dir1Btn.innerHTML = `<span class="direction-arrow">→</span> Richtung ${lastStation}`;
            dir1Btn.addEventListener('click', () => {
                onSelect(station.name, station.rblIds[0], 1, isLastStation);
                onClose();
            });

            const dir2Btn = document.createElement('button');
            dir2Btn.className = 'direction-btn';
            dir2Btn.innerHTML = `<span class="direction-arrow">←</span> Richtung ${firstStation}`;
            dir2Btn.addEventListener('click', () => {
                onSelect(station.name, station.rblIds[1], 2, isFirstStation);
                onClose();
            });

            dropdown.appendChild(dir1Btn);
            dropdown.appendChild(dir2Btn);
            container.appendChild(btn);
            container.appendChild(dropdown);
            stationsList.appendChild(container);
        }

        group.appendChild(header);
        group.appendChild(stationsList);
        stationListEl.appendChild(group);
    }
}
