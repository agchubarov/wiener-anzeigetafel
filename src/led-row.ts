// Wien U-Bahn Anzeigetafel — LED Row Rendering

import { STATION_CELLS } from './constants';
import { createSegmentCell } from './segment-cell';
import type { DisplayDeparture } from './types';

export function createLedRow(destination: string, countdown: number | string): string {
    const cells: string[] = [];

    const stationText = destination.toUpperCase().padEnd(STATION_CELLS, ' ').slice(0, STATION_CELLS);

    const isArriving = countdown === 'arriving' || countdown === 0;
    const timeText = isArriving ? '**' : String(countdown).padStart(2, ' ');

    for (let i = 0; i < STATION_CELLS; i++) {
        cells.push(createSegmentCell(stationText[i]));
    }

    cells.push(createSegmentCell(' '));

    const arrivingClasses = ['arriving-prev', 'arriving-last'];
    for (let i = 0; i < 2; i++) {
        cells.push(createSegmentCell(timeText[i], isArriving ? arrivingClasses[i] : ''));
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
