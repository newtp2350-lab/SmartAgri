import { useEffect, useRef, useState } from "react";

interface StreamedTextProps {
  text: string;
  speedMs?: number;
  className?: string;
  onProgress?: () => void;
  onDone?: () => void;
}

export const StreamedText = ({
  text,
  speedMs = 30,
  className,
  onProgress,
  onDone,
}: StreamedTextProps) => {
  const [displayed, setDisplayed] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const indexRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const onProgressRef = useRef<(() => void) | undefined>(onProgress);
  const onDoneRef = useRef<(() => void) | undefined>(onDone);

  // Keep callback refs updated without retriggering the typing effect
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // Reset when text changes
    setDisplayed("");
    setIsTyping(true);
    indexRef.current = 0;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!text) {
      setIsTyping(false);
      if (onDoneRef.current) onDoneRef.current();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      const i = indexRef.current;
      if (i >= text.length) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsTyping(false);
        if (onDoneRef.current) onDoneRef.current();
        return;
      }
      const next = text.slice(0, i + 1);
      indexRef.current = i + 1;
      setDisplayed(next);
      if (onProgressRef.current) onProgressRef.current();
    }, Math.max(1, speedMs));

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speedMs]);

  return (
    <span className={className} style={{ whiteSpace: 'pre-line' }}>
      {displayed}
      {isTyping && (
        <span className="opacity-70 animate-pulse">|</span>
      )}
    </span>
  );
};

export default StreamedText;


