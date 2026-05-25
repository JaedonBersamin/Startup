import { initTRPC, TRPCError } from "@trpc/server"
import { db } from "@/db"
import { createClient } from "@/lib/supabase/server"

export async function createTRPCContext() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return { db, user }
}

const t = initTRPC.context<typeof createTRPCContext>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" })
    return next({ ctx: { ...ctx, user: ctx.user } })
})
