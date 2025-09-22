import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Square, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";

// Supported languages for Web Speech API
const SUPPORTED_LANGUAGES = {
  'en': 'en-US',
  'hi': 'hi-IN', 
  'ml': 'ml-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'gu': 'gu-IN',
  'pa': 'pa-IN',
  'bn': 'bn-IN',
  'or': 'or-IN'
};

// Language detection function
function detectLanguageFromInput(): string | null {
  // Check if user has previously selected a language
  const savedLanguage = localStorage.getItem('preferred-language');
  if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
    return SUPPORTED_LANGUAGES[savedLanguage as keyof typeof SUPPORTED_LANGUAGES];
  }
  
  // Try to detect from browser language
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES[browserLang as keyof typeof SUPPORTED_LANGUAGES]) {
    return SUPPORTED_LANGUAGES[browserLang as keyof typeof SUPPORTED_LANGUAGES];
  }
  
  // Default to English
  return 'en-US';
}

interface SpeechToTextButtonProps {
  onTranscription: (text: string, detectedLanguage?: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
  onTranscription,
  disabled = false,
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support for Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setSelectedLanguage(savedLanguage);

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    try {
      if (!isSupported) {
        toast.error("Speech recognition is not supported in this browser");
        return;
      }

      if (isRecording) {
        console.log("Already recording, ignoring start request");
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition for better detection with language support
      const languageCode = SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES] || 'en-US';
      recognition.lang = languageCode;
      recognition.interimResults = true; // Enable interim results for better feedback
      recognition.maxAlternatives = 3; // Get multiple alternatives
      recognition.continuous = false;
      
      console.log("Using language:", languageCode, "for", selectedLanguage);
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (isRecording) {
          console.log("Speech recognition timeout, stopping...");
          recognition.stop();
        }
      }, 10000); // 10 second timeout

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        clearTimeout(timeout);
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log("Interim transcript:", interimTranscript);
        console.log("Final transcript:", finalTranscript);
        
        // If we have a final result, use it
        if (finalTranscript.trim().length > 0) {
          console.log("Speech recognition result:", finalTranscript);
          setIsRecording(false);
          setIsTranscribing(false);
          
          onTranscription(finalTranscript.trim());
          toast.success("Transcription successful!");
        }
        // If we only have interim results, show them but keep listening
        else if (interimTranscript.trim().length > 0) {
          console.log("Interim result:", interimTranscript);
          // Don't stop recording yet, wait for final result
        }
      };

      recognition.onerror = (event: any) => {
        clearTimeout(timeout);
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setIsTranscribing(false);
        
        // Handle specific error types
        if (event.error === 'no-speech') {
          toast.error("No speech detected. Please speak louder and more clearly, then try again.", {
            action: {
              label: "Type Instead",
              onClick: handleManualInput
            }
          });
        } else if (event.error === 'audio-capture') {
          toast.error("Microphone not accessible. Please check your microphone is connected and try again.");
        } else if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
        } else if (event.error === 'network') {
          toast.error("Network error. Please check your internet connection.");
        } else if (event.error === 'aborted') {
          console.log("Speech recognition was aborted");
          // Don't show error for aborted (user cancelled)
        } else {
          toast.error(`Speech recognition error: ${event.error}. Please try again.`, {
            action: {
              label: "Type Instead",
              onClick: handleManualInput
            }
          });
        }
      };

      recognition.onend = () => {
        clearTimeout(timeout);
        console.log("Speech recognition ended");
        setIsRecording(false);
        setIsTranscribing(false);
      };

      // Store reference and start recognition
      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Failed to start speech recognition. Please try again.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (!isRecording || !recognitionRef.current) {
        console.log("No active recording to stop");
        return;
      }

      console.log("Stopping speech recognition");
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(false);

    } catch (error) {
      console.error("Error stopping speech recognition:", error);
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  const cancelRecording = () => {
    try {
      if (isRecording && recognitionRef.current) {
        console.log("Cancelling speech recognition");
        recognitionRef.current.abort();
      }

      setIsRecording(false);
      setIsTranscribing(false);
      
      toast.info("Recording cancelled");
    } catch (error) {
      console.error("Error cancelling recording:", error);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('preferred-language', language);
    toast.success(`Language changed to ${getLanguageName(language)}`);
  };

  const getLanguageName = (code: string): string => {
    const names: { [key: string]: string } = {
      'en': 'English',
      'hi': 'Hindi',
      'ml': 'Malayalam',
      'ta': 'Tamil',
      'te': 'Telugu',
      'kn': 'Kannada',
      'gu': 'Gujarati',
      'pa': 'Punjabi',
      'bn': 'Bengali',
      'or': 'Odia'
    };
    return names[code] || 'English';
  };

  const handleManualInput = () => {
    const text = prompt("Speech recognition failed. Please type your message:");
    if (text && text.trim()) {
      onTranscription(text.trim());
    }
  };

  // Show different states based on recording status
  const getButtonContent = () => {
    if (isRecording) {
      return (
        <>
          <Square className="w-4 h-4" />
          <span className="ml-2">Listening... (Click to stop)</span>
        </>
      );
    }

    return (
      <>
        <Mic className="w-4 h-4" />
        <span className="ml-2">Start Voice Input</span>
      </>
    );
  };

  const getButtonVariant = () => {
    if (isRecording) {
      return "destructive" as const;
    }
    return "outline" as const;
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 h-9">
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">Hindi</SelectItem>
          <SelectItem value="ml">Malayalam</SelectItem>
          <SelectItem value="ta">Tamil</SelectItem>
          <SelectItem value="te">Telugu</SelectItem>
          <SelectItem value="kn">Kannada</SelectItem>
          <SelectItem value="gu">Gujarati</SelectItem>
          <SelectItem value="pa">Punjabi</SelectItem>
          <SelectItem value="bn">Bengali</SelectItem>
          <SelectItem value="or">Odia</SelectItem>
        </SelectContent>
      </Select>

      {/* Voice Input Button */}
      <Button
        variant={getButtonVariant()}
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        className={className}
      >
        {getButtonContent()}
      </Button>
      
      {isRecording && (
        <Button
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default SpeechToTextButton;
