Component({
    /**
     * 组件的属性列表
     */
    properties: {
        placeholder: {
            type: String,
            value: '请输入关键字搜索'
        },
        searchClass:{
            type:String,
            value:'blog-search'
        },
        keywords:String
    },
    options: {
        styleIsolation: 'shared'
    },
    observers:{
        keywords(val){
            this.setData({
                keyword:val
            })
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        keyword: '',
    },
    

    /**
     * 组件的方法列表
     */
    methods: {
        onInput(e) {
            this.setData({
                keyword: e.detail.trim()
            })
            this.triggerEvent('change', {
                keyword: e.detail.trim()
            })
        },
        onSearch() {
            this.triggerEvent('search', {
                keyword: this.data.keyword.trim()
            })
        },
        clearKeyword() {
            this.setData({
                keyword: ''
            })
            this.triggerEvent('clear');
        }
    }
})
