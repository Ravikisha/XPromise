const RPromise = require("./src/promise.js");

const r1 = () => console.log("r1");
const p = new RPromise((fulfill) => fulfill());
const q = p.then(() => q);
q.then(null, r1);
