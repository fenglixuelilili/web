class Vue {
    constructor(options){//在实例化new Vue({}) 传入的对象 包括 data methods 生命周期函数等等
        // 传入的所有属性
        this.$options = options
        // 将 data数据取出
        this.$data = options.data
        this.observe(this.$data)

        new Compile(this.$options.el,this)//节点  和  当前实例
    }
    // 对data数据进行监听
    observe(data={a:10,b:{bb:20}}){
        if(!data||typeof data !=='object'){
            return
        }
        // 将keys取出
        Object.keys(data).forEach(key=>{
            this.DefineReactive(data,key,data[key])
            // 属性代理  将data代理到vue 实例上面
            this.proptype(key)
        })
    }
    // 数据劫持函数
    DefineReactive(obj,key,val){//val 为当前传入的值 我们可以认为是当前值  如果不动的话 一直就是当前值
        if(typeof obj[key] === 'object'){
            this.observe(obj[key])
        }
        const dep = new Dep() //对于每一个属性来说 都是一个独立的作用于 因此 每一个属性都对应一个dep  里面的watcher 集合对应的都是一条属性
        Object.defineProperty(obj,key,{
            set:function(newval){
                // 更新当前值 其实val就相当于缓存了下来
                if(val === newval){
                    // 如果赋的值是想等的 那就不需要更新
                    return
                }
                val = newval
                // 更新
                // console.log(val,newval,'更新了..')
                // 使用依赖收集 与发布订阅的方式进行更新(需要做什么事情呢?)  这块设置的时候应该是更新
                dep.notify()
            },
            get:function(){
                // 当读取属性的时候   将watcher加入到depdends中
                Dep.target&&dep.addDep(Dep.target) //如果new 了一个watcher 的话 target就是dep实例 并将watcher加入到dep中
                return val
            }
        })
    }
    proptype(key){
        Object.defineProperty(this,key,{
            set(newval){
                this.$data[key] = newval
            },
            get(){
                return this.$data[key]
            }
        })
    }
}
// 依赖收集  就是收集页面上面使用到的属性  有两个东西 ：1.依赖对象  2.观察者 watcher  会有若干watcher一个watcher对应一个属性
// 依赖收集就是 一个属性有一个依赖  一个依赖里面会有多个wathcer监听器（因为页面上会有多个的数据）

// depdents 是watcher 的管理器   称为
// 依赖里面管理了很多监听器 每一个依赖针对于一个单独的属性（单独的属性就是初始化的时候，有的属性，wacher监听器对应页面上的重复数据）
class Dep {
    constructor(){
        // 存放 watcher 依赖于属性  界面上有多少个数据 就有多少个watcher
        this.deps = []
    }
    addDep(dep){
        this.deps.push(dep)
    }
    // 通知所有的依赖做更新
    notify(){
        this.deps.forEach(dep=>dep.updata()) //每一个小的dep就是一个watcher

    }
}
// 具体的watcher  wacher监听器对应页面上的重复数据，每在页面上出现一个数据 就会有一个watcher
class Watcher {
    constructor(vm,key,fn){
        this.vm = vm
        this.key = key
        this.fn = fn
        // 将当前watcher的实例 指定到Dep的静态属性target
        Dep.target = this
        // 读取属性 触发get函数  让当前依赖添加进去  然后进行置空操作
        this.vm[this.key]
        Dep.target = null
    }
    updata(){
        // console.log('属性更新了')
        // 具体的更新内容
        this.fn.call(this.vm,this.vm[this.key])
    }
}