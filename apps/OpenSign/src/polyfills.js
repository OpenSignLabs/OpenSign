// below code is used to handle undefined Promise.withResolvers for safari
if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Usage:
// const { promise, resolve, reject } = Promise.withResolvers()
// console.log(promise, resolve, reject) // Promise { <pending> } [Function (anonymous)] [Function (anonymous)]
// ... Do something async and then call resolve or reject!
