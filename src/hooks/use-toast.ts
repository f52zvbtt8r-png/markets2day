import { useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 2000;

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToastMessage(message);
    timeoutRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  };

  return { toastMessage, showToast };
}
