const CONTEXT_2D = canvas.getContext('2d');
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const PI = Math.PI;

const C2D = CONTEXT_2D;

let LEN = 7;
let SPAN = LEN * 2 + 1;
let UNIT = CANVAS_WIDTH / SPAN;

const E1 = new Vector2D(1, 0);

function setup() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    run();
}

function generate(bee, wanted, lms, draw = false) {
    const beeSectors = generateRetina(bee, lms, draw);
    const wantedSectors = generateRetina(wanted, lms, draw);

    if (draw) {
        console.log('beeSectors', beeSectors)
        console.log('wantedSectors', wantedSectors)
    }

    const [bds, bls] = makeBisectorRepresentation(beeSectors);
    const [wds, wls] = makeBisectorRepresentation(wantedSectors);

    if (draw) {
        console.log('beedarksectors', bds)
        console.log('beelightsectors', bls)

        console.log('wanteddarksectors', wds)
        console.log('wantedlightsectors', wls)
    }

    const darkMatched = matchSnapshot(bds, wds);
    const lightMatched = matchSnapshot(bls, wls);

    if (draw) {
        console.log('darkMatched', darkMatched)
        console.log('lightMatched', lightMatched)
    }

    const angles = [...darkMatched, ...lightMatched];

    const positionVectors = calculatePositionVectors(angles);
    if (draw) console.log('positionVectors', positionVectors.map(x => V2D.angleTo(E1)(x)))

    const posSum = V2D.sum(positionVectors);
    // weight the position vector by 3
    const stretchSum = V2D.scale(3)(posSum);

    if (draw) console.log('angles', angles)
    const turningVectors = calculateTurningVectors(angles);
    if (draw) console.log('turningVectors', turningVectors.map(x => V2D.angleTo(E1)(x)))

    const posTurn = V2D.sum(turningVectors);

    const homing = V2D.sum([stretchSum, posTurn]);

    if (draw) console.log('homing vector', homing.toString())

    return homing;
}

async function run() {
    const vectorField = new VectorField(SPAN);

    drawCanvasOutline();

    const l1 = new Landmark(new Vector2D(3.5, 2), 0.5);
    const l2 = new Landmark(new Vector2D(3.5, -2), 0.5);
    const l3 = new Landmark(new Vector2D(0, -4), 0.5);

    const lms = new List(l1, l2, l3);
    List.map(Landmark.draw)(lms);

    BEE = new Vector2D(-4, 6);
    WANTED = new Vector2D(0, 0);

    generate(BEE, WANTED, lms, true);

    // generate vector field
    const diffs = [];
    for (let i = -LEN; i <= LEN; i++) {
        for (let ii = -LEN; ii <= LEN; ii++) {
            const curr = new Vector2D(i, ii);
            const home = generate(curr, WANTED, lms);

            // resize vector for displaying
            const homeUnit = V2D.resize(LEN * 1.3)(home);

            // calculate the difference between a direct vector
            const algoRad = V2D.angleTo(E1)(home);
            const directRad = V2D.angleTo(E1)(new Vector2D(-i, -ii));
            diffs.push(Math.abs(Math.abs(algoRad) - Math.abs(directRad)))

            vectorField.setValueAt(curr, homeUnit);
        }
    }

    const averageDiffRad = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const averageDiffDeg = averageDiffRad * 180 / PI;

    document.getElementById('info').innerHTML = `Homing precision in degree: ${averageDiffDeg.toFixed(2)}`
    console.log('homing precision in degree', averageDiffDeg);

    vectorField.draw();
}

