// Wien U-Bahn Anzeigetafel — SVG Segment Cell Renderer

import { SEGMENT_MAP, BASE_SEGMENTS } from './segment-map';

const SVG_VIEWBOX = '8.346 8.578 54.908 97.526';

/**
 * Create an inline SVG segment cell for a single character.
 * Returns an HTML string with a div.led-cell containing an SVG
 * with 84 path segments, lit according to SEGMENT_MAP.
 */
export function createSegmentCell(char: string, extraClasses = ''): string {
    // Uppercase basic latin letters; pass through ß, umlauts, symbols as-is
    const normalized = /^[a-z]$/i.test(char) ? char.toUpperCase() : char;
    const litSegments = SEGMENT_MAP[normalized] || [];

    const paths = BASE_SEGMENTS.map((seg) => {
        const isLit = litSegments.includes(seg.id);
        return `<path class="segment${isLit ? ' lit' : ''}" d="${seg.d}" />`;
    }).join('');

    const svgClass = extraClasses ? `led-segment ${extraClasses}` : 'led-segment';

    return `<svg class="${svgClass}" viewBox="${SVG_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}
