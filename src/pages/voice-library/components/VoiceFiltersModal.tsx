import { useEffect, useState } from 'react'

import { Filter, User } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/ToggleGroup'

export interface VoiceFilters {
  languages?: string[]
  category?: string[]
  gender?: 'any' | 'male' | 'female' | 'neutral'
}

interface VoiceFiltersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: VoiceFilters
  onFiltersChange: (filters: VoiceFilters) => void
  onApply: () => void
}

const CATEGORIES = [
  'Narrative & Story',
  'Conversational',
  'Characters & Animation',
  'Social Media',
  'Entertainment & TV',
  'Advertisement',
  'Informative & Educational',
]

export function VoiceFiltersModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
}: VoiceFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<VoiceFilters>(filters)

  // 모달이 열릴 때 필터 상태 동기화
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleReset = () => {
    const resetFilters: VoiceFilters = {
      gender: 'any',
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApply()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted" />
          <DialogTitle>Voice Filters</DialogTitle>
        </div>

        <div className="mt-6 space-y-6">
          {/* Languages */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Languages</label>
            <Select
              value={localFilters.languages?.[0] || ''}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, languages: value ? [value] : undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="jp">日本語</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    const currentCategories = localFilters.category || []
                    const newCategories = currentCategories.includes(category)
                      ? currentCategories.filter((c) => c !== category)
                      : [...currentCategories, category]
                    setLocalFilters({
                      ...localFilters,
                      category: newCategories.length > 0 ? newCategories : undefined,
                    })
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    localFilters.category?.includes(category)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-surface-3 bg-surface-1 text-muted hover:bg-surface-2',
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <ToggleGroup
              type="single"
              value={localFilters.gender || 'any'}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  gender: (value as 'any' | 'male' | 'female' | 'neutral') || 'any',
                })
              }
              className="flex gap-2"
            >
              <ToggleGroupItem
                value="any"
                className="rounded-lg border border-surface-3 data-[state=off]:bg-surface-2 data-[state=on]:bg-white data-[state=off]:text-muted data-[state=on]:text-foreground"
              >
                Any
              </ToggleGroupItem>
              <ToggleGroupItem
                value="male"
                className="rounded-lg border border-surface-3 data-[state=off]:bg-surface-2 data-[state=on]:bg-white data-[state=off]:text-muted data-[state=on]:text-foreground"
              >
                <User className="mr-1.5 h-4 w-4" />
                Male
              </ToggleGroupItem>
              <ToggleGroupItem
                value="female"
                className="rounded-lg border border-surface-3 data-[state=off]:bg-surface-2 data-[state=on]:bg-white data-[state=off]:text-muted data-[state=on]:text-foreground"
              >
                <User className="mr-1.5 h-4 w-4" />
                Female
              </ToggleGroupItem>
              <ToggleGroupItem
                value="neutral"
                className="rounded-lg border border-surface-3 data-[state=off]:bg-surface-2 data-[state=on]:bg-white data-[state=off]:text-muted data-[state=on]:text-foreground"
              >
                Neutral
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleReset}>
            Reset all
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
