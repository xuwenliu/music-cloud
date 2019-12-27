// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    // 参考链接：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/openapi/openapi.html#%E4%BA%91%E8%B0%83%E7%94%A8
    const {
        OPENID
    } = cloud.getWXContext();
    try {
        let sendData = {
            touser: OPENID, // 通过 getWXContext 获取 OPENID
            page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
            templateId: "ihSHNc8_vUtqfd1L81fUJsiGGDatJdtSucj6XoEX1rQ",
            formId: event.formId,
            data: {
                name3: { //评论人
                    value: event.commentNickName
                },
                thing2: { //评论内容
                    value: event.content
                },
                date4: { //评论时间
                    value: event.createTime
                }
            }
        };
        console.log('sendData',sendData);
        let result = await cloud.openapi.templateMessage.send(sendData)
        console.log(result)
        return result
    } catch (err) {
        throw err
    }
}