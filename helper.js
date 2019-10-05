const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const map = f => x => x.map(f);

const okay = void 0;