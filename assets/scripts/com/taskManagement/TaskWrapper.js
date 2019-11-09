cc.Class({
    properties: {
        done: false,
        _updateFreq: 0.25,
        _updateCount: 0,
        _updateEveryFrame: false,
    },

    setUpdateFreq: function (f) {
        this._updateFreq = f;
        if (f <= 0) {
            this._updateEveryFrame = true;
        }
    },

    setup: function (timeout, onTimeout, onTimeoutCaller, checker, checkerCaller, onComplete, onCompleteCaller, dataContainerBindInfo) {
        this._timeout = timeout;
        this._onTimeout = onTimeout;
        if (onTimeoutCaller == null) {
            this._onTimeoutCaller = this;
        } else {
            this._onTimeoutCaller = onTimeoutCaller;
        }

        this._checker = checker;
        if (checkerCaller == null) {
            this._checkerCaller = this;
        } else {
            this._checkerCaller = checkerCaller;
        }

        this._onComplete = onComplete;
        if (onCompleteCaller == null && onComplete != null) {
            this._onCompleteCaller = this;
        } else {
            this._onCompleteCaller = onCompleteCaller;
        }

        if (dataContainerBindInfo != null) {
            this.bindDataContainer(dataContainerBindInfo);
        }

        this.done = false;
    },

    update: function (dt) {
        if (this.done) {
            return;
        }

        if (this._updateEveryFrame) {
            this.onUpdate(dt);
        } else {
            this._updateCount += dt;
            if (this._updateCount > this._updateFreq) {
                this._updateCount -= this._updateFreq;
                this.onUpdate(this._updateFreq);
            }
        }
    },

    onUpdate: function (dt) {
        if (this._checker != null && this._checkerCaller != null) {
            if (this._checker.call(this._checkerCaller)) {
                this.done = true;
                if (this._onComplete != null && this._onCompleteCaller != null) {
                    this._onComplete.call(this._onCompleteCaller);
                    this.done = true;
                }
            }
        }

        if (this._bindDataContainerDone) {
            for (let key in this.dcData) {
                this.listenDataContainer(this.dcData[key]);
            }
        }

        this._timeout -= dt;
        if (this._timeout < 0) {
            if (this._onTimeout != null && this._onTimeoutCaller != null) {
                this._onTimeout.call(this._onTimeoutCaller);
            }
            this.done = true;
        }
    },

    bindDataContainer: function (bindInfo) {
        if (this.dcData == null) {
            this.dcData = [];
        }

        for (let i in bindInfo) {
            let info = bindInfo[i];
            if (this[info.funcName] != null) {
                debug.warn("cover existing property!");
            }
            this[info.funcName] = info.func;
            this.dcData[info.key] = {
                func: info.funcName
            };
        }

        let dr = appContext.getDataRepository();
        for (let key in this.dcData) {
            if (this.dcData[key].dc == null) {
                let dc = dr.getContainer(key);
                this.dcData[key].dc = dc;
                this.dcData[key].timestamp = dc.timestamp;
            }
        }

        this._bindDataContainerDone = true;
    },

    listenDataContainer: function (dcData) {
        if (dcData && dcData.dc.timestamp > dcData.timestamp) {
            if (this[dcData.func] != null) {
                //这里的func是一个字符串和别的地方的同名方法不同
                this[dcData.func](dcData.dc.read());
            }
            dcData.timestamp = appContext.currentFrame;
        }
    },
});