// Wien U-Bahn Anzeigetafel — TypeScript Types

/** A single departure from the API */
export interface Departure {
    countdown: number;
    timePlanned?: string;
    timeReal?: string;
}

/** A line with its departures */
export interface Line {
    name: string;
    towards: string;
    direction: 'H' | 'R';
    barrierFree: boolean;
    departures: Departure[];
}

/** A station with its RBL IDs */
export interface Station {
    name: string;
    rblIds: number[];
}

/** U-Bahn line configuration */
export interface LineConfig {
    id: string;
    name: string;
    color: string;
    stations: Station[];
}

/** Parsed departure for display */
export interface DisplayDeparture {
    line: string;
    destination: string;
    countdown: number | 'arriving';
}

/** API response structure (simplified) */
export interface ApiResponse {
    data: {
        monitors: Array<{
            locationStop: {
                properties: {
                    title: string;
                    attributes: { rbl: number };
                };
            };
            lines: Array<{
                name: string;
                towards: string;
                direction: string;
                barrierFree: boolean;
                departures: {
                    departure: Array<{
                        departureTime: {
                            timePlanned?: string;
                            timeReal?: string;
                            countdown: number;
                        };
                    }>;
                };
            }>;
        }>;
    };
}
