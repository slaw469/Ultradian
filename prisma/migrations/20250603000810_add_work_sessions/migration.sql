-- CreateTable
CREATE TABLE "WorkSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "focusBlockId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "websiteUrl" TEXT,
    "favicon" TEXT,
    "domain" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "tabSwitches" INTEGER NOT NULL DEFAULT 0,
    "totalTabs" INTEGER NOT NULL DEFAULT 1,
    "activityType" TEXT,
    "aiSummary" TEXT,
    "nextSteps" JSONB,
    "tags" JSONB,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkSession_userId_startTime_idx" ON "WorkSession"("userId", "startTime");

-- CreateIndex
CREATE INDEX "WorkSession_userId_activityType_idx" ON "WorkSession"("userId", "activityType");

-- AddForeignKey
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_focusBlockId_fkey" FOREIGN KEY ("focusBlockId") REFERENCES "FocusBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
