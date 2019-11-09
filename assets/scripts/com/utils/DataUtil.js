//http://www.w3school.com.cn/jsref/jsref_obj_string.asp
let StringUtil = require("StringUtil");
let DialogTypes = require("DialogTypes");
let GameUtil = require("GameUtil");

let DataUtil = {
    // 返回指定长度的密码
    getRandomPasswordByLength: function (passwordLength) {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
        let password = "";
        for (let i = 0; i < passwordLength; i++) {
            let charRandom = Math.floor(Math.random() * alphabet.length);
            password += alphabet[charRandom];
        }
        return password;
    },

    extractFileNameFromUrl: function (url) {
        if (url == null || url === "") {
            return null;
        }

        let idx = url.lastIndexOf('/');
        return url.substring(idx + 1, url.length - 1 - idx);
    },

    parseParameter: function (url) {
        let res = [];
        if (url == null || url === "") {
            return res;
        }

        try {
            let pairs = url.split('&');
            if (pairs.length <= 0)
                return res;

            for (let i = 0; i < pairs.length; i++) {
                let p = pairs[i];
                let kv = p.split('=');

                if (kv.length >= 2) {
                    if (res[kv[0]] != undefined) {
                        res[kv[0]] = kv[1].replace(/\"/, "");
                    } else {
                        res.push(kv[0], kv[1].replace(/\"/, ""));
                    }
                }
            }
        } catch (e) {
            debug.log(e);
        }

        return res;
    },

    //这是干嘛用的？目前没有用
    getCurrencyList: function (res /*type CheckTradeResult*/) /*type:List<Currency>*/ {
        // if (res == null) {
        //     return null;
        // }

        // let list = [];
        // if (res.getAddedCurrencyCount() > 0) {
        //     let c = new Currency();
        //     c.setType(res.getCurrencyType());
        //     c.setCount(res.getAddedCurrencyCount());
        //     list.push(c);
        // }

        // if (res.getGift() != null && res.getGift().getCurrenyList().length > 0) {
        //     list.concat(res.getGift().getCurrenyList());
        // }

        // return list;
    },

    updateUserPublic: function (from, to) {
        if (from == null) {
            return false;
        }

        if (to == null) {
            to = from;
            return true;
        }

        to.setNickname(from.getNickname());
        to.setSex(from.getSex());
        //to.setDescription(from.getDescription());
        //to.setCity(from.getCity());
        to.setLevel(from.getLevel());
        to.setTitle(from.getTitle());
        to.setMoney(from.getMoney());
        to.setSecondMoney(from.getSecondMoney());
        to.setKickOutCard(from.getKickOutCard());
        to.setRoundCount(from.getRoundCount());
        to.setWinCount(from.getWinCount());
        to.setEscapeCount(from.getEscapeCount());
        to.setHair(from.getHair());
        to.setBody(from.getBody());
        to.setItemShowList(from.getItemShowList());
        to.setReady(from.getReady());
        to.setTempLeave(from.getTempLeave());
        to.setHeadiconUrl(from.getHeadiconUrl());
        let exp = from.getExp();
        if (exp > 0) {
            to.setExp(exp);
        }

        to.setWxScore(from.getWxScore());
        to.setGradeStar(from.getGradeStar());
        to.setHistoryMaxGradeStar(from.getHistoryMaxGradeStar());

        return true;
    },

    updateTable: function (from /*type:Table*/, to /*type:Table*/) {
        if (from == null || to == null) {
            debug.log("updateTable from or to is null");
            return false;
        }

        to.setTableId(from.getTableId());
        to.setType(from.getType());
        to.setPlayerCount(from.getPlayerCount());
        to.setTargetHost(from.getTargetHost());
        to.setTeam1Host(from.getTeam1Host());
        to.setTeam2Host(from.getTeam2Host());
        to.setHostTeam(from.getHostTeam());

        to.setSeatList(from.getSeatList());

        to.setRoundCount(from.getRoundCount());
        to.setState(from.getState());

        return true;
    },

    getKeepWinRaceInfoFromTable: function (table, seat) {
        if (table == null) {
            return null;
        }

        let seats = table.getSeatList();
        if (seats == null) {
            return null;
        }

        let mySeat = null;
        for (let i = 0; i < 4; i++) {
            if (seats[i] != null) {
                let seatNum = seats[i].getNumber();
                if (seatNum === seat) {
                    mySeat = seats[i];
                    break;
                }
            }
        }

        if (mySeat == null) {
            return null;
        }

        return mySeat.getKeepWinRaceInfo();
    },

    getUser: function (table /*type:Table*/, seat /*type:int*/) {
        if (table == null) {
            return null;
        }

        let seats = table.getSeatList();
        for (let i in seats) {
            let currentSeat = seats[i];
            if (currentSeat != null && currentSeat.getNumber() === seat) {
                return currentSeat.getUser();
            }
        }

        return null;
    },

    setTableUser: function (table, seat, data) {
        if (table == null) {
            return;
        }

        let seats = table.getSeatList();
        let isSet = false;
        for (let i in seats) {
            let currentSeat = seats[i];
            if (currentSeat != null && currentSeat.getNumber() === seat) {
                currentSeat.setUser(data);
                isSet = true;
                break;
            }
        }
        if (!isSet) {
            let newSeat = new Seat();
            newSeat.setUser(data);
            newSeat.setNumber(seat);
            seats.push(newSeat);
        }
    },

    replaceSeat: function (seatObj, table) {
        if (table == null) {
            return;
        }

        let seats = table.getSeatList();
        let isSet = false;
        for (let i in seats) {
            let currentSeat = seats[i];
            if (currentSeat != null && currentSeat.getNumber() === seatObj.getNumber()) {
                currentSeat.setUser(seatObj.getUser());
                currentSeat.setGameScore(seatObj.getGameScore());
                isSet = true;
                break;
            }
        }

        if (!isSet) {
            let newSeat = new Seat();
            newSeat.setUser(seatObj.getUser());
            newSeat.setNumber(seatObj.getNumber());
            if (seatObj.getUser() != null) {
                newSeat.setGameScore(seatObj.getGameScore());
            }
            seats.push(newSeat);
        }

        table.setSeatList(seats);
    },

    changeSeat: function (table, from, to) {
        if (table == null) {
            return;
        }

        let seats = table.getSeatList();
        let fromIndex = -1;
        let toIndex = -1;
        for (let i in seats) {
            let currentSeat = seats[i];
            if (currentSeat != null && currentSeat.getNumber() === from) {
                fromIndex = i;
            }
            if (currentSeat != null && currentSeat.getNumber() === to) {
                toIndex = i;
            }
        }

        if (toIndex > -1 && fromIndex > -1) {
            seats[toIndex] = seats[fromIndex];
            seats[toIndex].setNumber(to);
            let newSeat = new Seat();
            newSeat.setUser(null);
            newSeat.setNumber(from);
            newSeat.setGameScore(0);
            seats[fromIndex] = newSeat;
        }

        table.setSeatList(seats);
    },

    getCurrency: function (data /*type:User*/, currencyType /*type:int*/) {
        if (data == null) {
            return 0;
        }

        switch (currencyType) {
            case CurrencyType.GOLDEN_EGG:
                return data.getMoney();

            case CurrencyType.YIN_PIAO:
                return data.getSecondMoney();

            case CurrencyType.EXP:
                return data.getExp();

            case CurrencyType.VIP:
                return data.getVip();

            default:
                return 0;
        }
    },

    formatNickname: function (nickName) {
        if (nickName == null || nickName === "") {
            return nickName;
        }

        // 删除换行符和空格。
        nickName = nickName.replace(/\n/, '');
        nickName = nickName.replace(/\r/, '');

        //nickName = nickName.Trim();
        while (nickName.charAt(0) == ' ') {
            nickName = nickName.slice(1);
        }
        while (nickName.charAt(nickName.length - 1) == ' ') {
            nickName = nickName.slice(0, -1);
        }

        return nickName;
    },

    formatWinRate: function (winRate) {
        let w = Math.floor(winRate * 10000);
        return w / 100 + " %";
    },

    newCurrency: function (type, count) /*type:Currency*/ {
        let cur = new Currency();
        cur.setType(type);
        cur.setCount(count);
        return cur;
    },

    buildAmountText: function (amount) {
        // 按照单位来。
        // 大于100000000的时候，按照亿来计算。
        if (amount >= 100000000) {
            return (Math.floor(amount / 1000000) / 100) + "亿";
        }

        // 大于1000000的时候，按照万来计算。
        if (amount >= 100000) {
            return Math.floor(amount / 1000) / 10 + "万";
        }

        return amount + "";
    },

    getTeamMateSeat: function (mySeat) {
        return mySeat < 2 ? mySeat + 2 : mySeat - 2;
    },

    getOpponentTeamSeats: function (mySeat) {
        let opponentTeamSeats = [];
        let myTeamMateSeat = this.getTeamMateSeat(mySeat);
        for (let i = 0; i < 4; i++) {
            if (i !== mySeat && i !== myTeamMateSeat) {
                opponentTeamSeats.push(i);
            }
        }

        return opponentTeamSeats;
    },

    protobufByteArrayToIntArray: function (bytes) {
        if (bytes == null) {
            return null;
        }

        let array = [];
        for (let i in bytes) {
            if (bytes[i] != null && typeof bytes[i] === "number") {
                array.push(bytes[i]);
            }
        }
        return array;
    },

    filterProtobufByteArray: function (bytes) {
        if (bytes == null) {
            return null;
        }

        for (let i = bytes.length - 1; i > -1; i--) {
            if (bytes[i] == null || typeof bytes[i] !== "number") {
                bytes.splice(i, 1);
            }
        }
        return bytes;
    },

    //产生lowerValue 到 upperValue之间的随机数
    randomFrom: function (lowerValue, upperValue) {
        return Math.random() * (upperValue - lowerValue + 1) + lowerValue;
    },

    // 产生两个整数之间的随机整数
    getRandomInt: function (lowerIntValue, upperIntValue) {
        return Math.floor(Math.random() * (upperIntValue - lowerIntValue + 1)) + lowerIntValue;
    },

    //根据proto里面的DialogInfo来显示对话框
    showDialogByInfo: function (dialogInfo) {
        if (dialogInfo != null) {
            let param = null;
            let paramList = dialogInfo.getDialogParamList();
            if (paramList != null && paramList.length != null && paramList.length > 0) {
                if (paramList.length == 1) {
                    param = paramList[0];
                } else {
                    param = {};
                    for (let i = 0; i < paramList.length; i += 2) {
                        param[paramList[i]] = paramList[i + 1];
                    }
                }
            }

            let dialogName = dialogInfo.getDialogName();
            if (StringUtil.isEmpty(dialogName)) {
                return;
            }

            let info = {};
            switch (dialogName) {
                case DialogTypes.ConfirmBox:
                    info.content = param;
                    break;

                default:
                    info = param;
                    break;
            }

            appContext.getDialogManager().showDialog(dialogInfo.getDialogName(), info);
        }
    },

    // 得到秒数
    getInteriorHourTimeString: function (t) {
        t = Math.floor(t);

        let stringSecond = "";
        let seconds = t % 60;
        if (seconds < 10) {
            stringSecond = "0" + seconds;
        } else {
            stringSecond = seconds;
        }

        let stringMinute = "";
        let minutes = Math.floor(t / 60);
        if (minutes < 10) {
            stringMinute = "0" + minutes;
        } else {
            stringMinute = minutes;
        }

        return stringMinute + ":" + stringSecond;
    },

    // 返回至零点(1970.1.1)的天数，一天 = 86,400,000毫秒
    getDaysToZero: function (milliseconds) {
        let days = milliseconds / 86400000;
        return Math.ceil(days);
    },

    // 获取用户当前数量道具
    getMyCurrencyCount: function (currencyType) {
        let myUser = GameUtil.getUserFromDataContainer();
        if (myUser == null) {
            return -1
        }

        let count = 0;
        switch (currencyType) {
            case CurrencyType.GOLDEN_EGG:
                count = myUser.getMoney();
                break;

            case CurrencyType.YIN_PIAO:
                count = myUser.getSecondMoney();
                break;

            case CurrencyType.BONUS_CARD:
                count = myUser.getBonusCard();
                break;

            case CurrencyType.ALIVE_CARD:
                count = myUser.getReliveCard();
                break;

            case CurrencyType.KICK_OUT_CARD:
                count = myUser.getKickOutCard();
                break;

            case CurrencyType.RECHECKIN_CARD:
                count = myUser.getRecheckinCard();
                break;

            default:
                count = -1;
                break;
        }

        return count;
    },

    // 如"1张复活卡,1张补签卡"
    getContentByConsumeResource: function (consumeResource) {
        if (consumeResource == null) {
            return "";
        }

        let content = "";
        let hasCurrency = false;
        let currencyList = consumeResource.getCurrencyList();
        if (currencyList != null && currencyList.length > 0) {
            hasCurrency = true;
            for (let i = 0; i < currencyList.length; i++) {
                if (i > 0) {
                    content += ","
                }
                let currency = currencyList[i];
                let currencyType = currency.getType();
                let currencyCount = currency.getCount();
                content += currencyCount + CurrencyType.unitOf(currencyType) + CurrencyType.labelOf(currencyType);
            }
        }

        let resourceTypeItemList = consumeResource.getItemList();
        if (resourceTypeItemList != null && resourceTypeItemList.length > 0) {
            for (let i = 0; i < resourceTypeItemList.length; i++) {
                if (hasCurrency || i > 0) {
                    content += ","
                }
                let resourceTypeItem = resourceTypeItemList[i];
                let itemType = resourceTypeItem.getItemType();
                let itemCount = resourceTypeItem.getCount();
                content += itemCount + ResourceTypeItemType.unitOf(itemType) + ResourceTypeItemType.labelOf(itemType);
            }
        }

        return content;
    },

    // 钱换算：把分换算成元
    convertFenToYuan: function (money) {
        if (money == null || money <= 0) {
            return 0;
        }

        return money / 100;
    },
}

module.exports = DataUtil;