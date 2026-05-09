// part of Supabase auth
// creates a Supabase client that runs on the server, manage cookie access

import { createServerClient } from "@supabase/ssr"

// be able to read and write cookies (server side only)
import { cookies } from "next/headers"

export async function createClient() {
    // get user auth token from request
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // to check auth token, read cookies from request
                getAll() {
                    return cookieStore.getAll()
                },
                // when a token needs to be updated, write new values
                setAll(cookiesToSet) {
                    // potential error (DONT FIX YET)
                    // !! missing try/catch if Error: cookies can only be modified in a server action or router handler crash !!
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )
}
