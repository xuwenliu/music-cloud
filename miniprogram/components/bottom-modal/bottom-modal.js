// components/bottom-modal.js
Component({
    options: {
        styleIsolation: 'apply-shared', // 组件样式隔离
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        modalShow: Boolean
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onClose () {
            this.setData({
                modalShow: false
            })
        }
    }
})
