import type {TeethManager} from "./TeethManager";
import {
    ArrowHelper,
    type BufferGeometry,
    type Intersection, Mesh, MeshBasicMaterial,
    type MeshStandardMaterial,
    Raycaster,
    SphereGeometry,
    Vector3
} from "three";
import {AppManager} from "./AppManager.js";

export class CollisionManager {

    // Auxiliary vector for reserving memory
    private static sV1: Vector3 = new Vector3();
    private static sV2: Vector3 = new Vector3();

    private mTeethManager: TeethManager;
    private mRaycaster: Raycaster;

    private mCounter: number;

    constructor(teethManager: TeethManager) {
        this.mTeethManager = teethManager;
        this.mRaycaster = new Raycaster()
    }

    checkForCollisions(): void {
        this.mCounter = 0;
        this.mTeethManager.upperJaw.children.forEach((upperTooth: Mesh<BufferGeometry, MeshStandardMaterial>) => {
            this.mTeethManager.lowerJaw.children.forEach((lowerTooth: Mesh<BufferGeometry, MeshStandardMaterial>) => {
                this.checkToothCollision(upperTooth, lowerTooth);
            });
        });
    }

    private checkToothCollision(upperTooth: Mesh<BufferGeometry, MeshStandardMaterial>, lowerTooth: Mesh<BufferGeometry, MeshStandardMaterial>): void {
        const positionAttribute = upperTooth.geometry.getAttribute("position");
        const normalAttribute = upperTooth.geometry.getAttribute("normal");
        const verticesCount: number = positionAttribute.count;


        for (let i = 0; i < verticesCount; i++) {
            CollisionManager.sV2.set(normalAttribute.getX(i), normalAttribute.getY(i), normalAttribute.getZ(i));
            // console.log(CollisionManager.sV2.y);
            // if (CollisionManager.sV2.y >= 0) {
            //     return;
            // r
            this.mCounter++;
            console.log(this.mCounter);
            upperTooth.getVertexPosition(i, CollisionManager.sV1);
            upperTooth.localToWorld(CollisionManager.sV1);
            this.checkVertexCollision(CollisionManager.sV1, lowerTooth);
        }
    }

    private checkVertexCollision(vertex: Vector3, lowerTooth: Mesh<BufferGeometry, MeshStandardMaterial>): boolean {

        this.mRaycaster.set(vertex, new Vector3(0, -1, 0));

        // Nudge the ray up, so we can compare distances between the ray's
        // collision point in lowerTooth against the original tooth vertex
        // this.mRaycaster.ray.origin.y += 10;

        const arrowHelper: ArrowHelper = new ArrowHelper(this.mRaycaster.ray.direction, this.mRaycaster.ray.origin, 10, 0xff0000);
        AppManager.instance.sceneController.scene.add(arrowHelper);
        const intersection: Intersection = this.mRaycaster.intersectObject(lowerTooth)?.[0];
        if (intersection == null) {
            return false;
        }

        // if (intersection.distance < 10) {
        //     console.log("Collision detected!");
        // }

        // const mesh: Mesh<SphereGeometry, MeshBasicMaterial> = new Mesh(new SphereGeometry(), new MeshBasicMaterial({color: 0xff0000}));
        // mesh.position.copy(intersection.point);
        // AppManager.instance.sceneController.scene.add(mesh);

    };
}