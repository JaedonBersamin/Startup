import type { ModelFormat } from "./models"

export interface ConvertJobData {
  modelId: string
  rawFileUrl: string
  format: ModelFormat
  deviceId: string
}

export interface AIValidateJobData {
  modelId: string
  glbUrl: string
  thumbnailUrls: string[]
  deviceMake: string
  deviceModel: string
  deviceYear: number | null
  claimedAnnotations: string[]
}
