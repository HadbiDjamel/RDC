/**
 * Ray-casting algorithm to determine if a point is inside a polygon.
 * @param point [latitude, longitude]
 * @param polygon array of [latitude, longitude] points
 */
export const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

/**
 * Checks if a point is in any of the polygons in a list.
 */
export const isPointInAnyPolygon = (point: [number, number], polygons: [number, number][][]): boolean => {
    return polygons.some(poly => isPointInPolygon(point, poly));
};
