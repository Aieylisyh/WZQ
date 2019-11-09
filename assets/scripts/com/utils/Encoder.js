

let Core = require("Core");
let DataUtil = require("DataUtil");
let Item = require("Item");

//礼包系统
//礼包码由日期加密
let Encoder = {
    //Encoder.makeGiftCode([{type:"Mine",count:111}])

    //Encoder.makeGiftCode([{type:"Mine",count:10000000},{type:"Diamond",count:100000},{type:"Ruby",count:100000},{type:"Sapphire",count:100000},{type:"TurtleRock",count:100000000},{type:"VolcanicRock",count:100000000}])

    makeGiftCode: function(giftList) {
        return this.getEncryptedCode(this.makeGiftString(giftList));
    },

    //别忘了是个数组
    makeGiftString: function(giftList) {
        let s = "";

        for (let i in giftList) {
            let item = giftList[i];
            //debug.log(item);
            if (item) {
                let prototype = Item[item.type];
                if (prototype) {
                    s += prototype.short + item.count + " ";
                }
            }
        }

        return s;
    },

    getEncryptedCode: function(inString) {
        //debug.log(inString);
        let iv = DataUtil.getDaysInChina() + "";
        let resultObject = Core.encode(inString, "zhageqianting", iv);
        return resultObject;
    },

    getDecryptedString: function(inCode) {
        //debug.log(inCode);
        let iv = DataUtil.getDaysInChina() + "";
        let resultObject = Core.decode(inCode, "zhageqianting", iv);
        return resultObject;
    },
   
    getGiftListByCode: function(inCode) {
        let s = this.getDecryptedString(inCode);

        let arr = s.split(" ");
        let list = [];
        for (let i in arr) {
            let block = arr[i];
            if (block) {
                let len = block.length;
                let typeShort = block.substr(0, 1);
                let countStr = block.substr(1, len);
                let type = "";
                for (let p in Item) {
                    if (Item[p] && Item[p].short === typeShort) {
                        type = p;
                        let count = parseInt(countStr);
                        list.push({
                            type: type,
                            count: count
                        });
                        break;
                    }
                }
            }
        }

        return list;
    },
}


module.exports = Encoder; 