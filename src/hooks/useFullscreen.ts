import { useState, useCallback, useEffect } from 'react';

interface UseFullscreenResult {
  isFullscreen: boolean;
  toggleFullscreen: (element?: HTMLElement | null) => void;
  enterFullscreen: (element: HTMLElement | null) => void;
  exitFullscreen: () => void;
}

const useFullscreen = (targetRef?: React.RefObject<HTMLElement>): UseFullscreenResult => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Check if the document is in fullscreen mode
  const checkFullscreen = useCallback(() => {
    const fullscreenElement = 
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;
    
    setIsFullscreen(!!fullscreenElement);
  }, []);

  // Enter fullscreen mode
  const enterFullscreen = useCallback((element: HTMLElement | null) => {
    const targetElement = element || (targetRef?.current || document.documentElement);
    
    if (!targetElement) return;

    const enterFullscreenMethod = 
      targetElement.requestFullscreen ||
      (targetElement as any).webkitRequestFullscreen ||
      (targetElement as any).mozRequestFullScreen ||
      (targetElement as any).msRequestFullscreen;

    if (enterFullscreenMethod) {
      enterFullscreenMethod.call(targetElement)
        .then(() => checkFullscreen())
        .catch((err: any) => console.error('Failed to enter fullscreen mode:', err));
    }
  }, [targetRef, checkFullscreen]);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(() => {
    const exitFullscreenMethod = 
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen;

    if (exitFullscreenMethod) {
      exitFullscreenMethod.call(document)
        .then(() => checkFullscreen())
        .catch((err: any) => console.error('Failed to exit fullscreen mode:', err));
    }
  }, [checkFullscreen]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback((element?: HTMLElement | null) => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen(element || null);
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Add event listeners for fullscreen changes
  useEffect(() => {
    const fullscreenChangeEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    fullscreenChangeEvents.forEach(eventType => {
      document.addEventListener(eventType, checkFullscreen);
    });

    return () => {
      fullscreenChangeEvents.forEach(eventType => {
        document.removeEventListener(eventType, checkFullscreen);
      });
    };
  }, [checkFullscreen]);

  return {
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
};

export default useFullscreen; 