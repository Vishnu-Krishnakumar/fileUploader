-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "folder_id" INTEGER NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
