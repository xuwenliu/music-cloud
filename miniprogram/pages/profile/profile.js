//我的


Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

	},

	//获取小程序码
	async onTapUnlimitedCode() {
		wx.showLoading({
			title: '生成中',
		})
		let res = await wx.cloud.callFunction({
			name: 'getUnlimited'
		})
		console.log(res)
		if (res.result) {
			const fileId = res.result
			wx.previewImage({
				urls: [fileId],
				current: fileId
			})
			wx.hideLoading()
		}
	}
})