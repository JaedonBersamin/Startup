export async function generateRepairGuide(threadId: string, deviceId: string): Promise<string> {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: `Generate a repair guide for device ${deviceId} based on repair thread ${threadId}.`,
                parameters: { max_new_tokens: 512 },
            }),
        }
    )

    const data = await response.json()
    return Array.isArray(data) ? (data[0]?.generated_text ?? "") : ""
}
