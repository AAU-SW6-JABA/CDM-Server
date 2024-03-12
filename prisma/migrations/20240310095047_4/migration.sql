-- AddForeignKey
ALTER TABLE "measurement" ADD CONSTRAINT "measurement_aid_fkey" FOREIGN KEY ("aid") REFERENCES "antennas"("aid") ON DELETE NO ACTION ON UPDATE NO ACTION;
