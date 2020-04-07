// 用法  new Compile(el,vm)   参数为元素节点  和  vue实例
class Compile {
    constructor(el,vm){
        // 宿主节点 就是#pp
        this.$el = document.querySelector(el)
        this.$vm = vm
        if(this.$el){
            // 如果有该节点 则进行解析
            this.$fragment = this.node2Fragment(this.$el) //将所有的节点转换成fragment片段
            // console.log(this.$fragment)
            // 执行编译
            this.compile(this.$fragment) //这一步是已经解析好的html了，操作的是frament 不是真正的dom
            // 最终追加
            this.$el.appendChild(this.$fragment)
        }
    }
    node2Fragment(el){
        let frgment = document.createDocumentFragment()
        // 将el中的元素拿到frgment中（移动操作）
        let child
        while (child = el.firstChild) { 
            frgment.appendChild(child) //这里是移动操作 
        }
        return frgment
    }
    // 编译过程
    compile(el){
        const childnodes = el.childNodes
        Array.from(childnodes).forEach(node=>{
            if(this.isElement(node)){
                // 节点是html元素的处理方式
                let attributes = node.attributes //将当前html节点的所有属性拿出来
                Array.from(attributes).forEach(attr=>{
                    let attrName = attr.name
                    let exp = attr.value
                    if(this.isDir(attrName)){
                        // 是指令 v-html v-mode
                        let dir = attrName.substring(2) //匹配出 html
                        // 有写的这个属性的话 执行html的解析
                        this[dir] && this[dir](node,this.$vm,exp)
                    }
                    if(this.isEvent(attrName)){
                        // 是方法
                        let dir = attrName.substring(1)
                        this.bindHandler(node,dir,exp,this.$vm)
                    }
                })
            }
            if(this.isText(node)){
                // 节点是文本的处理方式---而且是差值文本
                this.compiletext(node)
            }
            if(node.childNodes&&node.childNodes.length>0){
                this.compile(node)
            }
        })
    }

    compiletext(node){
        // 使用更新函数进行更新
        // node.textContent = this.$vm.$data[RegExp.$1]
        this.update(node,this.$vm,RegExp.$1,'text')
    }
    update(node,vm,exp,dir) {//node节点 vue实例 exp匹配的key值  dir是指令--就是具体要用哪个函数
        const unpdataFn = this[dir + 'updata']
        // 执行具体的内容---就是更新视图
        unpdataFn && unpdataFn(node,vm[exp])
        // 具体的依赖收集
        new Watcher(vm,exp,function(value){
            unpdataFn && unpdataFn(node,value)
        })
    }
    // v-text的解析
    text(node,vm,exp){
        this.update(node,vm,exp,'text')
    }
    // v-mode 双向绑定的解析 （对input 的解析）
    model(node,vm,exp){
        // 分为双向  向视图输入内容   视图反馈回来内容
        // 向视图输入内容
        this.update(node,vm,exp,'model')
        // 视图反馈回来内容  视图对模型的响应
        node.addEventListener('input',(e)=>{
            vm[exp] = e.target.value
        })
    }
    // {{}} 的解析
    textupdata(node,value){
        node.textContent = value
    }
    modelupdata(node,value){
        node.value = value
    }
    bindHandler(node,dir,exp,vm){
        let fn = vm.$options.methods && vm.$options.methods[exp]
        if(fn){
            node.addEventListener(dir,fn.bind(vm))
        }
    }
    isElement(node){
        return node.nodeType === 1
    }
    isText(node){
        return node.nodeType === 3&& /\{\{(.*)\}\}/.test(node.textContent)
    }
    isDir(attrName){
        return attrName.indexOf('v-') == 0 //是第一个的话 那么就是
    }
    isEvent(attrName){
        return attrName.indexOf('@') == 0 //是第一个的话 那么就是
    }
}