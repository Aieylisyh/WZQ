let ServerTypes = require("ServerTypes");

cc.Class({
    properties: {
        _sockets: [],

        //消息储存节点
        outputNode: {
            default: null,
            visible: false,
        },
    },

    startWebSocket: function (url, connectionProtocol, serverType) {
        //每种serverType的socket只能持有一个！
        debug.log("startWebSocket:" + url + " type " + serverType);
        if (typeof (WebSocket) == "undefined") {
            debug.log("不支持WebSocket");
            return;
        }

        try {
            let currentSocket = this.getValidSocketObject(serverType);

            if (currentSocket != null) {
                debug.log("startWebSocket 当前存在同类socket");
                if (this.isConnected(serverType)) {
                    debug.log(serverType + "同类socket已连接，关闭并重开");
                    currentSocket.reconnectUrl = url;
                    currentSocket.reconnectConnectionProtocol = connectionProtocol;
                    currentSocket.reconnectServerType = serverType;
                    let self = this;
                    currentSocket.ws.onclose = function (event) {
                        self.restartConnection(currentSocket);
                    };
                    currentSocket.ws.close();
                } else if (this.isConnecting(serverType)) {
                    debug.log(serverType + "同类socket在连接中，不做什么");
                } else if (this.isClosing(serverType)) {
                    debug.log(serverType + "同类socket正在关闭中，abort并开新的");
                    this.abort(serverType);
                    this.createWebsocket(url, connectionProtocol, serverType);
                } else {
                    debug.log(serverType + "同类socket没有连接，开新的");
                    this.createWebsocket(url, connectionProtocol, serverType);
                }
            } else {
                this.createWebsocket(url, connectionProtocol, serverType);
            }
        } catch (ex) {
            debug.log(ex.message);
        }
    },

    getValidSocketObject: function (serverType) {
        let obj = this._sockets[serverType];
        if (obj == null || obj.ws == null) {
            return null;
        }

        return obj;
    },

    isConnected: function (serverType) {
        let obj = this.getValidSocketObject(serverType);
        if (obj == null) {
            return false;
        }

        if (obj.ws.readyState === WebSocket.OPEN) {
            return true;
        }

        return false;
    },

    isClosing: function (serverType) {
        let obj = this.getValidSocketObject(serverType);
        if (obj == null) {
            return false;
        }

        if (obj.ws.readyState === WebSocket.CLOSING) {
            return true;
        }

        return false;
    },

    isClosed: function (serverType) {
        let obj = this.getValidSocketObject(serverType);
        if (obj == null) {
            return false;
        }

        if (obj.ws.readyState === WebSocket.CLOSED) {
            return true;
        }

        return false;
    },

    isConnecting: function (serverType) {
        let obj = this.getValidSocketObject(serverType);
        if (obj == null) {
            return false;
        }

        if (obj.ws.readyState === WebSocket.CONNECTING) {
            return true;
        }

        return false;
    },

    onMessage: function (msg, serverType) {
        if (msg.constructor != null && msg.constructor.name == "Blob") {
            //debug.log("接收到的信息是blob");
            //如果得到一个blob对象，必须转化，否则不能解析
            //将Blob 对象转换成 ArrayBuffer
            //在模拟器和微信小程序中没有FileReader或者FileReaderSync
            let reader;
            if (typeof (FileReader) == "undefined") {
                reader = new FileReaderSync();
            } else {
                reader = new FileReader();
            }
            if (reader != null) {
                let self = this;
                reader.onload = function (e) {
                    if (self.outputNode == null) {
                        debug.log("没有outputNode来保存收到的信息");
                    } else {
                        self.outputNode.processMessage(reader.result);
                    }
                }
                reader.readAsArrayBuffer(msg);
            } else {
                debug.log("无法识别blob，因为不支持FileReader");
            }
        } else {
            //否则直接解析,微信小程序端应该是直接获得ArrayBuffer
            //debug.log("接收到的信息是ArrayBuffer");
            if (this.outputNode == null) {
                debug.log("没有outputNode来保存收到的信息");
            } else {
                this.outputNode.processMessage(msg, serverType);
            }
        }
    },

    restartConnection: function (obj) {
        let url = obj.reconnectUrl;
        let connectionProtocol = obj.reconnectConnectionProtocol;
        let serverType = obj.reconnectServerType;
        debug.log("socket已断开，开始重开:" + obj.reconnectServerType);
        this.createWebsocket(url, connectionProtocol, serverType);
    },

    createWebsocket: function (url, connectionProtocol, serverType, reconnectCount = 1) {
        if (url == null) {
            debug.log("createWebsocket no url!");
            return;
        }

        if (serverType == null) {
            debug.log("createWebsocket no serverType!");
            return;
        }

        let ws = null;
        if (connectionProtocol == null || connectionProtocol == "") {
            ws = new WebSocket(url);
        } else {
            ws = new WebSocket(url, connectionProtocol);
        }

        let self = this;
        let obj = { ws: ws, url: url, connectionProtocol: connectionProtocol, serverType: serverType };
        ws.onopen = function (event) {
            debug.log("ws is open " + serverType);
            appContext.getNetworkManager().onConnected(serverType);
        };
        ws.onmessage = function (event) {
            self.onMessage(event.data, serverType);
        };
        ws.onerror = function (event) {
            debug.log("ws has an error " + serverType + " " + event);
            debug.log(event);
            appContext.getNetworkManager().onDisconnected(serverType);
        };
        ws.onclose = function (event) {
            debug.log("ws is closed " + serverType + " " + event);
            debug.log(event);
            appContext.getNetworkManager().onDisconnected(serverType);
        };
        this._sockets[serverType] = obj;
    },

    sendMessage: function (msg, serverType) {
        if (msg == null) {
            return;
        }

        let socket = null;
        socket = this._sockets[serverType];
        if (!this.isConnected(serverType)) {
            debug.log("Send while ws is not ok, message into queue " + serverType);
            this.outputNode.enqueueMessageSendFailed(msg, serverType)
            return;
        }

        // if ((typeof msg).toString() != "ArrayBuffer") {
        if (WechatAPI.isEnabled()) {
            socket.ws.send(msg.buffer);
        } else {
            socket.ws.send(msg);
        }
    },

    shutDown: function (serverType) {
        this.abort(serverType, true);
    },

    abort: function (serverType, closeSocket = false) {
        let obj = this.getValidSocketObject(serverType);
        if (obj != null) {
            let socket = obj.ws;
            socket.onclose = function (event) {
                debug.log("abort ws onclose " + serverType);
            };
            socket.onerror = function (event) {
                debug.log("abort ws onerror " + serverType);
            };
            if (closeSocket) {
                debug.log("shutDown " + serverType);
                socket.close();
            }
        }
    },
});