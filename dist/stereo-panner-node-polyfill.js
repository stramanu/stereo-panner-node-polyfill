((window, undefined) => {
    const BaseAudioContext = window.BaseAudioContext;
    class StereoPannerNode {
        constructor(context, options = { pan: 0 }) {
            this.context = context;
            this._input = this.context.createGain();
            this._output = this.context.createGain();
            let panValue = options.pan;
            const splitter = this.context.createChannelSplitter(2);
            const gainL1 = this.context.createGain();
            const gainL2 = this.context.createGain();
            const gainR1 = this.context.createGain();
            const gainR2 = this.context.createGain();
            const mergerL = this.context.createChannelMerger(2);
            const mergerR = this.context.createChannelMerger(2);
            const merger = this.context.createChannelMerger(2);
            this._input.connect(splitter);
            splitter.connect(gainL1, 0);
            splitter.connect(gainL2, 0);
            splitter.connect(gainR1, 1);
            splitter.connect(gainR2, 1);
            gainL1.connect(mergerL, 0, 0);
            gainR2.connect(mergerL, 0, 0);
            gainR1.connect(mergerR, 0, 1);
            gainL2.connect(mergerR, 0, 1);
            mergerL.connect(merger, 0, 0);
            mergerR.connect(merger, 0, 1);
            merger.connect(this._output);
            this.pan = {
                get value() {
                    return panValue;
                },
                set value(value) {
                    gainL1.gain.value = 1 - Math.max(value, 0);
                    gainR2.gain.value = -Math.min(value, 0);
                    gainR1.gain.value = 1 + Math.min(value, 0);
                    gainL2.gain.value = Math.max(value, 0);
                    panValue = value;
                },
            };
            this.pan.value = panValue;
        }
        get _isStereoPannerNode() {
            return true;
        }
        connect() {
            this._output.connect.apply(this._output, arguments);
        }
        disconnect() {
            this._output.disconnect.apply(this._output, arguments);
        }
        toString() {
            return "StereoPannerNode";
        }
    }
    // Install polyfill
    if (BaseAudioContext && !("createStereoPanner" in BaseAudioContext.prototype)) {
        Object.defineProperty(BaseAudioContext.prototype, "createStereoPanner", {
            value: function () {
                return new StereoPannerNode(this);
            },
            enumerable: false, writable: false, configurable: true
        });
        AudioNode.prototype._connect = AudioNode.prototype.connect;
        AudioNode.prototype.connect = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args[0]._isStereoPannerNode)
                args[0] = args[0]._input;
            this._connect.apply(this, args);
        };
        if (typeof Symbol === "function" && typeof Symbol.hasInstance === "symbol") {
            Object.defineProperty(StereoPannerNode, Symbol.hasInstance, {
                value: function (value) {
                    return value instanceof AudioNode && value.pan instanceof AudioParam;
                }
            });
        }
        if (typeof window !== undefined) {
            window.StereoPannerNode = StereoPannerNode;
        }
    }
})(window);
