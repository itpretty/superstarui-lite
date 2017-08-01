//namespace of SuperStar UI
let ss = {};
window['ss'] = ss;

ss.global = {
	debug: false,
	ajaxCount: 0,
	currVm: null,
	isRefreshingTab: false,
	mapNameLabel: {},
	ueditor: {
		initialFrameHeight: 100,
		initialFrameWidth: null
	}
};

ss.log = data => { console && console.log(data) };
ss.path = { 
	base: window.location.protocol + '//' + window.location.host + '/' + window.location.pathname.split('/')[1] + '/',
	ajax: str => ss.path.base + str
};
ss.ajax = (obj) => {
	var _obj = {
		dataType: 'json'
	};
	return $.ajax($.extend(true, _obj, obj));
};

ss.util = {
	arrDiff (a1, a2) {
		var a = [], diff = [];
		for (var i = 0; i < a1.length; i++) {
			a[a1[i]] = true;
		}
		for (var i = 0; i < a2.length; i++) {
			if (a[a2[i]]) {
				delete a[a2[i]];
			} else {
				a[a2[i]] = true;
			}
		}
		for (var k in a) {
			diff.push(k);
		}
		return diff;
	},
	str_repeat (str, num) { 
		return new Array(num + 1).join(str);
	},
	isNumber (obj) {  
		return obj === +obj;
	},
	isString (obj) {  
		return obj === obj + '';  
	},
	// 前置扩展某方法
	prependFn (fn, prevfn) {
		return function () {
			prevfn.apply(this, arguments);
			return fn.apply(this, arguments);
		}
	},
	// 后置扩展某方法
	appendFn (fn, nextfn) {
		return function () {
			fn.apply(this, arguments);
			return nextfn.apply(this, arguments);
		}
	},

	// 将扁平的无序的无限分类数据整理成：
	// “多维树状（data.unflat）”和“扁平树状（data.flat）”两种数据
	genTreeData (data, opt) {
		var opt = opt || { idField: 'id', parentField: 'pid', textField: 'name'};
		var idField, textField, parentField, tmpMap = {};
		idField = opt.idField || 'id';
		textField = opt.textField || 'name';
		var unflatten = function () {
			if (opt.parentField) {				
				parentField = opt.parentField;
				var i, l, treeData = [];
				for (i = 0, l = data.length; i < l; i++) {
					data[i].label = data[i][textField];
					data[i].value = data[i][idField];
					tmpMap[data[i][idField]] = data[i];
				}
				for (i = 0, l = data.length; i < l; i++) {
					if (tmpMap[data[i][parentField]] && data[i][idField] != data[i][parentField]) {
						if (!tmpMap[data[i][parentField]]['children'])
							tmpMap[data[i][parentField]]['children'] = [];
						data[i]['text'] = data[i][textField];
						var hasEle = (function(){
							var ret = false;
							$.each(tmpMap[data[i][parentField]]['children'], function(idx, ele){
								if (ele[idField] == data[i][idField]) {
									ret = true;
									return false;
								}
							});
							return ret;
						})();
						if (hasEle == false) {
							tmpMap[data[i][parentField]]['children'].push(data[i]);
						}						
					} else {
						data[i]['text'] = data[i][textField];
						treeData.push(data[i]);
					}
				}
				return treeData;
			}
			return data;
		};
		//console.log(unflatten())
		var flatten = function () {
			var arr = [];
			var flattenIt = function (data, _level) {
				for (var i = 0; i < data.length; i++) {
					var _levelSub = _level + 1;
					var ele = tmpMap[data[i][idField]];	
					ele.level = _level;
					arr.push(ele);
					if ('children' in data[i] && data[i].children.length > 0) {
						flattenIt(data[i].children, _levelSub);
					}					
				}
			}
			flattenIt(unflatten(), 0);
			return arr;
		};
		
		return {
			flat: flatten(),
			unflat: unflatten()
		}
	},
	// 处理扁平树状数据，为 i-select 使用
	formatSelectData (arr) {
		var _arr = [];
		$.each(arr, function (idx, ele) {
			var _objItem = {};
			var label = ele.name || '';	
			if ($.type(ele.level) != 'undefined' && isNaN(ele.level) == false) {
			 	//label = '<span class="treeLevel"><i class="ivu-icon ivu-icon-' + ss.map.iconTree[ele.level] + ' tl-' + ele.level + '"></i>'+ label +'</span>';
				// 生成多个全角空格
				label = ss.util.str_repeat('　　', ele.level) + label;
			}		
			_objItem = {
				label: label,
				value: String(ele.id),
				id: String(ele.id),
				pId: ele.pId || ''
			}			
			_arr.push(_objItem);
		});
		return _arr;
	},
	map2select (obj) {
		let _arr = [];
		$.each(obj, function(key, val){		
			_arr.push({
				label: val,
				value: '' + key
			});
		});
		return _arr;
	}
};

