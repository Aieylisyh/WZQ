let SocketNode = require('SocketNode');
let PacketNode = require('PacketNode');
let ServerTypes = require("ServerTypes");
let LoginState = require("LoginState");

cc.Class({
    properties: {
        _socketNode: null,

        _packetNode: null,

        connectionProtocol: "",

        connectInterval: 10, //断线重连时间间隔

        _connectTimer: -1,

        connectMaxTries: 1,

        _connectTries: 0,
    },

    ctor: function () {
        this._connectTimer = -1;
        this._connectTries = 0;

        this._socketNode = new SocketNode();
        this._packetNode = new PacketNode();
        this._socketNode.outputNode = this._packetNode;

        this._isPaused = false;
    },

    isConnecting: function (serverType) {
        if (this._socketNode == null) {
            return false;
        }

        return this._socketNode.isConnecting(serverType);
    },

    isConnected: function (serverType) {
        if (this._socketNode == null) {
            return false;
        }

        return this._socketNode.isConnected(serverType);
    },

    connect: function (url, connectionProtocol, serverType) {
        debug.log("将连接 " + serverType);
        this._socketNode.startWebSocket(url, connectionProtocol, serverType);

        appContext.getTaskManager().addWaitingTask(10,
            function () {
                this.abort(serverType);
                appContext.getDialogManager().showToast("连接服务器超时，请网络稳定后重试");
                debug.log("connect timeout " + url + " " + serverType);
                appContext.getDialogManager().hideWaitingCircle();
                let state = LoginState != null ? LoginState.Wait : 0;
                appContext.getLoginManager().switchToState(state);//有用户出现LoginState无定义这个bug，虽然按理说不会有bug
            },
            this,
            function () {
                return !this.isConnecting(serverType);
            },
            this);
    },

    //这个api是与登录配合的,不要在其他场合使用
    tryConnect: function (serverType, url) {
        //console.log(url + " " + serverType);
        if (this.isConnected(serverType)) {
            debug.log("tryConnect " + serverType + " while isConnected");
            this.onConnected(serverType);
        } else if (this.isConnecting(serverType)) {
            debug.log("可能出现了错误。放弃目前的重新开");
            this.shutDown(serverType);
            this.connect(url, this.connectionProtocol, serverType);
        } else {
            this.connect(url, this.connectionProtocol, serverType);
        }
    },

    abort: function (serverType) {
        this._socketNode.abort(serverType);
    },

    shutDown: function (serverType) {
        this._socketNode.shutDown(serverType);
    },

    onUpdate: function (dt) {
        //为了让不同的地方调用的断线重连不会冲突，都在update里统一调用
        if (this._connectTimer >= 0) {
            this._connectTimer -= dt;

            if (this._connectTimer < 0) {
                this._connectTries += 1;

                if (this._connectTries <= this.connectMaxTries) {
                    this._connectTimer = this.connectInterval;
                    debug.log("重连第" + this._connectTries + "次");
                    appContext.getAppController().clearGameData();
                    appContext.getLoginManager().switchToState(LoginState.Wait);
                    appContext.getLoginManager().login();
                } else {
                    debug.log("重连结束，已尝试次数 " + this._connectTries + " 最大重连尝试次数 " + this.connectMaxTries);
                    if (!appContext.getLoginManager().isInLoginProcess()) {
                        appContext.getAppController().clearGameData();
                    }
                    appContext.getLoginManager().switchToState(LoginState.Wait);
                }
            }
        }

        if (this._isPaused) {
            return;
        }
        this.sendMessageToSend();
        this.sendMessageSendFailed();
    },

    pause: function () {
        this._isPaused = true;
    },

    resume: function () {
        this._isPaused = false;
    },

    onConnected: function (serverType) {
        if (serverType === ServerTypes.WxPServer) {
            appContext.getLoginManager().onWxPServerConnected();
        } else if (serverType === ServerTypes.WxHServer) {
            this.flushReconnectTries();
            appContext.getLoginManager().onWxHServerConnected();
            this.shutDown(ServerTypes.WxPServer);
        } else if (serverType === ServerTypes.HServer) {
            this.flushReconnectTries();
            appContext.getLoginManager().onHServerConnected();
        }

        this.resume();
    },

    onDisconnected: function () {
        if (this._connectTimer < 0) {
            this._connectTimer = 0.6;
        } else if (this._connectTimer > 1) {
            this._connectTimer = 1;
        }
    },

    flushReconnectTries: function () {
        //停止尝试连接服务器并清空尝试计数
        this._connectTries = 0;
        this._connectTimer = -1;
    },

    resetReconnectFailTimes: function () {
        //停止尝试连接服务器并清空失败计数
        if (this._connectTries > this.connectMaxTries) {
            this._connectTries = this.connectMaxTries;
        }

        this._connectTimer = -1;
    },

    stopReconnect: function () {
        this._connectTries = this.connectMaxTries;
        this._connectTimer = -1;
        appContext.getLoginManager().switchToState(LoginState.Wait);
    },

    checkPause: function () {
        if (this.isConnected(ServerTypes.WxPServer)) {
            this.resume();
            return;
        }

        if (this.isConnected(ServerTypes.WxHServer)) {
            this.resume();
            return;
        }

        if (this.isConnected(ServerTypes.HServer)) {
            this.resume();
            return;
        }

        this.pause();
    },

    //发送向服务器消息，如果消息队列里有消息的话。参数sendNumPerFrame为每帧发送的最大数量
    sendMessageToSend: function (sendNumPerFrame = 1) {
        for (let i = 0; i < sendNumPerFrame; i++) {
            let msg = this._packetNode.dequeueMessageToSend();
            if (msg == null) {
                return;
            }

            this._socketNode.sendMessage(msg.msg, msg.server);
        }
    },

    //发送向服务器之前发送失败的消息，如果有的话。参数sendNumPerFrame为每帧发送的最大数量
    sendMessageSendFailed: function (sendNumPerFrame = 1) {
        for (let i = 0; i < sendNumPerFrame; i++) {
            let msg = this._packetNode.dequeueMessageSendFailed();
            if (msg == null) {
                return;
            }

            this._socketNode.sendMessage(msg.msg, msg.server);
        }

        this.checkPause();
    },

    dequeueMessageReceived: function () {
        return this._packetNode.dequeueMessageReceived();
    },

    //向服务器发送对应内容的消息
    enqueueContentToSend: function (type, content, serverType, encrypt = "", encryptKey = "", version = 0) {
        this._packetNode.enqueueContentToSend(type, content, serverType, encrypt, encryptKey, version);
    },

    //向自己伪造接收到的对应内容的消息
    enqueueContentReceived: function (type, content, serverType, encrypt = "", encryptKey = "", version = 0) {
        this._packetNode.enqueueContentReceived(type, content, serverType, encrypt, encryptKey, version);
    },

    clearMessagesToSend: function (alsoClearSendFailed = false) {
        if (alsoClearSendFailed) {
            this.clearMessagesSendFailed();
        }
        this._packetNode._messageToSend = [];
    },

    clearMessagesSendFailed: function () {
        this._packetNode._messageSendFailed = [];
    },

    clearMessagesReceived: function () {
        this._packetNode._receivedPacket = [];
    },
});