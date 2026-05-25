import { router } from "../trpc"
import { devicesRouter } from "./devices"
import { modelsRouter } from "./models"
import { threadsRouter } from "./threads"

export const appRouter = router({
    devices: devicesRouter,
    models: modelsRouter,
    threads: threadsRouter,
})

export type AppRouter = typeof appRouter
