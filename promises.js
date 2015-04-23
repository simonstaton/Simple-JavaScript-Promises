'Use strict';

var Promise = function(){
    this.resolves = [];
    this.rejects = [];
}

Promise.prototype = {
    
    state: 'pending',
    
    response: null,
    
    then: function(resolve, reject){
        this.resolves.push({fnc: resolve, state: 'pending'});
        if(reject) this.rejects.push({fnc: reject, state: 'pending'});
        if(this.state !== 'pending') this.executeCallbacks(this.state, this.response);
    },
    
    done: function(resolve){
        this.resolves.push({fnc: resolve, state: 'pending'});
        if(this.state === 'resolved') this.executeCallbacks(this.state, this.response);
        return this;
    },
    
    error: function(reject){
        this.rejects.push({fnc: reject, state: 'pending'});
        if(this.state === 'rejected') this.executeCallbacks(this.state, this.response);
        return this;
    },
    
    executeCallbacks: function(state, response){
        this.state = state;
        this.response = response;
        if(state == 'resolved'){
            for(var index in this.resolves){
                if(this.resolves[index].state === 'pending'){
                  this.executeCallback(this.resolves[index], response);
                }
            }
        } else if(state == 'rejected'){
            for(var index in this.rejects){
                if(this.rejects[index].state === 'pending'){
                    this.executeCallback(this.rejects[index], response);
                }
            }
        }
    },

    executeCallback: function(callback, response){
        callback.state = this.state;
        setTimeout(function(){
            callback.fnc(response);
        }, 1);
    }
    
}

var Defer = function(){
    this.promise = new Promise();
}

Defer.prototype = {
 
    resolve: function(response){
        if(this.promise.state !== 'pending'){
          throw new Error('Promise already has a '+this.promise.state+' state');
        }
        this.promise.executeCallbacks('resolved', response);
    },
    
    reject: function(response){
        if(this.promise.state !== 'pending'){
          throw new Error('Promise already has a '+this.promise.state+' state');
        }
        this.promise.executeCallbacks('rejected', response);
    }
    
}

var When = function(){
    var args = Array.prototype.slice.call(arguments),
        resolved = 0,
        callback = args.pop(),
        promises = args;
    if(typeof(callback) != "function"){
        throw new Error('No callback passed to when');
    } else {
        for(var index in promises){
            promises[index].done(function(){
                resolved++;
                if(resolved == promises.length){
                    callback();   
                }
            }).error(function(error){
                throw new Error("when failed due to rejected promise: "+error);
            });
        }
    }
}

var test = function(){
    var defer = new Defer();
    setTimeout(function(){
        defer.resolve('it worked');
        //defer.reject('it failed');
    }, 2000);
    return defer.promise;   
}

var myPromise = test(),
    myPromise2 = test();

When(myPromise, myPromise2, function(){
    console.log("promises done");
});

//myPromise.done(function(success){
//    console.log(success);
//}).error(function(error){
//    console.log(error);
//});
