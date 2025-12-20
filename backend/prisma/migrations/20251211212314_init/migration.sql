-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrafficReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "location" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "contactNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedBy" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrafficReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CongestionSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "congestionLevel" TEXT NOT NULL,
    "trafficSpeed" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TrafficReport_status_idx" ON "TrafficReport"("status");

-- CreateIndex
CREATE INDEX "TrafficReport_createdAt_idx" ON "TrafficReport"("createdAt");

-- CreateIndex
CREATE INDEX "TrafficReport_isEmergency_idx" ON "TrafficReport"("isEmergency");

-- CreateIndex
CREATE INDEX "CongestionSnapshot_timestamp_idx" ON "CongestionSnapshot"("timestamp");

-- CreateIndex
CREATE INDEX "CongestionSnapshot_latitude_longitude_idx" ON "CongestionSnapshot"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Alert_isActive_idx" ON "Alert"("isActive");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_isEmergency_idx" ON "Alert"("isEmergency");
