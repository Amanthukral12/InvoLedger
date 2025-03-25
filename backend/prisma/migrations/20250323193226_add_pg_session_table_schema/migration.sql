-- CreateTable
CREATE TABLE "PgSession" (
    "sid" TEXT NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PgSession_pkey" PRIMARY KEY ("sid")
);
