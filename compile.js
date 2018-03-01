function Compile(el){
  this.$el = document.querySelector(el);
  this.$fragment = this.node2Fragment(this.$el);
  this.init();
  this.$el.appendChild(this.$fragment);
}
Compile.prototype = {
  init: function(){
    this.compileElement(this.$fragment);
  },
  node2Fragment: function(el){
    var fragment = document.createDocumentFragment(),
        child;
    // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }        
    return fragment;
  },
  compileElement: function(el){
    var childNodes = el.childNodes, me=this;

    childNodes.forEach(function(node,index){
      var text = node.textContent;
      var reg = /\{\{(.*)\}\}/;

      if(me.isElementNode(node)){
        me.compile(node);
      }else if(me.isTextNode(node) && reg.test(text)){
        // console.log(node);
        me.compileText(node,RegExp.$1);        
      }
      // 遍历编译子节点
      if (node.childNodes && node.childNodes.length) {
        me.compileElement(node);
      }
    });
  },
  compile: function(node){
    // console.log('compile node');
  },
  compileText: function(node,attr){
    // console.log('compile text');
    compileUtil.text(node,attr);
  },
  isElementNode: function(node) {
    return node.nodeType == 1;
  },
  isTextNode: function(node) {
    return node.nodeType == 3;
  }
}

//指令处理集合
var compileUtil = {
  text: function(node,attr){
    //处理文本节点方法
    this.bind(node,attr);
  },
  bind: function(node,attr){
    //为Dom绑定watcher方法
    new Watcher(node,attr,function(oldVal,newVal,type){
      updater.update(node,oldVal,newVal,'text');
    });
  }
}

var updater = {
  update: function(node,oldVal,newVal,type){
    if(type === 'text'){
      console.log('[MVVM]:'+this.key+':'+oldVal+'=>'+newVal);
      let val = newVal || oldVal;
      node.textContent = val;
    }
  }
}
a = new Compile('#app');