class SlotConnector {
    constructor(parentModel, childModel) {
        this.parentModel = parentModel;
        this.childModel = childModel;
        this.parentSlotName = "";
        this.childSlotName = "";
    }

    setSlotComb(parentSlotName, childSlotName) {
        this.parentSlotName = parentSlotName;
        this.childSlotName = childSlotName;
    }

    set() {
        this.parentModel.setSlotValue(
            this.parentSlotName,
            this.childModel.getSlotValue(this.childSlotName)
        );
    }

    gimme() {
        this.childModel.setSlotValue(
            this.childSlotName,
            this.parentModel.getSlotValue(this.parentSlotName)
        );
    }

    update() {
        gimme();
    }
}

// コネクションシートは子供が持つようにする。