export const MAX_FILE_SIZE_BYTES = 100_000_000 // 100MB

export const ACCEPTED_MIME_TYPES = [
  "model/gltf+json",
  "model/gltf-binary",
  "application/octet-stream", // .glb
  "text/plain",               // .obj
  "application/step",
  "application/stp",
] as const

export const ACCEPTED_EXTENSIONS = [".glb", ".gltf", ".obj", ".step", ".stp"] as const

export const REP_THRESHOLDS = {
  SUBMIT_MODELS: 50,
  REVIEWER_TIER_1: 200,
  REVIEWER_TIER_2: 500,
  REVIEWER_TIER_3: 1000,
} as const

export const REVIEWER_TIER_REP: Record<number, number> = {
  1: 200,
  2: 500,
  3: 1000,
}

export const REP_REWARDS = {
  MODEL_APPROVED: 10,
  ACCEPTED_ANSWER: 5,
  COMMENT_UPVOTE: 1,
  THREAD_UPVOTE: 2,
  BOUNTY_EARNED: 15,
} as const

export const AI_VALIDATION_PASS_THRESHOLD = 0.75

export const AI_DAILY_LIMIT = 5 // max AI-triggered answers per user per day
