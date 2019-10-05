const CONTEXT_2D = canvas.getContext('2d');
const DELTA_TIME = 25; // ms
const DEBUG = false;
const ANIMATE = false;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const PI = Math.PI;

const C2D = CONTEXT_2D;
const SPAN = 15;

const UNIT = CANVAS_WIDTH / SPAN;

function setup() {
    console.log('SETUP');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    run();
}

async function run() {
    console.log('RUN');

    const vectorField = new VectorField(SPAN);

    drawCanvasOutline();

    vectorField.draw();


    const l1 = new Landmark(new Vector2D(3.5, 2));
    const l2 = new Landmark(new Vector2D(3.5, -2));
    const l3 = new Landmark(new Vector2D(0, -4));

    const lms = [l1, l2, l3];
    lms.map(Landmark.draw);

    generateRetina(new Vector2D(-7, 7), lms);

    // describe dark spot on retina
    const spot = { from: new Vector2D(), to: new Vector2D() };

    // retina/snapshot is multiple spots, ordered
    const retina = [spot, spot, spot];


    // ANIMATION LOOP
    while (ANIMATE) {
        C2D.clearRect(0, 0, canvas.width, canvas.height);

        // animate here

        await sleep(DELTA_TIME);
    }
}

function generateRetina(position, landmarks) {
    const base = Grid.getCoordiantesOf(position);
    const l = Grid.getCoordiantesOf(landmarks[0].position);

    const edge1 = l.pipe(
        V2D.sub(base),
        // V2D.draw(),
        Fnl.tap(console.log),
        V2D.mult(new Vector2D(1, -1)),
        Fnl.tap(console.log),
        V2D.draw(),
        V2D.resize(landmarks[0].radius),
        V2D.draw(),
        V2D.add(l),
        V2D.draw(),
        //V2D.add(base),
        //V2D.draw(base)
    );

    const r = l.pipe(
        V2D.sub(base),
        V2D.mult(new Vector2D(-1, 1)),
        V2D.resize(landmarks[0].radius),
    );

    r.pipe(
        V2D.add({ x: 50, y: 50}),
        V2D.draw({ x: 50, y: 50}),
        Fnl.tap(console.log),
        V2D.mult(new Vector2D(1, -1)),
        Fnl.tap(console.log),
        V2D.resize(landmarks[0].radius),
        Fnl.tap(console.log),
        V2D.draw({ x: 50, y: 50}),
    )

    console.log('edge1', edge1);

    console.log('r', r);

    console.log('angle', V2D.angleTo(r)(l));

}

function drawCanvasOutline() {
    // draw outline and crosshair
    C2D.beginPath();
    C2D.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    C2D.moveTo(0, CANVAS_WIDTH / 2);
    C2D.lineTo(CANVAS_HEIGHT, CANVAS_WIDTH / 2);
    C2D.moveTo(CANVAS_HEIGHT / 2, 0);
    C2D.lineTo(CANVAS_HEIGHT / 2, CANVAS_WIDTH);
    C2D.stroke();

    // draw center dot
    C2D.beginPath();
    C2D.arc(CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2, 4, 0, 2 * PI);
    C2D.fillStyle = 'black';
    C2D.fill();
    C2D.stroke();
}