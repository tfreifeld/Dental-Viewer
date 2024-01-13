import GUI, { Controller } from "lil-gui";
import { AppManager } from "./AppManager.js";
import { TeethManager } from "./TeethManager.js";
import { SceneController } from "./SceneController.js";
var Action;
(function (Action) {
    Action["COLOR"] = "Color";
    Action["TRANSLATE"] = "Translate";
    Action["BOUNDING_BOX"] = "Bounding Box";
})(Action || (Action = {}));
var Value;
(function (Value) {
    Value["COLOR"] = "Color";
    Value["UPPER_JAW"] = "Upper Jaw";
    Value["LOWER_JAW"] = "Lower Jaw";
    Value["SIZE"] = "Size";
    Value["CENTER"] = "Center";
    Value["MIN"] = "Min";
    Value["MAX"] = "Max";
    Value["IS_BOXES_COLLIDING"] = "Boxes Colliding?";
    Value["COMPUTE_COLLISION"] = "Compute Collision";
})(Value || (Value = {}));
var ControllerType;
(function (ControllerType) {
    ControllerType["COLOR"] = "Color";
    ControllerType["UPPER_JAW_SIZE"] = "Upper Jaw Size";
    ControllerType["UPPER_JAW_CENTER"] = "Upper Jaw Center";
    ControllerType["UPPER_JAW_MIN"] = "Upper Jaw Min";
    ControllerType["UPPER_JAW_MAX"] = "Upper Jaw Max";
    ControllerType["LOWER_JAW_SIZE"] = "Lower Jaw Size";
    ControllerType["LOWER_JAW_CENTER"] = "Lower Jaw Center";
    ControllerType["LOWER_JAW_MIN"] = "Lower Jaw Min";
    ControllerType["LOWER_JAW_MAX"] = "Lower Jaw Max";
    ControllerType["IS_BOXES_COLLIDING"] = "Boxes Colliding?";
    ControllerType["COMPUTE_COLLISION"] = "Compute Collision";
})(ControllerType || (ControllerType = {}));
var FolderType;
(function (FolderType) {
    FolderType["UPPER_JAW"] = "Upper Jaw";
    FolderType["LOWER_JAW"] = "Lower Jaw";
})(FolderType || (FolderType = {}));
export class GUIManager {
    mLoadButton;
    mOrbitControlsToggle;
    mMainFolder;
    mActions;
    mControllers;
    mFolders;
    mSelectedAction;
    mValues = {
        [Value.COLOR]: TeethManager.DEFAULT_COLOR,
        [Value.COMPUTE_COLLISION]: () => AppManager.instance.teethManager.computeCollision(),
        [Value.UPPER_JAW]: {
            [Value.SIZE]: "0",
            [Value.CENTER]: "0",
            [Value.MIN]: "0",
            [Value.MAX]: "0"
        },
        [Value.LOWER_JAW]: {
            [Value.SIZE]: "0",
            [Value.CENTER]: "0",
            [Value.MIN]: "0",
            [Value.MAX]: "0"
        },
        [Value.IS_BOXES_COLLIDING]: "No"
    };
    constructor() {
        this.mMainFolder = new GUI();
        this.mMainFolder.hide();
        this.mActions = new Map();
        this.mControllers = new Map();
        this.mFolders = new Map();
        this.mLoadButton = document.getElementById("load-button");
        this.mLoadButton.addEventListener("click", () => this.onLoadButtonClick());
        this.mOrbitControlsToggle = document.getElementById("orbit-controls-toggle");
        this.mOrbitControlsToggle.addEventListener("change", () => {
            AppManager.instance.sceneController.orbitControls.enabled = this.mOrbitControlsToggle.checked;
        });
        // Hide the orbit controls toggle until the assets are loaded
        window.addEventListener(SceneController.ASSETS_LOADED, () => {
            this.mOrbitControlsToggle.parentElement.style.display = "block";
        });
        this.mSelectedAction = { value: Action.COLOR };
        this.setUpActions();
        this.setUpControllers();
    }
    /**
     * Load the assets and show the GUI
     * @private
     */
    onLoadButtonClick() {
        AppManager.instance.sceneController.loadAssets().then(() => {
            AppManager.instance.sceneController.setUpControls();
            this.mMainFolder.show();
        });
        this.mLoadButton.remove();
    }
    /**
     * Set up the actions
     * @private
     */
    setUpActions() {
        this.mActions.set(Action.COLOR, {
            onSelect: () => this.onColorActionSelected(),
            onUnselect: () => this.onColorActionUnselected()
        });
        this.mActions.set(Action.TRANSLATE, {
            onSelect: () => this.onTranslateActionSelected(),
            onUnselect: () => this.onTranslateActionUnselected()
        });
        this.mActions.set(Action.BOUNDING_BOX, {
            onSelect: () => this.onBoundingBoxActionSelected(),
            onUnselect: () => this.onBoundingBoxActionUnselected()
        });
        this.mMainFolder
            .add(this.mSelectedAction, "value", Object.values(Action))
            .name("Actions")
            .onChange((value) => this.onActionSelected(value));
    }
    /**
     * Handle selection of an action
     * @param newAction The selected action
     * @private
     */
    onActionSelected(newAction) {
        this.mActions.get(newAction)?.onSelect();
        // TODO: perhaps only call unselect on the previously selected action?
        Object.values(Action)
            .filter((action) => action !== newAction)
            .forEach((action) => this.mActions.get(action)?.onUnselect());
    }
    /**
     * Set up the controllers
     * @private
     */
    setUpControllers() {
        this.setUpColorController();
        this.setUpCollisionController();
        this.setUpBoundingBoxesController();
    }
    /**
     * Set up the color controller
     * @private
     */
    setUpColorController() {
        const controller = this.mMainFolder
            .addColor(this.mValues, Value.COLOR)
            .onChange((value) => {
            AppManager.instance.teethManager.markingColor = parseInt(value);
        });
        this.mControllers.set(ControllerType.COLOR, controller);
    }
    /**
     * Set up the collision controller
     * @private
     */
    setUpCollisionController() {
        const controller = this.mMainFolder.add(this.mValues, Value.COMPUTE_COLLISION);
        this.mControllers.set(ControllerType.COMPUTE_COLLISION, controller);
        controller.hide();
    }
    /**
     * Set up the bounding boxes controllers
     * @private
     */
    setUpBoundingBoxesController() {
        const upperJawFolder = this.mMainFolder.addFolder("Upper Jaw").hide();
        const lowerJawFolder = this.mMainFolder.addFolder("Lower Jaw").hide();
        const upperSizeController = upperJawFolder.add(this.mValues[Value.UPPER_JAW], Value.SIZE).disable();
        upperSizeController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.UPPER_JAW_SIZE, upperSizeController);
        const upperCenterController = upperJawFolder.add(this.mValues[Value.UPPER_JAW], Value.CENTER).disable();
        upperCenterController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.UPPER_JAW_CENTER, upperCenterController);
        const upperMinController = upperJawFolder.add(this.mValues[Value.UPPER_JAW], Value.MIN).disable();
        upperMinController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.UPPER_JAW_MIN, upperMinController);
        const upperMaxController = upperJawFolder.add(this.mValues[Value.UPPER_JAW], Value.MAX).disable();
        upperMaxController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.UPPER_JAW_MAX, upperMaxController);
        const lowerSizeController = lowerJawFolder.add(this.mValues[Value.LOWER_JAW], Value.SIZE).disable();
        lowerSizeController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.LOWER_JAW_SIZE, lowerSizeController);
        const lowerCenterController = lowerJawFolder.add(this.mValues[Value.LOWER_JAW], Value.CENTER).disable();
        lowerCenterController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.LOWER_JAW_CENTER, lowerCenterController);
        const lowerMinController = lowerJawFolder.add(this.mValues[Value.LOWER_JAW], Value.MIN).disable();
        lowerMinController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.LOWER_JAW_MIN, lowerMinController);
        const lowerMaxController = lowerJawFolder.add(this.mValues[Value.LOWER_JAW], Value.MAX).disable();
        lowerMaxController.domElement.classList.add("constant-controller");
        this.mControllers.set(ControllerType.LOWER_JAW_MAX, lowerMaxController);
        this.mFolders.set(FolderType.UPPER_JAW, upperJawFolder);
        this.mFolders.set(FolderType.LOWER_JAW, lowerJawFolder);
        const boxesCollidingController = this.mMainFolder.add(this.mValues, Value.IS_BOXES_COLLIDING).disable();
        boxesCollidingController.domElement.classList.add("constant-controller");
        boxesCollidingController.hide();
        this.mControllers.set(ControllerType.IS_BOXES_COLLIDING, boxesCollidingController);
        window.addEventListener(TeethManager.BOUNDING_BOXES_UPDATED, (event) => this.onBoundingBoxesUpdated(event));
    }
    /**
     * Handle the bounding boxes being updated
     * @param event CustomEvent object containing the updated bounding boxes data
     * @private
     */
    onBoundingBoxesUpdated(event) {
        const formatter = (value) => "(" +
            value.toArray()
                .map((number) => number.toFixed(2))
                .join(", ") +
            ")";
        // Save the new values
        const { upper, lower, isColliding } = event.detail;
        this.mValues[Value.UPPER_JAW][Value.SIZE] = formatter(upper.size);
        this.mValues[Value.UPPER_JAW][Value.CENTER] = formatter(upper.center);
        this.mValues[Value.UPPER_JAW][Value.MIN] = formatter(upper.min);
        this.mValues[Value.UPPER_JAW][Value.MAX] = formatter(upper.max);
        this.mValues[Value.LOWER_JAW][Value.SIZE] = formatter(lower.size);
        this.mValues[Value.LOWER_JAW][Value.CENTER] = formatter(lower.center);
        this.mValues[Value.LOWER_JAW][Value.MIN] = formatter(lower.min);
        this.mValues[Value.LOWER_JAW][Value.MAX] = formatter(lower.max);
        this.mValues[Value.IS_BOXES_COLLIDING] = isColliding ? "Yes" : "No";
        // Update the UI with the new values
        this.mControllers.get(ControllerType.UPPER_JAW_SIZE).updateDisplay();
        this.mControllers.get(ControllerType.UPPER_JAW_CENTER).updateDisplay();
        this.mControllers.get(ControllerType.UPPER_JAW_MIN).updateDisplay();
        this.mControllers.get(ControllerType.UPPER_JAW_MAX).updateDisplay();
        this.mControllers.get(ControllerType.LOWER_JAW_SIZE).updateDisplay();
        this.mControllers.get(ControllerType.LOWER_JAW_CENTER).updateDisplay();
        this.mControllers.get(ControllerType.LOWER_JAW_MIN).updateDisplay();
        this.mControllers.get(ControllerType.LOWER_JAW_MAX).updateDisplay();
        this.mControllers.get(ControllerType.IS_BOXES_COLLIDING).updateDisplay();
    }
    /**
     * Show the color controller and activate the tooth picker
     * @private
     */
    onColorActionSelected() {
        this.mControllers.get(ControllerType.COLOR).show();
        AppManager.instance.toothPicker.activate();
    }
    /**
     * Hide the color controller and deactivate the tooth picker
     * @private
     */
    onColorActionUnselected() {
        this.mControllers.get(ControllerType.COLOR).hide();
        AppManager.instance.toothPicker.deactivate();
    }
    /**
     * Show the collision controller and activate the transform controls
     * @private
     */
    onTranslateActionSelected() {
        this.mControllers.get(ControllerType.COMPUTE_COLLISION).show();
        AppManager.instance.teethManager.activateTransformControls();
    }
    /**
     * Hide the collision controller and deactivate the transform controls
     * @private
     */
    onTranslateActionUnselected() {
        this.mControllers.get(ControllerType.COMPUTE_COLLISION).hide();
        AppManager.instance.teethManager.deactivateTransformControls();
    }
    /**
     * Show the bounding boxes controllers and show the bounding boxes
     * @private
     */
    onBoundingBoxActionSelected() {
        this.mFolders.get(FolderType.LOWER_JAW).show();
        this.mFolders.get(FolderType.UPPER_JAW).show();
        this.mControllers.get(ControllerType.IS_BOXES_COLLIDING).show();
        AppManager.instance.teethManager.showBoundingBoxes();
    }
    /**
     * Hide the bounding boxes controllers and hide the bounding boxes
     * @private
     */
    onBoundingBoxActionUnselected() {
        this.mFolders.get(FolderType.LOWER_JAW).hide();
        this.mFolders.get(FolderType.UPPER_JAW).hide();
        this.mControllers.get(ControllerType.IS_BOXES_COLLIDING).hide();
        AppManager.instance.teethManager.hideBoundingBoxes();
    }
}
//# sourceMappingURL=GUIManager.js.map