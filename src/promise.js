// Possible states: pending, fulfilled, rejected
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class RPromise {
    constructor(executor) {
        // Initial state is pending
        this.state = PENDING;
        // call the executor function immediately
        doResolve(this, executor);
    }
}

// fulfill with `reason`
function fulfill(promise, reason) {
    promise.state = FULFILLED;
    promise.value = reason;
}

// reject with `reason`
function reject(promise, reason) {
    promise.state = REJECTED;
    promise.value = reason;
}

// creates the fulfill and reject functions that are passed to the executor
function doResolve(promise, executor) {
    function wrapFulfill(value) {
        fulfill(promise, value);
    }

    function wrapReject(reason) {
        reject(promise, reason);
    }

    executor(wrapFulfill, wrapReject);
}

module.exports = RPromise;