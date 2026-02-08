// Wien U-Bahn Anzeigetafel — Analog Clock

export function updateClock(hourHand: SVGLineElement, minuteHand: SVGLineElement): void {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();

    const hourAngle = (hours + minutes / 60) * 30;
    const minuteAngle = minutes * 6;

    hourHand.setAttribute('transform', `rotate(${hourAngle} 50 50)`);
    minuteHand.setAttribute('transform', `rotate(${minuteAngle} 50 50)`);
}
