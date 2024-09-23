const RPromise = require("../src/promise");

describe("Promise constructor", () => {
  it("receives a executor function when constructed which is called immediately", () => {
    // mock function with spies
    const executor = jest.fn();
    const promise = new RPromise(executor);

    // mock function should be called immediately
    expect(executor.mock.calls.length).toBe(1);
    //arguments should be functions
    expect(typeof executor.mock.calls[0][0]).toBe("function");
    expect(typeof executor.mock.calls[0][1]).toBe("function");
  });

  it("initial state is pending", () => {
    const promise = new RPromise(function executor(fulfill, reject) {
      // do nothing
    });
    // for the sake of simplicity the state is public
    expect(promise.state).toBe("PENDING");
  });

  it("transitions to the FULFILLED state with a `value`", () => {
    const value = ":)";
    const promise = new RPromise((fulfill, reject) => {
      fulfill(value);
    });
    expect(promise.state).toBe("FULFILLED");
  });

  it("transitions to the REJECTED state with a `reason`", () => {
    const reason = "I failed :(";
    const promise = new RPromise((fulfill, reject) => {
      reject(reason);
    });
    expect(promise.state).toBe("REJECTED");
  });
});

describe("Observing state changes", () => {
  it("should have a .then method", () => {
    const promise = new RPromise(() => {});
    expect(typeof promise.then).toBe("function");
  });

  it("should call the onFulfilled method when a promise is in a FULFILLED state", () => {
    const value = ":)";
    const onFulfilled = jest.fn();
    const promise = new RPromise((fulfill, reject) => {
      fulfill(value);
    }).then(onFulfilled);
    expect(onFulfilled.mock.calls.length).toBe(1);
    expect(onFulfilled.mock.calls[0][0]).toBe(value);
  });

  it("transitions to the REJECTED state with a `reason`", () => {
    const reason = "I failed :(";
    const onRejected = jest.fn();
    const promise = new RPromise((fulfill, reject) => {
      reject(reason);
    }).then(null, onRejected);
    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
  });
});

describe("One way transition", () => {
  const value = ":)";
  const reason = "I failed :(";

  it("when a promise is fulfilled it should not be rejected with another value", () => {
    const onFulfilled = jest.fn();
    const onRejected = jest.fn();

    const promise = new RPromise((resolve, reject) => {
      resolve(value);
      reject(reason);
    });
    promise.then(onFulfilled, onRejected);

    expect(onFulfilled.mock.calls.length).toBe(1);
    expect(onFulfilled.mock.calls[0][0]).toBe(value);
    expect(onRejected.mock.calls.length).toBe(0);
    expect(promise.state === "FULFILLED");
  });

  it("when a promise is rejected it should not be fulfilled with another value", () => {
    const onFulfilled = jest.fn();
    const onRejected = jest.fn();

    const promise = new RPromise((resolve, reject) => {
      reject(reason);
      resolve(value);
    });
    promise.then(onFulfilled, onRejected);

    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
    expect(onFulfilled.mock.calls.length).toBe(0);
    expect(promise.state === "REJECTED");
  });
});

describe("handling executor errors", () => {
  it("when the executor fails the promise should transition to the REJECTED state", () => {
    const reason = new Error("I failed :(");
    const onRejected = jest.fn();
    const promise = new RPromise((resolve, reject) => {
      throw reason;
    });
    promise.then(null, onRejected);
    expect(onRejected.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls[0][0]).toBe(reason);
    expect(promise.state === "REJECTED");
  });
});

