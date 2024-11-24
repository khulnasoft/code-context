import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callAnthropic(prompt: string, model: string, maxTokens: number = 1000): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    
    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Error from anthropic', error);
    return `Error from anthropic: ${error}`;
  }
}

export async function* chatAnthropic(model: string, messages: Anthropic.MessageParam[]): AsyncGenerator<string, string, unknown> {
  try {
    const stream = await anthropic.messages.stream({
      model: model,
      messages: messages,
      max_tokens: 4096
    })
    
    for await (const event of stream) {
      if (event.type == "content_block_delta") {
        yield event.delta.type=== "text_delta" ? event.delta.text : "";
      }
    }

    const msg = await stream.finalMessage();

    return msg.content[0].type === 'text' ? msg.content[0].text : '';
  } catch (error) {
    console.error('Error from anthropic', error);
    return `Error from anthropic: ${error}`;
  }
}