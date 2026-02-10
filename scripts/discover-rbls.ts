/**
 * Helper script to discover U-Bahn RBL IDs from Wiener Linien API
 * Run with: npx tsx helpers/discover-rbls.ts
 * 
 * U-Bahn RBL Pattern (based on confirmed tests):
 * - U1: 41xx range
 * - U2: 42xx range  
 * - U3: 43xx range
 * - U4: 44xx range
 * - U6: 46xx range
 */

const API_BASE = 'https://www.wienerlinien.at/ogd_realtime/monitor';
const DELAY_MS = 200; // 200ms between requests to avoid rate limiting

interface RblMapping {
    rbl: number;
    station: string;
    line: string;
    towards: string;
}

interface LineRange {
    line: string;
    start: number;
    end: number;
}

const U_BAHN_RANGES: LineRange[] = [
    { line: 'U1', start: 4101, end: 4150 },
    { line: 'U2', start: 4201, end: 4280 },
    { line: 'U3', start: 4301, end: 4399 }, // Wider range to find U3 stations
    { line: 'U4', start: 4401, end: 4450 },
    { line: 'U6', start: 4601, end: 4670 },
];

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchRbl(rbl: number): Promise<RblMapping | null> {
    try {
        const url = `${API_BASE}?rbl=${rbl}&sender=rbl-discovery`;
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const monitor = data.data?.monitors?.[0];

        if (!monitor) {
            return null;
        }

        const station = monitor.locationStop?.properties?.title || 'Unknown';
        const lineData = monitor.lines?.[0];

        if (!lineData) {
            return null;
        }

        const line = lineData.name;
        const towards = lineData.towards?.trim() || 'Unknown';

        // Only return if it's a U-Bahn line
        if (!line.startsWith('U')) {
            return null;
        }

        return { rbl, station, line, towards };
    } catch (error) {
        return null;
    }
}

async function discoverLine(range: LineRange): Promise<RblMapping[]> {
    const results: RblMapping[] = [];

    console.log(`\n📍 Discovering ${range.line} (RBLs ${range.start}-${range.end})...`);

    for (let rbl = range.start; rbl <= range.end; rbl++) {
        const mapping = await fetchRbl(rbl);

        if (mapping && mapping.line === range.line) {
            console.log(`  ✓ ${rbl}: ${mapping.station} → ${mapping.towards}`);
            results.push(mapping);
        }

        await sleep(DELAY_MS);
    }

    return results;
}

async function main() {
    console.log('🚇 Wien U-Bahn RBL Discovery Script');
    console.log('=====================================');
    console.log(`Rate limit: ${DELAY_MS}ms between requests\n`);

    const allMappings: Record<string, RblMapping[]> = {};

    for (const range of U_BAHN_RANGES) {
        allMappings[range.line] = await discoverLine(range);
    }

    // Generate stations.ts format output
    console.log('\n\n📄 Generated stations.ts data:');
    console.log('================================\n');

    for (const [line, mappings] of Object.entries(allMappings)) {
        // Group by station name
        const stationMap = new Map<string, number[]>();

        for (const m of mappings) {
            if (!stationMap.has(m.station)) {
                stationMap.set(m.station, []);
            }
            stationMap.get(m.station)!.push(m.rbl);
        }

        console.log(`// ${line} stations`);
        for (const [station, rbls] of stationMap) {
            // Take first 2 RBLs (one per direction)
            const rblPair = rbls.slice(0, 2);
            if (rblPair.length === 2) {
                console.log(`{ name: '${station}', rblIds: [${rblPair[0]}, ${rblPair[1]}] },`);
            } else if (rblPair.length === 1) {
                console.log(`{ name: '${station}', rblIds: [${rblPair[0]}, ${rblPair[0]}] }, // Only 1 RBL found`);
            }
        }
        console.log('');
    }

    // Save as JSON for reference
    console.log('\n📊 Full JSON mapping:');
    console.log(JSON.stringify(allMappings, null, 2));
}

main().catch(console.error);
