import {
    Box3,
    Box3Helper,
    type BufferGeometry,
    type Group,
    type Mesh,
    MeshBasicMaterial,
    type MeshStandardMaterial,
    Vector3
} from "three";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {AppManager} from "./AppManager.js";
import {SceneController} from "./SceneController.js";
import {CollisionManager} from "./CollisionManager.js";

export type BoundingBoxUpdateData = {
    upper: {
        size: Vector3,
        center: Vector3,
        min: Vector3,
        max: Vector3
    },
    lower: {
        size: Vector3,
        center: Vector3,
        min: Vector3,
        max: Vector3
    }
    isColliding: boolean
}

export class TeethManager {

    // Auxiliary vectors for reserving memory
    private static sV1: Vector3 = new Vector3();
    private static sV2: Vector3 = new Vector3();
    private static sV3: Vector3 = new Vector3();
    private static sV4: Vector3 = new Vector3();

    public static BOUNDING_BOXES_UPDATED: string = "boundingBoxesUpdated";

    public static DEFAULT_COLOR: number = 0x7cf5fe;

    private readonly mMarkedTeeth: Map<Mesh<BufferGeometry, MeshStandardMaterial>, number>;
    private mMarkingColor: number;

    private mModelGroup: Group;
    private mUpperJaw: Group;
    private mLowerJaw: Group;

    private mUpperBoundingBox: Box3;
    private mLowerBoundingBox: Box3;
    private mUpperBoundingBoxHelper: Box3Helper;
    private mLowerBoundingBoxHelper: Box3Helper;

    private mTransformControls: TransformControls;

    private mCollisionManager: CollisionManager;

    constructor() {
        this.mMarkedTeeth = new Map<Mesh<BufferGeometry, MeshStandardMaterial>, number>();
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
    private setUpAssetsListener() {
        window.addEventListener(SceneController.ASSETS_LOADED, (event: CustomEvent) => {
            this.mModelGroup = event.detail.group;
            this.mUpperJaw = event.detail.upperJaw;
            this.mLowerJaw = event.detail.lowerJaw;

            // TODO: remove?
            const yellowMaterial: MeshBasicMaterial = new MeshBasicMaterial({color: 0xffff00});

            [...this.mUpperJaw.children, ...this.mLowerJaw.children].forEach(
                (tooth: Mesh) => {
                    const numberOfVertices = tooth.geometry.getAttribute("position").count;
                    tooth.material = [tooth.material as MeshStandardMaterial, yellowMaterial];
                    tooth.geometry.addGroup(0, numberOfVertices, 0);
                }
            )
        });
    }

    /**
     * Set up the bounding boxes
     * @private
     */
    private setUpBoundingBoxes() {
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
    private setUpTransformControls() {
        this.mTransformControls = new TransformControls(
            AppManager.instance.sceneController.camera,
            AppManager.instance.sceneController.renderer.domElement
        );

        // Only allow translation along the y-axis per instructions
        this.mTransformControls.showZ = false;
        this.mTransformControls.showX = false;

        // Disable orbit controls when dragging
        this.mTransformControls.addEventListener("dragging-changed", (event) => {
            AppManager.instance.sceneController.orbitControls.enabled = !event.value;
        });

        this.mTransformControls.addEventListener("mouseDown", () => {
            AppManager.instance.toothPicker.deactivate();
        });

        this.mTransformControls.addEventListener("mouseUp", () => {
            AppManager.instance.toothPicker.activate();
        });
    }

    /**
     * Check if the jaws are colliding
     */
    computeCollision(): void {
        this.mCollisionManager.checkForCollisions();
    }

    /**
     * Activate the transform controls
     */
    activateTransformControls(): void {
        this.mTransformControls.attach(this.mUpperJaw);
        AppManager.instance.sceneController.scene.add(this.mTransformControls);
    }

    /**
     * Deactivate the transform controls
     */
    deactivateTransformControls(): void {
        this.mTransformControls.detach();
        AppManager.instance.sceneController.scene.remove(this.mTransformControls);
    }

    /**
     * Add or remove the tooth from the set of marked teeth
     * @param tooth The tooth that the user clicked on
     */
    onToothSelected(tooth: Mesh<BufferGeometry, MeshStandardMaterial>): void {

        // Original color is no longer needed
        tooth.userData.originalColor = null;

        // If the tooth is already marked
        if (this.mMarkedTeeth.has(tooth)) {
            // If the tooth is marked with the same color as the current marking color, unmark it
            if (this.mMarkedTeeth.get(tooth) === this.mMarkingColor) {
                this.mMarkedTeeth.delete(tooth);
                tooth.material[0].color.set(0xffffff);
                return;
            }
        }
        /*
         If the tooth is marked with a different color or if it is not marked at all,
         change its color to the current marking color,
        */
        this.mMarkedTeeth.set(tooth, this.mMarkingColor);
        tooth.material[0].color.set(this.mMarkingColor);

    }

    /**
     * Change the color of the tooth back to its previous color
     * @param tooth The tooth that the user stopped hovering over
     */
    onToothNotHovered(tooth: Mesh<BufferGeometry, MeshStandardMaterial>): void {
        if (tooth.userData.originalColor != null) {
            tooth.material[0].color.set(tooth.userData.originalColor);
            tooth.userData.originalColor = null;
        }
    }

    /**
     * Change the color of the tooth to the marked color when hovering over it,
     * and keep its original color in memory
     * @param tooth The tooth that the user is hovering over
     */
    onToothHovered(tooth: Mesh<BufferGeometry, MeshStandardMaterial>): void {
        tooth.userData.originalColor = tooth.material[0].color.getHex();
        tooth.material[0].color.set(this.mMarkingColor);
    }

    /**
     * Show the bounding boxes of the jaws
     */
    showBoundingBoxes(): void {

        this.mUpperBoundingBox.setFromObject(this.mUpperJaw, true);
        this.mLowerBoundingBox.setFromObject(this.mLowerJaw, true);

        this.mUpperBoundingBoxHelper.visible = true;
        this.mLowerBoundingBoxHelper.visible = true;

        window.dispatchEvent(new CustomEvent<BoundingBoxUpdateData>(TeethManager.BOUNDING_BOXES_UPDATED, {
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
    hideBoundingBoxes(): void {
        this.mUpperBoundingBoxHelper.visible = false;
        this.mLowerBoundingBoxHelper.visible = false;
    }

    set markingColor(value: number) {
        this.mMarkingColor = value;
    }

    get models(): Group {
        return this.mModelGroup;
    }

    get upperJaw(): Group {
        return this.mUpperJaw;
    }

    get lowerJaw(): Group {
        return this.mLowerJaw;
    }
}