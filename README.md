# XPromise

XPromise is a JavaScript library that replicates the functionality of native JavaScript Promises, providing an intuitive way to handle asynchronous operations. XPromise supports promise chaining, error handling, and much more to enhance asynchronous workflows.

## Features

- **Promise Chaining**: Chain multiple asynchronous operations.
- **Error Handling**: Catch and manage errors within promise chains.
- **Custom Implementation**: Fully implemented to mimic native JavaScript Promises.
- **Simple API**: Easy to use and integrate into any project.
  
## Installation

To install XPromise, you can simply clone the repository or add it to your project.

```bash
git clone https://github.com/ravikisha/xpromise.git
```

## Usage

Here is a simple example of how to use XPromise:

```javascript
const promise = new XPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('Success!');
    }, 1000);
});

promise
    .then((result) => {
        console.log(result); // Output: Success!
    })
    .catch((error) => {
        console.error(error);
    });
```

## API

### XPromise Constructor

```javascript
new XPromise((resolve, reject) => { ... });
```

Creates a new XPromise. The executor function receives two arguments:
- **resolve**: A function to fulfill the promise.
- **reject**: A function to reject the promise.

### `.then(onFulfilled, onRejected)`

Appends fulfillment and rejection handlers to the promise.

### `.catch(onRejected)`

Appends a rejection handler callback.

### `.finally(onFinally)`

Appends a handler to be called when the promise is settled (fulfilled or rejected).

## Contributing

Feel free to submit issues or pull requests. Contributions are welcome!

## License

This project is licensed under the [MIT License](LICENSE).