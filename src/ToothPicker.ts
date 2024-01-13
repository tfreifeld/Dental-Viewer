import {BufferGeometry, type Intersection, Mesh, MeshStandardMaterial, Raycaster, Vector2} from "three";
import {AppManager} from "./AppManager.js";
import {SceneController} from "./SceneController.js";

export class ToothPicker {

    private mIsActive: boolean;

    private readonly mRaycaster: Raycaster;
    private readonly mPointerCoords: Vector2;

    private mPickedTooth: Mesh<BufferGeometry, MeshStandardMaterial> | null;

    constructor() {

        this.mIsActive = true;
        this.mPickedTooth = null;
        this.mRaycaster = new Raycaster();
        this.mPointerCoords = new Vector2();
        window.addEventListener("pointermove", (event: PointerEvent) => this.onPointerMove(event));
        window.addEventListener("click", () => this.onPointerClick());

        // Listen for the assets to be loaded
        window.addEventListener(SceneController.ASSETS_LOADED, () => {
            // Only then we should start listening for the render event for picking
            window.addEventListener(SceneController.RENDER, () => this.onRender());
        });

    }

    /**
     * Update the pointer coordinates
     * @param event PointerEvent object containing the pointer coordinates
     * @private
     */
    private onPointerMove(event: PointerEvent): void {

        // Calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        this.mPointerCoords.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
    }

    /**
     * Handle selection of a tooth
     * @private
     */
    private onPointerClick(): void {

        if (!this.mIsActive) {
            return;
        }
        if (this.mPickedTooth != null) {
            AppManager.instance.teethManager.onToothSelected(this.mPickedTooth);
        }
    }

    /**
     * Try to pick a tooth on each frame
     */
    onRender(): void {

        if (!this.mIsActive) {
            return;
        }

        // Update the picking ray with the camera and pointer position
        this.mRaycaster.setFromCamera(this.mPointerCoords, AppManager.instance.sceneController.camera);

        const intersection: Intersection = this.mRaycaster.intersectObject(AppManager.instance.teethManager.models, true)?.[0];

        if (intersection != null) {

            // If the user is already hovering over the picked tooth, do nothing
            if (this.mPickedTooth === intersection.object) {
                return;
            }

            // If the user was already hovering a different tooth, change its color back to white if needed
            if (this.mPickedTooth != null) {
                AppManager.instance.teethManager.onToothNotHovered(this.mPickedTooth);
            }

            this.mPickedTooth = intersection.object as Mesh<BufferGeometry, MeshStandardMaterial>;

            // Mark the picked tooth as hovered
            AppManager.instance.teethManager.onToothHovered(this.mPickedTooth);
        } else {

            // If the user is not hovering over any tooth, change the color of the previously picked tooth back to white if needed
            if (this.mPickedTooth != null) {
                AppManager.instance.teethManager.onToothNotHovered(this.mPickedTooth);
            }

            this.mPickedTooth = null;
        }
    }

    /**
     * Activate the tooth picker
     */
    activate(): void {
        this.mIsActive = true;
    }

    /**
     * Deactivate the tooth picker
     */
    deactivate(): void {
        this.mIsActive = false;
    }
}
