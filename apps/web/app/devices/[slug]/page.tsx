import { ModelViewer } from "@/components/viewer/ModelViewer"
import {
    IPHONE12_NODE_NAMES,
    IPHONE12_DEPENDENCIES,
    IPHONE12_CASCADE,
} from "@/components/viewer/lib/buildAssembly"

const TEST_MODELS: Record<string, string> = {
    "iphone-12": "/models/iphone_12_teardown.glb",
}

const DEVICE_WHITELISTS: Record<string, Set<string>> = {
    "iphone-12": IPHONE12_NODE_NAMES,
}

const DEVICE_DEPENDENCIES: Record<string, Record<string, string[]>> = {
    "iphone-12": IPHONE12_DEPENDENCIES,
}

const DEVICE_CASCADE: Record<string, Record<string, string[]>> = {
    "iphone-12": IPHONE12_CASCADE,
}

export default async function DevicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const glbUrl = TEST_MODELS[slug]
    const nodeWhitelist = DEVICE_WHITELISTS[slug]
    const dependencies = DEVICE_DEPENDENCIES[slug]
    const cascadeRemovals = DEVICE_CASCADE[slug]

    return (
        <main style={{ height: "100vh", display: "flex", flexDirection: "column", margin: 0 }}>
            <div style={{ padding: "1rem", flexShrink: 0 }}>
                <h1 style={{ margin: 0, fontSize: "1.25rem" }}>{slug}</h1>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ModelViewer
                    glbUrl={glbUrl}
                    height="100%"
                    nodeWhitelist={nodeWhitelist}
                    dependencies={dependencies}
                    cascadeRemovals={cascadeRemovals}
                />
            </div>
        </main>
    )
}
