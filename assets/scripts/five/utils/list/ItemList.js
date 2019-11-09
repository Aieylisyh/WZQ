cc.Class({
    extends: cc.Component,

    properties: {

        refreshTime: 0,

        contentParent: {
            default: null,
            type: cc.Node,
        },

        _itemList: [],

        _idleItemCache: [],

        /// <summary>
        /// 当前选中的slot。
        /// </summary>
        _selectedSlot: 0,

        _isDestroyItemOnDisable: true,

        refreshDelay: 0, //第一个刷新的延迟

        refreshWithDelayInterval: 0, //如果不为0 则不会在一帧内刷新list 而是每过间隔时间刷新一个

        _refreshWithDelayCount: 0,

        _refreshWithDelayIndex: 0,

        _refreshWithDelayTimer: 0,
    },

    update: function (dt) {
        if (this.refreshTime < this.dataUpdateTime()) {
            this.refreshTime = this.dataUpdateTime();
            this.refreshContent();
        }

        if (this._refreshWithDelayTimer != null && this._refreshWithDelayTimer >= 0) {
            this.refreshWithDelayTimer(dt);
        }

        this.onUpdate(dt);
    },

    refreshWithDelayTimer: function (dt) {
        this._refreshWithDelayTimer -= dt;
        if (this._refreshWithDelayTimer < 0) {
            if (this._refreshWithDelayIndex >= this._refreshWithDelayCount) {
                //finish
                return;
            } else {
                this._refreshWithDelayTimer += this.refreshWithDelayInterval;
                if (this._refreshWithDelayTimer < 0) {
                    this._refreshWithDelayTimer = 0;
                }
                this.refreshSingleContent(this._refreshWithDelayIndex);
                this._refreshWithDelayIndex += 1;
            }
        }
    },

    onDisable: function () {
        if (this._isDestroyItemOnDisable == false) {
            return;
        }

        for (let i = 0; i < this._itemList.length; i++) {
            if (this._itemList[i].node != null) {
                this._itemList[i].node.destroy();
            }
        }
        this._itemList = [];

        for (let i = 0; i < this._idleItemCache.length; i++) {
            if (this._idleItemCache[i].node != null) {
                this._idleItemCache[i].node.destroy();
            }
        }
        this._idleItemCache = [];

        this.refreshTime = 0;
    },

    /// <summary>
    /// 手动设置内容刷新时间。
    /// </summary>
    /// <param name="time"></param>
    setRefreshTime: function (time) {
        this.refreshTime = time;
    },

    /// <summary>
    /// 刷新列表的内容。
    /// </summary>
    refreshContent: function () {
        this.beforeRefresh();

        let slotCount = this.slotCount();
        let dataCount = this.dataCount();

        if (slotCount < dataCount) {
            slotCount = dataCount;
        }

        if (this._itemList.length > slotCount) {
            // 删除多余的卡槽。
            let n = this._itemList.length - slotCount;
            for (let i = 0; i < n && this._itemList.length > 0; i++) {
                let item = this._itemList[this._itemList.length - 1];
                this._itemList.splice(this._itemList.length - 1, 1);
                item.reset(0);
                this.setItemIdle(item);
            }
        }

        if (this.refreshDelay <= 0 && this.refreshWithDelayInterval <= 0) {
            for (let j = 0; j < slotCount; j++) {
                this.refreshSingleContent(j);
            }
        } else {
            this._refreshWithDelayTimer = this.refreshDelay;
            this._refreshWithDelayIndex = 0;
            this._refreshWithDelayCount = slotCount;
        }

        this.afterRefresh();
    },

    refreshSingleContent: function (index) {
        // 生成Item
        let item = null;
        if (index < this._itemList.length) {
            item = this._itemList[index];
        } else {
            item = this.getMyItem();

            if (item != null) {
                if (item.node.parent !== this.contentParent) {
                    this.contentParent.addChild(item.node);
                }
                this._itemList.push(item);
            }
        }

        let data = this.getData(index);
        if (item != null) {
            if (data == null) {
                // 没数据的就Reset成空的状态
                item.reset(index);
            } else {
                // 有数据的就绑定数据。
                item.bindData(index, data);
                item.node.setSiblingIndex(index);
            }
        }
        let selected = index == this._selectedSlot;
        item.select(selected);

        if (selected) {
            this.onItemSelected(item);
        }
    },

    getItem: function (index) {
        if (index < 0 || index >= this._itemList.length) {
            return null;
        }

        return this._itemList[index];
    },

    getItemCount: function () {
        return this._itemList.length;
    },

    /// <summary>
    /// 获取显示Item的对象。
    /// </summary>
    /// <returns></returns>
    getMyItem: function () {
        if (this._idleItemCache.length > 0) {
            let item = this._idleItemCache.shift();
            if (item && item.node) {
                item.node.active = true;
            }

            return item;
        } else {
            let item = this.createItem();
            if (item != null) {
                let btn = item.getClickButton();
                if (btn != null) {
                    let self = this;
                    btn.node.on('click', function (event) {
                        self.select(item)
                    });
                }
            }

            return item;
        }
    },

    /// <summary>
    /// item已经无效了。
    /// </summary>
    /// <param name="item"></param>
    setItemIdle: function (item) {
        if (item == null) {
            return
        };

        if (item.node) {
            item.node.active = false;
        }

        this._idleItemCache.push(item);
    },

    select: function (item) {
        this._selectedSlot = this._itemList.indexOf(item);
        this.refreshSelectState();
        this.onItemSelected(item);
    },

    selectEmpty: function () {
        this._selectedSlot = -1;
    },

    notDestroyItemOnDisable: function () {
        this._isDestroyItemOnDisable = false;
    },

    /// <summary>
    /// 设置当前选中的slot，但是不刷新。
    /// </summary>
    /// <param name="slot"></param>
    setSelectSlot: function (slot) {
        if (slot < 0 || slot >= this._itemList.length) {
            return;
        }

        this._selectedSlot = slot;
    },

    /// <summary>
    /// 刷新列表的选中状态。
    /// </summary>
    refreshSelectState: function () {
        for (let i = 0; i < this._itemList.length; i++) {
            this._itemList[i].select(i === this._selectedSlot);
        }
    },

    /// <summary>
    /// 在刷新内容之前调用。
    /// </summary>
    beforeRefresh: function () {

    },

    /// <summary>
    /// 在刷新内容之后调用。
    /// </summary>
    afterRefresh: function () {

    },

    /// <summary>
    /// Update事件。
    /// </summary>
    onUpdate: function (dt) {

    },

    /// <summary>
    /// 有多少个空位。
    /// </summary>
    /// <returns></returns>
    slotCount: function () {
        return 0;
    },

    /// <summary>
    /// 创建Item。
    /// 这里是CreateItem，而不是GetItemPrefab，返回Item类型！
    /// </summary>
    /// <returns></returns>
    createItem: function () {
        return null;
    },

    /// <summary>
    /// 数据更新的时间。
    /// </summary>
    /// <returns></returns>
    dataUpdateTime: function () {
        return 0;
    },

    /// <summary>
    /// 数据的个数。
    /// </summary>
    /// <returns></returns>
    dataCount: function () {
        return 0;
    },

    /// <summary>
    /// 获取数据对象。
    /// </summary>
    /// <param name="index"></param>
    /// <returns></returns>
    getData: function (index) {
        return null;
    },

    /// <summary>
    /// item被选中的事件。
    /// </summary>
    /// <param name="item"></param>
    onItemSelected: function (item) {

    },
});