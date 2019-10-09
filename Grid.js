class Grid {
    static getCoordiantesOf(point) {
        Grid._checkBounds(point);
        const canvasPoint = Grid._translateToCanvas(point);
        return canvasPoint.pipe(
            V2D.scale(UNIT),
            V2D.add(new Vector2D(UNIT / 2, UNIT / 2))
        );
    }

    static _translateToCanvas(point) {
        return point.pipe(
            V2D.mult(new Vector2D(1, -1)),
            V2D.add(new Vector2D((SPAN - 1) / 2, (SPAN - 1) / 2))
        );
    }

    static _checkBounds(point) {
        Grid._checkBound(point.x);
        Grid._checkBound(point.y);
    }

    static _checkBound(value) {
        if (value > (SPAN - 1) / 2) {
            throw `ValueError: ${value} too large.`;
        }
        if (value < -(SPAN - 1) / 2) {
            throw `ValueError: ${value} too small.`;
        }
    }
}