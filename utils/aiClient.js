import { Configuration, OpenAIApi } from 'openai';

// 创建 OpenAI 配置
const configuration = new Configuration({
  basePath: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

// 初始化 OpenAI 客户端
const openai = new OpenAIApi(configuration);

/**
 * 调用 AI 进行对话
 * @param {string} prompt - 用户输入的提示词
 * @param {Object} options - 可选配置项
 * @param {string} options.model - 模型名称，默认为 'deepseek-chat'
 * @param {number} options.temperature - 温度参数，控制随机性，默认为 0.7
 * @param {number} options.max_tokens - 最大生成token数，默认为 1000
 * @returns {Promise<string>} AI 的响应文本
 */
export async function chatWithAI(prompt, options = {}) {
  try {
    const response = await openai.createChatCompletion({
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI 调用出错:', error);
    throw new Error('调用 AI 服务时发生错误');
  }
}

/**
 * 使用 AI 生成图片
 * @param {string} prompt - 图片描述
 * @param {Object} options - 可选配置项
 * @returns {Promise<string>} 生成的图片 URL
 */
export async function generateImage(prompt, options = {}) {
  try {
    const response = await openai.createImage({
      prompt,
      n: options.n || 1,
      size: options.size || '512x512',
    });

    return response.data.data[0].url;
  } catch (error) {
    console.error('AI 图片生成出错:', error);
    throw new Error('生成图片时发生错误');
  }
}

/**
 * 调用 AI 获取 JSON 格式的响应
 * @param {string} prompt - 用户输入的提示词
 * @param {string} systemPrompt - 系统提示词，用于指定 JSON 格式
 * @param {Object} options - 可选配置项
 * @returns {Promise<Object>} 返回解析后的 JSON 对象
 */
export async function chatWithAIJson(prompt, systemPrompt, options = {}) {
  try {
    const response = await openai.createChatCompletion({
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
      response_format: {
        type: 'json_object'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('AI JSON 调用出错:', error);
    throw new Error('调用 AI JSON 服务时发生错误');
  }
}

/**
 * 获取菜品食材的系统提示词
 */
export const GET_RECIPE_INGREDIENTS_PROMPT = `
请解析用户的菜品查询，并以JSON格式返回所需的食材列表。

输出格式示例：
{
  "ingredients": [
    {
      "name": "食材名称",
      "quantity": "用量"
    }
  ]
}
`;

// 使用示例：
/*
async function getRecipeIngredients() {
  try {
    const result = await chatWithAIJson(
      "帮我查询制作红烧肉所需的食材列表",
      RECIPE_SYSTEM_PROMPT
    );
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
*/ 