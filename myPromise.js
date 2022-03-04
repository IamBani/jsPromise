(function(window){
 function myPromise(executor){
    var that=this;
    that.state="pending";
    that.callbacks=[];
    that.date=undefined;

    executor(onResolved,onRejected);

    function onResolved(value){
        if(that.state==="pending"){
            that.state="reslove";
            that.date=value;
            if(that.callbacks.length>0){
                setTimeout(()=>{
                    that.callbacks.forEach(callback => {
                        callback.onResolve(that.date);
                    });
                })
            }
        }else{
            return
        }
    }

    function onRejected(error){
        if(that.state==="pending"){
            that.state="rejecte";
            that.date=error;
            if(that.callbacks.length>0){
                setTimeout(()=>{
                    that.callbacks.forEach(callback =>{
                        callback.onRejecte(that.date)
                    })
                })
            }
        }
    }

    myPromise.prototype.then=function(onResolve,onRejecte){
        let that=this;
        onResolve=typeof(onResolve) === "function"?onResolve:(value)=>{return myPromise.reslove(value)}
        onRejecte=typeof(onRejecte) ==="function"?onRejecte:(value)=>{throw value}
        return new myPromise((reslove,rejecte)=>{
            function handle(call){
                try {
                    let result=call(that.date);
                    if(result instanceof myPromise){
                        result.then(reslove,rejecte)
                    }else{
                        reslove(result);
                    }
                } catch (error) {
                    rejecte(error);
                }
            }
            if(that.state==="reslove"){
                setTimeout(()=>{
                    handle(onResolve);
                })
            }else if(that.state==="rejecte"){
                setTimeout(()=>{
                    handle(onRejecte);
                })
            }else{
                that.callbacks.push({
                    onResolve(){
                            handle(onResolve);
                    },
                    onRejecte(){
                            handle(onRejecte);
                    }
                })
            }
        })
    }

    myPromise.prototype.catch=function(onRejecte){
      return that.then(undefined,onRejecte)
    }
 }
 myPromise.reslove=function(value){
    return new myPromise((reslove,rejecte)=>{
        if(value instanceof myPromise){
            value.then(reslove,rejecte)
        }else{
            reslove(value)
        }
    })
}

myPromise.rejecte=function(error){
    return new myPromise((reslove,rejecte)=>{
        rejecte(error);
    })
}

myPromise.all=function(Pros){
    let counter=0;
    let newList=new Array(Pros.length);
    return new myPromise((reslove,rejecte)=>{
        Pros.forEach((p,index)=>{
         myPromise.reslove(p).then(value=>{
            counter++;
            newList[index]=value;
                if(counter === Pros.length){
                    reslove(newList);
                }
            },(error)=>{
                rejecte(error)
            })
        })
    })  
}
myPromise.race=function(Pros){
    return new myPromise((reslove,rejecte)=>{
        Pros.forEach(item=>{
            myPromise.reslove(item).then(value=>{
                reslove(value)
            },error=>{
                rejecte(error);
            })
        })
    })
}
window.myPromise=myPromise;
})(window)
