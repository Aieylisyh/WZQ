let LoginState = {
    Null: -1,//刚刚进入游戏第一次登录没开始的状态/异常状态

    Wait: 0,//需要等待用户点击按钮的状态

    WxCheckSession: 1,//获得当前session是否过期

    WxLogin: 2,//登录微信，可能会刷新sessionkey

    WxGetUserInfo: 3,//获得用户信息

    DownloadPip: 4,//下载pip文件

    DownloadDefaultPip: 5,//下载默认pip文件

    ConnectWxPServer: 6,//连接服务器

    GotWxPloginResult: 7,//发送了登录消息，等回复

    ConnectWxHServer: 8,//连接服务器

    GotWxHloginResult: 9,//发送了登录消息，等回复

    WxGetSetting: 101,//不发起授权的情况下，获得当前授权设置

    WxWaitAuthorize: 102,//等待用户授权

    Finish: 1000,

    nameOf: function (state) {
        for (let i in LoginState) {
            if (LoginState[i] == state) {
                return i;
            }
        }
    }
}

module.exports = LoginState; 