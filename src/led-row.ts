// Wien U-Bahn Anzeigetafel — LED Row Rendering

import { STATION_CELLS } from './constants';
import type { DisplayDeparture } from './types';

function createCell(char: string, extraClasses = ''): string {
    const displayChar = char === ' ' ? '&nbsp;' : char;
    const cellClass = extraClasses ? `led-cell ${extraClasses}` : 'led-cell';
    return `<span class="${cellClass}"><span class="led-cell__char">${displayChar}</span></span>`;
}

export function createLedRow(destination: string, countdown: number | string): string {
    const cells: string[] = [];

    const stationText = destination.toUpperCase().padEnd(STATION_CELLS, ' ').slice(0, STATION_CELLS);

    const isArriving = countdown === 'arriving' || countdown === 0;
    const timeText = isArriving ? ' ★' : String(countdown).padStart(2, ' ');
    const blinkClass = isArriving ? 'arriving' : '';

    for (let i = 0; i < STATION_CELLS; i++) {
        cells.push(createCell(stationText[i]));
    }

    cells.push(createCell(' '));

    for (let i = 0; i < 2; i++) {
        cells.push(createCell(timeText[i], blinkClass));
    }

    return cells.join('');
}

export function renderDepartures(rows: NodeListOf<HTMLElement>, departures: DisplayDeparture[]): void {
    rows.forEach((row, index) => {
        const dep = departures[index];
        if (dep) {
            row.innerHTML = createLedRow(dep.destination, dep.countdown);
        } else {
            row.innerHTML = createLedRow('---', '--');
        }
    });
}
