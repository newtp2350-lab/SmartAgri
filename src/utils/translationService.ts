// Translation service using LibreTranslate API with CORS proxy
interface TranslationRequest {
  q: string;
  source: string;
  target: string;
  format: string;
}

interface TranslationResponse {
  translatedText: string;
}

// In-memory cache for translations
const translationCache = new Map<string, string>();

// Language codes mapping
export const LANGUAGE_CODES = {
  en: 'English',
  ml: 'Malayalam',
  pa: 'Punjabi',
  hi: 'Hindi',
  gu: 'Gujarati'
} as const;

export type LanguageCode = keyof typeof LANGUAGE_CODES;

// Fallback translations for common UI text
const FALLBACK_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {},
  ml: {
    "Settings & Profile": "ക്രമീകരണങ്ങളും പ്രൊഫൈലും",
    "Manage your account, farm details, and application preferences": "നിങ്ങളുടെ അക്കൗണ്ട്, കൃഷി വിശദാംശങ്ങൾ, ആപ്ലിക്കേഷൻ മുൻഗണനകൾ നിയന്ത്രിക്കുക",
    "Profile": "പ്രൊഫൈൽ",
    "Farm Details": "കൃഷി വിശദാംശങ്ങൾ",
    "Notifications": "അറിയിപ്പുകൾ",
    "Language": "ഭാഷ",
    "Data & Privacy": "ഡാറ്റയും സ്വകാര്യതയും",
    "Welcome to SmartAgri Advisor": "SmartAgri Advisor-ലേക്ക് സ്വാഗതം",
    "Your AI-powered farming companion for better crop decisions": "മികച്ച വിള തീരുമാനങ്ങൾക്കായി നിങ്ങളുടെ AI-പവർഡ് കൃഷി കൂട്ടാളി",
    "Chat": "ചാറ്റ്",
    "Advanced": "അഡ്വാൻസ്ഡ്",
    "Ask me anything about farming, weather, soil, or crops...": "കൃഷി, കാലാവസ്ഥ, മണ്ണ് അല്ലെങ്കിൽ വിളകളെക്കുറിച്ച് എന്തും ചോദിക്കുക...",
    "Send": "അയയ്ക്കുക",
    "Chat History": "ചാറ്റ് ചരിത്രം",
    "Save Language Settings": "ഭാഷാ ക്രമീകരണങ്ങൾ സേവ് ചെയ്യുക",
    "Saving...": "സേവ് ചെയ്യുന്നു...",
    "Display Language": "പ്രദർശന ഭാഷ",
    "Region/Timezone": "പ്രദേശം/സമയ മേഖല",
    "Currency": "കറൻസി",
    "Units": "യൂണിറ്റുകൾ",
    "Voice Assistance": "വോയ്സ് അസിസ്റ്റൻസ്",
    "Enable voice commands and responses": "വോയ്സ് കമാൻഡുകളും പ്രതികരണങ്ങളും പ്രവർത്തനക്ഷമമാക്കുക",
    "Homepage": "ഹോംപേജ്",
    "Weather": "കാലാവസ്ഥ",
    "Soil Insights": "മണ്ണ് ഇൻസൈറ്റ്സ്",
    "Market": "മാർക്കറ്റ്",
    "Farm History": "കൃഷി ചരിത്രം",
    "Alerts": "അലേർട്ടുകൾ",
    "Community": "കമ്മ്യൂണിറ്റി",
    "Settings": "ക്രമീകരണങ്ങൾ",
    "Logout": "ലോഗൗട്ട്",
    "Weather Analytics": "കാലാവസ്ഥ വിശകലനം",
    "Current and forecasted weather patterns for your location": "നിങ്ങളുടെ സ്ഥാനത്തിനായുള്ള നിലവിലെയും പ്രവചിച്ച കാലാവസ്ഥ പാറ്റേണുകൾ",
    "Soil Insights": "മണ്ണ് ഇൻസൈറ്റ്സ്",
    "Detailed soil analysis and health recommendations for your farm": "നിങ്ങളുടെ കൃഷിയിടത്തിനായുള്ള വിശദമായ മണ്ണ് വിശകലനവും ആരോഗ്യ ശുപാർശകളും",
    "Temperature": "താപനില",
    "Humidity": "ആർദ്രത",
    "Wind Speed": "കാറ്റിന്റെ വേഗത",
    "Visibility": "ദൃശ്യത",
    "Pressure": "മർദ്ദം",
    "Feels like": "അനുഭവപ്പെടുന്നത്",
    "Last updated": "അവസാനം അപ്ഡേറ്റ് ചെയ്തത്",
    "Refresh": "പുതുക്കുക",
    "Export Report": "റിപ്പോർട്ട് എക്സ്പോർട്ട് ചെയ്യുക",
    "24-Hour Forecast": "24 മണിക്കൂർ പ്രവചനം",
    "5-Day Forecast": "5 ദിവസ പ്രവചനം",
    "Crop Impact": "വിള ഇമ്പാക്റ്റ്",
    "Temperature & Humidity (24 Hours)": "താപനിലയും ആർദ്രതയും (24 മണിക്കൂർ)",
    "Precipitation Probability (24 Hours)": "വർഷപാത സാധ്യത (24 മണിക്കൂർ)",
    "Overall Soil Health Score": "മൊത്തം മണ്ണ് ആരോഗ്യ സ്കോർ",
    "Good": "നല്ലത്",
    "Based on pH level, organic carbon, and soil texture analysis": "pH ലെവൽ, ഓർഗാനിക് കാർബൺ, മണ്ണ് ടെക്സ്ചർ വിശകലനത്തിന്റെ അടിസ്ഥാനത്തിൽ",
    "pH Level": "pH ലെവൽ",
    "Neutral": "നിഷ്പക്ഷം",
    "Organic Carbon": "ഓർഗാനിക് കാർബൺ",
    "Sand Content": "മണൽ ഉള്ളടക്കം",
    "Sand": "മണൽ",
    "Soil Texture": "മണ്ണ് ടെക്സ്ചർ",
    "Sandy Clay Loam": "സാൻഡി ക്ലേ ലോം",
    "Soil Data Summary": "മണ്ണ് ഡാറ്റ സംഗ്രഹം",
    "Nutrient Analysis": "പോഷക വിശകലനം",
    "Fertilizer Tips": "വള ടിപ്പുകൾ",
    "Crop Suitability": "വിള അനുയോജ്യത",
    "Trends": "ട്രെൻഡുകൾ",
    "Nutrient Profile": "പോഷക പ്രൊഫൈൽ",
    "Detailed Breakdown": "വിശദമായ വിഭജനം",
    "Refresh Data": "ഡാറ്റ പുതുക്കുക",
    "Export Analysis": "വിശകലനം എക്സ്പോർട്ട് ചെയ്യുക",
    "Market Analytics": "മാർക്കറ്റ് വിശകലനം",
    "Real-time crop prices, trends, and profitability analysis for your location": "നിങ്ങളുടെ സ്ഥാനത്തിനായുള്ള റിയൽ-ടൈം വിള വിലകൾ, ട്രെൻഡുകൾ, ലാഭകരത വിശകലനം",
    "Avg Market Price": "ശരാശരി മാർക്കറ്റ് വില",
    "Best Crop to Plant": "നടാനുള്ള മികച്ച വിള",
    "Total Volume": "മൊത്തം വോളിയം",
    "Active Markets": "സജീവ മാർക്കറ്റുകൾ",
    "Live Market Prices - Sorted by Best to Plant": "ലൈവ് മാർക്കറ്റ് വിലകൾ - നടാനുള്ള മികച്ചതിന് അനുസരിച്ച് അടുക്കിയത്",
    "Crops are ranked by suitability score based on your location's soil, weather, and market conditions": "നിങ്ങളുടെ സ്ഥാനത്തിന്റെ മണ്ണ്, കാലാവസ്ഥ, മാർക്കറ്റ് അവസ്ഥകളുടെ അടിസ്ഥാനത്തിൽ വിളകൾ അനുയോജ്യത സ്കോറിന് അനുസരിച്ച് റാങ്ക് ചെയ്യുന്നു",
    "Location": "സ്ഥാനം",
    "Market": "മാർക്കറ്റ്",
    "Suitability Score": "അനുയോജ്യത സ്കോർ",
    "Volume": "വോളിയം",
    "Price": "വില",
    "Range": "പരിധി",
    "Best Choice": "മികച്ച തിരഞ്ഞെടുപ്പ്",
    "tons traded today": "ഇന്ന് വ്യാപാരം ചെയ്ത ടൺ",
    "mandis reporting": "മണ്ഡികൾ റിപ്പോർട്ട് ചെയ്യുന്നു",
    "Farm History & Analytics": "കൃഷി ചരിത്രം & വിശകലനം",
    "Track your farming activities, yields, and performance over time": "നിങ്ങളുടെ കൃഷി പ്രവർത്തനങ്ങൾ, വിളവ്, സമയത്തിനനുസരിച്ച് പ്രകടനം ട്രാക്ക് ചെയ്യുക",
    "Export Report": "റിപ്പോർട്ട് എക്സ്പോർട്ട് ചെയ്യുക",
    "Community Hub": "കമ്മ്യൂണിറ്റി ഹബ്",
    "Connect with fellow farmers, share knowledge, and learn from experts": "സഹ കർഷകരുമായി ബന്ധപ്പെടുക, അറിവ് പങ്കിടുക, വിദഗ്ധരിൽ നിന്ന് പഠിക്കുക",
    "Ask Question": "ചോദ്യം ചോദിക്കുക",
    "Active Members": "സജീവ അംഗങ്ങൾ",
    "Questions Answered": "ഉത്തരം നൽകിയ ചോദ്യങ്ങൾ",
    "Expert Articles": "വിദഗ്ധ ലേഖനങ്ങൾ",
    "Success Stories": "വിജയ കഥകൾ",
    "Discussions": "ചർച്ചകൾ",
    "Knowledge Base": "അറിവ് ബേസ്",
    "Expert Network": "വിദഗ്ധ നെറ്റ്‌വർക്ക്",
    "Search discussions...": "ചർച്ചകൾ തിരയുക...",
    "Filter by Tags": "ടാഗുകൾ അനുസരിച്ച് ഫിൽട്ടർ ചെയ്യുക",
    "Advanced Search": "വിപുലമായ തിരയൽ",
    "Coming Soon": "ഉടൻ വരുന്നു",
    "Community features are being developed. Stay tuned for updates!": "കമ്മ്യൂണിറ്റി സവിശേഷതകൾ വികസിപ്പിക്കുന്നു. അപ്ഡേറ്റുകൾക്കായി കാത്തിരിക്കുക!"
  },
  pa: {
    "Settings & Profile": "ਸੈਟਿੰਗਾਂ ਅਤੇ ਪ੍ਰੋਫਾਈਲ",
    "Manage your account, farm details, and application preferences": "ਆਪਣੇ ਖਾਤੇ, ਖੇਤ ਦੇ ਵਿਸਥਾਰ, ਅਤੇ ਐਪਲੀਕੇਸ਼ਨ ਪਸੰਦਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
    "Profile": "ਪ੍ਰੋਫਾਈਲ",
    "Farm Details": "ਖੇਤ ਦੇ ਵਿਸਥਾਰ",
    "Notifications": "ਸੂਚਨਾਵਾਂ",
    "Language": "ਭਾਸ਼ਾ",
    "Data & Privacy": "ਡੇਟਾ ਅਤੇ ਪ੍ਰਾਈਵੇਸੀ",
    "Welcome to SmartAgri Advisor": "SmartAgri Advisor ਵਿੱਚ ਸਵਾਗਤ ਹੈ",
    "Your AI-powered farming companion for better crop decisions": "ਬਿਹਤਰ ਫਸਲ ਦੇ ਫੈਸਲਿਆਂ ਲਈ ਤੁਹਾਡਾ AI-ਸੰਚਾਲਿਤ ਖੇਤੀ ਸਾਥੀ",
    "Chat": "ਚੈਟ",
    "Advanced": "ਐਡਵਾਂਸਡ",
    "Ask me anything about farming, weather, soil, or crops...": "ਖੇਤੀ, ਮੌਸਮ, ਮਿੱਟੀ, ਜਾਂ ਫਸਲਾਂ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ...",
    "Send": "ਭੇਜੋ",
    "Chat History": "ਚੈਟ ਇਤਿਹਾਸ",
    "Save Language Settings": "ਭਾਸ਼ਾ ਸੈਟਿੰਗਾਂ ਸੇਵ ਕਰੋ",
    "Saving...": "ਸੇਵ ਕਰ ਰਿਹਾ ਹੈ...",
    "Display Language": "ਡਿਸਪਲੇ ਭਾਸ਼ਾ",
    "Region/Timezone": "ਖੇਤਰ/ਸਮਾਂ ਜ਼ੋਨ",
    "Currency": "ਮੁਦਰਾ",
    "Units": "ਯੂਨਿਟ",
    "Voice Assistance": "ਵੌਇਸ ਸਹਾਇਤਾ",
    "Enable voice commands and responses": "ਵੌਇਸ ਕਮਾਂਡ ਅਤੇ ਜਵਾਬ ਸਮਰੱਥ ਕਰੋ",
    "Homepage": "ਹੋਮਪੇਜ",
    "Weather": "ਮੌਸਮ",
    "Soil Insights": "ਮਿੱਟੀ ਇੰਸਾਈਟਸ",
    "Market": "ਮਾਰਕੀਟ",
    "Farm History": "ਖੇਤ ਇਤਿਹਾਸ",
    "Alerts": "ਅਲਰਟ",
    "Community": "ਕਮਿਊਨਿਟੀ",
    "Settings": "ਸੈਟਿੰਗਾਂ",
    "Logout": "ਲੌਗ ਆਉਟ",
    "Weather Analytics": "ਮੌਸਮ ਵਿਸ਼ਲੇਸ਼ਣ",
    "Current and forecasted weather patterns for your location": "ਤੁਹਾਡੇ ਸਥਾਨ ਲਈ ਮੌਜੂਦਾ ਅਤੇ ਪੂਰਵਾਨੁਮਾਨ ਮੌਸਮ ਪੈਟਰਨ",
    "Soil Insights": "ਮਿੱਟੀ ਇੰਸਾਈਟਸ",
    "Detailed soil analysis and health recommendations for your farm": "ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਵਿਸਤ੍ਰਿਤ ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਸਿਹਤ ਸਿਫਾਰਸ਼ਾਂ",
    "Temperature": "ਤਾਪਮਾਨ",
    "Humidity": "ਨਮੀ",
    "Wind Speed": "ਹਵਾ ਦੀ ਗਤੀ",
    "Visibility": "ਦ੍ਰਿਸ਼ਟੀ",
    "Pressure": "ਦਬਾਅ",
    "Feels like": "ਲੱਗਦਾ ਹੈ",
    "Last updated": "ਆਖਰੀ ਅਪਡੇਟ",
    "Refresh": "ਤਾਜ਼ਾ ਕਰੋ",
    "Export Report": "ਰਿਪੋਰਟ ਐਕਸਪੋਰਟ ਕਰੋ",
    "24-Hour Forecast": "24 ਘੰਟੇ ਦਾ ਪੂਰਵਾਨੁਮਾਨ",
    "5-Day Forecast": "5 ਦਿਨ ਦਾ ਪੂਰਵਾਨੁਮਾਨ",
    "Crop Impact": "ਫਸਲ ਪ੍ਰਭਾਵ",
    "Temperature & Humidity (24 Hours)": "ਤਾਪਮਾਨ ਅਤੇ ਨਮੀ (24 ਘੰਟੇ)",
    "Precipitation Probability (24 Hours)": "ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ (24 ਘੰਟੇ)",
    "Overall Soil Health Score": "ਕੁੱਲ ਮਿੱਟੀ ਸਿਹਤ ਸਕੋਰ",
    "Good": "ਚੰਗਾ",
    "Based on pH level, organic carbon, and soil texture analysis": "pH ਲੈਵਲ, ਆਰਗੈਨਿਕ ਕਾਰਬਨ, ਅਤੇ ਮਿੱਟੀ ਟੈਕਸਚਰ ਵਿਸ਼ਲੇਸ਼ਣ ਦੇ ਅਧਾਰ 'ਤੇ",
    "pH Level": "pH ਲੈਵਲ",
    "Neutral": "ਨਿਰਪੱਖ",
    "Organic Carbon": "ਆਰਗੈਨਿਕ ਕਾਰਬਨ",
    "Sand Content": "ਰੇਤ ਸਮੱਗਰੀ",
    "Sand": "ਰੇਤ",
    "Soil Texture": "ਮਿੱਟੀ ਟੈਕਸਚਰ",
    "Sandy Clay Loam": "ਸੈਂਡੀ ਕਲੇ ਲੋਮ",
    "Soil Data Summary": "ਮਿੱਟੀ ਡੇਟਾ ਸੰਖੇਪ",
    "Nutrient Analysis": "ਪੋਸ਼ਕ ਤੱਤ ਵਿਸ਼ਲੇਸ਼ਣ",
    "Fertilizer Tips": "ਖਾਦ ਸੁਝਾਅ",
    "Crop Suitability": "ਫਸਲ ਯੋਗਤਾ",
    "Trends": "ਰੁਝਾਨ",
    "Nutrient Profile": "ਪੋਸ਼ਕ ਤੱਤ ਪ੍ਰੋਫਾਈਲ",
    "Detailed Breakdown": "ਵਿਸਤ੍ਰਿਤ ਵਿਭਾਜਨ",
    "Refresh Data": "ਡੇਟਾ ਤਾਜ਼ਾ ਕਰੋ",
    "Export Analysis": "ਵਿਸ਼ਲੇਸ਼ਣ ਨਿਰਯਾਤ ਕਰੋ",
    "Market Analytics": "ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ",
    "Real-time crop prices, trends, and profitability analysis for your location": "ਤੁਹਾਡੇ ਸਥਾਨ ਲਈ ਰੀਅਲ-ਟਾਈਮ ਫਸਲ ਵਿਕਰੀ, ਰੁਝਾਨ, ਅਤੇ ਲਾਭਕਾਰੀ ਵਿਸ਼ਲੇਸ਼ਣ",
    "Avg Market Price": "ਔਸਤ ਮਾਰਕੀਟ ਕੀਮਤ",
    "Best Crop to Plant": "ਬੀਜਣ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲ",
    "Total Volume": "ਕੁੱਲ ਵਾਲੀਅਮ",
    "Active Markets": "ਸਰਗਰਮ ਮਾਰਕੀਟ",
    "Live Market Prices - Sorted by Best to Plant": "ਲਾਈਵ ਮਾਰਕੀਟ ਕੀਮਤਾਂ - ਬੀਜਣ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਦੇ ਅਨੁਸਾਰ ਕ੍ਰਮਬੱਧ",
    "Crops are ranked by suitability score based on your location's soil, weather, and market conditions": "ਤੁਹਾਡੇ ਸਥਾਨ ਦੀ ਮਿੱਟੀ, ਮੌਸਮ, ਅਤੇ ਮਾਰਕੀਟ ਹਾਲਤਾਂ ਦੇ ਅਧਾਰ 'ਤੇ ਫਸਲਾਂ ਨੂੰ ਯੋਗਤਾ ਸਕੋਰ ਦੇ ਅਨੁਸਾਰ ਰੈਂਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ",
    "Location": "ਸਥਾਨ",
    "Market": "ਮਾਰਕੀਟ",
    "Suitability Score": "ਯੋਗਤਾ ਸਕੋਰ",
    "Volume": "ਵਾਲੀਅਮ",
    "Price": "ਕੀਮਤ",
    "Range": "ਰੇਂਜ",
    "Best Choice": "ਸਭ ਤੋਂ ਵਧੀਆ ਚੋਣ",
    "tons traded today": "ਅੱਜ ਵਪਾਰ ਕੀਤੇ ਟਨ",
    "mandis reporting": "ਮੰਡੀਆਂ ਰਿਪੋਰਟਿੰਗ",
    "Farm History & Analytics": "ਖੇਤ ਇਤਿਹਾਸ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ",
    "Track your farming activities, yields, and performance over time": "ਆਪਣੀਆਂ ਖੇਤੀ ਗਤੀਵਿਧੀਆਂ, ਫਸਲਾਂ, ਅਤੇ ਸਮੇਂ ਦੇ ਨਾਲ ਪ੍ਰਦਰਸ਼ਨ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ",
    "Export Report": "ਰਿਪੋਰਟ ਐਕਸਪੋਰਟ ਕਰੋ",
    "Community Hub": "ਕਮਿਊਨਿਟੀ ਹੱਬ",
    "Connect with fellow farmers, share knowledge, and learn from experts": "ਸਾਥੀ ਕਿਸਾਨਾਂ ਨਾਲ ਜੁੜੋ, ਗਿਆਨ ਸਾਂਝਾ ਕਰੋ, ਅਤੇ ਮਾਹਿਰਾਂ ਤੋਂ ਸਿੱਖੋ",
    "Ask Question": "ਸਵਾਲ ਪੁੱਛੋ",
    "Active Members": "ਸਰਗਰਮ ਮੈਂਬਰ",
    "Questions Answered": "ਜਵਾਬ ਦਿੱਤੇ ਗਏ ਸਵਾਲ",
    "Expert Articles": "ਮਾਹਿਰ ਲੇਖ",
    "Success Stories": "ਸਫਲਤਾ ਦੀਆਂ ਕਹਾਣੀਆਂ",
    "Discussions": "ਚਰਚਾਵਾਂ",
    "Knowledge Base": "ਗਿਆਨ ਬੇਸ",
    "Expert Network": "ਮਾਹਿਰ ਨੈੱਟਵਰਕ",
    "Search discussions...": "ਚਰਚਾਵਾਂ ਖੋਜੋ...",
    "Filter by Tags": "ਟੈਗਾਂ ਦੁਆਰਾ ਫਿਲਟਰ ਕਰੋ",
    "Advanced Search": "ਵਿਸ਼ੇਸ਼ ਖੋਜ",
    "Coming Soon": "ਜਲਦੀ ਆ ਰਿਹਾ",
    "Community features are being developed. Stay tuned for updates!": "ਕਮਿਊਨਿਟੀ ਫੀਚਰ ਵਿਕਸਿਤ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ। ਅਪਡੇਟਾਂ ਲਈ ਬਣੇ ਰਹੋ!"
  },
  hi: {
    "Settings & Profile": "सेटिंग्स और प्रोफाइल",
    "Manage your account, farm details, and application preferences": "अपने खाते, खेत के विवरण और एप्लिकेशन प्राथमिकताओं का प्रबंधन करें",
    "Profile": "प्रोफाइल",
    "Farm Details": "खेत का विवरण",
    "Notifications": "सूचनाएं",
    "Language": "भाषा",
    "Data & Privacy": "डेटा और गोपनीयता",
    "Welcome to SmartAgri Advisor": "SmartAgri Advisor में आपका स्वागत है",
    "Your AI-powered farming companion for better crop decisions": "बेहतर फसल निर्णयों के लिए आपका AI-संचालित कृषि साथी",
    "Chat": "चैट",
    "Advanced": "उन्नत",
    "Ask me anything about farming, weather, soil, or crops...": "कृषि, मौसम, मिट्टी या फसलों के बारे में कुछ भी पूछें...",
    "Send": "भेजें",
    "Chat History": "चैट इतिहास",
    "Save Language Settings": "भाषा सेटिंग्स सेव करें",
    "Saving...": "सेव हो रहा है...",
    "Display Language": "प्रदर्शन भाषा",
    "Region/Timezone": "क्षेत्र/समय क्षेत्र",
    "Currency": "मुद्रा",
    "Units": "इकाइयां",
    "Voice Assistance": "आवाज सहायता",
    "Enable voice commands and responses": "आवाज कमांड और प्रतिक्रियाएं सक्षम करें",
    "Homepage": "होमपेज",
    "Weather": "मौसम",
    "Soil Insights": "मिट्टी इनसाइट्स",
    "Market": "बाजार",
    "Farm History": "खेत का इतिहास",
    "Alerts": "अलर्ट",
    "Community": "समुदाय",
    "Settings": "सेटिंग्स",
    "Logout": "लॉग आउट",
    "Weather Analytics": "मौसम विश्लेषण",
    "Current and forecasted weather patterns for your location": "आपके स्थान के लिए वर्तमान और पूर्वानुमानित मौसम पैटर्न",
    "Soil Insights": "मिट्टी इनसाइट्स",
    "Detailed soil analysis and health recommendations for your farm": "आपके खेत के लिए विस्तृत मिट्टी विश्लेषण और स्वास्थ्य सिफारिशें",
    "Temperature": "तापमान",
    "Humidity": "आर्द्रता",
    "Wind Speed": "हवा की गति",
    "Visibility": "दृश्यता",
    "Pressure": "दबाव",
    "Feels like": "महसूस होता है",
    "Last updated": "अंतिम अपडेट",
    "Refresh": "ताज़ा करें",
    "Export Report": "रिपोर्ट निर्यात करें",
    "24-Hour Forecast": "24 घंटे का पूर्वानुमान",
    "5-Day Forecast": "5 दिन का पूर्वानुमान",
    "Crop Impact": "फसल प्रभाव",
    "Temperature & Humidity (24 Hours)": "तापमान और आर्द्रता (24 घंटे)",
    "Precipitation Probability (24 Hours)": "वर्षा की संभावना (24 घंटे)",
    "Overall Soil Health Score": "समग्र मिट्टी स्वास्थ्य स्कोर",
    "Good": "अच्छा",
    "Based on pH level, organic carbon, and soil texture analysis": "pH स्तर, कार्बनिक कार्बन, और मिट्टी बनावट विश्लेषण के आधार पर",
    "pH Level": "pH स्तर",
    "Neutral": "तटस्थ",
    "Organic Carbon": "कार्बनिक कार्बन",
    "Sand Content": "रेत सामग्री",
    "Sand": "रेत",
    "Soil Texture": "मिट्टी बनावट",
    "Sandy Clay Loam": "रेतीली मिट्टी",
    "Soil Data Summary": "मिट्टी डेटा सारांश",
    "Nutrient Analysis": "पोषक तत्व विश्लेषण",
    "Fertilizer Tips": "उर्वरक सुझाव",
    "Crop Suitability": "फसल उपयुक्तता",
    "Trends": "रुझान",
    "Nutrient Profile": "पोषक तत्व प्रोफाइल",
    "Detailed Breakdown": "विस्तृत विभाजन",
    "Refresh Data": "डेटा ताज़ा करें",
    "Export Analysis": "विश्लेषण निर्यात करें",
    "Market Analytics": "बाजार विश्लेषण",
    "Real-time crop prices, trends, and profitability analysis for your location": "आपके स्थान के लिए रियल-टाइम फसल कीमतें, रुझान, और लाभप्रदता विश्लेषण",
    "Avg Market Price": "औसत बाजार मूल्य",
    "Best Crop to Plant": "बोने के लिए सबसे अच्छी फसल",
    "Total Volume": "कुल मात्रा",
    "Active Markets": "सक्रिय बाजार",
    "Live Market Prices - Sorted by Best to Plant": "लाइव बाजार कीमतें - बोने के लिए सबसे अच्छे के अनुसार क्रमबद्ध",
    "Crops are ranked by suitability score based on your location's soil, weather, and market conditions": "आपके स्थान की मिट्टी, मौसम, और बाजार स्थितियों के आधार पर फसलों को उपयुक्तता स्कोर के अनुसार रैंक किया जाता है",
    "Location": "स्थान",
    "Market": "बाजार",
    "Suitability Score": "उपयुक्तता स्कोर",
    "Volume": "मात्रा",
    "Price": "मूल्य",
    "Range": "रेंज",
    "Best Choice": "सबसे अच्छा विकल्प",
    "tons traded today": "आज कारोबार किए गए टन",
    "mandis reporting": "मंडियां रिपोर्टिंग",
    "Farm History & Analytics": "खेत का इतिहास और विश्लेषण",
    "Track your farming activities, yields, and performance over time": "अपनी कृषि गतिविधियों, उपज और समय के साथ प्रदर्शन को ट्रैक करें",
    "Export Report": "रिपोर्ट निर्यात करें",
    "Community Hub": "कम्युनिटी हब",
    "Connect with fellow farmers, share knowledge, and learn from experts": "साथी किसानों से जुड़ें, ज्ञान साझा करें, और विशेषज्ञों से सीखें",
    "Ask Question": "प्रश्न पूछें",
    "Active Members": "सक्रिय सदस्य",
    "Questions Answered": "उत्तरित प्रश्न",
    "Expert Articles": "विशेषज्ञ लेख",
    "Success Stories": "सफलता की कहानियां",
    "Discussions": "चर्चाएं",
    "Knowledge Base": "ज्ञान आधार",
    "Expert Network": "विशेषज्ञ नेटवर्क",
    "Search discussions...": "चर्चाएं खोजें...",
    "Filter by Tags": "टैग के अनुसार फिल्टर करें",
    "Advanced Search": "उन्नत खोज",
    "Coming Soon": "जल्द आ रहा है",
    "Community features are being developed. Stay tuned for updates!": "कम्युनिटी सुविधाएं विकसित की जा रही हैं। अपडेट के लिए बने रहें!"
  },
  gu: {
    "Settings & Profile": "સેટિંગ્સ અને પ્રોફાઇલ",
    "Manage your account, farm details, and application preferences": "તમારા એકાઉન્ટ, ખેતરના વિગતો અને એપ્લિકેશન પસંદગીઓનું સંચાલન કરો",
    "Profile": "પ્રોફાઇલ",
    "Farm Details": "ખેતરની વિગતો",
    "Notifications": "સૂચનાઓ",
    "Language": "ભાષા",
    "Data & Privacy": "ડેટા અને ગોપનીયતા",
    "Welcome to SmartAgri Advisor": "SmartAgri Advisor માં આપનું સ્વાગત છે",
    "Your AI-powered farming companion for better crop decisions": "વધુ સારા પાક નિર્ણયો માટે તમારો AI-સંચાલિત ખેતી સાથી",
    "Chat": "ચેટ",
    "Advanced": "અડવાન્સ્ડ",
    "Ask me anything about farming, weather, soil, or crops...": "ખેતી, હવામાન, માટી અથવા પાક વિશે કંઈપણ પૂછો...",
    "Send": "મોકલો",
    "Chat History": "ચેટ ઇતિહાસ",
    "Save Language Settings": "ભાષા સેટિંગ્સ સેવ કરો",
    "Saving...": "સેવ થઈ રહ્યું છે...",
    "Display Language": "ડિસ્પ્લે ભાષા",
    "Region/Timezone": "પ્રદેશ/સમય ક્ષેત્ર",
    "Currency": "ચલણ",
    "Units": "એકમો",
    "Voice Assistance": "વૉઇસ સહાયતા",
    "Enable voice commands and responses": "વૉઇસ કમાન્ડ અને પ્રતિભાવ સક્ષમ કરો",
    "Homepage": "હોમપેજ",
    "Weather": "હવામાન",
    "Soil Insights": "માટી ઇનસાઇટ્સ",
    "Market": "બજાર",
    "Farm History": "ખેતરનો ઇતિહાસ",
    "Alerts": "અલર્ટ",
    "Community": "સમુદાય",
    "Settings": "સેટિંગ્સ",
    "Logout": "લોગ આઉટ",
    "Weather Analytics": "હવામાન વિશ્લેષણ",
    "Current and forecasted weather patterns for your location": "તમારા સ્થાન માટે વર્તમાન અને પૂર્વાનુમાનિત હવામાન પેટર્ન",
    "Soil Insights": "માટી ઇનસાઇટ્સ",
    "Detailed soil analysis and health recommendations for your farm": "તમારા ખેતર માટે વિગતવાર માટી વિશ્લેષણ અને આરોગ્ય ભલામણો",
    "Temperature": "તાપમાન",
    "Humidity": "આર્દ્રતા",
    "Wind Speed": "પવનની ગતિ",
    "Visibility": "દૃષ્ટિ",
    "Pressure": "દબાણ",
    "Feels like": "લાગે છે",
    "Last updated": "છેલ્લું અપડેટ",
    "Refresh": "તાજું કરો",
    "Export Report": "રિપોર્ટ નિકાસ કરો",
    "24-Hour Forecast": "24 કલાકની આગાહી",
    "5-Day Forecast": "5 દિવસની આગાહી",
    "Crop Impact": "વાવેતર પ્રભાવ",
    "Temperature & Humidity (24 Hours)": "તાપમાન અને આર્દ્રતા (24 કલાક)",
    "Precipitation Probability (24 Hours)": "વરસાદની સંભાવના (24 કલાક)",
    "Overall Soil Health Score": "કુલ માટી આરોગ્ય સ્કોર",
    "Good": "સારું",
    "Based on pH level, organic carbon, and soil texture analysis": "pH સ્તર, કાર્બનિક કાર્બન, અને માટી ટેક્સ્ચર વિશ્લેષણના આધારે",
    "pH Level": "pH સ્તર",
    "Neutral": "તટસ્થ",
    "Organic Carbon": "કાર્બનિક કાર્બન",
    "Sand Content": "રેતી સામગ્રી",
    "Sand": "રેતી",
    "Soil Texture": "માટી ટેક્સ્ચર",
    "Sandy Clay Loam": "રેતી ક્લે લોમ",
    "Soil Data Summary": "માટી ડેટા સારાંશ",
    "Nutrient Analysis": "પોષક તત્વ વિશ્લેષણ",
    "Fertilizer Tips": "ખાતર ટિપ્સ",
    "Crop Suitability": "વાવેતર યોગ્યતા",
    "Trends": "ટ્રેન્ડ્સ",
    "Nutrient Profile": "પોષક તત્વ પ્રોફાઇલ",
    "Detailed Breakdown": "વિગતવાર વિભાજન",
    "Refresh Data": "ડેટા તાજું કરો",
    "Export Analysis": "વિશ્લેષણ નિકાસ કરો",
    "Market Analytics": "બજાર વિશ્લેષણ",
    "Real-time crop prices, trends, and profitability analysis for your location": "તમારા સ્થાન માટે રિયલ-ટાઇમ વાવેતર કિંમતો, ટ્રેન્ડ્સ, અને નફાકારકતા વિશ્લેષણ",
    "Avg Market Price": "સરેરાશ બજાર કિંમત",
    "Best Crop to Plant": "વાવવા માટે શ્રેષ્ઠ વાવેતર",
    "Total Volume": "કુલ વોલ્યુમ",
    "Active Markets": "સક્રિય બજાર",
    "Live Market Prices - Sorted by Best to Plant": "લાઇવ બજાર કિંમતો - વાવવા માટે શ્રેષ્ઠના અનુસાર ક્રમબદ્ધ",
    "Crops are ranked by suitability score based on your location's soil, weather, and market conditions": "તમારા સ્થાનની માટી, હવામાન, અને બજાર સ્થિતિઓના આધારે વાવેતરોને યોગ્યતા સ્કોરના અનુસાર રેન્ક કરવામાં આવે છે",
    "Location": "સ્થાન",
    "Market": "બજાર",
    "Suitability Score": "યોગ્યતા સ્કોર",
    "Volume": "વોલ્યુમ",
    "Price": "કિંમત",
    "Range": "રેન્જ",
    "Best Choice": "શ્રેષ્ઠ પસંદગી",
    "tons traded today": "આજે વેપાર કરેલા ટન",
    "mandis reporting": "મંડીઓ રિપોર્ટિંગ",
    "Farm History & Analytics": "ખેતરનો ઇતિહાસ અને વિશ્લેષણ",
    "Track your farming activities, yields, and performance over time": "તમારી કૃષિ પ્રવૃત્તિઓ, ઉપજ અને સમય જતાં પ્રદર્શનને ટ્રેક કરો",
    "Export Report": "રિપોર્ટ નિકાસ કરો",
    "Community Hub": "કમ્યુનિટી હબ",
    "Connect with fellow farmers, share knowledge, and learn from experts": "સાથી કૃષકો સાથે જોડાઓ, જ્ઞાન શેર કરો, અને નિષ્ણાતો પાસેથી શીખો",
    "Ask Question": "પ્રશ્ન પૂછો",
    "Active Members": "સક્રિય સભ્યો",
    "Questions Answered": "જવાબ આપેલા પ્રશ્નો",
    "Expert Articles": "નિષ્ણાત લેખો",
    "Success Stories": "સફળતાની વાર્તાઓ",
    "Discussions": "ચર્ચાઓ",
    "Knowledge Base": "જ્ઞાન આધાર",
    "Expert Network": "નિષ્ણાત નેટવર્ક",
    "Search discussions...": "ચર્ચાઓ શોધો...",
    "Filter by Tags": "ટેગ્સ દ્વારા ફિલ્ટર કરો",
    "Advanced Search": "અદ્યતન શોધ",
    "Coming Soon": "ટૂંક સમયમાં આવી રહ્યું છે",
    "Community features are being developed. Stay tuned for updates!": "કમ્યુનિટી સુવિધાઓ વિકસાવી રહ્યા છીએ. અપડેટ્સ માટે જોડાયેલા રહો!"
  }
};

