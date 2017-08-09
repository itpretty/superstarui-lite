<#include "common/global.ftl" encoding="utf-8">
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SuperStarUI Lite</title>
<!--[if lt IE 9]>
    <style>#pageLogin form{visibility:hidden;}</style>
<![endif]-->
<script>
    (function(){
        var div = document.createElement("div");
        div.innerHTML = "<!--[if lt IE 9]><i></i><![endif]-->";
        var isIeLessThan9 = (div.getElementsByTagName("i").length == 1);
        if (isIeLessThan9) {
            if (confirm('这位同学，你的浏览器太旧，我们与时俱进好吗？\n\n前往百度，搜索“谷歌浏览器”，下载并安装 :)')) {
                //location.href = 'http://outdatedbrowser.com/zh-cn';            
                window.location.href = 'https://www.baidu.com';
            }
            return false;
        }
    })();
</script>
<#-- <link rel="stylesheet" href="https://rawgit.com/itpretty/superstarui-lite/master/ssui.min.css"> -->
<link rel="stylesheet" href="static/dist/ssui.min.css">
<link rel="shortcut icon" href="static/img/favicon.ico" type="image/x-icon" />
<style>
    body{background-color:#00386F;}
    #pageLogin{height:390px;}
    .wrapper-login {background-image: url('static/img/login-background.jpg')}
	.loading{visibility:hidden;background:#00386F url('static/img/bg-loading.gif') center center no-repeat;}
</style>
</head>
<body class="loading">
<div class="wrapper-login">
    <canvas id="starCanvas" width="100%" height="100%"></canvas>
    <div id="pageLogin">
        <div class="ss-logo">
            <img src="static/img/logo-login.png" alt="">
        </div>
        <form>
            <i-form ref="form" :model="form" :rules="rule" inline>
                <Tooltip content="记住用户名和密码" placement="left-start">
                    <Form-item prop="rememberMe">
                        <Checkbox v-model="form.rememberMe">记住我</Checkbox>
                    </Form-item>
                </Tooltip>
                <Form-item prop="username">
                    <i-input type="text" v-model="form.username" placeholder="请输入登录名">
                        <Icon type="ios-person-outline" slot="prepend"></Icon>
                    </i-input>
                </Form-item>
                <Form-item prop="password">
                    <i-input type="password" v-model="form.password" placeholder="请输入密码">
                        <Icon type="ios-locked-outline" slot="prepend"></Icon>
                    </i-input>
                </Form-item>
                <Form-item>
                    <i-button type="primary" @click="submit('form')">登录</i-button>
                </Form-item>
            </i-form>
        </form>
    </div>
</div>

<#-- <script type="text/javascript" src="https://rawgit.com/itpretty/superstarui-lite/master/ssui.min.js"></script> -->
<script type="text/javascript" src="static/dist/ssui.min.js"></script>
</body>
</html>