ss.ui = new Vue({
	data: {
		
	},
	methods: {
		loading () {
			this.$Message.config({
				top: 13
			});
			this.msgHide();
			this.$Message.loading('正在加载中...', 0);						
		},
		msgHide () {
			this.$Message.destroy();
		},
		msgShow ({content = '', duration = 1, type = 'info', onClose = function(){}, closable = true}) {
			// type: info, success, warning, error
			// duration: 0 is open forever
			this.msgHide();
			this.$Message[type]({content, duration, onClose, closable});
			setTimeout(()=>{
				onClose();
			}, duration*1000);
		},
		dlShow ({ type = 'info', title = '确认', content = '', width = 416, okText = '确定', cancelText = '取消', loading = true, scrollable = false, onOk = function(){}, onCancel = function(){} }) {
			// type: info, success, warning, error, confirm
			this.$Modal[type]({ title, content, width, okText, cancelText, loading, scrollable, onOk, onCancel});
		},		
		dlRemove () {
			this.$Modal.remove();
		},
		noticeShow ({type="info", title="", desc="", duration=2, key='', onClose=function(){}}) {
			this.$Notice[type]({title, desc, duration, key, onClose});
		},
		noticeHide (key) {
			this.$Notice.close(key);
		},
		noticeHideAll () {
			this.$Notice.destroy();
		},
		ztree ({$ul, setting, data}) {
			return $.fn.zTree.init($ul, setting, data);
		},
		ueditor ({id, opt = {}}) {
			return UE.getEditor(id, $.extend(true, {}, ss.global.ueditor, opt));
		}
	}
});

$.ajaxSetup({
	timeout: 3000,
	cache: false,
	type: 'post',
	beforeSend (request, settings) {
		if (ss.global.ajaxCount < 0) { ss.global.ajaxCount = 0; }
		ss.global.ajaxCount++; 
		if (ss.global.ajaxCount == 1) { ss.ui.loading(); }

		let oriSuccess = settings.success;
		//console.log(settings)
		if ($.type(oriSuccess) == 'function') {
			settings.success = function(response, textStatus, jqXHR) {		
				//console.log(response);
				let code = response.code;
				const currVm = ss.global.currVm;

				// 处理错误，如果 code!=1
				if ($.type(code) != 'undefined') {
					if (code != 1) {
						// 处理 10004 错误
						if (code == 10004) {
							let arrMsg = JSON.parse(response.message);
							let objMsg = {};
							let strMsg = '';
							setTimeout(() => {
								$.each(arrMsg, (idx, ele) => {
									$.each(ele, (key, val) => {
										if ($.type(objMsg[key]) == 'undefined') {
											objMsg[key] = [];
										}
										objMsg[key].push(val);
									});							
								});
							}, 0);
							setTimeout(() => {
								$.each(objMsg, (key, val) => {
									var label = ss.global.mapNameLabel[currVm][key];
									strMsg += '<strong>'+ label +'</strong>：' + val.join('，') + '<br />';
								});							
								ss.ui.noticeShow({
									type: 'error',
									title: '表单填写有误',
									desc: strMsg,
									duration: 0
								});
							}, 0);
							window[currVm].dialogSubmitLoading = false;
						} else {
							ss.ui.msgShow({
								type: 'error',
								content: code + ': ' + response.message
							});
						}
						return false;
					} else {
						if (ss.global.ajaxCount == 0) {
							ss.ui.msgHide();
						}
					}
				}
				return oriSuccess(response, textStatus, jqXHR);
			}
		}
	},
	dataFilter (data, type) {
		//raw data before success response
		if (data.indexOf('pageLogin') > -1) {
			ss.ui.dlShow({
				type: 'confirm',
				title: '已超时退出！',
				content: '点击“取消”将留在当前页，点击“确定”将转向登录页。',
				onOk: function(){
					location.href = 'login.do';
				}
			});			
			return false;
		}
		// debug 状态下，以纯文本直接输出 ajax 返回的数据
		ss.global.debug && ss.log(data);
		return data;
	},
	complete(jqXHR, textStatus) {//console.log(textStatus)
		ss.global.ajaxCount--;
		if (ss.global.ajaxCount < 0) { ss.global.ajaxCount = 0; }		
		
		// 处理各种错误信息
		if ($('#pageLogin').length == 0) {
			let currVm = ss.global.currVm;
			if (currVm != null && $.type(window[currVm].dialogSubmitLoading) != 'undefined') {
				window[currVm].dialogSubmitLoading = false;
			}

			if (textStatus == 'error') {
				let content = jqXHR.status + ': ' + jqXHR.statusText;
				if (!!jqXHR.responseJSON) {
					content = jqXHR.responseJSON.code + ': ' + jqXHR.responseJSON.message;
				}
				ss.ui.msgShow({
					type: 'error',
					content: content,
					duration: 0
				});
			} else if (textStatus == 'timeout') {
				ss.ui.msgShow({
					type: 'error',
					content: '请求超时，请稍候再试',
					duration: 0
				});
			} else {
				if (ss.global.ajaxCount == 0 && jqXHR.responseJSON && jqXHR.responseJSON.code == 1) {
					ss.ui.msgHide();
				}
			}
			return false;
		}
	},
	error: function(xhr, status, e) { //alert(e)				
		ss.global.debug && ss.log(xhr);
	}
});

