// Wien U-Bahn Anzeigetafel — API Module

import type { ApiResponse, DisplayDeparture } from './types';

const CORS_PROXY = 'https://corsproxy.io/?';
const API_BASE = 'https://www.wienerlinien.at/ogd_realtime/monitor';
const SENDER = 'wien-tafel';

/**
 * Fetch departures for given RBL IDs
 */
export async function fetchDepartures(rblIds: number[]): Promise<DisplayDeparture[]> {
    const rblParams = rblIds.map((id) => `rbl=${id}`).join('&');
    const url = `${CORS_PROXY}${encodeURIComponent(`${API_BASE}?${rblParams}&sender=${SENDER}`)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        return parseDepartures(data);
    } catch (error) {
        console.error('Failed to fetch departures:', error);
        throw error;
    }
}

/**
 * Parse API response into display-ready departures
 */
function parseDepartures(response: ApiResponse): DisplayDeparture[] {
    const departures: DisplayDeparture[] = [];

    for (const monitor of response.data?.monitors ?? []) {
        for (const line of monitor.lines ?? []) {
            // Filter: Only include U-Bahn lines (U1, U2, U3, U4, U5, U6)
            if (!line.name.startsWith('U')) {
                continue;
            }

            const deps = line.departures?.departure ?? [];

            for (const dep of deps.slice(0, 2)) {
                const countdown = dep.departureTime?.countdown;

                departures.push({
                    line: line.name,
                    destination: line.towards,
                    countdown: countdown === 0 ? 'arriving' : countdown,
                });
            }
        }
    }

    // Sort by countdown (arriving first, then by minutes)
    departures.sort((a, b) => {
        const aVal = a.countdown === 'arriving' ? -1 : a.countdown;
        const bVal = b.countdown === 'arriving' ? -1 : b.countdown;
        return aVal - bVal;
    });

    return departures.slice(0, 2);
}
