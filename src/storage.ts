// Wien U-Bahn Anzeigetafel — localStorage Persistence

import { STORAGE_KEY } from './constants';
import type { SavedStation } from './types';

export function saveStation(data: SavedStation): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadStation(): SavedStation | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;

        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.rblId) {
            return {
                name: parsed.name,
                rblId: parsed.rblId,
                gleisNum: parsed.gleisNum ?? 1,
                atTerminus: parsed.atTerminus ?? false,
            };
        }
    } catch {
        // Ignore parse errors
    }
    return null;
}
