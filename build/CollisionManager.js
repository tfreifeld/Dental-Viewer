import { Box3, BufferGeometry, Mesh, Points, PointsMaterial, Raycaster, Sphere, Vector3 } from "three";
import { acceleratedRaycast } from "three-mesh-bvh";
import { AppManager } from "./AppManager.js";
export class CollisionManager {
    // Auxiliary variables for reserving memory
    static sVec1 = new Vector3();
    static sRayDirection = new Vector3(0, 0, 1);
    static sBox1 = new Box3();
    static sBox2 = new Box3();
    static sSphere1 = new Sphere();
    static sSphere2 = new Sphere();
    mTeethManager;
    mRaycaster;
    mPointMaterial;
    mPointGeometry;
    mPointsData;
    mPointObject;
    constructor(teethManager) {
        this.mTeethManager = teethManager;
        this.mRaycaster = new Raycaster();
        // Replace built-in raycast method with accelerated version of three-mesh-bvh
        Mesh.prototype.raycast = acceleratedRaycast;
    }
    /**
     * Check for collisions between the upper and lower teeth
     */
    checkForCollisions() {
        // Initialize the point material if needed
        this.mPointMaterial ??= new PointsMaterial({ color: "yellow", size: 0.1, depthTest: false });
        this.mPointGeometry ??= new BufferGeometry();
        this.mPointObject ??= new Points(this.mPointGeometry, this.mPointMaterial);
        AppManager.instance.sceneController.scene.add(this.mPointObject);
        this.nullifyPointsData();
        // Check for collisions for each upper tooth with each lower tooth
        this.mTeethManager.upperJaw.children.forEach((upperTooth) => {
            this.mTeethManager.lowerJaw.children.forEach((lowerTooth) => {
                this.checkTeethCollision(upperTooth, lowerTooth);
            });
        });
        // Update the points geometry with gathered data
        this.mPointGeometry.setFromPoints(this.mPointsData);
    }
    /**
     * Nullify the points data so not more points are rendered
     */
    nullifyPointsData() {
        this.mPointsData = [];
        this.mPointGeometry?.setFromPoints(this.mPointsData);
    }
    /**
     * Check for collisions between an upper and a lower tooth
     * @param upperTooth The upper tooth
     * @param lowerTooth The lower tooth
     * @private
     */
    checkTeethCollision(upperTooth, lowerTooth) {
        // Check if the bounding spheres of the teeth intersect for quick rejection
        if (!this.isBoundingSpheresIntersecting(upperTooth, lowerTooth)) {
            return;
        }
        // Check if the bounding boxes of the teeth intersect for quick rejection
        if (!this.isBoundingBoxesIntersecting(upperTooth, lowerTooth)) {
            return;
        }
        const verticesCount = upperTooth.geometry.getAttribute("position").count;
        // Iterate through the vertices of the upper tooth
        for (let i = 0; i < verticesCount; i++) {
            upperTooth.getVertexPosition(i, CollisionManager.sVec1);
            // Raycaster works in world space, so we need to transform the vertex position to world space
            upperTooth.localToWorld(CollisionManager.sVec1);
            this.raycast(lowerTooth);
        }
    }
    /**
     * Check if the bounding spheres of the teeth intersect
     * @param upperTooth The upper tooth
     * @param lowerTooth The lower tooth
     * @private
     */
    isBoundingSpheresIntersecting(upperTooth, lowerTooth) {
        if (upperTooth.geometry.boundingSphere == null) {
            upperTooth.geometry.computeBoundingSphere();
        }
        if (lowerTooth.geometry.boundingSphere == null) {
            lowerTooth.geometry.computeBoundingSphere();
        }
        // Transform the bounding spheres to world space
        CollisionManager.sSphere1.copy(upperTooth.geometry.boundingSphere);
        CollisionManager.sSphere1.applyMatrix4(upperTooth.matrixWorld);
        CollisionManager.sSphere2.copy(lowerTooth.geometry.boundingSphere);
        CollisionManager.sSphere2.applyMatrix4(lowerTooth.matrixWorld);
        return CollisionManager.sSphere1.intersectsSphere(CollisionManager.sSphere2);
    }
    /**
     * Check if the bounding boxes of the teeth intersect
     * @param upperTooth The upper tooth
     * @param lowerTooth The lower tooth
     * @private
     */
    isBoundingBoxesIntersecting(upperTooth, lowerTooth) {
        // These boxes are in world space
        CollisionManager.sBox1.setFromObject(upperTooth);
        CollisionManager.sBox2.setFromObject(lowerTooth);
        return CollisionManager.sBox1.intersectsBox(CollisionManager.sBox2);
    }
    /**
     * Raycast from a vertex of the upper tooth to an arbitrary direction.
     * If the number of intersections is odd then the vertex is inside the lower tooth
     * ( because it only intersects the lower tooth once, on exit ).
     * If the number of intersections is even then the vertex is outside the lower tooth.
     * ( because it enters and exits the lower tooth an equal number of times ).
     * @param lowerTooth The lower tooth
     * @private
     */
    raycast(lowerTooth) {
        // The ray direction doesn't matter, so we use an arbitrary direction
        this.mRaycaster.set(CollisionManager.sVec1, CollisionManager.sRayDirection);
        const intersections = this.mRaycaster.intersectObject(lowerTooth);
        if (intersections.length % 2 === 0) {
            return;
        }
        this.mPointsData.push(this.mRaycaster.ray.origin.clone());
    }
}
//# sourceMappingURL=CollisionManager.js.map