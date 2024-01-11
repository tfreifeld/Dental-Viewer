import { SceneController } from "./SceneController.js";
import { ToothPicker } from "./ToothPicker.js";
import { TeethManager } from "./TeethManager.js";
import { GUIManager } from "./GUIManager.js";
export class AppManager {
    static instance;
    mLoadButton;
    mSceneController;
    mToothPicker;
    mTeethManager;
    mGUIManager;
    constructor() {
        AppManager.instance = this;
        this.mGUIManager = new GUIManager();
        this.mSceneController = new SceneController();
        this.mToothPicker = new ToothPicker();
        this.mTeethManager = new TeethManager();
        this.mLoadButton = document.getElementById("load-button");
        this.mLoadButton.addEventListener("click", () => this.onLoadButtonClick());
    }
    onLoadButtonClick() {
        this.mSceneController.loadAssets().then(() => this.mSceneController.setUpControls());
        this.mLoadButton.remove();
    }
    get sceneController() {
        return this.mSceneController;
    }
    get toothPicker() {
        return this.mToothPicker;
    }
    get teethManager() {
        return this.mTeethManager;
    }
}
//# sourceMappingURL=AppManager.js.map