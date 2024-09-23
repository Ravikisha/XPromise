// Possible states: pending, fulfilled, rejected
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class RPromise {
  constructor(executor) {
    // Initial state is pending
    this.state = PENDING;
    // this handler queue will be used to store the onFulfilled and onRejected functions
    this.queue = [];
    // call the executor function immediately
    doResolve(this, executor);
  }

  // `then` method handles the fulfillment and rejection of a promise
  then(onFulfilled, onRejected) {
    // empty executor function
    const promise = new RPromise(() => {});
    // store the promise as well
    handle(this, { promise, onFulfilled, onRejected });
    return promise;
  }
}

// checks the state of the promise to either:
// - queue it for later use if the promise is PENDING
// - call the handler if the promise is not PENDING

function handle(promise, handler) {
  // take the state of the innermost promise
  while (promise.state !== REJECTED && promise.value instanceof RPromise) {
    promise = promise.value;
  }

  if (promise.state === PENDING) {
    promise.queue.push(handler);
  } else {
    handleResolved(promise, handler);
  }
}

// handle the fulfillment and rejection of a promise
function handleResolved(promise, handler) {
  setImmediate(() => {
    const cb =
      promise.state === FULFILLED ? handler.onFulfilled : handler.onRejected;
    // resolve immediately if the callback is not a function
    if (typeof cb !== "function") {
      if (promise.state === FULFILLED) {
        fulfill(handler.promise, promise.value);
      } else {
        reject(handler.promise, promise.value);
      }
      return;
    }
    try {
      const value = cb(promise.value);
      fulfill(handler.promise, value);
    } catch (e) {
      reject(handler.promise, e);
    }
  });
}


// fulfill with `reason`
function fulfill(promise, value) {
  if (value === promise) {
    return reject(promise, new TypeError());
  }

  if (value && (typeof value === "object" || typeof value === "function")) {
    let then;
    try {
      then = value.then;
    } catch (e) {
      return reject(promise, e);
    }

    // promise
    if (then === promise.then && promise instanceof RPromise) {
      promise.state = FULFILLED;
      promise.value = value;
      return finale(promise);
    }

    // thenable
    if (typeof then === "function") {
      return doResolve(promise, then.bind(value));
    }
  }

  // primitive
  promise.state = FULFILLED;
  promise.value = value;
  finale(promise);
}

// reject with `reason`
function reject(promise, reason) {
  promise.state = REJECTED;
  promise.value = reason;
  finale(promise);
}

// invoke all the handlers stored in the promise
function finale(promise) {
  const length = promise.queue.length;
  for (let i = 0; i < length; i++) {
    handle(promise, promise.queue[i]);
  }
}

// creates the fulfill and reject functions that are passed to the executor
function doResolve(promise, executor) {
  let called = false;
  function wrapFulfill(value) {
    if (called){ return }
    called = true;
    fulfill(promise, value);
  }

  function wrapReject(reason) {
    if (called){ return }
    called = true;
    reject(promise, reason);
  }
  try {
    executor(wrapFulfill, wrapReject);
  } catch (e) {
    wrapReject(e);
  }
}


module.exports = RPromise;
