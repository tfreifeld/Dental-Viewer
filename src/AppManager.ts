import {SceneController} from "./SceneController.js";
import {TeethManager} from "./TeethManager.js";
import {GUIManager} from "./GUIManager.js";
import {ToothPicker} from "./ToothPicker.js";

declare global {
    interface Window {
        app: AppManager;
    }
}

export class AppManager {

    private readonly mSceneController: SceneController;
    private readonly mToothPicker: ToothPicker;
    private readonly mTeethManager: TeethManager;

    constructor() {

        window["app"] = this;

        new GUIManager();
        this.mSceneController = new SceneController();
        this.mToothPicker = new ToothPicker();
        this.mTeethManager = new TeethManager();

    }

    get sceneController(): SceneController {
        return this.mSceneController;
    }

    get toothPicker(): ToothPicker {
        return this.mToothPicker;
    }

    get teethManager(): TeethManager {
        return this.mTeethManager;
    }
}