import React, { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useLinkPrefetch } from '../../hooks/usePrefetch';

/**
 * Enhanced Link component with hover prefetching
 * Usage: <PrefetchLink to="/profile/123" prefetchType="user" prefetchId="123">
 */
const PrefetchLink = memo(({
    to,
    children,
    prefetchType,
    prefetchId,
    className,
    onClick,
    ...props
}) => {
    const { handleLinkHover } = useLinkPrefetch();

    const handleMouseEnter = () => {
        if (prefetchType && prefetchId) {
            handleLinkHover(prefetchType, prefetchId);
        }
    };

    return (
        <RouterLink
            to={to}
            className={className}
            onMouseEnter={handleMouseEnter}
            onClick={onClick}
            {...props}
        >
            {children}
        </RouterLink>
    );
});

PrefetchLink.displayName = 'PrefetchLink';

export default PrefetchLink;
