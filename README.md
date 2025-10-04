# 🌱 SmartAgri - Smart Soil Soothsayer

[![GitHub](https://img.shields.io/badge/GitHub-SmartAgri-blue)](https://github.com/newtp2350-lab/SmartAgri)
[![React](https://img.shields.io/badge/React-18.0+-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-green)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-blue)](https://tailwindcss.com/)

## 🚀 Overview

SmartAgri is an intelligent agricultural platform that combines AI-powered plant disease detection, soil analysis, weather forecasting, and market insights to help farmers make data-driven decisions. The platform features multiple disease detection models and provides comprehensive agricultural recommendations.

## ✨ Key Features

### 🔬 AI-Powered Disease Detection
- **Multi-Model Support**: PlantDoc, PlantVillage, and PlantNet models
- **Real-time Analysis**: Instant disease detection from plant images
- **Confidence Scoring**: AI confidence levels for accurate diagnosis
- **Browser-based Processing**: No data leaves your device

### 🌍 Smart Soil Analysis
- **SoilGrids Integration**: Global soil data analysis
- **pH & Nutrient Analysis**: Comprehensive soil health assessment
- **Texture Analysis**: Sand, silt, and clay composition
- **Organic Carbon Content**: Soil fertility indicators

### 🌤️ Weather Intelligence
- **Real-time Weather**: Current conditions and forecasts
- **Location-based**: GPS-enabled weather data
- **Agricultural Alerts**: Weather warnings for farming activities

### 📊 Market Insights
- **Price Tracking**: Real-time crop prices from Agmarknet
- **Market Analysis**: Historical price trends
- **Regional Data**: Location-specific market information

### 💬 AI Chat Assistant
- **Contextual Advice**: Location and weather-aware recommendations
- **Multi-language Support**: Local language assistance
- **Voice Input**: Speech-to-text capabilities
- **Image Analysis**: Upload images for instant analysis

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **shadcn/ui** component library
- **TensorFlow.js** for client-side AI models

### Backend Services
- **Supabase** for database and authentication
- **OpenRouter API** for AI chat functionality
- **Weather API** for meteorological data
- **SoilGrids API** for soil analysis
- **Agmarknet API** for market prices

### AI Models
- **PlantDoc**: Plant disease detection
- **PlantVillage**: Alternative disease classification
- **PlantNet**: Plant identification and disease detection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/newtp2350-lab/SmartAgri.git
   cd SmartAgri
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```bash
   # Database
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # APIs
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key
   VITE_OPENCAGE_API_KEY=your_opencage_api_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   VITE_AGMARKNET_BASE_URL=https://api.example.com/agmarknet
   
   # Plant Disease Detection Models
   VITE_PLANTDOC_MODEL_URL=your_plantdoc_model_url
   VITE_PLANTDOC_LABELS_URL=your_plantdoc_labels_url
   VITE_PLANTVILLAGE_MODEL_URL=your_plantvillage_model_url
   VITE_PLANTVILLAGE_LABELS_URL=your_plantvillage_labels_url
   VITE_PLANTNET_MODEL_URL=your_plantnet_model_url
   VITE_PLANTNET_LABELS_URL=your_plantnet_labels_url
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5173`

## 📱 Features in Detail

### Disease Detection
- Upload plant images for instant AI analysis
- Choose between three different AI models
- Get confidence scores and detailed results
- Browser-based processing ensures privacy

### Soil Analysis
- Enter location coordinates for soil data
- Get comprehensive soil health reports
- pH, organic carbon, and texture analysis
- Agricultural suitability recommendations

### Weather Dashboard
- Real-time weather conditions
- 7-day weather forecasts
- Agricultural weather alerts
- Location-based weather data

### Market Intelligence
- Live crop prices from government sources
- Historical price trends
- Regional market analysis
- Price comparison tools

### AI Chat Assistant
- Context-aware agricultural advice
- Multi-language support
- Voice input capabilities
- Image analysis integration

## 🏗️ Project Structure

```
SmartAgri/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── DiseaseDetector.tsx
│   │   ├── ChatInterface.tsx
│   │   └── ...
│   ├── pages/              # Application pages
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── integrations/       # Third-party integrations
├── public/                  # Static assets
├── server/                  # Backend services
└── supabase/               # Database schema
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment
1. Run `npm run build`
2. Upload `dist` folder to your hosting provider
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PlantDoc Dataset** for disease detection models
- **PlantVillage** for agricultural image datasets
- **PlantNet** for plant identification capabilities
- **SoilGrids** for global soil data
- **Agmarknet** for market price data
- **OpenWeather** for weather data
- **Supabase** for backend infrastructure

## 📞 Support

For support, email support@smartagri.com or create an issue on GitHub.

## 🔮 Future Roadmap

- [ ] Mobile app development
- [ ] IoT sensor integration
- [ ] Drone image analysis
- [ ] Blockchain-based crop certification
- [ ] Advanced ML model training
- [ ] Multi-language support expansion
- [ ] Offline functionality
- [ ] Farmer community features

---

**Built with ❤️ for the agricultural community**