import OpenAI from 'openai';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * 调用 AI 进行对话
 */
export async function chatWithAI(prompt, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI 调用出错:', error);
    throw new Error('调用 AI 服务时发生错误');
  }
}

/**
 * 调用 AI 获取 JSON 格式的响应
 */
export async function chatWithAIJson(prompt, systemPrompt, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI JSON 调用出错:', error);
    throw new Error('调用 AI JSON 服务时发生错误');
  }
}