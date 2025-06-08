'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  objectFit = 'cover',
  loading = 'lazy',
  placeholder,
  blurDataURL,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 75,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    const element = document.getElementById(`img-${src}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src, priority, loading]);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Use smaller quality for mobile to save bandwidth
  const getQuality = () => {
    if (typeof window === 'undefined') return quality;
    return window.innerWidth <= 640 ? Math.min(quality, 60) : quality;
  };

  return (
    <div
      id={`img-${src}`}
      className={`relative overflow-hidden ${className}`}
      style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
    >
      <AnimatePresence mode="wait">
        {/* Loading skeleton */}
        {isLoading && !hasError && (
          <motion.div
            className="absolute inset-0 bg-secondary/20 animate-pulse rounded-lg"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Error state */}
        {hasError && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-secondary/10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center p-4">
              <svg
                className="w-12 h-12 mx-auto text-secondary mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-secondary">Falha ao carregar imagem</p>
            </div>
          </motion.div>
        )}

        {/* Image */}
        {isInView && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className={`object-${objectFit}`}
              onLoadingComplete={handleLoadComplete}
              onError={handleError}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
              sizes={sizes}
              quality={getQuality()}
              fill={!width || !height}
              style={{
                objectFit: objectFit as any,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progressive enhancement for slow connections */}
      <noscript>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading="lazy"
          style={{
            objectFit: objectFit as any,
          }}
        />
      </noscript>
    </div>
  );
}

// Optimized background image component
export function ResponsiveBackgroundImage({
  src,
  alt,
  children,
  className = '',
  overlayOpacity = 0,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlayOpacity?: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.1 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          quality={60}
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </motion.div>

      {/* Overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}