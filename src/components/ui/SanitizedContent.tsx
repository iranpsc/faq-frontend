'use client';

import { useMemo } from 'react';
import { sanitizeContent } from '@/lib/sanitize';

interface SanitizedContentProps {
  content: string;
  className?: string;
}

/**
 * A component that safely renders HTML content with XSS protection.
 * Use this component instead of dangerouslySetInnerHTML for user-generated content.
 */
export function SanitizedContent({ content, className = '' }: SanitizedContentProps) {
  const sanitizedHtml = useMemo(() => sanitizeContent(content), [content]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default SanitizedContent;

