import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage Component
 * Implements lazy loading using Intersection Observer
 * Shows placeholder/blur effect while loading
 */
const LazyImage = ({
    src,
    alt = '',
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
    className = '',
    style = {},
    onLoad,
    onError,
    threshold = 0.01,
    rootMargin = '50px',
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        if (!imageRef || !src) return;

        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: load image immediately
            setImageSrc(src);
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
                threshold,
                rootMargin,
            }
        );

        observer.observe(imageRef);

        return () => {
            if (observer && imageRef) {
                observer.disconnect();
            }
        };
    }, [imageRef, src, threshold, rootMargin]);

    useEffect(() => {
        if (!isInView || !src) return;

        // Preload image
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
            if (onLoad) onLoad();
        };

        img.onerror = (error) => {
            console.error('Failed to load image:', src);
            if (onError) onError(error);
        };
    }, [isInView, src, onLoad, onError]);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${!isLoaded ? 'lazy-loading' : 'lazy-loaded'}`}
            style={{
                ...style,
                transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
                opacity: isLoaded ? 1 : 0.6,
                filter: isLoaded ? 'none' : 'blur(5px)',
            }}
            {...props}
        />
    );
};

export default LazyImage;
