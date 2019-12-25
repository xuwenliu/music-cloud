// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const playListCol = db.collection('playlist');
const TcbRouter = require('tcb-router');
const rp = require('request-promise');
const BASE_URL = "http://musicapi.xiecheng.live";

// 云函数入口函数
exports.main = async (event, context) => {

    const app = new TcbRouter({
        event
    });

    //推荐列表
    app.router('playlist', async (ctx, next) => {
        const page = event.page || 1;
        const pageSize = event.pageSize || 15;
        let res = await playListCol
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .orderBy('createTime', 'desc')
            .get();
        let totalCount = await playListCol.count();
        ctx.body = {
            page,
            pageSize,
            totalCount: totalCount.total,
            ...res
        }
    })

    //推荐的歌曲列表
    app.router('musiclist', async (ctx, next) => {
        ctx.body = await rp(BASE_URL + `/playlist/detail?id=${event.playlistId * 1}`).then(res => JSON.parse(res));
    })

    //音乐的url
    app.router('musicUrl', async (ctx, next) => {
        ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId * 1}`).then(res => JSON.parse(res));
    })

    //歌词
    app.router('lyric', async (ctx, next) => {
        ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId * 1}`).then(res => JSON.parse(res));
    })



    return app.serve();
}