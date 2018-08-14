window.onload=function(){
    function $(str){
        var str1=str.charAt(0);//返回首字母的位置
        if(str1=="#"){
            return document.getElementById(str.slice(1));//从第二个位置开始截取
        }
        if(str1=="."){
            return document.getElementsByClassName(str.slice(1));
        }else{
            return document.getElementsByTagName(str);
        }
    }
    //根据首字母返回#是ID  .是class值  默认的是标签选择器
    //$("#b").style.backgroundColor="green";
}