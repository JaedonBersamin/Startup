export default async function ThreadPage({
    params,
}: {
    params: Promise<{ slug: string; threadId: string }>
}) {
    const { slug, threadId } = await params
    return (
        <main>
            <p>Device: {slug}</p>
            <p>Thread: {threadId}</p>
            <p>Thread detail page — coming soon.</p>
        </main>
    )
}
