// OpenRouter Chat Service — replaces Gemini Live Audio
// Uses OpenRouter's OpenAI-compatible API for text-based analyst chat

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `You are a professional NBA analyst specializing in the Toronto Raptors.
You have deep knowledge of basketball statistics, player matchups, and team strategies.
Keep your answers concise, energetic, and focused on helping the user analyze the game.
If asked about stats, give specific numbers.`;

export class ChatSessionManager {
    private messages: ChatMessage[] = [];
    private abortController: AbortController | null = null;

    constructor() {
        this.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    }

    async sendMessage(
        userMessage: string,
        onChunk: (text: string) => void
    ): Promise<string> {
        this.messages.push({ role: 'user', content: userMessage });

        this.abortController = new AbortController();

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Raptors Intel',
            },
            body: JSON.stringify({
                model: 'anthropic/claude-sonnet-4',
                messages: this.messages,
                stream: true,
            }),
            signal: this.abortController.signal,
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${err}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
                const data = line.slice(6);
                if (data === '[DONE]') break;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        fullResponse += content;
                        onChunk(content);
                    }
                } catch {
                    // skip malformed chunks
                }
            }
        }

        this.messages.push({ role: 'assistant', content: fullResponse });
        return fullResponse;
    }

    disconnect() {
        this.abortController?.abort();
        this.abortController = null;
    }
}
