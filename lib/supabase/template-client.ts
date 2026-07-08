import { createBrowserClient } from "@supabase/ssr"

export function createTemplateBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_TEMPLATE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_TEMPLATE_SUPABASE_ANON_KEY!
  )
}
