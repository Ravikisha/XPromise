// Possible states: pending, fulfilled, rejected
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class RPromise {
  constructor(executor) {
    // Initial state is pending
    this.state = PENDING;
    // call the executor function immediately
    doResolve(this, executor);
  }

  // `then` method handles the fulfillment and rejection of a promise
  then(onFulfilled, onRejected) {
    handleResolved(this, onFulfilled, onRejected);
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
  let called = false;
  function wrapFulfill(value) {
    if (called) return;
    called = true;
    fulfill(promise, value);
  }

  function wrapReject(reason) {
    if (called) return;
    called = true;
    reject(promise, reason);
  }

  executor(wrapFulfill, wrapReject);
}

// handle the fulfillment and rejection of a promise
function handleResolved(promise, onFulfilled, onRejected) {
  const cb = promise.state === FULFILLED ? onFulfilled : onRejected;
  cb(promise.value);
}

module.exports = RPromise;
