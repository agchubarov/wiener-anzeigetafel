// Wien U-Bahn Anzeigetafel — TypeScript Types

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

/** Persisted station selection in localStorage */
export interface SavedStation {
    name: string;
    rblId: number;
    gleisNum: number;
    atTerminus: boolean;
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
