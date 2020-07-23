export function clamp(num, min, max) {
    /* Returns number within clamp min max range */
    const MIN = min || 1;
    const MAX = max || 20;
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, MIN), MAX)
}

export function clampFloat(num, min, max) {
    /* Returns number within clamp min max range */
    const MIN = min || 1;
    const MAX = max || 20;

    return Math.min(Math.max(num, MIN), MAX)
}

export function getCanvasCoords(width, height, x, y) {
    /* Returns the canvas coords for given euclidean X, Y */
    const zeroX = Math.floor(width / 2);
    const zeroY = Math.floor(height / 2);
    return {
        x: zeroX + x,
        y: zeroY + y
    }
}

export function getNextLocation(diff, ratio, d, theta)  {
    const xTheta = (diff * Math.cos(theta)) + (d *  Math.cos(ratio  * theta));
    const yTheta = (diff * Math.sin(theta)) + (d *  Math.sin(ratio  * theta));
    return  {
        xTheta,
        yTheta
    }
}