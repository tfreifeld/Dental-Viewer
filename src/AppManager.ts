import {SceneController} from "./SceneController.js";
import {ToothPicker} from "./ToothPicker.js";
import {TeethManager} from "./TeethManager.js";
import {GUIManager} from "./GUIManager.js";

export class AppManager {

    public static instance: AppManager;

    private readonly mLoadButton: HTMLButtonElement;
    private readonly mSceneController: SceneController;
    private readonly mToothPicker: ToothPicker;
    private readonly mTeethManager: TeethManager;
    private readonly mGUIManager: GUIManager;

    constructor() {

        AppManager.instance = this;

        this.mGUIManager = new GUIManager();
        this.mSceneController = new SceneController();
        this.mToothPicker = new ToothPicker();
        this.mTeethManager = new TeethManager();

        this.mLoadButton = document.getElementById("load-button") as HTMLButtonElement;
        this.mLoadButton.addEventListener("click", () => this.onLoadButtonClick());
    }

    private onLoadButtonClick(): void {
        this.mSceneController.loadAssets().then(() => this.mSceneController.setUpControls());
        this.mLoadButton.remove();

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