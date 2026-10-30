/**
 * Parses an OpenAI-compatible server-sent-events response and yields each
 * content delta as it arrives.
 */
export async function* readStream(response: Response): AsyncGenerator<string> {
  if (!response.body) {
    throw new Error('Response has no body to stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Events are separated by newlines; keep any partial line for the next chunk
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const delta = parseLine(line);
        if (delta === null) return;
        if (delta) yield delta;
      }
    }

    // Flush a final line that had no trailing newline
    const delta = parseLine(buffer);
    if (delta) yield delta;
  } finally {
    reader.releaseLock();
  }
}

// Returns the content delta, '' for lines to skip, or null once the stream is finished
function parseLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return '';

  const payload = trimmed.slice(5).trim();
  if (payload === '[DONE]') return null;

  try {
    const content = JSON.parse(payload).choices?.[0]?.delta?.content;
    return typeof content === 'string' ? content : '';
  } catch {
    // Ignore keep-alives and malformed events
    return '';
  }
}
