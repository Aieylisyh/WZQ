/**
 * 1、此脚本挂的节点为线的容器，且中心必须在所有线条的中心
 * 2、线条间必须等间距
 */
cc.Class({
    extends: cc.Component,

    properties: {
        speed: 0,

        lineInterval: 0, // 线条之间的间隔

        toLeft: true, // 向左或向右运动

        lines: [cc.Node], // 线条节点数组
    },

    onLoad: function () {
        this.totalWidth = 0;
        let linesLength = this.lines.length
        for (let i = 0; i < linesLength; i++) {
            this.totalWidth += this.lines[i].width;
            if (i !== linesLength - 1) {
                this.totalWidth += this.lineInterval;
            }
        }

        // 如果是向左移动
        if (this.toLeft) {
            // 计算达到重置的X坐标
            this.positionXOfReset = -320 + this.totalWidth / 2 - (this.lines[0].width + this.lineInterval);
            // 计算重置后的X坐标
            this.initialX = this.totalWidth / 2 - 320;
        } else {
            this.positionXOfReset = 320 - this.totalWidth / 2 + (this.lines[0].width + this.lineInterval)
            this.initialX = 320 - this.totalWidth / 2;
        }
    },

    startLinesAnimation: function (globalSpeed) {
        this._startLinesAnimation = true;

        this.setGlobalSpeed(globalSpeed);
    },

    stopLinesAnimation: function () {
        this.toStop = true;
        this.stopTimer = 0.5;
        this.stopSpeedFactor = this._globalSpeed / this.stopTimer;
    },

    setGlobalSpeed: function (globalSpeed) {
        if (globalSpeed != null) {
            this._globalSpeed = globalSpeed;
        }
    },

    update: function (dt) {
        if (this.toStop) {
            if (this.stopTimer <= 0) {
                this._startLinesAnimation = false;
                this.toStop = false;
                return;
            }

            this.stopTimer -= dt;
            this._globalSpeed = this.stopSpeedFactor * this.stopTimer;
        }

        if (this._startLinesAnimation) {
            if (this._globalSpeed > 0) {
                if (this.toLeft) {
                    // 向左移动
                    if (this.node.x <= this.positionXOfReset) {
                        let delta = this.node.x - this.positionXOfReset - this.speed * dt * this._globalSpeed;
                        this.node.x = this.initialX + delta;
                    } else {
                        this.node.x -= this.speed * dt * this._globalSpeed;
                    }
                } else {
                    // 向右移动
                    if (this.node.x >= this.positionXOfReset) {
                        let delta = this.node.x - this.positionXOfReset + this.speed * dt * this._globalSpeed;
                        this.node.x = this.initialX + delta;
                    } else {
                        this.node.x += this.speed * dt * this._globalSpeed;
                    }
                }
            }
        }
    },
});
