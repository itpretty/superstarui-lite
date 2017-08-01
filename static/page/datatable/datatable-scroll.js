"use strict";
ss.mvvm({
    id: 'pageDatatableScroll',
    data: {
        total: 100,
        currPage: 2,
        pageSize: 20,
        formSearch: {
            name: '',
            mail: '',
            city: '',
            gender: 'male',
            age: 22,
            interest: [],
            switch: true,
            date: '',
            time: '',
            slider: [20, 50],
            desc: ''
        },
        columns1: [
            {
                type: 'selection',
                width: 50,
                fixed: 'left',
                align: 'center'
            },
            {
                "title": "名称",
                "key": "name",
                "fixed": "left",
                "width": 100
            },
            {
                "title": "展示",
                "key": "show",
                "width": 150,
                "sortable": true
                //                      filters: [
                //                          {
                //                              label: '大于4000',
                //                              value: 1
                //                          },
                //                          {
                //                              label: '小于4000',
                //                              value: 2
                //                          }
                //                      ],
                //                      filterMultiple: false,
                //                      filterMethod (value, row) {
                //                          if (value === 1) {
                //                              return row.show > 4000;
                //                          } else if (value === 2) {
                //                              return row.show < 4000;
                //                          }
                //                      }
            },
            {
                "title": "唤醒",
                "key": "weak",
                "width": 150,
                "sortable": false
            },
            {
                "title": "登录",
                "key": "signin",
                "width": 150,
                "sortable": false
            },
            {
                "title": "点击",
                "key": "click",
                "width": 150,
                "sortable": false
            },
            {
                "title": "激活",
                "key": "active",
                "width": 150,
                "sortable": false
            },
            {
                "title": "7日留存",
                "key": "day7",
                "width": 150,
                "sortable": false
            },
            {
                "title": "30日留存",
                "key": "day30",
                "width": 150,
                "sortable": false
            },
            {
                "title": "次日留存",
                "key": "tomorrow",
                "width": 150,
                "sortable": false
            },
            {
                "title": "日活跃",
                "key": "day",
                "width": 150,
                "sortable": false
            },
            {
                "title": "周活跃",
                "key": "week",
                "width": 150,
                "sortable": false
            },
            {
                "title": "月活跃",
                "key": "month",
                "width": 150,
                "sortable": false
            },
            {
                title: '操作',
                key: 'action',
                width: 240,
                align: 'center',
                fixed: 'right',
                render: function (create, params) {
                    var vm = pageDatatableScroll;
                    return create('div', [
                        create('Button', {
                            props: {
                                type: 'primary',
                                size: 'small'
                            },
                            style: {
                                marginRight: '5px'
                            },
                            on: {
                                click: function () {
                                    vm.editModal(params.index);
                                }
                            }
                        }, '编辑(弹窗)'),
                        create('Button', {
                            props: {
                                type: 'info',
                                size: 'small'
                            },
                            style: {
                                marginRight: '5px'
                            },
                            on: {
                                click: function () {
                                    vm.edit(params.index);
                                }
                            }
                        }, '编辑(整页)'),
                        create('Button', {
                            props: {
                                type: 'error',
                                size: 'small'
                            },
                            on: {
                                click: function () {
                                    vm.remove(params.index);
                                }
                            }
                        }, '删除')
                    ]); // end of create('div')
                }
            }
        ],
        data: [],
        modalEdit: false,
        formEdit: {
            name: '',
            mail: '',
            city: '',
            gender: 'male',
            age: 22,
            interest: [],
            switch: true,
            date: '',
            time: '',
            desc: ''
        },
        ruleEdit: {
            name: [
                { required: true, message: '姓名不能为空', trigger: 'blur' }
            ],
            mail: [
                { required: true, message: '邮箱不能为空', trigger: 'blur' },
                { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
            ],
            city: [
                { required: true, message: '请选择城市', trigger: 'change' }
            ],
            gender: [
                { required: true, message: '请选择性别', trigger: 'change' }
            ],
            interest: [
                { required: true, type: 'array', min: 1, message: '至少选择一个爱好', trigger: 'change' },
                { type: 'array', max: 2, message: '最多选择两个爱好', trigger: 'change' }
            ],
            date: [
                { required: true, type: 'date', message: '请选择日期', trigger: 'change' }
            ],
            time: [
                { required: true, type: 'date', message: '请选择时间', trigger: 'change' }
            ],
            desc: [
                { required: true, message: '请输入个人介绍', trigger: 'blur' },
                { type: 'string', min: 20, message: '介绍不能少于20字', trigger: 'blur' }
            ]
        }
    },
    methods: {
        onSelect: function (selection, row) {
            //selection: array
            //row: data of selected row
            //console.log(selection, row)
        },
        onSelectionChange: function (selection) {
            // selection: array
            console.log(selection);
        },
        editModal: function (index) {
            // this.$Modal.info({
            //     title: '用户信息',
            //     content: `推广：${this.data[index].name}<br>显示次数：${this.data[index].show}<br>登录次数：${this.data[index].signin}`
            // })
            this.modalEdit = true;
        },
        edit: function (index) {
            ss.ajax({
                dataType: 'html',
                url: ss.path.ajax('static/page/form/vertical.html'),
                success: function (data) {
                    ss.page.create(data, function () {
                        //callback when inner page inited
                    });
                }
            });
        },
        remove: function (index) {
            var vm = this;
            this.$Modal.confirm({
                title: '确认要删除此记录吗？',
                content: '<p>按确定后，对话框将在 2 秒后关闭！</p>',
                loading: true,
                onOk: function () {
                    setTimeout(function () {
                        vm.data.splice(index, 1);
                        vm.$Modal.remove();
                        vm.$Message.info('记录已成功删除');
                    }, 2000);
                }
            });
        },
        // end of remove
        submit: function (name) {
            this.$Message.success('提交成功!');
        },
        reset: function (name) {
            this.$refs[name].resetFields();
        },
        submitEdit: function (name) {
            var _this = this;
            this.$refs[name].validate(function (valid) {
                if (valid) {
                    _this.$Message.success('提交成功!');
                }
                else {
                    _this.$Message.error('表单验证失败!');
                    _this.modalEdit = true;
                }
            });
        },
        resetEdit: function (name) {
            this.$refs[name].resetFields();
        }
    },
    created: function () {
        var _this = this;
        ss.ajax({
            url: ss.path.ajax('static/json/datatable-scroll.json'),
            success: function (data) {
                _this.data = data;
            }
        });
    }
});
// end of vue	 
