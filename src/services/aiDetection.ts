import { type DetectionResult, type TextCharacteristics } from '../types/detection';
import { processApiResponse } from '../utils/responseProcessor';
import { GROQ_CONFIG } from '../config/groq';
import { OPENAI_CONFIG } from '../config/openai';
import { ApiError, getErrorMessage } from '../utils/errorHandler';
import { API_PROVIDERS, CURRENT_PROVIDER } from '../config/api';
import { analyzeTextCharacteristics } from './textAnalysis';


const API_KEY = import.meta.env.VITE_AI_DETECTION_API_KEY;

export async function analyzeText(text: string): Promise<DetectionResult> {
  if (!text.trim()) {
    throw new ApiError('Please provide text to analyze');
  }

  if (!API_KEY) {
    throw new ApiError('API key is not configured');
  }

  try {
    const characteristics = analyzeTextCharacteristics(text);
    const config = CURRENT_PROVIDER === API_PROVIDERS.GROQ ? GROQ_CONFIG : OPENAI_CONFIG;
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: config.systemPrompt
          },
          {
            role: 'user',
            content: `Analyze this text, considering these characteristics:
- Contains historical language: ${characteristics.hasHistoricalLanguage}
- Has complex metaphors: ${characteristics.hasComplexMetaphors}
- Shows emotional depth: ${characteristics.hasEmotionalDepth}
- Has irregular structure: ${characteristics.hasIrregularStructure}
- Contains unique imagery: ${characteristics.hasUniqueImagery}
- Uses modern language: ${characteristics.isModernLanguage}
- Has conversational tone: ${characteristics.hasConversationalTone}

Text to analyze:
${text}`
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new ApiError(
        errorData.error?.message || `API error: ${response.status}`,
        errorData.error?.code,
        response.status
      );
    }

    const data = await response.json();
    return processApiResponse(data);
  } catch (error) {
    console.error('AI Detection error:', error);
    throw new ApiError(getErrorMessage(error));
  }
}