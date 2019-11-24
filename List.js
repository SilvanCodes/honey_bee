class List extends Functional {
    constructor(...items) {
        super();
        this._list = items;
    }

    static map(f) {
        return l => new List(...l._list.map(f));
    }

    static apply(v) {
        return l => new List(...l._list.map(f => f(v)));
    }

    static reduceWith(f) {
        return l => new List(...l._list.reduce((acc, val, idx) => idx ? f(acc)(val) : val))
    }

    static mapWith(f) {
        return l => new List(...l._list.map((val, idx, arr) => idx ? f(arr[idx-1])(val) : val).slice(-l._list.length+1))
    }

    static flatten(l) {
        return new List(...l._list.reduce((acc, val) => acc.concat(val._list), []));
    }

    static toArray(l) {
        return Array.from(l._list);
    }
}