"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber"
import { ContactShadows, Environment, Html, OrbitControls } from "@react-three/drei"
import { Suspense } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { buildAssemblyFromScene, setHighlight } from "./lib/buildAssembly"
import { fitCameraToObject } from "./lib/fitCameraToObject"

// --- Internal: bench surface ---

function RepairBench() {
    return (
        <group name="repair-bench">
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[12, 12]} />
                <meshStandardMaterial color="#c8ccbf" roughness={0.9} metalness={0.02} />
            </mesh>
            <ContactShadows
                position={[0, -0.008, 0]}
                opacity={0.45}
                scale={5}
                blur={2.6}
                far={3}
                resolution={512}
                color="#1a1f18"
            />
        </group>
    )
}

// --- Internal: loading overlay ---

function ModelLoading() {
    return (
        <Html center>
            <div
                style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(247,247,245,0.95)",
                    border: "1px solid #e0e0dc",
                    color: "#111",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                }}
            >
                Loading 3D model…
            </div>
        </Html>
    )
}

// --- Internal: snap assembly to bench surface ---

function mountOnBench(assembly: THREE.Group): THREE.Group {
    const mount = new THREE.Group()
    mount.name = "bench-mount"
    mount.add(assembly)
    mount.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(mount)
    if (!box.isEmpty()) {
        mount.position.y = 0.01 - box.min.y
    }
    return mount
}

// --- Internal: device model ---

type DeviceModelProps = {
    glbUrl: string
    selectedPart: string | null
    removedParts: Set<string>
    blockingParts: Set<string>
    onLeftClick: (name: string) => void
    onRightClick: (name: string) => void
    activePart?: string | null
    nodeWhitelist?: Set<string>
}

function DeviceModel({
    glbUrl,
    selectedPart,
    removedParts,
    blockingParts,
    onLeftClick,
    onRightClick,
    activePart,
    nodeWhitelist,
}: DeviceModelProps) {
    const gltf = useLoader(GLTFLoader, glbUrl)
    const { camera, invalidate } = useThree()
    const get = useThree((s) => s.get)

    const root = useMemo(
        () => mountOnBench(buildAssemblyFromScene(gltf.scene.clone(), nodeWhitelist)),
        [gltf, nodeWhitelist]
    )

    useEffect(() => {
        let id2 = 0
        let cancelled = false
        const id1 = requestAnimationFrame(() => {
            id2 = requestAnimationFrame(() => {
                if (cancelled) return
                fitCameraToObject(camera, root, get().controls as never)
                invalidate()
            })
        })
        return () => {
            cancelled = true
            cancelAnimationFrame(id1)
            cancelAnimationFrame(id2)
        }
    }, [root, camera, get, invalidate])

    const effectivePart = activePart ?? selectedPart
    useLayoutEffect(() => {
        setHighlight(root, effectivePart, blockingParts)
    }, [root, effectivePart, blockingParts])

    const partGroupMap = useMemo(() => {
        const map = new Map<string, THREE.Group[]>()
        root.traverse((obj) => {
            if (!(obj instanceof THREE.Group)) return
            const name = obj.userData.partName as string | undefined
            if (!name) return
            if (!map.has(name)) map.set(name, [])
            map.get(name)!.push(obj)
        })
        return map
    }, [root])

    useFrame(() => {
        partGroupMap.forEach((groups, name) => {
            const removed = removedParts.has(name)
            for (const group of groups) {
                const home = group.userData.homePos as THREE.Vector3 | undefined
                if (!home) continue
                const targetY = home.y + (removed ? 2 : 0)
                group.position.x = THREE.MathUtils.lerp(group.position.x, home.x, 0.03)
                group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.03)
                group.position.z = THREE.MathUtils.lerp(group.position.z, home.z, 0.03)
            }
        })
    })

    const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
        let o: THREE.Object3D | null = e.object
        while (o) {
            if (o.userData.partName) {
                e.stopPropagation()
                document.body.style.cursor = "pointer"
                return
            }
            o = o.parent
        }
    }

    const handlePointerOut = () => {
        document.body.style.cursor = "auto"
    }

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        let o: THREE.Object3D | null = e.object
        while (o) {
            const name = o.userData.partName as string | null | undefined
            if (name) {
                onLeftClick(name)
                return
            }
            o = o.parent
        }
    }

    const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        e.nativeEvent.preventDefault()
        let o: THREE.Object3D | null = e.object
        while (o) {
            const name = o.userData.partName as string | null | undefined
            if (name) {
                onRightClick(name)
                return
            }
            o = o.parent
        }
    }

    return (
        <group
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <primitive object={root} dispose={null} />
        </group>
    )
}