// 初始化 vue 实例
ss.mvvm = obj => {
	if ($.type(obj.id) == 'undefined') {
		alert('亲，连 id 都没有？');
		return false;
	}
	let el = '';
	let id = obj.id;
	let crud = ('crud' in obj) ? Boolean(obj.crud) : true;
	let _obj = {};
	if (crud == true) {
		_obj = {
			data: {
				label: {
					add: '添加',
					edit: '编辑',
					search: '搜索',
					'delete': '删除',
					clear: '清空',
					submit: '提交'
				},
				currDialog: 'add',
				dialogShow: false,
				delRowKey: 'id',
				dialogSubmitLoading: false,
				formSearch: {}
			},
			watch: {
				dialogShow: function(newVal, oldVal){
					// TODO: autofocus
				}
			},
			methods: {
				submitSearch: function (name) {
					var obj = $.extend({}, this.pager, this.formSearch);
					$.each(obj, function (key, val) {
						if (val == '') {
							delete obj[key];
						}
					});
					this.pager = obj;
					this.paging(1);
				},
				resetSearch: function (name) {
					this.$refs[name].resetFields();
					this.submitSearch();
				},
				genBtnEdit: function(vm, create, params){
					return create('Button', {
						props: {type: 'primary', size: 'small'},
						style: {marginRight: '5px'},
						on: {
							click: function () {
								if ($.type(vm.initDialog) == 'function') {
									vm.editRow(params.index, vm.initDialog(params.row));
								} else {
									vm.editRow(params.index);
								}
							}
						}
					}, vm.label.edit);
				},				
				genBtnDelete: function(vm, create, params){
					return create('Button', {
						props: {type: 'error', size: 'small'},
						on: {
							click: function () {
								vm.delRow(params.index);
							}
						}
					}, vm.label.delete);
				},
				addRow: function () {
					this.currDialog = 'add';
					this.resetDialogForm('formDialog');
					this.dialogShow = true;
					if ('id' in this.formDialog) {
						this.formDialog.id = 0;
					}
					if ($.type(this.ueditor) != 'undefined' && this.ueditor != null) {
						this.ueditor.setContent('');
					}
				},
				editRow: function (index, initDialogData) {
					// this.$Modal.info({
					//     title: '用户信息',
					//     content: `推广：$ {this.data[index].name}<br>显示次数：$ {this.data[index].show}<br>登录次数：$ {this.data[index].signin}`
					// })
					var vm = this;
					var _formDialog = {};
					//this.resetDialogForm('formDialog');
					this.dialogShow = true;					
					this.currDialog = 'edit';

					_formDialog = $.extend({}, this.pager.data[index]);
					if ($.type(initDialogData) != 'undefined') {
						_formDialog = initDialogData;
					}
					$.each(_formDialog, function (key, val) {
						if ($.type(vm.formDialog[key]) == 'undefined') {
							delete _formDialog[key];
						}
						if (ss.util.isNumber(val)) {
							_formDialog[key] = String(val);
						}
					});
					//console.log(_formDialog)
					this.formDialog = _formDialog;
				},
				delRow: function (index) {
					var vm = this;
					var _data = {};

					_data[vm.delRowKey] = vm.pager.data[index][vm.delRowKey];

					ss.ui.dlShow({
						type: 'confirm',
						title: '确认',
						content: '确认删除这条数据吗？',
						loading: true,
						onOk: function () {
							ss.ajax({
								url: ss.path.ajax(vm.url.delete),
								data: _data,
								success: function () {
									ss.ui.dlRemove();
									//vm.pager.data.splice(index, 1);
									vm.paging();
									ss.ui.msgShow({
										type: 'warning',
										content: '已成功删除'
									});
									if ($.type(vm.onRowDeleted) == 'function') {
										vm.onRowDeleted();
									}
								}
							});
						}
					});
				}, 
				submitDialogForm: function (name) {
					var vm = this;
					var _data = ($.type(vm.postDialog) == 'function') ? vm.postDialog() : vm.formDialog;
					this.$refs[name].validate(function (valid) {//console.log(vm.formDialog)
						if (valid) {							
							vm.dialogSubmitLoading = true;
							//ss.global.currVm = id;
							ss.ajax({
								type: 'post',
								url: ss.path.ajax(vm.url[vm.currDialog]),
								data: _data,
								success: function (result) {									
									vm.dialogShow = false;																			
									ss.ui.msgShow({
										type: 'success',
										content: vm.label[vm.currDialog] + '成功!'
									});
									if (vm.currDialog == 'add') {
										vm.paging(1);
									} else {
										vm.paging();
									}
								}
							});
							// end of ss.ajax
						} else {
							vm.dialogSubmitLoading = false;	
						}
					});
				},
				resetDialogForm: function (name) {
					this.$refs[name].resetFields();
				}
			}
			// end of methods
		};
	}
	// End of crud

	if (id in window && typeof window[id].$data != 'undefined') {
		//alert('亲，'+ id +' 这个 vm 变量名在整个项目中已被占用！\n\n请按此规范修改并确保唯一：模块名缩写+页面分类名+动作名\n\n例如：pmsRoleAdd, pmsUsersEdit');
		//return false;
	}
	el = '#' + id;
	//delete obj.id;
	obj.el = el;

	if ('domReady' in obj && $.type(obj.domReady) == 'function') {
		if ('mounted' in obj && $.type(obj.mounted) == 'function') {
			obj.mounted = ss.util.appendFn(obj.mounted, obj.domReady);
		} else {
			obj.mounted = obj.domReady;
		}
		delete obj.domReady;
	}

	if (crud == true) {
		if ('pager' in obj && $.type(obj.pager) == 'object') {//console.log(obj.pager);
			let mapNameLabel = {};
			let _pager = {
				data: {
					pager: {
						nowpage: 1,
						pagesize: ($.type(obj.pager.showPager) != 'undefined') ? 100000 : 10,
						sort: obj.pager.sort || '',
						order: obj.pager.order || '',
						total: 1,
						data: []
					},
					mapNameLabel: {}
				},
				methods: {
					pagingFiltData: function (obj) {
						let _obj = $.extend({}, obj);
						$.each(_obj, function(key, val){
							if ($.trim(val) == '') {
								delete _obj[key];
							}
						});
						delete obj.data;
						return obj;
					},
					paging: function (nowpage) {
						var vm = this;
						if (isNaN(nowpage) == false) {
							this.pager.nowpage = parseInt(nowpage);
						}						
						ss.ajax({
							type: ('type' in obj.pager) ? obj.pager.type : 'post',
							url: ss.path.ajax(obj.pager.url),
							data: vm.pagingFiltData(vm.pager),
							success: function (result) {
								let _result = result;
								let _data = [];
								let _res = {};
								if ($.type(vm.pagerResult) == 'function') {
									_result = vm.pagerResult(result);
								}									
								_data = [].concat(_result.data);
								$.extend(true, _res, vm.pager, _result);																		
								_res.data = _data;
								vm.pager = _res;
							}
						});
					},
					pagingNumChange: function (currPage) {						
						this.pager.nowpage = currPage;
						this.paging();
					},
					pagingSizeChange: function (pageSize) {
						this.pager.pagesize = pageSize;
						this.paging();
					}
				},
				beforeCreate: function () {
					let btnReload = '<i-button icon="ios-refresh-empty" title="刷新当前页" @click="paging()" class="btn-reload" shape="circle"></i-button>';
					$('.wrapper-pagination').prepend(btnReload);

					const $formItems = $('#'+ id).find('Form-item');

					$.each($formItems, function (idx, ele) {
						let $this = $(ele);
						let label = $this.attr('label');
						let prop = $this.attr('prop');
						if ($.type(label) != 'undefined' &&  $.type(prop) != 'undefined') {
							mapNameLabel[prop] = label;
						}
					});
					ss.global.mapNameLabel[id] = mapNameLabel;			
				},
				created: function () {
					this.mapNameLabel = ss.global.mapNameLabel[id];
				}
			}
			$.extend(true, _obj, _pager, {
				data: {
					pager: $.extend({}, obj.pager)
				}
			});
		}
	} // End of crud

	const extendFn = (objOld = {}, objNew = {}) => {		
		$.each(objNew, (key, val) => {
			// 前置并入
			const keyB4 = key + 'Pre';
			if ($.type(objOld[key]) == 'function' && $.type(objNew[keyB4]) == 'function') {
				objOld[key] = ss.util.prependFn(objOld[key], objNew[keyB4]);
				delete objNew[keyB4];
			}
			// 后置并入
			if ($.type(objOld[key]) == 'function' && $.type(objNew[key]) == 'function') {
				objOld[key] = ss.util.appendFn(objOld[key], objNew[key]);
				delete objNew[key];
			}
		});
	};

	// 如果有重复定义的方法，追加合并
	extendFn(_obj, obj);
	if ($.type(_obj.methods) == 'object' && $.type(obj.methods) == 'object') {
		extendFn(_obj.methods, obj.methods);
	}

	// 最终合并所有 options，初始化 Vue 实例，并暴露到全局变量中
	$.extend(true, _obj, obj);		
	return window[id] = new Vue(_obj);
}
// End of ss.mvvm

