ss.mvvm({
    id: 'pageFormVertical',
    data: {
        data2: [],
        targetKeys2: [],
        modal6: false,
        loading: true,
        form: {
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
        rule: {
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
        submit (name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.$Message.success('提交成功!');
                } else {
                    this.$Message.error('表单验证失败!');
                    this.modal6 = true;
                }
            })
        },
        reset (name) {
            this.$refs[name].resetFields();
            ss.page.close();
        },
        getMockData () {
            let mockData = [];
            for (let i = 1; i <= 20; i++) {
                mockData.push({
                    key: i.toString(),
                    label: '内容' + i,
                    description: '内容' + i + '的描述信息',
                    disabled: Math.random() * 3 < 1
                });
            }
            return mockData;
        },
        getTargetKeys () {
            return this.getMockData()
                    .filter(() => Math.random() * 2 > 1)
                    .map(item => item.key);
        },
        handleChange2 (newTargetKeys) {
            this.targetKeys2 = newTargetKeys;
        },
        filterMethod (data, query) {
            return data.label.indexOf(query) > -1;
        },
        asyncOK () {
            setTimeout(() => {
                this.modal6 = false;
                this.$Message.success('提交成功！', 1, ()=>{ ss.page.close(); });                
            }, 2000);
        }
    },
    created () {
        this.data2 = this.getMockData();
        this.targetKeys2 = this.getTargetKeys();
    }
});
// end of ss.mvvm