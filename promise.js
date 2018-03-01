function fn1(resolve){
  console.log('do fn1');
  setTimeout(()=>{
    // console.log('fn1 done');
    resolve('1');
  },1000);
};

function fn2(resolve){
  console.log('do fn2');
  setTimeout(()=>{
    resolve('2');
  },1000);
};

// 原生promise
// var promise = new Promise(fn1).then((val)=>{
//   console.log('[PROMISE]:'+val);
//   return new Promise(fn2);
// }).catch((val)=>{
//   console.log('[PROMISE]:'+val)
// });

//基础版
function promise_simple(fn){
  var cbkSuc,cbkFail;
  //在then中指定回调
  this.then = function(done,fail){
    cbkSuc = done;
    cbkFail = fail;
  }
  //内部函数resolve和reject传给fn
  function resolve(val){
    //加上timeout，resolve先于then执行
    setTimeout(()=>{
      cbkSuc(val);
    });
  }
  function reject(val){
    setTimeout(()=>{
      cbkFail(val);
    });
  }
  //执行fn
  fn(resolve,reject);
}
// var p = new promise_simple(fn1).then((val) => {
//   console.log(val);
// });

//添加链式
function promise_chain(fn){
  var promise = this,
      value = null;
  promise._resolves = [];
  
  // 每次调用then，向_resolves中推入sucCbk
  // 通过返回this，返回了promise对象，从而可以链式调用then
  this.then = (sucCbk) => {
    console.log('add then');
    promise._resolves.push(sucCbk);      
    return this;
  }

  function resolve(value){
    console.log('call resolve');
    setTimeout(()=>{
      console.log('do resolve');
      promise._resolves.forEach((cbk) => {
        cbk(value);
      });
    });
  }

  fn(resolve);
}
// var p1 = new promise_chain(fn1).then((val) => {
//   console.log('then chain 1',val);
// }).then((val)=>{
//   console.log('then chain 2',val);
// }).then((val)=>{
//   console.log('then chain 3',val);
// });

//添加status
//promise的status是单向的，如果状态已经变化，再次调用的时候只会立刻返回结果
function promise_status(fn){
  var promise = this,
      value = null;
  promise._resolves = [];
  promise._status = 'PENDING';

  this.then = (sucCbk) => {
    if(promise._status === 'PENDING'){
      console.log('add then');
      promise._resolves.push(sucCbk);
      return this;      
    }
    sucCbk(value);      
    return this;
  }

  function resolve(value){
    console.log('call resolve');
    setTimeout(()=>{
      promise._status = 'FULFIELD';
      console.log('do resolve');
      promise._resolves.forEach((cbk) => {
        cbk(value);
      });
    });
  }

  fn(resolve);
}
// var p2 = new promise_status(fn1).then((val) => {
//   console.log('then chain 1',val);
// });
// //在promise执行完成前，该then会插入到then队列
// setTimeout(()=>{
//   p2.then((val) => {
//     console.log('then chain 2',val);
//   });
// },500);
// //在promise执行完成后，该then会立刻执行，不会在加入到resolve队列
// setTimeout(()=>{
//   p2.then((val) => {
//     console.log('promise finish');
//   });
// },2000);

//串行promise
//改写了then函数，第一个promise还在pending的时候，把第二个promise的resolve回调添加进去，等到第一个promise到了fulfield的时候，就执行了第一个
//then函数，之后执行handle函数，handle函数执行了第二个promise的then，以此类推
function Dromise(fn){
  var promise = this,
      value = null;
      promise._resolves = [];
      promise._status = 'PENDING';

  this.then = (sucCbk) => {
    return new Dromise(function(resolve){
      function handle(value) {
          var ret = typeof sucCbk === 'function' && sucCbk(value) || value;
          if( ret && typeof ret ['then'] == 'function'){
              ret.then(function(value){
                 resolve(value);
              });
          } else {
              resolve(ret);
          }
      }
      if (promise._status == 'PENDING') {
        promise._resolves.push(handle);
      } else if(promise._status == 'FULFIELD'){
        handle(value);
      }        
    });    
  }

  function resolve(value){
    setTimeout(()=>{
      promise._status = 'FULFIELD';
      promise._resolves.forEach((cbk) => {
        cbk(value);
      });
    });
  }

  fn(resolve);
}
function isFunction(func){
  return typeof(func) == 'function';
}
var p = new Dromise(fn1).then((val)=>{
  console.log('[Dromise]:fn1 resolve',val);
  return new Dromise(fn2);
}).then((val) => {
  console.log('[Dromise]:fn2 resolve',val);
});