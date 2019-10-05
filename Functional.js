/**
 * Selection of functional helpers and enables piping on extended classes.
 */
class Functional {

    static tap(f){
        return x => { f(x); return x; };
    }

    static repeat(f, n) {
        return x => n ? repeat(f, n-1)(f(x)) : x;
    }

    static compose(...fns){
        return x => fns.reduce((v, f) => f(v), x);
    }

    pipe(...fns) {
        return fns.reduce((v, f) => f(v), this);
    }
}

// alias for less verbose access
const Fnl = Functional;