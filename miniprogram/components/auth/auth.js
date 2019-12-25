// components/auth/auth.js
Component({
    options: {
        styleIsolation: 'apply-shared', // 组件样式隔离
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
        onGotUserInfo (event) {
            console.log(event)
            const userInfo = event.detail.userInfo;
            //允许授权
            if (userInfo) {
                this.setData({
                    modalShow: false
                })
                this.triggerEvent('authSuccess', userInfo)
            } else {
                this.triggerEvent('authFail')
            }
        }
    }
})
