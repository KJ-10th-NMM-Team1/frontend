/**
 * React Query hook for fetching presigned URLs from S3 keys
 */

import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/shared/config/queryKeys'
import { resolvePresignedUrl } from '@/shared/lib/utils'

type UsePresignedUrlOptions = {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

/**
 * Fetches a presigned URL for an S3 key
 *
 * @param s3Key - S3 key/path for the media file
 * @param options - React Query options
 * @returns Query result with presigned URL
 *
 * @example
 * ```tsx
 * const { data: url, isLoading } = usePresignedUrl('audio/segment-123.mp3')
 * ```
 */
export function usePresignedUrl(
  s3Key: string | null | undefined,
  options?: UsePresignedUrlOptions,
) {
  return useQuery({
    queryKey: queryKeys.storage.presignedUrl(s3Key ?? ''),
    queryFn: () => resolvePresignedUrl(s3Key!),
    enabled: !!s3Key && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes default (renamed from cacheTime in v5)
  })
}

// /**
//  * Fetches multiple presigned URLs for multiple S3 keys
//  *
//  * @param s3Keys - Array of S3 keys/paths
//  * @param options - React Query options
//  * @returns Array of query results
//  *
//  * @example
//  * ```tsx
//  * const urls = usePresignedUrls([
//  *   'audio/segment-1.mp3',
//  *   'audio/segment-2.mp3'
//  * ])
//  * ```
//  */
// export function usePresignedUrls(
//   s3Keys: (string | null | undefined)[],
//   options?: UsePresignedUrlOptions,
// ) {
//   const validKeys = s3Keys.filter((key): key is string => !!key)

//   return validKeys.map((key) => usePresignedUrl(key, options))
// }
