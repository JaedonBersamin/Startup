export type ModelStatus =
  | "pending"
  | "converting"
  | "ai_pass"
  | "approved"
  | "rejected"

export type ModelFormat = "glb" | "gltf" | "obj" | "step"

export interface Annotation {
  id: string
  label: string
  position: { x: number; y: number; z: number }
  normal: { x: number; y: number; z: number }
}

export interface AIVerdict {
  pass: boolean
  confidence: number
  issues: string[]
}
