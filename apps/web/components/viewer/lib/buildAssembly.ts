import * as THREE from "three"

// Known GLB node names for the iPhone 12 teardown model.
// Walking up the parent chain and matching against this set gives individual part granularity
// instead of the top-level assembly groups (body / front_panel / back_cover).
export const IPHONE12_NODE_NAMES = new Set([
    "battery",
    "motherboard",
    "motherboard_cover",
    "motherboard_cables_cover",
    "front_panel",
    "front_panel_screw01",
    "front_panel_screw02",
    "front_panel_screw03",
    "front_panel_screw04",
    "back_cover",
    "backplate",
    "inside_body",
    "profile_housing_top",
    "profile_housing_bottom",
    "profile_housing_left",
    "profile_housing_right",
    "profile_housing_dummies",
    "wireless_charge",
    "magnets",
    "back_cam",
    "back_cam_cover",
    "back_cam_glass",
    "back_cam_hole1",
    "back_cam_hole2",
    "back_cam_flashlight_hole",
    "inside_cam_holder",
    "flashlight",
    "flashlight_dummy",
    "front_cam",
    "front_cam_bracket",
    "front_sensor",
    "earspeaker",
    "speaker",
    "speaker_cover",
    "mic",
    "taptick",
    "btn_off",
    "btn_off_gears",
    "btn_volume_up",
    "btn_volume_up_gears",
    "btn_volume_down",
    "btn_volume_down_gears",
    "btn_volume_off",
    "charging_port",
    "charging_cable",
    "inside_power_port",
    "simholder",
    "simholder_box",
    "simholder_cable_cover",
    "antenn",
    "wifi_antenn",
    "cover",
    "cover_flex_cables",
    "grid_wires",
    "glue_sticker",
    "screw_pentalobe",
    "Screw01",
    "Screw02",
    "Screw03",
    "Screw04",
    "Screw05",
    "Screw06",
    "Screw08",
    "Screw09",
    "Screw10",
    "Screw11",
    "Screw12",
    "Screw13",
    "Screw14",
    "Screw15",
    "Screw16",
    "Screw17",
    "Screw18",
    "Screw19",
    "Screw20",
    "Screw21",
    "Screw22",
    "Screw23",
    "Screw24",
    "Screw25",
    "Screw26",
    "Screw27",
    "Screw28",
    "Screw29",
    "Screw30",
    "Screw31",
    "Screw32",
    "Screw33",
    "Screw34",
    "Screw35",
    "Screw36",
    "Screw37",
    "Screw38",
    "Screw39",
    "Screw40",
    "Screw41",
    "Screw42",
    "Screw43",
    "Screw44",
    "Screw045",
    "Screw048",
    "Screw_special_01",
    "Screw_special_02",
    "Screws_special_003",
])

