/**
 * Breadcrumbs Navigation Component
 * 페이지 경로를 표시하고 각 항목 클릭 시 해당 페이지로 이동 가능
 */

import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import { ChevronRight } from 'lucide-react'

import { cn } from '../lib/utils'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
  separator?: 'chevron' | 'slash'
}

export function Breadcrumbs({ items, className, separator = 'chevron' }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null
  }

  const Separator = () => {
    if (separator === 'slash') {
      return <span className="text-muted mx-2 text-sm">/</span>
    }
    return <ChevronRight className="text-muted mx-1 h-4 w-4" />
  }

  return (
    <nav aria-label="breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isFirst = index === 0

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className={cn(
                      'text-muted hover:text-primary text-sm transition-colors',
                      isFirst && 'font-medium',
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'text-foreground text-sm',
                      isLast ? 'font-semibold' : 'text-muted',
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true">
                  <Separator />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
