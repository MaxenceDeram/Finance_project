-- Remove legacy finance/trading domain tables and columns.

DROP INDEX IF EXISTS "DailyEmailLog_userId_portfolioId_periodDate_key";
ALTER TABLE "DailyEmailLog" DROP CONSTRAINT IF EXISTS "DailyEmailLog_portfolioId_fkey";
ALTER TABLE "DailyEmailLog" DROP COLUMN IF EXISTS "portfolioId";
DROP INDEX IF EXISTS "DailyEmailLog_userId_periodDate_key";
CREATE UNIQUE INDEX "DailyEmailLog_userId_periodDate_key" ON "DailyEmailLog"("userId", "periodDate");

ALTER TABLE "UserPreferences" DROP COLUMN IF EXISTS "preferredCurrency";

DROP TABLE IF EXISTS "Execution";
DROP TABLE IF EXISTS "orders";
DROP TABLE IF EXISTS "Position";
DROP TABLE IF EXISTS "PortfolioSnapshot";
DROP TABLE IF EXISTS "PortfolioCashLedger";
DROP TABLE IF EXISTS "MarketNews";
DROP TABLE IF EXISTS "AssetPrice";
DROP TABLE IF EXISTS "Portfolio";
DROP TABLE IF EXISTS "Asset";
DROP TABLE IF EXISTS "MarketDataCache";

DROP TYPE IF EXISTS "AssetType";
DROP TYPE IF EXISTS "OrderSide";
DROP TYPE IF EXISTS "OrderType";
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "CashLedgerType";
