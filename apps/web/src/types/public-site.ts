export interface SiteSettings {
  id: string
  siteName: string
  logoUrl: string | null
  logoDarkUrl: string | null
  faviconUrl: string | null
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedTextColor: string
  headingFont: string
  bodyFont: string
  supportEmail: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicPageSection {
  id: string
  pageId: string
  key: string
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  content: string | null
  buttonText: string | null
  buttonUrl: string | null
  secondaryButtonText: string | null
  secondaryButtonUrl: string | null
  imageUrl: string | null
  metadata: unknown
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface SeoSettings {
  id: string
  pageId: string
  title: string
  description: string
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImageUrl: string | null
  canonicalUrl: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicPage {
  id: string
  slug: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  sections: PublicPageSection[]
  seo: SeoSettings | null
}

export interface SiteResponse {
  settings: SiteSettings
}

export interface PublicPageResponse {
  page: PublicPage
}

export interface SeoResponse {
  seo: SeoSettings
}

export interface FeatureItem {
  key?: string
  title: string
  description: string
}

export interface PricingItem {
  key: string
  name: string
  title: string
  price: string
  description: string
  featured: boolean
  features: string[]
}

export interface FaqItem {
  question: string
  answer: string
}