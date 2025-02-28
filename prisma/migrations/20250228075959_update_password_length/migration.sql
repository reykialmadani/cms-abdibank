-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(70) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "bearer_token" TEXT DEFAULT gen_random_uuid(),

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" SERIAL NOT NULL,
    "sub_menu_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "required_documents" TEXT,
    "thumbnail" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan" (
    "id" SERIAL NOT NULL,
    "content_id" INTEGER,
    "loan_type" VARCHAR(255),
    "nominal" VARCHAR(255),
    "annual_interest_rate" DECIMAL(5,2),
    "interest_type" VARCHAR(255),
    "loan_term" VARCHAR(255),
    "collateral" VARCHAR(255),
    "cost" VARCHAR(255),
    "provisions" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" SERIAL NOT NULL,
    "menu_name" VARCHAR(255) NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "order_position" INTEGER NOT NULL DEFAULT 0,
    "url" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_menu" (
    "id" SERIAL NOT NULL,
    "menu_id" INTEGER,
    "sub_menu_name" VARCHAR(255) NOT NULL,
    "order_position" INTEGER NOT NULL DEFAULT 0,
    "url" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "sub_menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_password_key" ON "admin"("password");

-- CreateIndex
CREATE UNIQUE INDEX "admin_bearer_token_key" ON "admin"("bearer_token");

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_sub_menu_id_fkey" FOREIGN KEY ("sub_menu_id") REFERENCES "sub_menu"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loan" ADD CONSTRAINT "loan_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loan" ADD CONSTRAINT "loan_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_menu" ADD CONSTRAINT "sub_menu_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
