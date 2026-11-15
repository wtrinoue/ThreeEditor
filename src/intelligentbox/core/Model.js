class Model {
    constructor(initialSlots = {}) {
        this.slots = { ...initialSlots };
        this.slotConnectors = [];
    }

    getSlotValue(slotname) {
        return this.slots[slotname];
    }

    setSlotValue(slotname, value) {
        this.slots[slotname] = value;
    }

    get slotKeys() {
        return Object.keys(this.slots);
    }
}