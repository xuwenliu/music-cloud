// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const TcbRouter = require('tcb-router');
const db = cloud.database();
const blogCol = db.collection('blog');

// 云函数入口函数
exports.main = async (event, context) => {
    const app = new TcbRouter({
        event
    });

    app.router('list', async (ctx, next) => {
        const page = event.page || 1;
        const pageSize = event.pageSize || 10;
        const keyword = event.keyword.trim();
        let searchCondition = {} //查询条件
        if (keyword !== '') {
            searchCondition = {
                content: db.RegExp({
                    regexp: keyword,
                    options: 'i'
                })
            }
        }

        let res = await blogCol
            .where(searchCondition)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .orderBy('createTime', 'desc')
            .get();
        let totalCount = await blogCol.count();
        ctx.body = {
            page,
            pageSize,
            totalCount: totalCount.total,
            ...res
        }
    })


    return app.serve();
}