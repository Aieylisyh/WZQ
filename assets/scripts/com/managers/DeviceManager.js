/*

switch from wx game to native app

canvas size:
cc.view.getDesignResolutionSize()

current canvas size:
appContext.node.width/height
cc.view.getVisibleSize()
cc.director.getWinSize()

window size in pixel with retina
cc.view.getCanvasSize()

window size in pixel without retina( equal to systemInfo.windowHeight/windowWidth in wx)
cc.view.getFrameSize()

dt in update
cc.director.getDeltaTime()

no model infomation

log cc.sys to get complete system info
*/


let GAME_HEIGHT = 640;

let GAME_WIDTH = 1136;

let DeviceManager = {

    bugHeight: 4.9,

    fringeScreenModels: [
        "iPhone X", "iPhone x", "vivo X21A", "ASUS Zenfone 5",
        "Ulefone T2 Pro", "Leagoo S9", "HUAWEI P20", "DooGee V",
        "OPPO R15", "LG G7", "SAMSUNG S9", "COR-AL00",
        "vivo Y83A", "LLD-AL20", "vivo Z1", "PACM00", "PAAM00"
    ],

    bugHeightScreenModels: ["iPhone X"],

    //wx only
    recheckWxScreenSize: function () {
        appContext.scheduleOnce(function () {
            let systemInfo = window.wx.getSystemInfoSync();
            if (systemInfo.windowWidth != WechatAPI.systemInfo.windowWidth &&
                systemInfo.windowHeight != WechatAPI.systemInfo.windowHeight) {
                //由于微信的适配bug，有的手机屏幕会旋转卡死，却没有api再旋转屏幕
                wx.showKeyboard({}); //调出键盘。回复屏幕旋转
            }
        }, 0);
    },

    //对于过窄的屏幕 用宽适配，实测在ipad上适配良好
    fitNarrowScreen: function () {
        if (this.isTooNarrow()) {
            cc.Canvas.instance.fitWidth = true;
            cc.Canvas.instance.fitHeight = false;
        } else {
            if (WechatAPI.systemInfo.windowWidth / WechatAPI.systemInfo.windowHeight > 2) {
                //appContext.getAnalyticManager().addEvent("wideScreen__" + WechatAPI.systemInfo.model);
            }
        }
    },

    fitWideScreen: function () {
        debug.log("!!fitWideScreen");
        debug.log(WechatAPI.systemInfo.windowHeight / WechatAPI.systemInfo.windowWidth < 1136 / 640);

        if (WechatAPI.systemInfo.windowHeight / WechatAPI.systemInfo.windowWidth < 1136 / 640) {
            cc.Canvas.instance.fitWidth = false;
            cc.Canvas.instance.fitHeight = true;
        }
    },

    getPixelRatio: function () {
        // 下面一行横屏才有效
        // if (this.isTooNarrow()) {
        //     debug.log("isTooNarrow");
        //     return WechatAPI.systemInfo.windowWidth / GAME_WIDTH;
        // }
        //return WechatAPI.systemInfo.windowHeight / GAME_HEIGHT;

        //竖屏的用这个
        return WechatAPI.systemInfo.windowWidth / 640;
    },

    //是否有刘海屏
    hasScreenFringe: function () {
        if (WechatAPI.systemInfo.model != null) {
            for (let i in this.fringeScreenModels) {
                if (WechatAPI.systemInfo.model.indexOf(this.fringeScreenModels[i]) > -1) {
                    // iphone x 刘海宽度大约为60
                    return true;
                }
            }
        }

        if (WechatAPI.systemInfo.windowWidth >= 800 || WechatAPI.systemInfo.windowWidth / WechatAPI.systemInfo.windowHeight > 2) {
            return true;
        }

        return false;
    },

    //横屏游戏以高度适配时，实际屏幕是否过于窄(对于我们的预设而言)，比如ipad
    isTooNarrow: function () {
        return WechatAPI.systemInfo.windowHeight / WechatAPI.systemInfo.windowWidth > GAME_HEIGHT / GAME_WIDTH;
    },

    //获取当前真实的游戏界面的大小，不是实际像素而是游戏中的像素
    //高适配时，height 始终是 GAME_HEIGHT
    //宽适配时，width 始终是 GAME_WIDTH
    getCanvasSize: function () {
        // return cc.view.getVisibleSize(); 获取当前真实的游戏界面的大小，不是实际像素而是游戏中的像素
        return {
            width: appContext.node.width,
            height: appContext.node.height,
        };
    },

    windowPixelResolution: {
        get: function () {
            return cc.sys.windowPixelResolution;
        },
    },

    getCanvasExtraHeightCamparedToStandard: function () {
        if (!this.isTooNarrow()) {
            return 0;
        }

        let size = this.getCanvasSize();
        return size.height - size.width * GAME_HEIGHT / GAME_WIDTH;
    },
};

module.exports = DeviceManager;