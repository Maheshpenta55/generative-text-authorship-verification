import { type ApiResponse, type DetectionResult } from '../types/detection';

export function processApiResponse(response: ApiResponse): DetectionResult {
  if (!response.choices?.[0]?.message?.content) {
    throw new Error('Invalid API response format');
  }

  const content = response.choices[0].message.content.trim();
  console.log('Raw API response:', content);

  // Extract classification and confidence
  const aiMatch = content.match(/^AI-GENERATED\s+(\d{1,3})%/i);
  const humanMatch = content.match(/^HUMAN-WRITTEN\s+(\d{1,3})%/i);
  
  if (!aiMatch && !humanMatch) {
    console.error('Invalid classification format:', content);
    throw new Error('Invalid response format: Missing classification');
  }

  const isAI = !!aiMatch;
  const confidence = parseInt(aiMatch?.[1] || humanMatch?.[1] || '0', 10);
  
  // Get explanation (everything after the first line)
  const details = content.split('\n').slice(1).join('\n').trim();

  const result = {
    isAI,
    confidence: Math.min(Math.max(confidence, 0), 100),
    details: details || 'Analysis details not provided'
  };

  console.log('Processed detection result:', result);
  return result;
}