ss.map = {
	sex: {
		1: '男',
		2: '女',
		3: '保密'
	},
	userType: {
		1: '管理员',
		2: '用户'
	},
	status: {
		1: '正常',
		2: '停用'
	},
	openClose: {
		1: '打开',
		2: '关闭'
	},
	iconTree: {
		0: 'chevron-right',
		1: 'ios-arrow-forward',
		2: 'ios-arrow-right'
	}
};

// 创建满屏新页面（暂时不用）
ss.page = {
	create (html, onclose) {
		let $container = $('.wrapper-page-inner:visible');
		let $pageInner = $container.find('.page-inner');

		//if ($pageInner.length == 0) {
			$pageInner = $(`
			<div class="page-inner">				
				<a class="ivu-modal-close">
					<i class="ivu-icon ivu-icon-ios-close-empty"></i>
				</a>
				<div class="page-inner-content">${html}</div>
			</div>
			`).appendTo($container);
		// } else {
		// 	$pageInner.find('.page-inner-content').html(html);
		// 	$pageInner.show();
		// }

		let _this = this;
		$pageInner.find('.ivu-modal-close').one('click', function () {
			_this.close(this, onclose);
		});
	},
	close (obj, cb) {
		let $pageInner = $(obj).closest('.page-inner');
		let $pageInnerPrev = $pageInner.prev();
		$pageInner.hide();

		if ($pageInnerPrev.is('.page-inner')) {
			$pageInnerPrev.show();			
		}
		if ($.type(cb) == 'function') { cb(); }
		$pageInner.remove();
	}
};

