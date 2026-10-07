import React from 'react';

export interface PageLayoutProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'default' | 'full' | 'narrow';
  className?: string;
  headerBorder?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  badge,
  actions,
  tabs,
  children,
  maxWidth = 'default',
  className = '',
  headerBorder = true,
}) => {
  const maxWidthClass =
    maxWidth === 'full' ? 'w-full' : maxWidth === 'narrow' ? 'max-w-5xl mx-auto w-full' : 'max-w-7xl mx-auto w-full';

  return (
    <div className={`space-y-6 animate-fade-in font-sans ${maxWidthClass} ${className}`}>
      {/* Normalized Shared Header Bar */}
      <div className={`pb-5 ${headerBorder ? 'border-b border-border' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-tight truncate">
                {title}
              </h1>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 leading-normal line-clamp-1">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
              {actions}
            </div>
          )}
        </div>

        {tabs && <div className="mt-4">{tabs}</div>}
      </div>

      {/* Main Normalized Content Area */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
export default PageLayout;
