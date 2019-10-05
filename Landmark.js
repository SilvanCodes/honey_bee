class Landmark {
    constructor(position) {
        this.position = position;
        this.radius = UNIT / 2;
    }

    static draw(v) {
        const { x, y } = Grid.getCoordiantesOf(v.position);

        C2D.beginPath();
        C2D.arc(x, y, v.radius, 0, 2 * PI);
        C2D.fillStyle = 'aqua';
        C2D.fill();
        C2D.stroke();
    }
}