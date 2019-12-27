Component({
    /**
     * 组件的属性列表
     */
    properties: {
        placeholder: {
            type: String,
            value: '请输入关键字'
        },
    },
    options: {
        styleIsolation: 'shared'
    },
    externalClasses: ['iconfont', 'btn', 'icon-search', 'icon-qingchu'],

    /**
     * 组件的初始数据
     */
    data: {
        keyword: '',
        isShowClear: false,//输入框是否显示清除按钮
    },
    observers: {
        keyword(val) {
            console.log(val)
            if (val.toString().trim()) {
                this.setData({
                    isShowClear: true
                })
            } else {
                this.setData({
                    isShowClear: false
                })
            }
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onInput(e) {
            this.setData({
                keyword: e.detail
            })
        },
        onSearch() {
            this.triggerEvent('search', {
                keyword: this.data.keyword
            })
        },
        clearKeyword() {
            this.setData({
                keyword: ''
            })
        }
    }
})
