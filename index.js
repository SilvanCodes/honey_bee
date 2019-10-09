const CONTEXT_2D = canvas.getContext('2d');
const DELTA_TIME = 250; // ms
const DEBUG = true;
const ANIMATE = false;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const PI = Math.PI;

const C2D = CONTEXT_2D;

let LEN = 7;
let SPAN = LEN * 2 + 1;
let UNIT = CANVAS_WIDTH / SPAN;

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

    const l1 = new Landmark(new Vector2D(3.5, 2), 0.5);
    const l2 = new Landmark(new Vector2D(3.5, -2), 0.5);
    const l3 = new Landmark(new Vector2D(0, -4), 0.5);

    const lms = new List(l1, l2, l3);
    List.map(Landmark.draw)(lms);

    BEE = new Vector2D(-7, 7);

    generateRetina(BEE, lms);

    /* document.addEventListener('click', ev => {
        console.log('click');
        C2D.clearRect(0, 0, canvas.width, canvas.height);

        LEN = LEN + 1;
        SPAN = LEN * 2 + 1;
        UNIT = CANVAS_WIDTH / SPAN;

        drawCanvasOutline();
        new VectorField(SPAN).draw();

        generateRetina(new Vector2D(-7, 7), lms);
        lms.map(Landmark.draw);

        console.log('ve')
    }); */

    // describe dark spot on retina
    const spot = { from: new Vector2D(), to: new Vector2D() };

    // retina/snapshot is multiple spots, ordered
    const retina = [spot, spot, spot];

    // ANIMATION LOOP
    while (ANIMATE) {
        C2D.clearRect(0, 0, canvas.width, canvas.height);

        // animate here
        drawCanvasOutline();
        vectorField.draw();
        List.map(Landmark.draw)(lms);
        generateRetina(BEE, lms);

        await sleep(DELTA_TIME);
    }
}

function generateRetina(position, landmarks) {
    console.log('COMPUTE RETINA');

    const getVp = lm => cw => Fnl.compose(
        V2D.sub(position),
        V2D.rotate90(cw),
        V2D.resize(lm.radius),
        V2D.add(lm.position),
    );

    // helper for visual debugging
    const drawFromPos = Fnl.compose(
        Grid.getCoordiantesOf,
        V2D.draw(position.pipe(
            Grid.getCoordiantesOf
        ))
    );

    const getVps = lm => new List(true, false).pipe(
        List.map(getVp(lm)),
        List.apply(lm.position)
    )

    let rv = landmarks.pipe(
        List.map(getVps)
    );

    rv.pipe(
        List.flatten,
        Fnl.tap(console.log),
        List.mapWith(V2D.angleBetween),
        Fnl.tap(console.log)
    )

    if (DEBUG) {
        rv.pipe(
            List.map(
                List.map(drawFromPos)
            )
        );
        console.log(rv);
    }
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