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
