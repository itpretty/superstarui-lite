<#include "common/global.ftl" encoding="utf-8">
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
	    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
	    <meta name="description" content="">
	    <meta name="author" content="http://ffzxnet.com">
		<title>SuperStar UI Lite</title>
		<#-- <link rel="stylesheet" href="https://rawgit.com/itpretty/superstarui-lite/master/ssui.min.css"> -->
		<link rel="stylesheet" href="static/dist/ssui.min.css">
		<link rel="stylesheet" href="static/css/app.css">
		<link rel="shortcut icon" href="static/img/favicon.ico" type="image/x-icon" />
	</head>
	<body class="ss page-home">
		<div id="pageHome" class="wrapper-page">
			<div class="layout" :class="{'layout-hide-left': showLeftCol}">
				<Row type="flex">
					<i-col class="layout-menu-left">
						<div class="layout-logo-left"><img src="static/img/logo-ffzx.png"></div>
						<ul id="ztreeHome" class="ztree showIcon"></ul>
					</i-col>
					<i-col class="layout-right">
						<div class="layout-header">
							<i-button type="name" class="btn-toggle" @click="toggleClick">
								<Icon type="navicon" size="32"></Icon>
							</i-button>
							<i-button type="text" class="btn-logout" icon="log-out" size="large" @click="logout">
								退出
							</i-button>							
						</div>
						<div class="layout-breadcrumb">
							<div id="homeTabs">
							<ul></ul>
							</div>
						</div>	                
						<div class="layout-copy">
							Copyright © 2017 粤ICP备15067190号-3 深圳市非凡之星网络科技有限公司版权所有
						</div>
					</i-col>
				</Row>
			</div>
	    </div>
		  
	    <#-- <script type="text/javascript" src="https://rawgit.com/itpretty/superstarui-lite/master/ssui.min.js"></script> -->
		<script type="text/javascript" src="static/lib/ueditor/ueditor.config.js"></script>
		<script type="text/javascript" src="static/lib/ueditor/ueditor.all.js"></script>
		<script type="text/javascript" src="static/dist/ssui.min.js"></script>
		<script type="text/javascript" src="static/js/app.js"></script>
	</body>
</html>