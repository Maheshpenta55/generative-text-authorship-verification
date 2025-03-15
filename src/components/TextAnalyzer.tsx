import React, { useState } from 'react';
import { Brain, User, AlertCircle, Loader2 } from 'lucide-react';
import { analyzeText } from '../services/aiDetection';
import type { DetectionResult } from '../types/detection';
import { isQuotaError } from '../utils/errorHandler';

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeText(text);
      setResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify text';
      setError(message);
      setResult(null);
      
      if (isQuotaError(err)) {
        setError('API quota exceeded. Please try again later or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--neon-primary)] neon-glow">Text Analysis</h2>
        <p className="text-gray-300">
          Paste your text below to verify whether it was written by AI or a human.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-48 p-4 bg-gray-900 border border-gray-700 rounded-lg 
                 focus:ring-2 focus:ring-[var(--neon-primary)] focus:border-transparent 
                 resize-none text-white placeholder-gray-500 transition-all duration-300"
        placeholder="Enter text to verify..."
      />

      <button
        onClick={handleAnalysis}
        disabled={!text.trim() || loading}
        className="w-full py-3 px-4 neon-border bg-gray-900 text-[var(--neon-primary)] 
                 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed 
                 flex items-center justify-center gap-2 transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5" />
            Verify Text
          </>
        )}
      </button>

      {error && (
        <div className="glass-morphism p-4 rounded-lg flex items-start gap-3 border border-red-500/50">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400">{error}</p>
            {isQuotaError(new Error(error)) && (
              <p className="text-sm text-red-400/80 mt-2">
                The API quota has been exceeded. Please try again later or contact support for assistance.
              </p>
            )}
          </div>
        </div>
      )}

      {result && !loading && (
        <div className={`glass-morphism p-6 rounded-lg neon-border ${
          result.isAI ? 'border-purple-500/50' : 'border-emerald-500/50'
        }`}>
          <div className="flex items-start gap-4">
            {result.isAI ? (
              <Brain className="w-6 h-6 text-purple-400" />
            ) : (
              <User className="w-6 h-6 text-emerald-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {result.isAI ? 'AI-Generated Content Detected' : 'Likely Human-Written Content'}
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Confidence: {result.confidence.toFixed(1)}%
              </p>
              {result.details && (
                <p className="text-sm text-gray-400 mt-2">{result.details}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
