-- CreateTable
CREATE TABLE "degree_programs" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "degree_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "degree_programs_universityId_idx" ON "degree_programs"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "degree_programs_universityId_name_key" ON "degree_programs"("universityId", "name");

-- AddForeignKey
ALTER TABLE "degree_programs" ADD CONSTRAINT "degree_programs_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
