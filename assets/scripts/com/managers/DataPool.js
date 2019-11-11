
//提供需要向WebService请求的数据的临时储存
let DataPool = {

    //数据的类型
    ID: {
    },

    //所有数据的列表
    pool: [],

    init: function () {
        let self = this;

        // 任务
        this.create(this.ID.Mission, function () {
            appContext.getRemoteAPI().sendRequestUserTaskList();
        });

        // 广告奖励列表
        this.create(
            this.ID.AvailableAdReward,
            function (param, applyRes) {
                WechatAPI.webService.fetchAdReward(
                    function (data) {
                        applyRes(data);
                    },
                    function (res) {
                        debug.log("fetchAdReward失败");
                        debug.log(res);
                        self.write(self.ID.AvailableAdReward);
                    },
                );
            }, null, 2.5);

        // 奖励池列表
        this.create(
            this.ID.RewardPoolTestId,
            function (param, applyRes) {
                WechatAPI.webService.fetchCanClientAssignBonus(
                    param,
                    function (data) {
                        debug.log(data);
                        applyRes(data);
                    },
                    function (res) {
                        debug.log("fetchCanClientAssignBonus失败");
                        debug.log("param " + param);
                        debug.log(res);
                        self.write(self.ID.RewardPoolTestId, null);
                    },
                );
            },
            this.ID.RewardPoolTestId, 2.5);
    },

    //创建一个数据
    create: function (id, fetch, param, interval) {
        let data = this.pool[id] || {};

        //是否准备好了
        data.ready = true;

        //数值
        data.value = null;

        //用于获取数据的方法，function(param, applyRes), 可以不使用这两个参数。
        //如果使用，第1个参数是用于获取数据的参数，第2个参数预留作为回调
        data.fetch = fetch;

        //用于获取数据的参数
        data.param = param;//用于获取数据的参数

        //读取完数据后自动刷新数据的时间，如果不大于1则不会自动刷新
        data.interval = interval || 0;

        this.pool[id] = data;
    },

    // 不包含任务的刷新
    refresh: function () {
        this.refreshById(this.ID.AvailableAdReward);
        this.refreshById(this.ID.RewardPoolTestId);
    },

    //刷新数据
    refreshById: function (id) {
        let data = this.pool[id];
        if (data == null) {
            return;
        }

        if (typeof data.fetch == "function") {
            data.ready = false;

            data.fetch(
                data.param,
                function (res) {
                    data.value = res;
                    data.ready = true;
                });
        }
    },

    //获取并清空数据
    read: function (id) {
        let data = this.pool[id];
        if (data == null) {
            return null;
        }

        let value = data.value;
        data.value = null;

        if (data.ready && data.interval > 0) {
            data.ready = false;
            appContext.scheduleOnce(() => { appContext.dataPool.refreshById(id) }, data.interval);
        }

        return value;
    },

    //写数据
    write: function (id, res) {
        let data = this.pool[id];
        if (data == null) {
            return;
        }

        data.value = res;
        data.ready = true;
    },

    //是否准备好了
    isReady: function (id) {
        let data = this.pool[id];

        return (data == null) ? false : data.ready;
    },
};

module.exports = DataPool;