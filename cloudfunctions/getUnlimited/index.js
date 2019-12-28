// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        const result = await cloud.openapi.wxacode.getUnlimited({
            scene: wxContext.OPENID,
            // lineColor: {
            // 'r': 211,
            // 'g': 60,
            // 'b': 57
            // },
            // isHyaline: true
        })
        const upload = await cloud.uploadFile({
            cloudPath: 'qrcode/' + Date.now() + '_' + Math.random() + '.png',
            fileContent: result.buffer
        })
        return upload.fileID
    } catch (err) {
        console.log(err)
        return err
    }
}