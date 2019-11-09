let packet_pb = require('Packet_pb');

//本脚本的方法不是对外暴露的，请使用NetworkManager
cc.Class({
    properties: {
        _receivedPacket: [],

        _messageToSend: [],

        //曾经发送失败的消息
        _messageSendFailed: [],

        _wechatGameClientVersion: 801,
    },

    processMessage: function (msg, serverType) {
        let u8Msg = new Uint8Array(msg);
        if (u8Msg == null) {
            debug.log("failed converting from ArrayBuffer to Uint8Array");
            return;
        }

        let packet = packet_pb.Packet.deserializeBinary(u8Msg);
        this.enqueuePacketReceived(packet, serverType);
    },

    enqueuePacketReceived: function (packet, serverType) {
        if (packet == null) {
            return;
        }

        /*if (debug.enableLog) {
            let typename = "";
            let type = packet.getType();
            let WxCmdType = require('WxCmdType');
            let CmdType = require('CmdType');
            for (let i in WxCmdType) {
                for (let ii in WxCmdType[i]) {
                    if (WxCmdType[i][ii] === type) {
                        typename = "WxCmdType " + i + " " + ii;
                        break;
                    }
                }
            }
            if (typename == "") {
                for (let j in CmdType) {
                    for (let jj in CmdType[j]) {
                        if (CmdType[j][jj] === type) {
                            typename = "CmdType " + j + " " + jj;
                            break;
                        }
                    }
                }
            }
            if (type != 50001 && type != 50002) {
                debug.log("receive " + packet.getType() + " " + typename);
            } else {
                //debug.log("da");
            }
        }*/

        this._receivedPacket.push({
            packet: packet,
            server: serverType
        });
    },

    dequeueMessageToSend: function () {
        if (this._messageToSend.length > 0) {
            return this._messageToSend.shift();
        }
        return null;
    },

    dequeueMessageSendFailed: function () {
        if (this._messageSendFailed.length > 0) {
            return this._messageSendFailed.shift();
        }
        return null;
    },

    dequeueMessageReceived: function () {
        if (this._receivedPacket.length > 0) {
            return this._receivedPacket.shift();
        }
        return null;
    },

    enqueueMessageToSend: function (msg, serverType) {
        this._messageToSend.push({
            msg: msg,
            server: serverType
        });
    },

    enqueueMessageSendFailed: function (msg, serverType) {
        if (msg != null) {
            this._messageSendFailed.push({
                msg: msg,
                server: serverType
            });
        }
    },

    enqueuePacketToSend: function (packet, serverType) {
        this.enqueueMessageToSend(this.serializePacket(packet), serverType);
    },

    enqueueContentToSend: function (type, content, serverType, encrypt = "", encryptKey = "", version = 0) {
        if (version === 0) {
            version = this._wechatGameClientVersion;
        }
/*
        if (debug.enableLog) {
            let typename = "";
            let WxCmdType = require('WxCmdType');
            let CmdType = require('CmdType');
            for (let i in WxCmdType) {
                for (let ii in WxCmdType[i]) {
                    if (WxCmdType[i][ii] === type) {
                        typename = "WxCmdType " + i + " " + ii;
                        break;
                    }
                }
            }
            if (typename == "") {
                for (let j in CmdType) {
                    for (let jj in CmdType[j]) {
                        if (CmdType[j][jj] === type) {
                            typename = "CmdType " + j + " " + jj;
                            break;
                        }
                    }
                }
            }
            if (type !== 50001 && type !== 50002) {
                debug.log("enqueueContentToSend " + type + " " + typename);
            } else {
                //debug.log("di");
            }
        }*/
        this.enqueuePacketToSend(this.createPacket(type, content, encrypt, encryptKey, version), serverType);
    },

    enqueueContentReceived: function (type, content, serverType, encrypt = "", encryptKey = "", version = 0) {
        if (version === 0) {
            version = this._wechatGameClientVersion;
        }
        this.enqueuePacketReceived(this.createPacket(type, content, encrypt, encryptKey, version), serverType);
    },

    serializePacket: function (packet) {
        //不用添加长度前缀，因为websocket header已经包含
        return packet.serializeBinary();
    },

    createPacket: function (type, content, encrypt = "", encryptKey = "", version = 0) {
        if (version === 0) {
            version = this._wechatGameClientVersion;
        }
        
        let packet = new packet_pb.Packet();
        packet.setType(type);
        packet.setContent(content);
        packet.setEncrypt(encrypt);
        packet.setEncryptKey(encryptKey);
        packet.setVersion(version);
        return packet;
    },
});