function Watcher(node,key,cb){
  this.dom = node;
  this.depIds = {};
  this.key = key;
  this.value = this.get();
  this.cb = cb;
}
Watcher.prototype = {
  addDep: function(dep,oriVal){
    console.log('[MVVM]:add dep');
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this);
      this.depIds[dep.id] = dep;
      //这样写可能有问题
      setTimeout(()=>{
        this.update(oriVal);
      });
    }
  },
  update: function(oldVal,newVal){
    console.log('[MVVM]:'+this.key+' has changed');
    this.cb(oldVal,newVal,'text');
  },
  get: function(){
    Dep.target = this;
    var value = data[this.key];
    Dep.target = null;
    return value;
  }
}