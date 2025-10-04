import React, { useState } from 'react';
import { predictFromImageElement, predictFromImageElementByType } from '@/services/plantModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PredictionResult {
  label: string;
  confidence: number;
}

export function DiseaseDetector() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modelType, setModelType] = useState<'plantdoc' | 'plantvillage' | 'plantnet'>('plantdoc');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setPrediction(null);
    setIsLoading(true);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const img = new Image();
      img.src = url;
      
      img.onload = async () => {
        try {
          const result = await predictFromImageElementByType(modelType, img);
          setPrediction(result);
        } catch (err) {
          setError('Failed to analyze image. Please try again.');
          console.error('Prediction error:', err);
        } finally {
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        setError('Failed to load image. Please try a different file.');
        setIsLoading(false);
      };
    } catch (err) {
      setError('Failed to process image. Please try again.');
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Plant Disease Detection
          </CardTitle>
          <CardDescription>
            Upload an image of a plant leaf to detect potential diseases using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Plant Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-select">Select Model</Label>
            <Select
              value={modelType}
              onValueChange={(v) => setModelType(v as 'plantdoc' | 'plantvillage' | 'plantnet')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plantdoc">PlantDoc</SelectItem>
                <SelectItem value="plantvillage">PlantVillage</SelectItem>
                <SelectItem value="plantnet">PlantNet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Plant preview"
                  className="max-w-full h-auto max-h-64 mx-auto rounded"
                />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Analyzing image...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {prediction && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Detection Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Disease/Condition:</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {prediction.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Confidence:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getConfidenceColor(prediction.confidence)}`}
                        style={{ width: `${prediction.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <Badge
                    variant="secondary"
                    className={getConfidenceColor(prediction.confidence)}
                  >
                    {getConfidenceText(prediction.confidence)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