function generateRetina(position, landmarks, draw = false) {
    const getEdge = landmark => clockwise => Fnl.compose(
        V2D.sub(position),
        V2D.rotate90(clockwise),
        V2D.resize(landmark.radius),
        V2D.add(landmark.position),
    );

    // helper for visual debugging
    const drawFromPos = Fnl.compose(
        Grid.getCoordiantesOf,
        V2D.draw(position.pipe(
            Grid.getCoordiantesOf
        ))
    );

    const getEdges = landmark => new List(false, true).pipe(
        List.map(getEdge(landmark)),
        List.apply(landmark.position)
    );

    const rv = landmarks.pipe(
        List.map(getEdges)
    );

    const allE1Spots = rv.pipe(
        List.map(
            List.map(
                Fnl.compose(
                    V2D.sub(position),
                    V2D.angleTo(E1)
                )
            )
        ),
    );

    const plain = allE1Spots.pipe(
        List.map(
            List.toArray
        ),
        List.toArray,
    );

    const spots = plain.map(([stop, start]) => ({ start, stop }));

    // remove overlapping spots
    const actualSpots = [];

    for (const spot of spots) {
        if (spot.marked) continue;
        spot.marked = true;
        for (const otherSpot of spots) {
            if (otherSpot.marked) continue;
            if (otherSpot.start > spot.start && otherSpot.start <= spot.stop) {
                spot.stop = otherSpot.stop;
                otherSpot.marked = true;
            }
            if (otherSpot.stop < spot.stop && otherSpot.stop >= spot.start) {
                spot.start = otherSpot.start;
                otherSpot.marked = true;
            }
        }

        actualSpots.push(spot);
    }
    

    if (draw) {
        rv.pipe(
            List.map(
                List.map(drawFromPos)
            )
        );
    }

    // sort in anti clockwise direction
    return actualSpots.sort((a, b) => {
        if (a.start < 0 && b.start < 0) {
            return a.start - b.start;
        }

        return b.start - a.start;
    });
}

function makeBisectorRepresentation(snapshot) {
    freeBisectors = [];
    objectBisectors = [];
    for (let idx = 0; idx < snapshot.length; idx++) {
        objectBisectors.push(getMidValue(snapshot[idx].start, snapshot[idx].stop));
        freeBisectors.push(getMidValue(snapshot[idx].stop, snapshot[(idx + 1) % snapshot.length].start));
    }

    return [objectBisectors, freeBisectors];
}

function getMidValue(start, stop) {
    let size = V2D.angleBetweenDir(V2D.fromRad(start))(V2D.fromRad(stop));
    // determine when to use the larger angle
    if (size < 0) size = PI * 2 + size;

    // calculating the 'mid' angle
    if (start > stop) stop += PI * 2;
    let rad = (start + stop) / 2;
    if (rad > PI) rad -= PI * 2;

    return { rad, size };
}


function matchSnapshot(bee, wanted) {
    const matched = [];
    for (const angle of bee) {
        let closest = null;
        const vec = V2D.fromRad(angle.rad);

        for (const wAngle of wanted) {
            if (closest == null) {
                closest = wAngle;
                continue;
            }

            const otherVec = V2D.fromRad(wAngle.rad);
            const oldVec = V2D.fromRad(closest.rad);
            const between = V2D.angleBetween(vec)(otherVec) ;
            const oldBetween = V2D.angleBetween(vec)(oldVec);

            if (between < oldBetween) {
                closest = wAngle;
            }
        }

        matched.push({ bee: angle, matched: closest });
    }

    return matched;
}

function calculatePositionVectors(sectors) {
    const vectors = [];

    for (const sec of sectors) {
        let vec = V2D.fromRad(sec.matched.rad);
        // inverse direction of vector if bee size is bigger than matched size
        if (sec.bee.size > sec.matched.size) vec = vec.inverse;

        vectors.push(vec);
    }

    return vectors;
}

function calculateTurningVectors(sectors) {
    const vectors = [];

    for (const sec of sectors) {
        const vecBee = V2D.fromRad(sec.bee.rad);
        const vecWanted = V2D.fromRad(sec.matched.rad);

        // rechts negativ / links positiv
        const rad = V2D.angleTo(vecBee)(vecWanted);

        // determine the turn direction
        const clockwise = rad > 0 ? false : true;
        let temp = V2D.rotate90(clockwise)(vecWanted);

        // inverse the direction if the angle is larger than 180 degrees
        if (sec.bee.size > PI) temp = temp.inverse;
        vectors.push(temp);
    }

    return vectors;
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
