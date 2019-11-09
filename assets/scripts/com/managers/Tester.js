let Dummy = require("Dummy");
let DummyPicker = require("DummyPicker");
let DialogTypes = require("DialogTypes");
let LoadResPath = require("LoadResPath");

cc.Class({
    extends: cc.Component,

    properties: {
        testImg: cc.Sprite,
    },

    start: function () {
        window.tester = this;

        this.tests = {};

        //测试工具
        this.tests.play = function () {
            let gm = appContext.getGameManager();

            let p2 = DummyPicker.pickTestDummy();
            gm.createGame(gm.selfPlayer, p2, Math.random(), {});
            gm.startGame();
        };

        this.tests.fullChessboard = function () {
            let gm = appContext.getGameManager();
            //测试棋盘满了
        };

        this.tests.test_loadAllLocalImg = this.test_loadAllLocalImg;

        this.tests.test_showRankDialog = this.test_showRankDialog; // 显示排行榜
    },

    runAllTest() {
        for (let i in this.tests) {
            let t = this.tests[i];
            if (typeof t == "function") {
                debug.log("\n测试 " + i);
                t.call(this);
            }
        }
    },

    setAiDepth(e, d) {
        this.depth = parseInt(d);
    },

    runChess(e) {
        let gm = appContext.getGameManager();
        let p2 = DummyPicker.pickTestDummy();
        gm.createGame(gm.selfPlayer, p2, Math.random(), {});
        gm.startGame();
    },

    surrender() {
        appContext.getGameManager().game.selfPlayer.surrender();
    },

    // 测试，加载所有本地resource资源
    test_loadAllLocalImg: function () {
        for (let i in LoadResPath.ImgPath) {
            this.loadLocalImg(LoadResPath.ImgPath[i]);
        }
    },

    loadLocalImg: function (imgPath) {
        appContext.getFileManager().applySpriteSafe(imgPath, this.testImg);
    },

    // 测试显示排行榜
    test_showRankDialog: function () {
        let info = {};
        info.rankList = [
            { grade: 1, currentScore: 100, nickName: "我是1号", sex: 1, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 2, currentScore: 100, nickName: "我是2号", sex: 1, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 8, currentScore: 100, nickName: "我是3号", sex: 1, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 7, currentScore: 100, nickName: "我是4号", sex: 1, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 6, currentScore: 100, nickName: "我是5号", sex: 1, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 5, currentScore: 100, nickName: "我是6号", sex: 1, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 5, currentScore: 100, nickName: "我是7号", sex: 1, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 2, currentScore: 100, nickName: "我是8号", sex: 2, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 3, currentScore: 100, nickName: "我是9号", sex: 2, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 4, currentScore: 100, nickName: "我是10号", sex: 2, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 2, currentScore: 100, nickName: "我是11号", sex: 2, headIconUrl: "" },
            { grade: 10, currentScore: 100, nickName: "我是12号", sex: 2, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 19, currentScore: 100, nickName: "我是13号", sex: 2, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 10, currentScore: 100, nickName: "我是14号", sex: 2, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
            { grade: 15, currentScore: 100, nickName: "我是15号", sex: 2, headIconUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132" },
        ];

        appContext.getDialogManager().showDialog(DialogTypes.Rank, info);
    },
});