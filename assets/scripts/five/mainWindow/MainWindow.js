let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        btnMatchMode: cc.Node,

        btnTodo: cc.Node,

        btnRank: cc.Node,

        btnSetting: cc.Node,

        userInfoNode: cc.Node,
    },

    start: function () {
        this.node.on("CloseAllDialogs", this.onCloseAllDialogs, this);

        this.autoShowDialogs();
    },

    update: function (dt) {
        // 信息栏动画
        if (this.swingTime != null) {
            this.userInfoNode.x = Math.floor(Math.sin(this.swingTime * 2) * 220) / 10;
            this.swingTime += dt;
        }
    },

    onUserUpdate: function (user) {
        if (user == null) {
            return;
        }
    },

    onCloseAllDialogs: function () {
        if (!this.btnMatchMode.active) {
            this.scheduleOnce(function () {
                this.buildAnim();
            }, 0);
        }
    },

    buildAnim: function () {
        if (this.btnMatchMode.active) {
            debug.log("buildAnim return!");
            return;
        }

        // 随机匹配左移动画
        this.btnMatchMode.active = true;
        let btnMatchModeY = this.btnMatchMode.y;
        let btnMatchModeAction = cc.moveTo(0.5, -9, btnMatchModeY).easing(cc.easeCubicActionOut());
        let finishCallback = cc.callFunc(function () {
            this.playBtnMatchModeEffect();
        }, this);
        let btnMatchModeSequence = cc.sequence(cc.delayTime(0.2), btnMatchModeAction, finishCallback);
        this.btnMatchMode.runAction(btnMatchModeSequence);

        // 敬请期待左移动画
        // this.btnTodo.active = true;
        // let btnTodoY = this.btnTodo.y;
        // let btnTodoAction = cc.moveTo(0.5, -9, btnTodoY).easing(cc.easeCubicActionOut());
        // this.btnTodo.runAction(btnTodoAction);

        // 排行榜动画
        // this.btnRank.active = true;
        // let btnRankX = this.btnRank.x + 700;
        // let btnRankAction = cc.moveTo(0.5, btnRankX, -313);
        // this.btnRank.runAction(cc.sequence(cc.delayTime(0.4), btnRankAction));

        // 设置动画
        // this.btnSetting.active = true;
        // let btnSettingX = this.btnSetting.x + 700;
        // let btnSettingAction = cc.moveTo(0.5, btnSettingX, -313);
        // this.btnSetting.runAction(cc.sequence(cc.delayTime(0.3), btnSettingAction));
    },

    playBtnMatchModeEffect: function () {
        let finishCallback = cc.callFunc(function () {
            this.onBuildAnimDone();
        }, this);

        this.btnMatchMode.runAction(finishCallback);
    },

    // TODO
    onBuildAnimDone: function () {
        // 如果有需要在动画完毕后的执行某些操作，可以放在这里

        this.playUserInfoAction();
    },

    // 播放用户信息栏动画
    playUserInfoAction: function () {
        if (this.userInfoNode.active) {
            return;
        }

        this.userInfoNode.active = true;
        let positionX = this.userInfoNode.x;
        let action1 = cc.moveTo(1, positionX, 483).easing(cc.easeElasticOut());
        let finishCallback = cc.callFunc(function () {
            this.swingTime = 0;
        }, this);
        let sequence = cc.sequence(action1, finishCallback);
        this.userInfoNode.runAction(sequence);
    },

    autoShowDialogs: function () {
        appContext.getDialogManager().fireQueuedDialogs();
    },

    // 点击"随机匹配"todo
    onClickBtnMatch: function () {
        appContext.getDialogManager().showDialog(DialogTypes.Match);
    },

    // 点击"敬请期待"
    onClickBtnTodo: function () {
        // debug.log("敬请期待");
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "敬请期待");
    },

    // 点击"排行"todo
    onClickBtnRank: function () {
        // let info = null;
        // appContext.getDialogManager().showDialog(DialogTypes.Rank, info);
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "敬请期待");
        //tester.test_showRankDialog();
    },

    // 点击"设置"
    onClickBtnSetting: function () {
        appContext.getDialogManager().showDialog(DialogTypes.GameSetting);
    },
});
