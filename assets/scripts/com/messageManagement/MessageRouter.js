//let AppState = require("AppState");

cc.Class({
    ctor: function () {
        // // 初始化filters
        // if (this._messageLogicFactory == null) {
        //     let MessageLogicFactory = require("MessageLogicFactory");
        //     this._messageLogicFactory = new MessageLogicFactory();
        // }

        // let filters = this._messageLogicFactory.getMessageFilterList();
        // if (filters != null) {
        //     for (let i in filters) {
        //         let f = filters[i];
        //         if (f == null) {
        //             continue;
        //         }
        //         if (this._filters.indexOf(f) == -1) {
        //             this._filters.push(f);
        //         }
        //     }
        // }

        // // 初始化MessageHandlers
        // let handlers = this._messageLogicFactory.getMessageHandlerList();
        // if (handlers != null) {
        //     for (let j in handlers) {
        //         let h = handlers[j];
        //         if (h == null) {
        //             continue;
        //         }
        //         let type = h.cmdType;
        //         this._msgHandlers[type] = h;
        //     }
        // }
    },

    properties: {
        //从这里获得处理消息的处理器
        _messageLogicFactory: null,

        //每帧最多处理_fetchCountPerFrame次
        _fetchCountPerFrame: 1,

        _filters: [],

        _msgHandlers: [],

        _msgUpdaters: [],

        noResponseTimeThreshold: 25,

        _noResponseTimer: 0,

        heatBeatSendTimeThreshold: 5,

        _heatBeatSendTimer: 0,

        _connected: false,//客户端认为自己是否在线，为false时一定断线，为true时如果长时间收不到服务器回复也认为是掉线
    },

    onLateUpdate: function (dt) {
        // 不管有没有断线，都应该始终检查是否收到消息，并处理完成。
        // this.checkReceivedMsg(this._fetchCountPerFrame);
        // this.checkResponse(dt);

        // 目前没有用到消息刷新器
        // this.checkMsgUpdater();
    },

    //分配处理器来处理网络接收到的消息
    checkReceivedMsg: function (_fetchCountPerFrame = 1) {
        // for (let i = 0; i < _fetchCountPerFrame; i++) {
        //     let obj = appContext.getNetworkManager().dequeueMessageReceived();
        //     if (obj == null) {
        //         continue;
        //     }

        //     let msg = obj.packet
        //     if (msg == null) {
        //         continue;
        //     }

        //     this.resetNoResponseTimer();

        //     let filtered = false;
        //     for (let j in this._filters) {
        //         let f = this._filters[j];
        //         if (f != null && f.filter(msg)) {
        //             filtered = true;
        //             break;
        //         }
        //     }

        //     if (!filtered) {
        //         this.dispatch(msg);
        //     }
        // }
    },

    dispatch: function (msg) {
        if (msg == null) {
            return;
        }

        let type = msg.getType();
        let handler = this.getHandler(type);
        if (handler == null) {
            return;
        }

        handler.handle(msg);
    },

    getHandler: function (type) {
        return this._msgHandlers[type];
    },

    getmsgUpdater: function (type) {
        return this._msgUpdaters[type];
    },

    resetNoResponseTimer: function () {
        this._noResponseTimer = 0;
        this._heatBeatSendTimer = 0;
    },

    checkResponse: function (dt) {
        return;
    },

    // 同一个刷新器，每次只处理一个
    checkMsgUpdater: function () {
        // for (let i in this._msgUpdaters) {
        //     let msgUpdater = this._msgUpdaters[i];
        //     if (msgUpdater.isUpdate()) {
        //         let content = msgUpdater.getContent();
        //         if (content != null) {
        //             msgUpdater.doHandle(content);
        //         }
        //     }
        // }
    },

    getMsgUpdater: function (type) {
        return this._msgUpdaters[type];
    },

    saveContentToUpdater: function (type, content) {
        if (content == null) {
            return;
        }

        let msgUpdater = this.getMsgUpdater(type);
        if (msgUpdater == null) {
            return;
        }

        msgUpdater.saveContent(content);
    },

    resetAllUpdaterState: function () {
        for (let i in this._msgUpdaters) {
            let msgUpdater = this._msgUpdaters[i];
            if (msgUpdater != null) {
                msgUpdater.resetState();
            }
        }
    },
});