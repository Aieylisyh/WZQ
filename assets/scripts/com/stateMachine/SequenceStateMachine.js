let LoginState = require("LoginState");

cc.Class({
    extends: require("StateMachine"),

    //完成一个状态，如果当前状态允许会切换到下一个状态
    switchToState: function (targetState) {
        let targetStateObj = this._states[targetState];
        if (targetStateObj == null) {
            debug.info("切换失败，targetState " + targetState);
            return;
        }

        if (targetStateObj.allowAll) {
            debug.info("切换成功，从状态" + LoginState.nameOf(this._currentState) + "到状态" + LoginState.nameOf(targetState));
            this.setState(targetState, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
            return;
        }

        for (let i in targetStateObj.allowList) {
            if (targetStateObj.allowList[i] == this._currentState) {
                debug.info("状态切换成功，从" + LoginState.nameOf(this._currentState) + "到" + LoginState.nameOf(targetState));
                this.setState(targetState, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                return;
            }
        }

        debug.info("状态切换失败，从" + LoginState.nameOf(this._currentState) + "到" + LoginState.nameOf(targetState));

        if (this.failedSwitchStateList == null) {
            this.failedSwitchStateList = [];
        }
        if (this.failedSwitchStateList[this._currentState] == null) {
            this.failedSwitchStateList[this._currentState] = [];
        }
        if (this.failedSwitchStateList[this._currentState][targetState] == null) {
            this.failedSwitchStateList[this._currentState][targetState] = 0;
        }
        this.failedSwitchStateList[this._currentState][targetState] += 1;
        if (this.failedSwitchStateList[this._currentState][targetState] > 2 && this.backupState != null) {
            console.warn("状态多次切换失败，从" + LoginState.nameOf(this._currentState) + "到" + LoginState.nameOf(targetState));
            appContext.getAnalyticManager().addEvent("bug__LoginState__" + LoginState.nameOf(this._currentState) + "__" + LoginState.nameOf(targetState));
            appContext.getAnalyticManager().accelerateUpload();
            this.setState(this.backupState, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
        }
    },

    setBackupState: function (targetState) {
        this.backupState = targetState;
    },

    //配置一个目标状态可以切换的状态来源
    //allowAll 表示所有的state都可以
    linkState: function (targetState, allowList, allowAll = false) {
        if (allowList == null || typeof allowList !== 'object') {
            debug.warn("allowList is not valid");
            allowList = [];
        }

        if (this._states[targetState] == null) {
            this._states[targetState] = {};
        }

        this._states[targetState].allowList = allowList;
        this._states[targetState].targetState = targetState;
        this._states[targetState].allowAll = allowAll;
    },

    addWaitingTask: function (currentState, callback, caller, timeout = 8) {
        appContext.getTaskManager().addWaitingTask(timeout,
            function () {
                debug.info(LoginState.nameOf(currentState) + " 状态超时");
                appContext.getDialogManager().hideWaitingCircle();

                if (callback != null) {
                    if (caller == null) {
                        caller = this;
                    }
                    callback.call(caller);
                }
            },
            this,
            function () {
                return this.getState() !== currentState;
            },
            this);
    },
});