$(document).ready(function(){
	// 绑定回车键到提交按钮
	$(document).keydown(function (e) {
		if (e.which == 13) {
			$(':input').each(function(idx, ele){
				var $this = $(this);
				var label = $.trim($this.text());
				var arr = ['登录', '查询'];
				if ($.inArray(label, arr) > -1) {
					$this.click();
					return false;
				}
			});
			return false;
		}
	}); 
});

// 监听 hash
ss.util.onHashChange = function() {
	var _hash = window.location.hash.substr(1);
	var $homeTabs = $('#homeTabs');
	var $currTab = $homeTabs.find('.ui-tabs-nav a[href$="' + _hash + '"]').parent();
	var currTree = (function (){
			var _node = {id: 0, name: ''};
			$.each(pageHome.tree, function (idx, ele) {
				if (ele.attributes == '/' + _hash) {
					_node = {
						id: ele.id,
						name: ele.name
					}
					return false;
				}
			});
			return _node;
		})();
	
	// 激活已开启的页签，或添加新页签
	if ($currTab.length > 0) {
		$homeTabs.tabs('option', 'active', $currTab.index());
	} else {		
		if (currTree.name != '') {
			pageHome.addTab(currTree.name, ss.path.base + _hash);
		}
	}
};
$(window).on("hashchange", ss.util.onHashChange);

/**       
 * 对Date的扩展，将 Date 转化为指定格式的String /u516d
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符       
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)  
 * eg:       
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423       
 * (new Date()).format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04       
 * (new Date()).format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04       
 * (new Date()).format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04       
 * (new Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18 
 * Ref: http://blog.csdn.net/vbangle/article/details/5643091 
 */
