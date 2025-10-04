import * as tf from '@tensorflow/tfjs';

type ModelType = 'plantdoc' | 'plantvillage' | 'plantnet';

let defaultModel: tf.GraphModel | null = null; // kept for backward compat
let defaultLabels: string[] | null = null;     // kept for backward compat
let modelLoadError: string | null = null;

const cache: Record<ModelType, { model: tf.GraphModel; labels: string[] } | undefined> = {
  plantdoc: undefined,
  plantvillage: undefined,
  plantnet: undefined,
};

function getUrls(type: ModelType): { modelUrl: string; labelsUrl: string } {
  const modelUrl = type === 'plantdoc'
    ? import.meta.env.VITE_PLANTDOC_MODEL_URL
    : type === 'plantvillage'
    ? import.meta.env.VITE_PLANTVILLAGE_MODEL_URL
    : import.meta.env.VITE_PLANTNET_MODEL_URL;

  const labelsUrl = type === 'plantdoc'
    ? import.meta.env.VITE_PLANTDOC_LABELS_URL
    : type === 'plantvillage'
    ? import.meta.env.VITE_PLANTVILLAGE_LABELS_URL
    : import.meta.env.VITE_PLANTNET_LABELS_URL;

  if (!modelUrl || !labelsUrl) {
    throw new Error(`Missing env URLs for ${type} model.`);
  }
  return { modelUrl, labelsUrl };
}

export async function loadPlantModel() {
  // Preserve old API: load default to plantdoc
  if (!defaultModel && !modelLoadError) {
    try {
      console.log('Loading plant disease detection model...');
      const modelUrl = import.meta.env.VITE_PLANT_TFJS_MODEL_URL || import.meta.env.VITE_PLANTDOC_MODEL_URL;
      const labelsUrl = import.meta.env.VITE_PLANT_TFJS_LABELS_URL || import.meta.env.VITE_PLANTDOC_LABELS_URL;
      
      if (!modelUrl || !labelsUrl) {
        throw new Error('Model URLs not configured. Please check environment variables.');
      }
      
      console.log('Model URL:', modelUrl);
      console.log('Labels URL:', labelsUrl);
      
      // First, try to load labels to validate the setup (bypass cache)
      const labelsUrlNoCache = `${labelsUrl}${labelsUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
      const res = await fetch(labelsUrlNoCache, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to load labels: ${res.status} ${res.statusText}`);
      }
      
      const labelsText = await res.text();
      defaultLabels = labelsText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      
      if (!labels || labels.length === 0) {
        throw new Error('No labels found in labels file');
      }
      
      console.log('Labels loaded successfully:', defaultLabels.length, 'classes', defaultLabels.slice(0, 5));
      
      // Now try to load the model as a GraphModel with better error handling
      try {
        defaultModel = await tf.loadGraphModel(modelUrl);

        // Validate model structure
        if (!defaultModel || !defaultModel.inputs || defaultModel.inputs.length === 0) {
          throw new Error('Invalid model structure: no inputs found');
        }

        const inputInfo = defaultModel.inputs[0];
        console.log('GraphModel loaded successfully:', {
          inputs: defaultModel.inputs.map(i => ({ name: i.name, shape: i.shape })),
          outputs: defaultModel.outputs.map(o => ({ name: o.name, shape: o.shape })),
          primaryInput: { name: inputInfo.name, shape: inputInfo.shape },
        });

      } catch (modelError) {
        console.error('Model loading failed:', modelError);
        throw new Error(`Failed to load plant disease detection model (graph): ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error loading plant model:', error);
      modelLoadError = error instanceof Error ? error.message : 'Unknown error loading model';
      defaultModel = null;
      defaultLabels = null;
      throw error;
    }
  }
  
  if (modelLoadError) {
    throw new Error(`Model loading failed: ${modelLoadError}`);
  }
}

export async function loadModelByType(type: ModelType): Promise<{ model: tf.GraphModel; labels: string[] }> {
  if (cache[type]) return cache[type]!;

  const { modelUrl, labelsUrl } = getUrls(type);

  // fetch labels no-cache
  const res = await fetch(`${labelsUrl}${labelsUrl.includes('?') ? '&' : '?'}v=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load labels for ${type}: ${res.status}`);
  const labelsText = await res.text();
  const labels = labelsText.split('\n').map(l => l.trim()).filter(Boolean);

  const model = await tf.loadGraphModel(modelUrl);
  if (!model.inputs || model.inputs.length === 0) throw new Error(`Invalid ${type} model: no inputs`);

  cache[type] = { model, labels };
  return cache[type]!;
}

function preprocessImage(img: HTMLImageElement | HTMLCanvasElement) {
  return tf.browser.fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(tf.scalar(255))
    .expandDims(0);
}

export async function predictFromImageElement(imgEl: HTMLImageElement) {
  try {
    if (!defaultModel) {
      await loadPlantModel();
    }
    
    if (!defaultModel || !defaultLabels) {
      throw new Error('Model or labels not loaded');
    }
    
    console.log('Starting image prediction...');
    console.log('Image dimensions:', imgEl.width, 'x', imgEl.height);
    
    const tensor = preprocessImage(imgEl);
    console.log('Preprocessed tensor shape:', tensor.shape);
    
    // Execute graph model. If multiple outputs, use the first.
    const executed = defaultModel.execute(tensor) as tf.Tensor | tf.Tensor[];
    const preds = Array.isArray(executed) ? executed[0] : executed;
    console.log('Prediction tensor shape:', preds.shape);
    
    const scores = Array.from(await preds.data());
    console.log('Prediction scores:', scores);
    
    if (scores.length !== defaultLabels.length) {
      throw new Error(`Score count (${scores.length}) doesn't match label count (${defaultLabels.length})`);
    }
    
    const maxIdx = scores.indexOf(Math.max(...scores));
    const result = { 
      label: defaultLabels[maxIdx], 
      confidence: scores[maxIdx] 
    };
    
    console.log('Prediction result:', result);
    
    // Clean up tensors
    tensor.dispose();
    preds.dispose();
    
    return result;
    
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}

export async function predictFromImageElementByType(type: ModelType, imgEl: HTMLImageElement) {
  const { model, labels } = await loadModelByType(type);

  const tensor = tf.browser.fromPixels(imgEl)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(tf.scalar(255))
    .expandDims(0);

  const executed = model.execute(tensor) as tf.Tensor | tf.Tensor[];
  const preds = Array.isArray(executed) ? executed[0] : executed;
  const scores = Array.from(await preds.data());

  if (scores.length !== labels.length) {
    throw new Error(`[${type}] Score count (${scores.length}) doesn't match labels (${labels.length})`);
  }

  const topIdx = scores.indexOf(Math.max(...scores));
  tensor.dispose();
  preds.dispose();
  return { label: labels[topIdx], confidence: scores[topIdx] };
}
