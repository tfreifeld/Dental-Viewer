import { Box3, Box3Helper, Vector3 } from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { AppManager } from "./AppManager.js";
import { SceneController } from "./SceneController.js";
import { CollisionManager } from "./CollisionManager.js";
import { MeshBVH } from "three-mesh-bvh";
export class TeethManager {
    // Auxiliary vectors for reserving memory
    static sV1 = new Vector3();
    static sV2 = new Vector3();
    static sV3 = new Vector3();
    static sV4 = new Vector3();
    static BOUNDING_BOXES_UPDATED = "boundingBoxesUpdated";
    static DEFAULT_COLOR = 0x7cf5fe;
    mMarkedTeeth;
    mMarkingColor;
    mModelGroup;
    mUpperJaw;
    mLowerJaw;
    mUpperBoundingBox;
    mLowerBoundingBox;
    mUpperBoundingBoxHelper;
    mLowerBoundingBoxHelper;
    mTransformControls;
    mCollisionManager;
    constructor() {
        this.mMarkedTeeth = new Map();
        this.mMarkingColor = TeethManager.DEFAULT_COLOR;
        this.setUpBoundingBoxes();
        this.setUpTransformControls();
        this.mCollisionManager = new CollisionManager(this);
        this.setUpAssetsListener();
    }
    /**
     * Listen for the assets to be loaded
     * @private
     */
    setUpAssetsListener() {
        window.addEventListener(SceneController.ASSETS_LOADED, (event) => {
            this.mModelGroup = event.detail.group;
            this.mUpperJaw = event.detail.upperJaw;
            this.mLowerJaw = event.detail.lowerJaw;
            // Compute bounding volume hierarchies for the teeth for faster collision detection
            this.mUpperJaw.children.forEach((upperTooth) => {
                // Create bounding volume hierarchy for the upper tooth
                upperTooth.geometry.boundsTree = new MeshBVH(upperTooth.geometry);
            });
            this.mLowerJaw.children.forEach((lowerTooth) => {
                // Create bounding volume hierarchy for the lower tooth
                lowerTooth.geometry.boundsTree = new MeshBVH(lowerTooth.geometry);
            });
        });
    }
    /**
     * Set up the bounding boxes
     * @private
     */
    setUpBoundingBoxes() {
        this.mUpperBoundingBox = new Box3();
        this.mLowerBoundingBox = new Box3();
        this.mUpperBoundingBoxHelper = new Box3Helper(this.mUpperBoundingBox, 0xff0000);
        this.mUpperBoundingBoxHelper.visible = false;
        this.mLowerBoundingBoxHelper = new Box3Helper(this.mLowerBoundingBox, 0xff0000);
        this.mLowerBoundingBoxHelper.visible = false;
        AppManager.instance.sceneController.scene.add(this.mUpperBoundingBoxHelper);
        AppManager.instance.sceneController.scene.add(this.mLowerBoundingBoxHelper);
    }
    /**
     * Set up the transform controls
     * @private
     */
    setUpTransformControls() {
        this.mTransformControls = new TransformControls(AppManager.instance.sceneController.camera, AppManager.instance.sceneController.renderer.domElement);
        // Only allow translation along the y-axis per instructions
        this.mTransformControls.showZ = false;
        this.mTransformControls.showX = false;
        // Disable orbit controls when dragging
        this.mTransformControls.addEventListener("dragging-changed", (event) => {
            AppManager.instance.sceneController.orbitControls.enabled = !event.value;
            this.mCollisionManager.nullifyPointsData();
        });
    }
    /**
     * Check if the jaws are colliding
     */
    computeCollision() {
        this.mCollisionManager.checkForCollisions();
    }
    /**
     * Activate the transform controls
     */
    activateTransformControls() {
        this.mTransformControls.attach(this.mUpperJaw);
        AppManager.instance.sceneController.scene.add(this.mTransformControls);
    }
    /**
     * Deactivate the transform controls
     */
    deactivateTransformControls() {
        this.mTransformControls.detach();
        AppManager.instance.sceneController.scene.remove(this.mTransformControls);
    }
    /**
     * Add or remove the tooth from the set of marked teeth
     * @param tooth The tooth that the user clicked on
     */
    onToothSelected(tooth) {
        // Original color is no longer needed
        tooth.userData.originalColor = null;
        // If the tooth is already marked
        if (this.mMarkedTeeth.has(tooth)) {
            // If the tooth is marked with the same color as the current marking color, unmark it
            if (this.mMarkedTeeth.get(tooth) === this.mMarkingColor) {
                this.mMarkedTeeth.delete(tooth);
                tooth.material.color.set(0xffffff);
                return;
            }
        }
        /*
         If the tooth is marked with a different color or if it is not marked at all,
         change its color to the current marking color,
        */
        this.mMarkedTeeth.set(tooth, this.mMarkingColor);
        tooth.material.color.set(this.mMarkingColor);
    }
    /**
     * Change the color of the tooth back to its previous color
     * @param tooth The tooth that the user stopped hovering over
     */
    onToothNotHovered(tooth) {
        if (tooth.userData.originalColor != null) {
            tooth.material.color.set(tooth.userData.originalColor);
            tooth.userData.originalColor = null;
        }
    }
    /**
     * Change the color of the tooth to the marked color when hovering over it,
     * and keep its original color in memory
     * @param tooth The tooth that the user is hovering over
     */
    onToothHovered(tooth) {
        tooth.userData.originalColor = tooth.material.color.getHex();
        tooth.material.color.set(this.mMarkingColor);
    }
    /**
     * Show the bounding boxes of the jaws
     */
    showBoundingBoxes() {
        this.mUpperBoundingBox.setFromObject(this.mUpperJaw, true);
        this.mLowerBoundingBox.setFromObject(this.mLowerJaw, true);
        this.mUpperBoundingBoxHelper.visible = true;
        this.mLowerBoundingBoxHelper.visible = true;
        window.dispatchEvent(new CustomEvent(TeethManager.BOUNDING_BOXES_UPDATED, {
            detail: {
                upper: {
                    size: this.mUpperBoundingBoxHelper.box.getSize(TeethManager.sV1),
                    center: this.mUpperBoundingBoxHelper.box.getCenter(TeethManager.sV2),
                    min: this.mUpperBoundingBoxHelper.box.min,
                    max: this.mUpperBoundingBoxHelper.box.max,
                },
                lower: {
                    size: this.mLowerBoundingBoxHelper.box.getSize(TeethManager.sV3),
                    center: this.mLowerBoundingBoxHelper.box.getCenter(TeethManager.sV4),
                    min: this.mLowerBoundingBoxHelper.box.min,
                    max: this.mLowerBoundingBoxHelper.box.max,
                },
                isColliding: this.mUpperBoundingBox.intersectsBox(this.mLowerBoundingBox)
            }
        }));
    }
    /**
     * Hide the bounding boxes of the jaws
     */
    hideBoundingBoxes() {
        this.mUpperBoundingBoxHelper.visible = false;
        this.mLowerBoundingBoxHelper.visible = false;
    }
    set markingColor(value) {
        this.mMarkingColor = value;
    }
    get models() {
        return this.mModelGroup;
    }
    get upperJaw() {
        return this.mUpperJaw;
    }
    get lowerJaw() {
        return this.mLowerJaw;
    }
}
//# sourceMappingURL=TeethManager.js.map