Date.prototype.format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份           
		"d+": this.getDate(), //日           
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时           
		"H+": this.getHours(), //小时           
		"m+": this.getMinutes(), //分           
		"s+": this.getSeconds(), //秒           
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度           
		"S": this.getMilliseconds() //毫秒           
	};
	var week = {
		"0": "日",
		"1": "一",
		"2": "二",
		"3": "三",
		"4": "四",
		"5": "五",
		"6": "六"
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

// Login page
if (location.href.indexOf(ss.path.base + 'login') == 0) {
	// Thanks to: http://www.zhangxinxu.com/study/201605/canvas-star-move.html
	(function() {
		
		var canvas = document.querySelector("#starCanvas");
		var context = canvas.getContext("2d");

		var stars = {},
			particleIndex = 0,
			settings = {
				r: 1400,                // 根据是设计稿确定的轨迹半径
				height: 260,            // 露出的圆弧的高度
				density: 300,
				maxLife: 100,
				groundLevel: canvas.height,
				leftWall: 0,
				rightWall: canvas.width,
				alpha: 0.0,
				maxAlpha: 1
			};

		var getMinRandom = function() {
			var rand = Math.random();
			// step的大小决定了星星靠近地球的聚拢程度，
			// step = Math.ceil(2 / (1 - rand))就聚拢很明显
			var step = Math.ceil(1 / (1 - rand));
			var arr = [];
			for (var i=0; i<step; i++) {
				arr.push(Math.random());
			}

			return Math.min.apply(null, arr);       
		};

		function resizeCanvas() {
			canvas.width = 1920;
			canvas.height = 800;
			settings.rightWall = canvas.width;
			settings.groundLevel = canvas.height;
			settings.height = 260 + (canvas.height - 800) / 2;
			document.querySelectorAll(".wrapper-login")[0].style.height = document.body.clientHeight + 'px';
			redraw();
		}        

		$(window).resize(function(){
			resizeCanvas();
		});

		function redraw() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "rgba(0,0,0,0)";
			context.fillRect(0, 0, canvas.width, canvas.height);
		}

		function Star() {
			// 圆的轨迹方程式为：(x-a)²+(y-b)²=r²
			// 因此，已知x, 则y = Math.sqrt(r² - (x-a)²) + b;
			// 其中，圆心是(a, b)
			// 在本例子中
			// 圆心坐标是(canvas.width/2, canvas.height - 600 + r);
			var a = canvas.width/2, b = canvas.height - settings.height + settings.r;
			// 因此，已知横坐标随机
			this.x = Math.floor(Math.random() * canvas.width);
			// 纵坐标需要在圆弧以上
			// 越往上，越稀疏
			this.offsety = getMinRandom() * (canvas.height - settings.height);
			this.y = b - Math.sqrt(settings.r * settings.r - (this.x - a) * (this.x - a)) - this.offsety;

			this.vx = Math.random() * 0.05 + 0.12;    // 水平偏移，也是移动速度

			// 星星的尺寸
			this.particleSize = 0.5 + (Math.random() + 0.1 / 4);
			particleIndex++;
			stars[particleIndex] = this;
			this.alpha = 0.0;
			this.maxAlpha = 0.2 + (this.y/canvas.height) * Math.random() * 0.8;
			this.alphaAction = 1;
		}

		Star.prototype.draw = function() {
			// 横坐标移动
			this.x += this.vx;
			// 根据切线方向进行偏移
			// y坐标
			this.y = canvas.height - settings.height + settings.r - Math.sqrt(settings.r * settings.r - (this.x - canvas.width/2) * (this.x - canvas.width/2)) - this.offsety;

			// 透明度慢慢起来
			if (this.alphaAction == 1) {
				if (this.alpha < this.maxAlpha ) {
					this.alpha += 0.005;
				} else {
					this.alphaAction = -1;
				}
			} else {
				if (this.alpha > 0.2 ) {
					this.alpha -= 0.002;
				} else {
					this.alphaAction = 1;
				}
			}

			if ( this.x + (this.particleSize*2) >= settings.rightWall ) {
				// x到左侧
				this.x = this.x - settings.rightWall;
			}

			// 绘制星星
			context.beginPath();
			context.fillStyle="rgba(255,255,255," + this.alpha.toString() + ")";
			context.arc(this.x, this.y, this.particleSize, 0, Math.PI*2, true); 
			context.closePath();
			context.fill();
		}

		function render() {

			redraw();

			// 星星的数目
			// IE下CUP性能有限，数目小
			var length = 300;
			if (!history.pushState) {
				// IE9
				length = 100;
			} else if (document.msHidden != undefined) {
				// IE10+
				length = 200;
			}

			if ( Object.keys(stars).length > length ) {
				settings.density = 0;
			}

			for ( var i = 0; i < settings.density; i++ ) {
				if ( Math.random() > 0.97 ) {
					new Star();
				}
			}

			// 星星实时移动
			for ( var i in stars ) {
				stars[i].draw();
			}

			requestAnimationFrame(render);
		}

		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function(fn) {
				setTimeout(fn, 17);
			};
		}  

		$(window).load(function(){
			resizeCanvas();
			render();
		});

   })();
   // End of star

   ss.mvvm({
       id: 'pageLogin',
       crud: false,
       data: {
           form: {
                username: '',
                password: '',
                rememberMe: 1
           },
           rule: {
                username: [
                    { required: true, message: '请填写登录名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请填写密码', trigger: 'blur' },
                    { type: 'string', min: 6, max: 15, message: '密码长度须在6-15位之间', trigger: 'blur' }
                ]
            }
       },
       methods: {
            submit: function(name) {
                var _this = this;
                this.$refs[name].validate(function (valid) {
                    if (valid) {
                        ss.ui.loading('登陆中...', 0);  
                        ss.ajax({                            
                            url: ss.path.base + 'login2Index.do',
                            data: pageLogin.form,
                            success: function (data) {                   
                                //ss.log(data.code);return false;
                                if (data.code == 1) {
                                    ss.ui.msgShow({
                                        type: 'success',
                                        content: '登录成功！',
                                        onClose: function () {
                                            location.href = ss.path.base + 'index.do'; 
                                        }
                                    });                                  
                                }                              
                            }
                        });
                    }
                });
                // end of validate
            }
        }
   });
}

