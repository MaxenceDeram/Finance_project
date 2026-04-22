-- Live market data foundation for Waren.
-- Adds provider metadata to assets, persisted market news, and a small DB-backed cache
-- used to respect external API rate limits while keeping dashboards responsive.

ALTER TABLE "Asset"
  ADD COLUMN "isin" TEXT,
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "providerId" TEXT,
  ADD COLUMN "exchangeName" TEXT,
  ADD COLUMN "industry" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "logoUrl" TEXT,
  ADD COLUMN "website" TEXT,
  ADD COLUMN "marketCap" DECIMAL(24,4),
  ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

CREATE INDEX "Asset_provider_providerId_idx" ON "Asset"("provider", "providerId");
CREATE INDEX "Asset_isin_idx" ON "Asset"("isin");

CREATE TABLE "MarketNews" (
  "id" TEXT NOT NULL,
  "assetId" TEXT,
  "symbol" TEXT,
  "provider" TEXT NOT NULL,
  "externalId" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "source" TEXT,
  "url" TEXT,
  "imageUrl" TEXT,
  "sentiment" TEXT,
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketNews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketNews_provider_externalId_key" ON "MarketNews"("provider", "externalId");
CREATE INDEX "MarketNews_assetId_publishedAt_idx" ON "MarketNews"("assetId", "publishedAt");
CREATE INDEX "MarketNews_symbol_publishedAt_idx" ON "MarketNews"("symbol", "publishedAt");
CREATE INDEX "MarketNews_publishedAt_idx" ON "MarketNews"("publishedAt");

ALTER TABLE "MarketNews"
  ADD CONSTRAINT "MarketNews_assetId_fkey"
  FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "MarketDataCache" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketDataCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketDataCache_key_key" ON "MarketDataCache"("key");
CREATE INDEX "MarketDataCache_expiresAt_idx" ON "MarketDataCache"("expiresAt");
CREATE INDEX "MarketDataCache_provider_idx" ON "MarketDataCache"("provider");
