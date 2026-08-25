import { useQuery } from '@tanstack/react-query'

import {
  getPublicPage,
  getPublicSeo,
  getSiteSettings,
} from '../services/public-site.service'

export function useSiteSettings() {
  return useQuery({
    queryKey: ['public-site', 'settings'],

    queryFn: getSiteSettings,

    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicPage(
  slug: string,
) {
  return useQuery({
    queryKey: [
      'public-site',
      'page',
      slug,
    ],

    queryFn: () =>
      getPublicPage(slug),

    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicSeo(
  slug: string,
) {
  return useQuery({
    queryKey: [
      'public-site',
      'seo',
      slug,
    ],

    queryFn: () =>
      getPublicSeo(slug),

    staleTime: 5 * 60 * 1000,
  })
}