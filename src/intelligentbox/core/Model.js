class Model {
    constructor(values = {}, initialSlots = {}, view = null) {
        if (!this.isSlotMap(initialSlots)) {
            throw new TypeError('initialSlots must be an object containing Slot instances');
        }
        this.values = { ...values };
        this.slots = { ...initialSlots };
        for (const slotName of this.slotKeys) {
            this.injectModelToSlot(this.slots[slotName]);
        }
        this.view = view;

        // 接続情報（直上の親は常に1つ）
        this.isConnect = false;
        this.parentModel = null;
        this.parentSlotName = null;
        this.childSlotName = null;

        // 通信許可フラグ（コネクションシートの設定）
        this.enableSet = true;
        this.enableGimme = true;
        this.enableUpdate = true;

        // 配下の子モデル群へ update 通知を送るためのリスナー集合
        this.listeners = new Set();

        // このモデル自身が解除されたときの関連する関数の解除処理
        this.disposeListeners = new Set();
    }

    dispose() {
        if (this.parentModel) {
            this.disconnect(this.parentModel);
        }

        for (const listener of [...this.disposeListeners]) {
            listener();
        }

        this.disposeListeners.clear();
        this.listeners.clear();

    }

    isSlotMap(initialSlots) {
        if (initialSlots === null || typeof initialSlots !== 'object' || Array.isArray(initialSlots)) {
            return false;
        }
        return Object.values(initialSlots).every(slot =>
            slot !== null &&
            typeof slot === 'object' &&
            typeof slot.get === 'function' &&
            typeof slot.set === 'function' &&
            typeof slot.setModel === 'function'
        );
    }

    injectModelToSlot(slot) {
        slot.setModel(this);
    }

    getValue(valueName) {
        return this.values[valueName];
    }

    // 内部状態の変更起点（ここから伝播が始まる）
    setValue(valueName, value) {
        // 【重要】値に変化がない場合はループ防止のため処理を中断（論文の仕様）
        if (this.values[valueName] === value) return;

        this.values[valueName] = value;

        // 1. 自身の View（Display Object）の表示更新
        if (this.view && typeof this.view.update === 'function') {
            this.view.update(this);
        }

        // 2. 親へ set メッセージを送信（上方向への伝播）
        this.set();

        // 3. 子へ update メッセージを通知（下方向への伝播）
        this.notifyUpdate();
    }

    getSlotValue(slotname) {
        return this.slots[slotname].get();
    }

    setSlotValue(slotname, value) {
        this.slots[slotname].set(value);
    }

    disconnect(parentModel = this.parentModel) {
        if (!parentModel || parentModel !== this.parentModel) return;

        parentModel.listeners.delete(this.gimmeListener);
        parentModel.disposeListeners.delete(this.disconnectListener);

        this.parentModel = null;
        this.parentSlotName = null;
        this.childSlotName = null;
        this.gimmeListener = null;
        this.disconnectListener = null;
        this.isConnect = false;
    }

    connect(parentModel, parentSlotName, childSlotName) {
        // 再接続時の解除処理
        if (this.isConnect) this.disconnect();

        this.parentModel = parentModel;
        this.parentSlotName = parentSlotName;
        this.childSlotName = childSlotName;

        // 親モデルに自身の update 受信ハンドラを登録
        this.gimmeListener = () => this.onParentUpdated();
        parentModel.listeners.add(this.gimmeListener);
        this.disconnectListener = () => this.disconnect(parentModel);
        parentModel.disposeListeners.add(this.disconnectListener);

        this.isConnect = true;
    }

    // 子 ➔ 親 への書き込み（set メッセージ）
    set() {
        if (this.isConnect && this.enableSet && this.parentModel) {
            const childValue = this.getSlotValue(this.childSlotName);
            // 親のスロットへ書き込み（親内部で setValue が呼ばれ、さらに上の親へ伝播する）
            this.parentModel.setSlotValue(this.parentSlotName, childValue);
        }
    }

    // 親から update 通知を受けたときのトリガー処理
    onParentUpdated() {
        // update 受信が許可されている場合のみ gimme を発動
        if (this.isConnect && this.enableUpdate) {
            this.gimme();
        }
    }

    // 親 ➔ 子 への値の引き抜き（gimme メッセージ）
    gimme() {
        if (this.isConnect && this.enableGimme && this.parentModel) {
            const parentValue = this.parentModel.getSlotValue(this.parentSlotName);
            // 取得した値を自分のスロットへ書き込む
            this.setSlotValue(this.childSlotName, parentValue);
        }
    }

    // 配下の子モデルたちへ一斉に update を通知
    notifyUpdate() {
        for (const listener of this.listeners) {
            listener();
        }
    }

    get slotKeys() {
        return Object.keys(this.slots);
    }
}

// モデルに対する親は一つだけなのでそれを利用して情報を載せたい。