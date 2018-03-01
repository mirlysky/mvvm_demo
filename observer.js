var uid = 0;
var data = {
  'name' : 'lan',
  'age'  : 19,
  'info' : {
    'like': 'football'
  }
};

/*
*订阅器
*一个订阅器上，绑定了很多watcher，当订阅器发生变化了，广播每一个watcher进行update
*/
function Dep(){
  //id是标记其的标识
  this.id = uid++;
  this.subs = [];
  this.target = null;
}

Dep.prototype = {
  depend: function(){
    /*
    *watcher.addDep(this)
    *this是defineProperty时候定义的Dep
    */
    console.log('[MVVM]:',Dep.target);
    Dep.target.addDep(this);
  },
  addSub: function(sub){
    this.subs.push(sub);
    console.log('[MVVM]:add sub',this.subs);
  },
  notify: function(oldVal,newVal){
    console.log('notify change');
    this.subs.forEach(function(sub){
      sub.update(oldVal,newVal);
    });
  }
}

observer(data);

function observer(data){
  if(!data || typeof(data) !== 'object'){
    return;
  }
  Object.keys(data).forEach(function(key,index){
    setReactive(data,key,data[key]);
  });
}

function setReactive(data,key,val){
  var dep = new Dep();//给每一个属性设置一个订阅器
  
  // console.log(dep,dep.prototype);

  observer(val);//监听子属性
  
  Object.defineProperty(data,key,{
    enumerable: true, // 可枚举
    configurable: false, // 不能再define    
    get: function() {
      Dep.target&&Dep.target.addDep(dep,val);
      return val;
    },
    set:function(newval){
      if(val === newval)return;
      //截获setter事件,通知watcher有属性发生了变化
      console.log('[MVVM]:'+key+' : '+val+'=>'+newval);
      dep.notify(val,newval);
      val = newval;
    }
  });
}