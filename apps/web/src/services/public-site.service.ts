import { apiRequest } from './api'

import type {
  PublicPageResponse,
  SeoResponse,
  SiteResponse,
} from '../types/public-site'

export function getSiteSettings() {
  return apiRequest<SiteResponse>(
    '/public/site',
  )
}

export function getPublicPage(
  slug: string,
) {
  return apiRequest<PublicPageResponse>(
    `/public/pages/${slug}`,
  )
}

export function getPublicSeo(
  slug: string,
) {
  return apiRequest<SeoResponse>(
    `/public/seo/${slug}`,
  )
}