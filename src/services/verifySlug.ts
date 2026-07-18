// Pure slug-authorization check shared by the full log write and the
// verify-only request in api/log.ts (server-verified slug design). No React,
// no database.
export function isSlugAuthorized(slug: unknown, expectedSlug: string | undefined): boolean {
  return (
    typeof slug === 'string' &&
    slug.length > 0 &&
    typeof expectedSlug === 'string' &&
    expectedSlug.length > 0 &&
    slug === expectedSlug
  )
}