// Parts that must be removed before a given part can be removed.
// Keys use the normalized names (post-collapse). Omitted = no requirements.
export const IPHONE12_DEPENDENCIES: Record<string, string[]> = {
    front_panel: ["screw_pentalobe"],
    front_panel_screw01: ["front_panel"],
    front_panel_screw02: ["front_panel"],
    front_panel_screw03: ["front_panel"],
    front_panel_screw04: ["front_panel"],
    motherboard_cables_cover: ["front_panel"],
    battery: ["front_panel", "motherboard_cables_cover"],
    chassis_screws: ["front_panel", "battery"],
    special_screws: ["front_panel", "battery"],
    cover: ["front_panel", "battery", "chassis_screws"],
    cover_flex_cables: ["front_panel", "battery", "chassis_screws"],
    motherboard_cover: ["front_panel", "battery", "chassis_screws"],
    back_cam_cover: ["front_panel", "battery", "chassis_screws"],
    back_cam: ["back_cam_cover"],
    inside_cam_holder: ["back_cam"],
    flashlight: ["front_panel", "battery", "chassis_screws"],
    flashlight_dummy: ["flashlight"],
    back_cam_glass: ["back_cover"],
    back_cam_hole1: ["back_cover"],
    back_cam_hole2: ["back_cover"],
    back_cam_flashlight_hole: ["back_cover"],
    simholder_cable_cover: ["front_panel", "battery", "chassis_screws"],
    simholder_box: ["simholder_cable_cover", "special_screws"],
    taptic: ["front_panel", "battery", "chassis_screws", "special_screws"],
    speaker_cover: ["front_panel", "battery", "chassis_screws"],
    speaker: ["speaker_cover", "taptic"],
    mic: ["speaker"],
    motherboard: [
        "front_panel",
        "battery",
        "back_cam",
        "simholder_box",
        "cover",
        "cover_flex_cables",
        "motherboard_cables_cover",
        "motherboard_cover",
        "chassis_screws",
        "special_screws",
        "taptic",
        "speaker",
    ],
    charging_port: ["motherboard", "chassis_screws", "special_screws"],
    charging_cable: ["charging_port"],
    inside_power_port: ["charging_port"],
    wireless_charge: ["motherboard"],
    magnets: ["wireless_charge"],
    antenn: ["motherboard", "charging_port"],
    wifi_antenn: ["motherboard", "charging_port"],
    btn_off_gears: ["motherboard", "charging_port"],
    btn_off: ["btn_off_gears"],
    btn_volume_up_gears: ["motherboard", "charging_port"],
    btn_volume_up: ["btn_volume_up_gears"],
    btn_volume_down_gears: ["motherboard", "charging_port"],
    btn_volume_down: ["btn_volume_down_gears"],
    btn_volume_off: ["motherboard", "charging_port"],
    profile_housing_top: [
        "motherboard",
        "charging_port",
        "antenn",
        "wifi_antenn",
        "wireless_charge",
        "btn_off",
        "btn_volume_up",
        "btn_volume_down",
        "btn_volume_off",
    ],
    profile_housing_bottom: [
        "motherboard",
        "charging_port",
        "antenn",
        "wifi_antenn",
        "wireless_charge",
        "btn_off",
        "btn_volume_up",
        "btn_volume_down",
        "btn_volume_off",
    ],
    profile_housing_left: [
        "motherboard",
        "charging_port",
        "antenn",
        "wifi_antenn",
        "wireless_charge",
        "btn_off",
        "btn_volume_up",
        "btn_volume_down",
        "btn_volume_off",
    ],
    profile_housing_right: [
        "motherboard",
        "charging_port",
        "antenn",
        "wifi_antenn",
        "wireless_charge",
        "btn_off",
        "btn_volume_up",
        "btn_volume_down",
        "btn_volume_off",
    ],
    profile_housing_dummies: ["profile_housing_top"],
    back_cover: [
        "profile_housing_top",
        "profile_housing_bottom",
        "profile_housing_left",
        "profile_housing_right",
    ],
    backplate: ["back_cover"],
    inside_body: ["backplate"],
    front_cam_bracket: ["front_panel"],
    front_cam: ["front_panel"],
    front_sensor: ["front_panel", "front_cam_bracket"],
    earspeaker: ["front_panel"],
    grid_wires: ["motherboard"],
    glue_sticker: ["front_panel"],
}

// When a part is removed, these parts are automatically removed with it
// (physically attached — e.g. the display bracket screws go with the front panel).
export const IPHONE12_CASCADE: Record<string, string[]> = {
    front_panel: [
        "front_panel_screw01",
        "front_panel_screw02",
        "front_panel_screw03",
        "front_panel_screw04",
    ],
}

// Collapses numbered screws and fixes the taptick typo in the GLB.
function normalizeNodeName(name: string): string {
    if (/^Screw\d/.test(name)) return "chassis_screws"
    if (name === "Screw_special_01" || name === "Screw_special_02" || name === "Screws_special_003")
        return "special_screws"
    if (name === "taptick") return "taptic"
    return name
}

function cloneMaterial(mat: THREE.Material): THREE.Material {
    const c = mat.clone()
    c.side = THREE.DoubleSide
    if (c instanceof THREE.MeshStandardMaterial || c instanceof THREE.MeshPhysicalMaterial) {
        c.metalness = Math.min(c.metalness ?? 0, 0.35)
        c.roughness = Math.max(c.roughness ?? 0.5, 0.45)
        c.envMapIntensity = 1.2
        if (c.color) c.color.multiplyScalar(1.15)
        c.emissive = c.emissive.clone()
    }
    return c
}