describe("Async executors", () => {
  it("should queue callbacks when the promise is not fulfilled immediately", (done) => {
    const value = ":)";
    const promise = new RPromise((fulfill, reject) => {
      setTimeout(fulfill, 1, value);
    });

    const onFulfilled = jest.fn();

    promise.then(onFulfilled);
    setTimeout(() => {
      // should have been called once
      expect(onFulfilled.mock.calls.length).toBe(1);
      expect(onFulfilled.mock.calls[0][0]).toBe(value);
      promise.then(onFulfilled);
    }, 5);

    // should not be called immediately
    expect(onFulfilled.mock.calls.length).toBe(0);

    setTimeout(function () {
      // should have been called twice
      expect(onFulfilled.mock.calls.length).toBe(2);
      expect(onFulfilled.mock.calls[1][0]).toBe(value);
      done();
    }, 10);
  });

  it("should queue callbacks when the promise is not rejected immediately", (done) => {
    const reason = "I failed :(";
    const promise = new RPromise((fulfill, reject) => {
      setTimeout(reject, 1, reason);
    });

    const onRejected = jest.fn();

    promise.then(null, onRejected);
    setTimeout(() => {
      // should have been called once
      expect(onRejected.mock.calls.length).toBe(1);
      expect(onRejected.mock.calls[0][0]).toBe(reason);
      promise.then(null, onRejected);
    }, 5);

    // should not be called immediately
    expect(onRejected.mock.calls.length).toBe(0);

    setTimeout(function () {
      // should have been called twice
      expect(onRejected.mock.calls.length).toBe(2);
      expect(onRejected.mock.calls[1][0]).toBe(reason);
      done();
    }, 10);
  });
});

describe("Chaining promises", () => {
  it(".then should return a new promise", () => {
    expect(function () {
      const qOnFulfilled = jest.fn();
      const rOnFulfilled = jest.fn();
      const p = new RPromise((fulfill) => fulfill());
      const q = p.then(qOnFulfilled);
      const r = q.then(rOnFulfilled);
    }).not.toThrow();
  });

  it("if .then's onFulfilled is called without errors it should transition to FULFILLED", () => {
    const value = ":)";
    const f1 = jest.fn();
    new RPromise((fulfill) => fulfill()).then(() => value).then(f1);
    expect(f1.mock.calls.length).toBe(1);
    expect(f1.mock.calls[0][0]).toBe(value);
  });

  it("if .then's onRejected is called without errors it should transition to FULFILLED", () => {
    const value = ":)";
    const f1 = jest.fn();
    new RPromise((fulfill, reject) => reject())
      .then(null, () => value)
      .then(f1);
    expect(f1.mock.calls.length).toBe(1);
    expect(f1.mock.calls[0][0]).toBe(value);
  });

  it("if .then's onFulfilled is called and has an error it should transition to REJECTED", () => {
    const reason = new Error("I failed :(");
    const f1 = jest.fn();
    new RPromise((fulfill) => fulfill())
      .then(() => {
        throw reason;
      })
      .then(null, f1);
    expect(f1.mock.calls.length).toBe(1);
    expect(f1.mock.calls[0][0]).toBe(reason);
  });

  it("if .then's onRejected is called and has an error it should transition to REJECTED", () => {
    const reason = new Error("I failed :(");
    const f1 = jest.fn();
    new RPromise((fulfill, reject) => reject())
      .then(null, () => {
        throw reason;
      })
      .then(null, f1);
    expect(f1.mock.calls.length).toBe(1);
    expect(f1.mock.calls[0][0]).toBe(reason);
  });
});


describe('Async handlers', () => {
    it('if a handler returns a promise, the previous promise should ' +
      'adopt the state of the returned promise', () => {
      const value = ':)'
      const f1 = jest.fn()
      new RPromise(fulfill => fulfill())
        .then(() => new RPromise(resolve => resolve(value)))
        .then(f1)
      expect(f1.mock.calls.length).toBe(1)
      expect(f1.mock.calls[0][0]).toBe(value)
    })
  
    it('if a handler returns a promise resolved in the future, ' +
        'the previous promise should adopt its value', done => {
      const value = ':)'
      const f1 = jest.fn()
      new RPromise(fulfill => setTimeout(fulfill, 0))
        .then(() => new RPromise(resolve => setTimeout(resolve, 0, value)))
        .then(f1)
      setTimeout(() => {
        expect(f1.mock.calls.length).toBe(1)
        expect(f1.mock.calls[0][0]).toBe(value)
        done()
      }, 10)
    })
  })