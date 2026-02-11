// Wien U-Bahn Anzeigetafel — Analog Clock
// Uses Vienna timezone (Europe/Vienna) and plays a spin-up animation on initial page load.

const VIENNA_TZ = 'Europe/Vienna';
const SPIN_DURATION_MS = 2000;

// ---------------------------------------------------------------------------
// Vienna time helpers
// ---------------------------------------------------------------------------

function getViennaTime(): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: VIENNA_TZ,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
    }).formatToParts(now);

    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return { hours: get('hour') % 12, minutes: get('minute'), seconds: get('second') };
}

function targetAngles(): { hourAngle: number; minuteAngle: number } {
    const { hours, minutes, seconds } = getViennaTime();
    return {
        hourAngle: (hours + minutes / 60) * 30,
        minuteAngle: minutes * 6 + seconds * 0.1,
    };
}

// ---------------------------------------------------------------------------
// Easing — cubic ease-out  (decelerating)
// ---------------------------------------------------------------------------

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

// ---------------------------------------------------------------------------
// Hand rendering
// ---------------------------------------------------------------------------

function setHands(
    hourHand: SVGLineElement,
    minuteHand: SVGLineElement,
    hAngle: number,
    mAngle: number,
): void {
    hourHand.setAttribute('transform', `rotate(${hAngle} 50 50)`);
    minuteHand.setAttribute('transform', `rotate(${mAngle} 50 50)`);
}

// ---------------------------------------------------------------------------
// Spin-up animation
//   Hour hand:   0° → target  (clockwise)
//   Minute hand: 0° → target  (counter-clockwise, i.e. 360° - target going CW = visually CCW)
// ---------------------------------------------------------------------------

function spinUp(
    hourHand: SVGLineElement,
    minuteHand: SVGLineElement,
): Promise<void> {
    return new Promise((resolve) => {
        const { hourAngle, minuteAngle } = targetAngles();

        // Minute CCW: travel from 0 upward through negative, equivalent to going 360 - target the long way around
        const minuteTravel = -(360 - minuteAngle);

        const start = performance.now();

        function frame(now: number): void {
            const elapsed = now - start;
            const t = Math.min(elapsed / SPIN_DURATION_MS, 1);
            const e = easeOutCubic(t);

            const hCurrent = e * hourAngle;
            const mCurrent = e * minuteTravel;

            setHands(hourHand, minuteHand, hCurrent, mCurrent);

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                // Snap to exact target angles (normalize negative)
                setHands(hourHand, minuteHand, hourAngle, minuteAngle);
                resolve();
            }
        }

        // Start both hands at 12 o'clock
        setHands(hourHand, minuteHand, 0, 0);
        requestAnimationFrame(frame);
    });
}

// ---------------------------------------------------------------------------
// Normal ticking (1 s interval)
// ---------------------------------------------------------------------------

function startTicking(hourHand: SVGLineElement, minuteHand: SVGLineElement): void {
    const tick = () => {
        const { hourAngle, minuteAngle } = targetAngles();
        setHands(hourHand, minuteHand, hourAngle, minuteAngle);
    };
    tick();
    setInterval(tick, 1000);
}

// ---------------------------------------------------------------------------
// Public API — call once on page load
// ---------------------------------------------------------------------------

export async function initClock(
    hourHand: SVGLineElement,
    minuteHand: SVGLineElement,
): Promise<void> {
    await spinUp(hourHand, minuteHand);
    startTicking(hourHand, minuteHand);
}
