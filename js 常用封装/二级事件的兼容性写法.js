window.onload=function(){
   Eventlisten={
       addEvent:function(ele,fn,str){//分别代表的是事件源，函数，事件
           if(ele.addEventListener){
               ele.addEventListener(str,fn);
           }else if(ele.attachEvent){
               ele.attachEvent("on"+str,fn);
           }else{
               ele["on"+str]=fn;
           }
       },
       removeEvent:function(ele,fn,str){
               if(ele.removeEventListener){
                   ele.removeEventListener(str,fn);
               }else if(ele.detachEvent){
                   ele.detachEvent("on"+str,fn);
               }else{
                   ele["on"+str]=null;
               }
       }
   }
    Eventlisten.addEvent($("div"),fn(),"click");
}