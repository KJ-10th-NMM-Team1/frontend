import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import type { AssetEntry } from '@/entities/asset/types'
import type { ProjectDetail } from '@/entities/project/types'
import { useAssets } from '@/features/assets/hooks/useAssets'
import { apiGet } from '@/shared/api/client'
import { queryKeys } from '@/shared/config/queryKeys'

export function useProjectAssets(project: ProjectDetail) {
  const { data: allAssets = [] } = useAssets(project.id)

  const assetsByLanguage = useMemo(() => {
    return allAssets.reduce<Record<string, AssetEntry[]>>((acc, asset) => {
      const lang = asset.language_code
      if (!acc[lang]) {
        acc[lang] = []
      }
      acc[lang].push(asset)
      return acc
    }, {})
  }, [allAssets])

  const videoAssets = useMemo(() => {
    const allVideoPaths = allAssets
      .filter((asset) => asset.asset_type === 'preview_video' && asset.file_path)
      .map((asset) => asset.file_path)
    if (project.video_source) {
      allVideoPaths.push(project.video_source)
    }
    return Array.from(new Set(allVideoPaths))
  }, [allAssets, project.video_source])

  const videoUrlResults = useQueries({
    queries: videoAssets.map((path) => ({
      queryKey: queryKeys.storage.presignedUrl(path),
      queryFn: () => apiGet<{ url: string }>(`api/storage/media/${path}`).then((data) => data.url),
      enabled: !!path,
      staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  })

  const videoUrlMap = useMemo(() => {
    return videoUrlResults.reduce<Record<string, string>>((acc, result, index) => {
      if (result.data) {
        const path = videoAssets[index]
        acc[path] = result.data
      }
      return acc
    }, {})
  }, [videoUrlResults, videoAssets])

  return { assetsByLanguage, videoUrlMap }
}
