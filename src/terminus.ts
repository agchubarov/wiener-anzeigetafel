// Wien U-Bahn Anzeigetafel — Terminus Display

import { TERMINUS_MESSAGE_INTERVAL_MS } from './constants';
import { createFreeTextLedRow } from './led-row';

let terminusInterval: ReturnType<typeof setInterval> | null = null;

function renderTerminusMessage(rows: NodeListOf<HTMLElement>, showGerman: boolean): void {
    if (rows[0]) {
        rows[0].innerHTML = createFreeTextLedRow(
            showGerman ? '' : 'NO DEPARTURE'
        );
    }
    if (rows[1]) {
        rows[1].innerHTML = createFreeTextLedRow(
            showGerman ? 'NICHT EINSTEIGEN' : 'PLATFORM'
        );
    }
}

export function startTerminusDisplay(rows: NodeListOf<HTMLElement>): void {
    stopTerminusDisplay();

    let showGerman = false;
    renderTerminusMessage(rows, showGerman);

    terminusInterval = setInterval(() => {
        showGerman = !showGerman;
        renderTerminusMessage(rows, showGerman);
    }, TERMINUS_MESSAGE_INTERVAL_MS);
}

export function stopTerminusDisplay(): void {
    if (terminusInterval) {
        clearInterval(terminusInterval);
        terminusInterval = null;
    }
}
