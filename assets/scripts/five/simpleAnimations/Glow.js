cc.Class({
    extends: cc.Component,

    properties: {
        speed: 10,

        glowInterval: 3,

        opacityMax: 255,

        opacityMin: 0,

        startFromTransparent: false,
    },

    start: function () {
        if (this.startFromTransparent) {
            this.timer = this.glowInterval;
        } else {
            this.timer = 0;
        }
    },

    update: function (dt) {
        if (this.speed != 0) {
            this.node.rotation += this.speed * dt;
        }

        if (this.opacityMax - this.opacityMin <= 0) {
            return;
        }

        if (this.timer > this.glowInterval * 2) {
            this.timer -= this.glowInterval * 2;
        }
        let f = Math.abs(this.timer / this.glowInterval - 1);
        this.node.opacity = this.opacityMin + (this.opacityMax - this.opacityMin) * f;

        this.timer += dt;
    },
});