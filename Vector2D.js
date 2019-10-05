class Vector2D extends Functional {
    constructor(x = 0, y = 0) {
        super();
        this.x = x;
        this.y = y;
    }

    // computed data props
    get norm() {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    get inverse() {
        return new Vector2D(-this.x, -this.y);
    }

    // display properly
    toString() {
        return `Vector2D { x: ${this.x}, y: ${this.y} }`;
    }

    // namespaced transforamtions
    static from(v) {
        return new Vector2D(v.x, v.y);
    }

    static rotate(alpha) {
        return v => new Vector2D(
            Math.cos(alpha) * v.x - Math.sin(alpha) * v.y,
            Math.sin(alpha) * v.x + Math.cos(alpha) * v.y
        );
    }

    static add(v2) {
        return v1 => new Vector2D(
            v1.x + v2.x,
            v1.y + v2.y
        );
    }

    static mult(v2) {
        return v1 => new Vector2D(
            v1.x * v2.x,
            v1.y * v2.y
        );
    }

    static sub(v2) {
        return v1 => this.add(v2.inverse)(v1);
    }

    static dot(v2) {
        return v1 => v1.x * v2.x + v1.y * v2.y;
    }

    // gives signed angle to rotate from v1 to v2
    static angleTo(v2) {
        return v1 => Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
    }

    // gives absolute angle between v1 and v2
    static angleBetween(v2) {
        return v1 => Math.acos(this.dot(v1)(v2) / (v1.norm * v2.norm));
    }

    static scale(s) {
        return v => new Vector2D(
            v.x * s,
            v.y * s
        );
    }

    static resize(l) {
        return v => this.scale(l / v.norm)(v);
    }

    // draw vector from specified origin
    static draw({ x, y } = new Vector2D()) {
        return v => {
            C2D.fillStyle = '#f0f0f0';
            C2D.beginPath();
            C2D.moveTo(x, y);
            C2D.lineTo(v.x, v.y);
            C2D.stroke();
            return v;
        }
    }
}

// alias for less verbose access
const V2D = Vector2D;