function meshToWorldPiece(mesh: THREE.Mesh): THREE.Mesh | null {
    const geo = mesh.geometry
    if (!geo) return null
    const baked = geo.clone()
    baked.applyMatrix4(mesh.matrixWorld)
    const src = mesh.material
    const material = Array.isArray(src) ? src.map(cloneMaterial) : cloneMaterial(src)
    const piece = new THREE.Mesh(baked, material)
    piece.name = mesh.name
    piece.frustumCulled = false
    piece.castShadow = true
    piece.receiveShadow = true
    return piece
}

// Walk up from a mesh to find its part group name.
// When a whitelist is provided, returns the first ancestor whose name is in the set
// (gives individual part granularity for deeply nested GLBs like the iPhone 12).
// Without a whitelist, falls back to the shallowest named ancestor with siblings.
function findPartGroupName(
    obj: THREE.Object3D,
    sceneRoot: THREE.Object3D,
    whitelist?: Set<string>
): string {
    if (whitelist) {
        let cur: THREE.Object3D | null = obj
        while (cur && cur !== sceneRoot) {
            if (whitelist.has(cur.name)) return normalizeNodeName(cur.name)
            cur = cur.parent
        }
        return "__ungrouped__"
    }

    const chain: THREE.Object3D[] = []
    let cur: THREE.Object3D | null = obj.parent
    while (cur && cur !== sceneRoot) {
        chain.unshift(cur)
        cur = cur.parent
    }

    if (chain.length === 0) return obj.name || "__ungrouped__"

    for (const node of chain) {
        if (node.name && node.parent && node.parent.children.length > 1) {
            return node.name
        }
    }

    for (let i = chain.length - 1; i >= 0; i--) {
        if (chain[i].name) return chain[i].name
    }

    return "__ungrouped__"
}

export function buildAssemblyFromScene(
    source: THREE.Object3D,
    whitelist?: Set<string>
): THREE.Group {
    source.updateMatrixWorld(true)

    const assembly = new THREE.Group()
    assembly.name = "device-assembly"

    const partGroupMap = new Map<string, THREE.Group>()

    source.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return
        const piece = meshToWorldPiece(obj)
        if (!piece) return

        const partName = findPartGroupName(obj, source, whitelist)
        piece.userData.partName = partName

        if (!partGroupMap.has(partName)) {
            const g = new THREE.Group()
            g.name = partName
            g.userData.partName = partName
            partGroupMap.set(partName, g)
            assembly.add(g)
        }
        partGroupMap.get(partName)!.add(piece)
    })

    // Center and normalize scale so any model appears at a consistent size
    assembly.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(assembly)
    if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3())
        assembly.position.sub(center)
        assembly.updateMatrixWorld(true)

        const box2 = new THREE.Box3().setFromObject(assembly)
        const size = box2.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z, 1e-6)
        assembly.scale.setScalar(2.5 / maxDim)
    }

    // Save home positions so removal animation can lerp back
    assembly.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.userData.partName) {
            obj.userData.homePos = obj.position.clone()
        }
    })

    return assembly
}

function supportsEmissive(
    mat: THREE.Material
): mat is
    | THREE.MeshStandardMaterial
    | THREE.MeshPhysicalMaterial
    | THREE.MeshLambertMaterial
    | THREE.MeshPhongMaterial {
    return (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial ||
        mat instanceof THREE.MeshLambertMaterial ||
        mat instanceof THREE.MeshPhongMaterial
    )
}

export const HIGHLIGHT_COLOR = new THREE.Color("#639922")
export const BLOCKING_COLOR = new THREE.Color("#ff6600")

export function setHighlight(
    root: THREE.Object3D,
    selectedPart: string | null,
    blockingParts: Set<string> = new Set()
) {
    root.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return
        const partName = obj.userData.partName as string | null | undefined
        const isSelected = Boolean(partName && selectedPart && partName === selectedPart)
        const isBlocking = Boolean(partName && blockingParts.has(partName))

        // x-ray: blocking parts render through everything else so they're visible inside the device
        obj.renderOrder = isBlocking ? 999 : 0

        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const mat of mats) {
            mat.depthTest = !isBlocking

            if (!supportsEmissive(mat)) continue
            if (isSelected) {
                mat.emissive.copy(HIGHLIGHT_COLOR)
                mat.emissiveIntensity = 0.22
            } else if (isBlocking) {
                mat.emissive.copy(BLOCKING_COLOR)
                mat.emissiveIntensity = 1.2
            } else {
                mat.emissive.set(0x000000)
                mat.emissiveIntensity = 0
            }
        }
    })
}
