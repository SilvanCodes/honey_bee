class Landmark {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    static draw(lm) {
        const { x, y } = Grid.getCoordiantesOf(lm.position);

        C2D.beginPath();
        C2D.arc(x, y, lm.radius * UNIT, 0, 2 * PI);
        C2D.fillStyle = 'aqua';
        C2D.fill();
        C2D.stroke();
    }
}