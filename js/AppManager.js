import { SceneController } from "./SceneController.js";
import { TeethManager } from "./TeethManager.js";
import { GUIManager } from "./GUIManager.js";
import { ToothPicker } from "./ToothPicker.js";
export class AppManager {
    mSceneController;
    mToothPicker;
    mTeethManager;
    constructor() {
        window["app"] = this;
        new GUIManager();
        this.mSceneController = new SceneController();
        this.mToothPicker = new ToothPicker();
        this.mTeethManager = new TeethManager();
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