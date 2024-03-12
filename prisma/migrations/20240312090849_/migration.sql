-- CreateTable
CREATE TABLE "antennas" (
    "aid" SERIAL NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "antennas_pkey" PRIMARY KEY ("aid")
);

-- CreateTable
CREATE TABLE "calculation" (
    "imsi" BIGINT NOT NULL,
    "calctime" BIGINT NOT NULL,
    "mid" INTEGER NOT NULL,

    CONSTRAINT "calculation_pkey" PRIMARY KEY ("imsi","calctime","mid")
);

-- CreateTable
CREATE TABLE "location" (
    "imsi" BIGINT NOT NULL,
    "calctime" BIGINT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("imsi","calctime")
);

-- CreateTable
CREATE TABLE "measurement" (
    "mid" SERIAL NOT NULL,
    "imsi" BIGINT NOT NULL,
    "aid" SMALLINT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "strengthDBM" SMALLINT NOT NULL,

    CONSTRAINT "measurement_pkey" PRIMARY KEY ("mid")
);

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_mid_fkey" FOREIGN KEY ("mid") REFERENCES "measurement"("mid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_imsi_calctime_fkey" FOREIGN KEY ("imsi", "calctime") REFERENCES "location"("imsi", "calctime") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "measurement" ADD CONSTRAINT "measurement_aid_fkey" FOREIGN KEY ("aid") REFERENCES "antennas"("aid") ON DELETE NO ACTION ON UPDATE NO ACTION;
