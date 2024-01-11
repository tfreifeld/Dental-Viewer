export class TeethManager {
    static HOVERED_COLOR = 0x7cf5fe;
    mMarkedTeeth;
    constructor() {
        this.mMarkedTeeth = new Set();
    }
    /**
     * Add or remove the tooth from the set of marked teeth
     * @param tooth The tooth that the user clicked on
     */
    onToothClicked(tooth) {
        if (this.mMarkedTeeth.has(tooth)) {
            this.mMarkedTeeth.delete(tooth);
            tooth.material.color.set(0xffffff);
        }
        else {
            this.mMarkedTeeth.add(tooth);
            tooth.material.color.set(0xff0000);
        }
    }
    /**
     * Check if the tooth is marked
     * @param tooth The tooth to check
     */
    isToothMarked(tooth) {
        return this.mMarkedTeeth.has(tooth);
    }
    /**
     * Change the color of the tooth back to white if it is not marked
     * @param tooth The tooth that the user stopped hovering over
     */
    onToothNotHovered(tooth) {
        if (!this.mMarkedTeeth.has(tooth)) {
            tooth.material.color.set(0xffffff);
        }
    }
    onToothHovered(tooth) {
        if (!this.mMarkedTeeth.has(tooth)) {
            tooth.material.color.set(TeethManager.HOVERED_COLOR);
        }
    }
}
//# sourceMappingURL=TeethManager.js.map