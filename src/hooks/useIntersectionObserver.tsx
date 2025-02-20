import { useEffect, useRef, useState } from "react";

const useIntersectionObserver = (
  options: IntersectionObserverInit | undefined
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return { targetRef, isIntersecting };
};

export default useIntersectionObserver;
