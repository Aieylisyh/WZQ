cc.Class({
    extends: cc.Component,

    properties: {
        freq: 8,

        force: 30,

        startAwake: true,

        isPlaying: false,

        verticalOnly: false,

        horizontalOnly: false,

        limitCount: 0, //限制的震动次数，如果小于0则不限制

        reposX: true,

        reposY: true,
    },

    onEnable: function() {
        if (this.startAwake) {
            this.isPlaying = true;
        }

        if (this.freq <= 0.1) {
            this.freq = 0.1;
        }

        this.initX = this.node.x;
        this.initY = this.node.y;
        this.timer = 0;
    },

    startShake: function(limitCount = 0) {
        this.isPlaying = true;
        this.timer = 0;
        this.limitCount = limitCount;
    },

    stop: function() {
        this.isPlaying = false;
        if (this.reposX) {
            this.node.x = this.initX;
        }
        if (this.reposY) {
            this.node.y = this.initY;
        }
    },

    update: function(dt) {
        if (!this.isPlaying) {
            return;
        }

        if (dt > 0.1) {
            dt = 0.1; //头条有个问题，看视频广告，会把所有的时间算在里面，导致dt十几秒！
        }
        this.timer -= dt;
        if (this.timer < 0) {
            let isLast = false;
            if (this.limitCount > 0) {
                this.limitCount--;
                isLast = this.limitCount <= 0;
            } else if (this.limitCount == 0) {
                this.isPlaying = false;
                if (this.reposX) {
                    this.node.x = this.initX;
                }
                if (this.reposY) {
                    this.node.y = this.initY;
                }
                return;
            }

            this.setNext(isLast);
        }

        if (!this.verticalOnly) {
            this.node.x += this.speedX * dt;
        }
        if (!this.horizontalOnly) {
            this.node.y += this.speedY * dt;
        }
    },

    setNext: function(isLast) {
        this.timer = 1 / this.freq;
        let targetX = this.initX;
        let targetY = this.initY;

        if (isLast) {
            //回归原位
        } else if (this.verticalOnly) {
            if (this.speedY > 0) {
                targetY -= this.force;
            } else {
                targetY += this.force;
            }

        } else if (this.horizontalOnly) {
            if (this.speedX > 0) {
                targetX -= this.force;
            } else {
                targetX += this.force;
            }
        } else {
            let rndRad = Math.random() * 2 * Math.PI;
            targetX += this.force * Math.cos(rndRad);
            targetY += this.force * Math.sin(rndRad);
        }

        if (!this.verticalOnly) {
            this.speedX = (targetX - this.node.x) / this.timer;
        }
        if (!this.horizontalOnly) {
            this.speedY = (targetY - this.node.y) / this.timer;
        }
    },
});