// --- Internal: full scene ---

type SceneProps = {
    glbUrl: string
    selectedPart: string | null
    removedParts: Set<string>
    blockingParts: Set<string>
    onLeftClick: (name: string) => void
    onRightClick: (name: string) => void
    activePart?: string | null
    nodeWhitelist?: Set<string>
}

function Scene({
    glbUrl,
    selectedPart,
    removedParts,
    blockingParts,
    onLeftClick,
    onRightClick,
    activePart,
    nodeWhitelist,
}: SceneProps) {
    return (
        <>
            <color attach="background" args={["#1a1a1a"]} />
            <ambientLight intensity={0.85} />
            <directionalLight
                position={[6, 14, 5]}
                intensity={1.45}
                castShadow
                shadow-mapSize={[2048, 2048] as unknown as THREE.Vector2}
                shadow-camera-far={28}
                shadow-camera-left={-7}
                shadow-camera-right={7}
                shadow-camera-top={7}
                shadow-camera-bottom={-7}
                shadow-bias={-0.0002}
            />
            <directionalLight position={[-8, 6, -6]} intensity={0.55} />
            <RepairBench />
            <OrbitControls
                makeDefault
                minDistance={0.5}
                maxDistance={50}
                enableDamping
                dampingFactor={0.08}
            />
            <Suspense fallback={null}>
                <Environment preset="sunset" background={false} />
            </Suspense>
            <Suspense fallback={<ModelLoading />}>
                <DeviceModel
                    glbUrl={glbUrl}
                    selectedPart={selectedPart}
                    removedParts={removedParts}
                    blockingParts={blockingParts}
                    onLeftClick={onLeftClick}
                    onRightClick={onRightClick}
                    activePart={activePart}
                    nodeWhitelist={nodeWhitelist}
                />
            </Suspense>
        </>
    )
}

// --- Public component ---

export type ModelViewerProps = {
    glbUrl?: string
    height?: number | string
    activePart?: string | null
    onPartSelect?: (name: string | null) => void
    nodeWhitelist?: Set<string>
    /** parts[name] = list of part names that must be removed first */
    dependencies?: Record<string, string[]>
    /** cascadeRemovals[name] = parts that are auto-removed alongside this part */
    cascadeRemovals?: Record<string, string[]>
}

export function ModelViewer({
    glbUrl,
    height = 500,
    activePart,
    onPartSelect,
    nodeWhitelist,
    dependencies,
    cascadeRemovals,
}: ModelViewerProps) {
    const [selectedPart, setSelectedPart] = useState<string | null>(null)
    const [removedParts, setRemovedParts] = useState<Set<string>>(new Set())
    const [blockingParts, setBlockingParts] = useState<Set<string>>(new Set())

    if (!glbUrl) {
        return (
            <div
                style={{ height, background: "#111", borderRadius: 8 }}
                aria-label="No model loaded"
            />
        )
    }

    const handleLeftClick = (name: string) => {
        // If already removed, restore it (no dep check needed to put things back)
        if (removedParts.has(name)) {
            setBlockingParts(new Set())
            setRemovedParts((prev) => {
                const next = new Set(prev)
                next.delete(name)
                return next
            })
            return
        }

        // Check if all required parts have been removed first
        const reqs = dependencies?.[name] ?? []
        const unmet = reqs.filter((r) => !removedParts.has(r))
        if (unmet.length > 0) {
            setBlockingParts(new Set(unmet))
            return
        }

        // All deps satisfied — remove the part (and any cascade parts)
        setBlockingParts(new Set())
        setRemovedParts((prev) => {
            const next = new Set(prev)
            next.add(name)
            const cascade = cascadeRemovals?.[name] ?? []
            for (const c of cascade) next.add(c)
            return next
        })
    }

    const handleRightClick = (name: string) => {
        setBlockingParts(new Set())
        setSelectedPart((prev) => {
            const next = prev === name ? null : name
            onPartSelect?.(next)
            return next
        })
    }

    return (
        <div style={{ height, borderRadius: 8, overflow: "hidden" }}>
            <Canvas
                shadows
                style={{ width: "100%", height: "100%", display: "block" }}
                camera={{ position: [0, 6, 10], fov: 45, near: 0.05, far: 5000 }}
                gl={{ antialias: true }}
            >
                <Scene
                    glbUrl={glbUrl}
                    selectedPart={selectedPart}
                    removedParts={removedParts}
                    blockingParts={blockingParts}
                    onLeftClick={handleLeftClick}
                    onRightClick={handleRightClick}
                    activePart={activePart}
                    nodeWhitelist={nodeWhitelist}
                />
            </Canvas>
        </div>
    )
}
