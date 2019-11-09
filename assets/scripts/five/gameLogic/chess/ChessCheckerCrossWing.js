cc.Class({
    extends: cc.Component,

    properties: {
        currentStep: 0,

        nodes: [cc.Node],

        steps: [cc.Float],
    },

    reset: function () {
        this.currentStep = 2;
        this.step();
    },

    step: function () {
        this.currentStep++;

        if (this.currentStep < 0) {
            this.currentStep = 0;
        }

        if (this.currentStep > this.nodes.length - 1) {
            this.currentStep = 0;
        }

        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            if (node) {
                let scaleIndex = this.currentStep + i;
                if (scaleIndex > this.steps.length - 1) {
                    if (this.currentStep < 0) {
                        node.scale = 0;
                        continue;
                    }
                    scaleIndex -= this.steps.length;
                }

                node.scale = this.steps[scaleIndex];
            }
        }
    },
});