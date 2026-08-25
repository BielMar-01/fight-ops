-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL,
    "site_name" VARCHAR(100) NOT NULL DEFAULT 'FightOps',
    "logo_url" TEXT,
    "logo_dark_url" TEXT,
    "favicon_url" TEXT,
    "primary_color" VARCHAR(20) NOT NULL DEFAULT '#E63737',
    "secondary_color" VARCHAR(20) NOT NULL DEFAULT '#F04747',
    "background_color" VARCHAR(20) NOT NULL DEFAULT '#080808',
    "surface_color" VARCHAR(20) NOT NULL DEFAULT '#141414',
    "text_color" VARCHAR(20) NOT NULL DEFAULT '#F6F6F6',
    "muted_text_color" VARCHAR(20) NOT NULL DEFAULT '#9D9D9D',
    "heading_font" VARCHAR(100) NOT NULL DEFAULT 'Inter',
    "body_font" VARCHAR(100) NOT NULL DEFAULT 'Inter',
    "support_email" VARCHAR(255),
    "instagram_url" TEXT,
    "linkedin_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_pages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "public_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_page_sections" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "eyebrow" VARCHAR(150),
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "button_text" VARCHAR(150),
    "button_url" TEXT,
    "secondary_button_text" VARCHAR(150),
    "secondary_button_url" TEXT,
    "image_url" TEXT,
    "metadata" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "public_page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_settings" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "og_title" VARCHAR(255),
    "og_description" TEXT,
    "og_image_url" TEXT,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,
    "robots_follow" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "seo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_pages_slug_key" ON "public_pages"("slug");

-- CreateIndex
CREATE INDEX "public_pages_active_idx" ON "public_pages"("active");

-- CreateIndex
CREATE INDEX "public_page_sections_page_id_idx" ON "public_page_sections"("page_id");

-- CreateIndex
CREATE INDEX "public_page_sections_page_id_active_idx" ON "public_page_sections"("page_id", "active");

-- CreateIndex
CREATE INDEX "public_page_sections_page_id_sort_order_idx" ON "public_page_sections"("page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "uk_public_page_sections_page_key" ON "public_page_sections"("page_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "seo_settings_page_id_key" ON "seo_settings"("page_id");

-- AddForeignKey
ALTER TABLE "public_page_sections" ADD CONSTRAINT "public_page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
