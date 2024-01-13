import { DirectionalLight, Group, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export class SceneController {
    static RENDER = "render";
    static ASSETS_LOADED = "assetsLoaded";
    mRenderer;
    mScene;
    mCamera;
    mOrbitControls;
    constructor() {
        this.setUpScene();
        this.animate();
    }
    /**
     * Set up the scene
     * @private
     */
    setUpScene() {
        this.setUpRenderer();
        this.setUpCamera();
        this.setUpLights();
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    /**
     * Set up the renderer
     * @private
     */
    setUpRenderer() {
        this.mRenderer = new WebGLRenderer({ antialias: true });
        this.mRenderer.setPixelRatio(window.devicePixelRatio);
        this.mRenderer.setSize(window.innerWidth, window.innerHeight);
        // Set background color to a nice grey instead of black
        this.mRenderer.setClearColor(0x888888);
        document.body.appendChild(this.mRenderer.domElement);
    }
    /**
     * Set up the camera
     * @private
     */
    setUpCamera() {
        this.mScene = new Scene();
        this.mCamera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.mCamera.position.z = -100;
        // Rotate the camera to face the model
        this.mCamera.rotation.y = Math.PI;
    }
    /**
     * Set up the lights
     * @private
     */
    setUpLights() {
        const directionalLight1 = new DirectionalLight(0xffffff, 5);
        const directionalLight2 = new DirectionalLight(0xffffff, 5);
        const directionalLight3 = new DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(0, 100, -100);
        directionalLight2.position.set(0, 100, 100);
        directionalLight3.position.set(0, -100, 0);
        this.mScene.add(directionalLight1);
        this.mScene.add(directionalLight2);
        this.mScene.add(directionalLight3);
    }
    /**
     * Animate the scene
     * @private
     */
    animate() {
        window.dispatchEvent(new CustomEvent(SceneController.RENDER));
        this.mRenderer.render(this.mScene, this.mCamera);
        requestAnimationFrame(() => this.animate());
    }
    /**
     * Adjust the camera and renderer when the window is resized
     * @private
     */
    onWindowResize() {
        this.mCamera.aspect = window.innerWidth / window.innerHeight;
        this.mCamera.updateProjectionMatrix();
        this.mRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    /**
     * Load the assets into the scene
     * @private
     */
    async loadAssets() {
        const onProgressCallback = (progress) => {
            console.log((progress.loaded / progress.total * 100) + '% loaded');
        };
        const loader = new GLTFLoader();
        const lowerJaw = (await loader.loadAsync('assets/LowerJaw/lower-jaw-vertical.glb', onProgressCallback)).scene;
        const upperJaw = (await loader.loadAsync('assets/UpperJaw/upper-jaw-vertical.glb', onProgressCallback)).scene;
        this.cloneMaterials(lowerJaw);
        this.cloneMaterials(upperJaw);
        const group = new Group();
        group.add(lowerJaw);
        group.add(upperJaw);
        // Rotate the upper jaw so it is aligned correctly
        upperJaw.rotateY(Math.PI);
        // Rotate the jaws so they are vertical
        group.rotateX(-Math.PI / 2);
        this.mScene.add(group);
        // Dispatch an event to let other components know that the assets have been loaded
        window.dispatchEvent(new CustomEvent(SceneController.ASSETS_LOADED, {
            detail: {
                group: group,
                upperJaw: upperJaw,
                lowerJaw: lowerJaw,
            }
        }));
    }
    /**
     * Set up the orbit controls
     */
    setUpControls() {
        this.mOrbitControls = new OrbitControls(this.mCamera, this.mRenderer.domElement);
    }
    /**
     * Clone the materials of the teeth, so we can change the color of individual teeth
     * @param jawGroup The group containing the teeth
     * @private
     */
    cloneMaterials(jawGroup) {
        jawGroup.children.forEach((tooth) => {
            tooth.material = tooth.material.clone();
        });
    }
    get camera() {
        return this.mCamera;
    }
    get scene() {
        return this.mScene;
    }
    get renderer() {
        return this.mRenderer;
    }
    get orbitControls() {
        return this.mOrbitControls;
    }
}
//# sourceMappingURL=SceneController.js.map