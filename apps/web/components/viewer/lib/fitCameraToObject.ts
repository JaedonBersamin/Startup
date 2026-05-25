import * as THREE from "three"

export function fitCameraToObject(
    camera: THREE.Camera,
    object: THREE.Object3D,
    controls?: { target: THREE.Vector3; update?: () => void } | null
) {
    object.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(object)
    if (box.isEmpty()) return

    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    const c = sphere.center
    const rad = Math.max(sphere.radius, 0.5)
    const dist = rad * 2.5

    camera.position.set(c.x + dist * 0.55, c.y + dist * 1.05, c.z + dist * 0.85)
    if (camera instanceof THREE.PerspectiveCamera) {
        camera.near = 0.05
        camera.far = 5000
        camera.fov = 45
        camera.updateProjectionMatrix()
    }
    camera.lookAt(c)
    controls?.target?.copy(c)
    controls?.update?.()
}