// Home page
if (location.href.indexOf(ss.path.base + 'index') == 0) {
	ss.mvvm({
		id: 'pageHome',
		crud: false,
		data: {
			showLeftCol: false,
			tabs: 0,
			homeTabs: null
		},
		tree: [],
		treeNode: {},
		ztree: null,
		watch: {
			tabs: function (newVal) {
				// 如果所有页签都关闭，清空 hash
				if (newVal == 0) {
					this.urlHash('');
				}
			}
		},
		methods: {
			toggleClick: function(){
				this.showLeftCol = !this.showLeftCol;		            	
			},
			urlHash: function (_hash) {
				if ($.type(_hash) != 'undefined') {
					window.location.hash = _hash;
				} else {
					return window.location.hash;
				}					
			},
			getVmId: function (ui) {
				var vmId = $(ui).find('.wrapper-page-inner:visible').attr('id');
				if ($.type(vmId) != 'undefined') {
					ss.global.currVm = vmId;
				}
			},            
			initTab: function(){
				var vm = this;
				vm.homeTabs = $('#homeTabs');
				vm.homeTabs.tabs({
					//heightStyle: "fill",		
					beforeLoad: function( event, ui ) {								

						ui.jqXHR.error(function(e){
							//console.log('jqXHR error:')
							//console.log(e)
						});

						ss.ui.loading();

						// 如果页签已加载，而且鼠标未停留在刷新icon上，阻止重新请求 ajax
						if ( ui.tab.data( "loaded" ) && ss.global.isRefreshingTab == false) {
							event.preventDefault();
							return;
						}			
						ui.jqXHR.success(function() {
							ui.tab.data( "loaded", true );
						});
						//if error occurs						    
						ui.jqXHR.fail(function() {
							ui.panel.html('<div class="ivu-alert ivu-alert-error">出了点小状况！此页面将以最快的速度修复，请稍候。</div>');
							ss.log('程序员同学，赶紧看下出啥问题了？');
							ss.ui.msgHide();
						});						        
					},
					load: function (event, ui) { 
						if (ss.global.ajaxCount == 0) {
							ss.ui.msgHide();
						}
						vm.getVmId(ui.panel);
					},
					// http://api.jqueryui.com/tabs/#event-activate
					activate: function (event, ui) {
						vm.getVmId(ui.newPanel.context);								
					
						if (ss.global.ajaxCount == 0) {
							ss.ui.msgHide();
						}
						var href = ui.newTab.context.href.replace(ss.path.base, '/');
						var treeId = (function(){
							var _id;
							$.each(vm.tree, function (idx, ele) {
								if (ele.attributes == href) {
									_id = ele.id;
									return false;
								}
							});
							return _id;
						})();

						// 展开并选中左侧列表中对应的节点
						vm.hiliteNode(treeId);
						// 静默更新 hash
						vm.urlHash(href.substr(1));
					}
				});

				// Event: remove tab
				vm.homeTabs.on("click", "span.ui-icon-close", function () {
					var panelId = $(this).closest("li").remove().attr("aria-controls");
					$("#" + panelId).remove();
					vm.homeTabs.tabs("refresh");
					vm.getTabs();
				})
				// 移除 onhashchange 监听
				.on('mouseenter', '.ui-tabs-tab', function () {							
					$(window).on("hashchange", null);
				})
				// 恢复 onhashchange 监听
				.on('mouseleave', '.ui-tabs-tab', function () {							
					$(window).on("hashchange", ss.util.onHashChange);
				})
				// Event: refresh tab
				.on('click', '.ui-state-active .ui-icon-arrowrefresh-1-n', function () {
					var tabIndex = vm.homeTabs.tabs("option","active");
					vm.homeTabs.tabs("load", tabIndex);
				})
				.on('mouseenter', '.ui-state-active .ui-icon-arrowrefresh-1-n', function () {
					ss.global.isRefreshingTab = true;
				})
				.on('mouseleave', '.ui-state-active span.ui-icon-arrowrefresh-1-n', function () {
					ss.global.isRefreshingTab = false;
				});					
			},
			
			getTabs: function(){
				var vm = this;
				this.tabs = (function(){
					return vm.homeTabs.find('.ui-tabs-tab').length;
				})();
			},
			
			addTab: function(label, url){
				var vm = this;
				var tabTemplate = "<li><a href='#[href]'>#[label]</a> <span class='ui-icon ui-icon-close' role='presentation' title='删除此页签'>删除此页签</span><span class='ui-icon ui-icon-arrowrefresh-1-n' role='presentation' title='刷新此页签'>刷新此页签</span></li>";	
				var li = $(tabTemplate.replace(/#\[href\]/g, url).replace(/#\[label\]/g, label));						 
				vm.homeTabs.find(".ui-tabs-nav").append(li);
				vm.homeTabs.tabs("refresh");
				vm.homeTabs.tabs('option', 'active', $('.ui-tabs-tab:last').index());
				
				vm.homeTabs.find(".ui-tabs-nav").sortable({
					axis: "x",
					stop: function() {
						vm.homeTabs.tabs( "refresh" );
					}
				});
				vm.getTabs();
			},

			logout: function () {
				this.$Modal.confirm({
					title: '确定要退出？',
					content: '<p>成功退出后，将自动返回登录页。</p>',
					loading: true,
					onOk: function () {							
						ss.ajax({
							url: ss.path.ajax('logout.do'),
							success: function (result) {										
								location.href = ss.path.base + 'login.do';
							}
						});															
					}
				});
			},

			// 展开并选中对应的左侧列表对应节点
			hiliteNode: function (nodeId) {						
				var ztree = this.ztree;
				var treeNode = ztree.getNodeByParam("id", nodeId);								
				if (treeNode) {
					ztree.selectNode(treeNode, true);
				}
			}
		}, // end of methods
		domReady: function(){
			var vm = this;
			vm.initTab();

			// left menu
			ss.ajax({
				url: ss.path.ajax('resource/tree.do'),
				success: function (result) {
					var _hash = vm.urlHash().substr(1);
					var currTree = {id: 0, name: ''};
					var zTree_Menu = null;
					var zNodes = (function(){
						$.each(result.data, function(idx, ele){
							if (ele.pId == null) {
								ele.pId = 0;
							}
							if (ele.attributes == '/' + _hash) {
								currTree = {
									id: ele.id,
									name: ele.name
								}
							}
						});
						//console.log(result)
						return result.data;
					})();
					vm.tree = zNodes;

					var addDiyDom = function (treeId, treeNode) {
						var spaceWidth = 5;
						var switchObj = $("#" + treeNode.tId + "_switch");
						var icoObj = $("#" + treeNode.tId + "_ico");
						switchObj.remove();
						icoObj.before(switchObj);

						if (treeNode.level > 1) {
							var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
							switchObj.before(spaceStr);
						}
					};

					var beforeClick = function (treeId, treeNode) {
						if (treeNode.level == 0 ) {
							var zTree = $.fn.zTree.getZTreeObj("ztreeHome");
							zTree.expandNode(treeNode);
							return false;
						}
						return true;
					};

					var onClick = function(event, treeId, treeNode) {
						//var url = treeNode.attributes.substr(1);
						var url = treeNode.attributes.substr(1);
						vm.urlHash(url);						
					};

					var setting = {
						view: {
							showLine: false,
							showIcon: false,
							selectedMulti: false,
							dblClickExpand: false,
							addDiyDom: addDiyDom
						},
						data: {
							simpleData: {
								enable: true
							}
						},
						callback: {
							beforeClick: beforeClick,
							onClick: onClick
						}
					};

					vm.ztree = ss.ui.ztree({
						$ul: $("#ztreeHome"), 
						setting: setting, 
						data: zNodes
					});

					// 通过 hash 默认打开某页签				
					if (currTree.name != '' && _hash != '') {
						ss.util.onHashChange();
					}									
				}
				// end of success
			});
			// end of ss.ajax			
		}
	});	
	// end of mvvm	
}