/**
 * Get fallback translation for common UI text
 * @param text - Text to translate
 * @param targetLang - Target language code
 * @returns string - Fallback translation or original text
 */
export function getFallbackTranslation(text: string, targetLang: LanguageCode): string {
  const fallbacks = FALLBACK_TRANSLATIONS[targetLang];
  return fallbacks?.[text] || text;
}

/**
 * Translate text using LibreTranslate API with CORS proxy and fallbacks
 * @param text - Text to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (default: 'en')
 * @returns Promise<string> - Translated text
 */
export async function translateText(
  text: string, 
  targetLang: string, 
  sourceLang: string = 'en'
): Promise<string> {
  // Return original text if target language is English or same as source
  if (targetLang === 'en' || targetLang === sourceLang) {
    return text;
  }

  // Check cache first
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Try fallback translation first for common UI text
  const fallbackTranslation = getFallbackTranslation(text, targetLang as LanguageCode);
  if (fallbackTranslation !== text) {
    translationCache.set(cacheKey, fallbackTranslation);
    return fallbackTranslation;
  }

  // Try using a CORS-friendly translation service
  try {
    // Use MyMemory API which is CORS-friendly
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translatedText = data.responseData.translatedText;
      
      // Cache the translation
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    } else {
      throw new Error('Invalid response from translation API');
    }
  } catch (error) {
    console.warn('MyMemory translation failed, trying LibreTranslate with proxy:', error);
    
    // Fallback to LibreTranslate with CORS proxy
    const proxyEndpoints = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ];

    const apiUrl = 'https://libretranslate.de/translate';
    
    for (const proxy of proxyEndpoints) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(apiUrl)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          } as TranslationRequest)
        });

        if (!response.ok) {
          continue; // Try next proxy
        }

        const data: TranslationResponse = await response.json();
        const translatedText = data.translatedText;

        // Cache the translation
        translationCache.set(cacheKey, translatedText);
        return translatedText;
      } catch (proxyError) {
        console.warn(`Translation failed with proxy ${proxy}:`, proxyError);
        continue; // Try next proxy
      }
    }
  }

  // If all proxies fail, return fallback or original text
  console.warn('All translation methods failed, using fallback');
  return fallbackTranslation;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache size for debugging
 */
export function getCacheSize(): number {
  return translationCache.size;
}
