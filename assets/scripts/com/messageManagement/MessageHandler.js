cc.Class({
    properties: {
        cmdType: -1,
    },

    handle: function (msg) {
        if (msg == null) {
            return;
        }

        let content = msg.getContent();
        if (content == null) {
            return;
        }

        let data = this.parseMessage(content);
        this.doHandle(data);
    },

    doHandle: function (content) {
        debug.log("you must override this function!");
    },

    parseMessage: function (msg) {
        if (this.msgParser == null) {
            return msg;
        } else {
            try {
                return this.msgParser.deserializeBinary(msg);
            } catch (e) {
                debug.warn("parseMessage error");
                return null;
            }
        }
    },

    init: function (cmdType, parser) {
        this.cmdType = cmdType;
        //所有的消息都应该设置parser，把Packet中的content的二进制数据变成对象数据
        this.msgParser = parser;
    },
});