function Promise(fn) {
    var _this = this;

    this.thenList = [];
    this.hasResolve = false;
    this.resolveResult;
    this.catchList = [];
    this.hasReject = false;
    this.rejectMessage;
    fn && fn(function(data) {
        _this.resolve(data);
    }, function(ex) {
        _this.reject(ex);
    });
}

Promise.prototype.then = function(fn, onFail) {
    if (this.hasResolve) {
        fn(this.resolveResult);
    } else {
        this.thenList.push(fn);
    }
    onFail && this.catch(onFail);
    return this;
};
Promise.prototype.catch = function(fn) {
    if (this.hasReject) {
        fn(this.rejectMessage);
    } else {
        this.catchList.push(fn);
    }
    return this;
};
Promise.prototype.resolve = function(data) {
    this.thenList.forEach(function(fn) {
        fn(data);
    });
    this.thenList = [];
    this.resolveResult = data;
    this.hasResolve = true;
};
Promise.prototype.reject = function(ex) {
    this.catchList.forEach(function(fn) {
        fn(ex);
    });
    this.catchList = [];
    this.rejectMessage = ex;
    this.hasReject = true;
};

Promise.resolve = function(data) {
    var promise = new Promise();
    promise.resolve(data);
    return promise;
};
Promise.reject = function(ex) {
    var promise = new Promise();
    promise.reject(ex);
    return promise;
};
Promise.all = function(promises) {
    return new this(function(resolve, reject) {
        var results = [];
        var remaining = 0;
        var resolver = function(index) {
            remaining += 1;
            return function(value) {
                results[index] = value;
                --remaining || resolve(results)
            };
        }
        for (var i = 0, promise; i < promises.length; i++) {
            promise = promises[i];
            if (promise && typeof promise.then === 'function')
                promise.then(resolver(i), reject);
            else
                results[i] = promise;
        }
        remaining || resolve(results);
    });
};
module.exports = Promise;
