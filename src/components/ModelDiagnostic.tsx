import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function ModelDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<{
    envVars: boolean;
    modelUrl: boolean;
    labelsUrl: boolean;
    modelLoad: boolean;
    error?: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics(null);

    const results = {
      envVars: false,
      modelUrl: false,
      labelsUrl: false,
      modelLoad: false,
      error: undefined as string | undefined
    };

    try {
      // Check environment variables
      const modelUrl = import.meta.env.VITE_PLANT_TFJS_MODEL_URL;
      const labelsUrl = import.meta.env.VITE_PLANT_TFJS_LABELS_URL;
      
      if (modelUrl && labelsUrl) {
        results.envVars = true;
        console.log('✅ Environment variables configured');
      } else {
        results.error = 'Environment variables not configured';
        setDiagnostics(results);
        setIsRunning(false);
        return;
      }

      // Check model URL accessibility
      try {
        const modelResponse = await fetch(modelUrl, { method: 'HEAD' });
        if (modelResponse.ok) {
          results.modelUrl = true;
          console.log('✅ Model URL accessible');
        } else {
          results.error = `Model URL not accessible: ${modelResponse.status}`;
          setDiagnostics(results);
          setIsRunning(false);
          return;
        }
      } catch (error) {
        results.error = `Model URL error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        setDiagnostics(results);
        setIsRunning(false);
        return;
      }

      // Check labels URL accessibility
      try {
        const labelsResponse = await fetch(labelsUrl);
        if (labelsResponse.ok) {
          const labelsText = await labelsResponse.text();
          const labels = labelsText.trim().split('\n').filter(label => label.trim());
          if (labels.length > 0) {
            results.labelsUrl = true;
            console.log('✅ Labels URL accessible, found', labels.length, 'labels');
          } else {
            results.error = 'Labels file is empty';
            setDiagnostics(results);
            setIsRunning(false);
            return;
          }
        } else {
          results.error = `Labels URL not accessible: ${labelsResponse.status}`;
          setDiagnostics(results);
          setIsRunning(false);
          return;
        }
      } catch (error) {
        results.error = `Labels URL error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        setDiagnostics(results);
        setIsRunning(false);
        return;
      }

      // Try to load the model
      try {
        const tf = await import('@tensorflow/tfjs');
        const model = await tf.loadLayersModel(modelUrl);
        
        if (model && model.inputs && model.inputs.length > 0) {
          results.modelLoad = true;
          console.log('✅ Model loaded successfully');
          console.log('Model inputs:', model.inputs.map(input => input.shape));
        } else {
          results.error = 'Model loaded but has no inputs';
        }
      } catch (error) {
        results.error = `Model loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

    } catch (error) {
      results.error = `Diagnostic error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Plant Disease Detection Model Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This tool will help diagnose issues with the plant disease detection model.
        </p>
        
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {diagnostics && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {getStatusBadge(diagnostics.envVars, "Environment Variables")}
              {getStatusBadge(diagnostics.modelUrl, "Model URL")}
              {getStatusBadge(diagnostics.labelsUrl, "Labels URL")}
              {getStatusBadge(diagnostics.modelLoad, "Model Loading")}
            </div>

            {diagnostics.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {diagnostics.error}
                </AlertDescription>
              </Alert>
            )}

            {diagnostics.modelLoad && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All diagnostics passed! The plant disease detection model should be working correctly.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Environment Variables:</strong></p>
          <p>Model URL: {import.meta.env.VITE_PLANT_TFJS_MODEL_URL || 'Not set'}</p>
          <p>Labels URL: {import.meta.env.VITE_PLANT_TFJS_LABELS_URL || 'Not set'}</p>
        </div>
      </CardContent>
    </Card>
  );
}







