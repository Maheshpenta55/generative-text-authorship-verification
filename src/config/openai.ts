export const OPENAI_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 200,
  systemPrompt: 'You are an AI detection expert. Analyze the given text and determine if it was written by AI or a human. Start your response with either "AI-GENERATED" or "HUMAN-WRITTEN", followed by a confidence score (0-100), then provide a detailed explanation.'
} as const;
