import { BufferGeometry, Mesh, MeshStandardMaterial, Raycaster, Vector2 } from "three";
import { AppManager } from "./AppManager.js";
export class ToothPicker {
    mRaycaster;
    mPointerCoords;
    mPickedTooth;
    constructor() {
        this.mPickedTooth = null;
        this.mRaycaster = new Raycaster();
        this.mPointerCoords = new Vector2();
        window.addEventListener("pointermove", (event) => this.onPointerMove(event));
        window.addEventListener("click", () => this.onPointerClick());
    }
    /**
     * Update the pointer coordinates
     * @param event PointerEvent object containing the pointer coordinates
     * @private
     */
    onPointerMove(event) {
        // Calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        this.mPointerCoords.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    }
    /**
     * Handle selection of a tooth
     * @private
     */
    onPointerClick() {
        if (this.mPickedTooth != null) {
            AppManager.instance.teethManager.onToothClicked(this.mPickedTooth);
        }
    }
    /**
     * Try to pick a tooth on each frame
     */
    onRender() {
        // Update the picking ray with the camera and pointer position
        this.mRaycaster.setFromCamera(this.mPointerCoords, AppManager.instance.sceneController.camera);
        const intersection = this.mRaycaster.intersectObject(AppManager.instance.sceneController.scene, true)?.[0];
        if (intersection != null) {
            // If the user is already hovering over the picked tooth, do nothing
            if (this.mPickedTooth === intersection.object) {
                return;
            }
            // If the user was already hovering a different tooth, change its color back to white if needed
            if (this.mPickedTooth != null) {
                AppManager.instance.teethManager.onToothNotHovered(this.mPickedTooth);
            }
            this.mPickedTooth = intersection.object;
            // Mark the picked tooth as hovered
            AppManager.instance.teethManager.onToothHovered(this.mPickedTooth);
        }
        else {
            // If the user is not hovering over any tooth, change the color of the previously picked tooth back to white if needed
            if (this.mPickedTooth != null) {
                AppManager.instance.teethManager.onToothNotHovered(this.mPickedTooth);
            }
            this.mPickedTooth = null;
        }
    }
}
//# sourceMappingURL=ToothPicker.js.map