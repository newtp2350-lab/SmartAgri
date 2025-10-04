import { DiseaseDetector } from '@/components/DiseaseDetector';

export default function DiseaseDetection() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Plant Disease Detection
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload an image of a plant leaf to get instant AI-powered disease detection. 
          Our model can identify various plant diseases and provide confidence scores.
        </p>
      </div>
      
      <DiseaseDetector />
      
      <div className="mt-12 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p>Upload a clear image of a plant leaf</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p>AI model analyzes the image locally in your browser</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <p>Get instant results with confidence scores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
