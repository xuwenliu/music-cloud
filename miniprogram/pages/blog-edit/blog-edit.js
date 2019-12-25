
const MAX_WORDS_NUM = 140; //输入文字的最大个数
Page({

    /**
     * 页面的初始数据
     */
    data: {
        wordsNum: 0,
    },

    onInput (event) {
        let wordsNum = event.detail.value.length;
        if (wordsNum >= MAX_WORDS_NUM) {
            wordsNum = `最大字数为${MAX_WORDS_NUM}`
        }
        this.setData({
            wordsNum
        })
    }
})