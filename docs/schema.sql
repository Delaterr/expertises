-- This schema is a relational representation of the Firestore data model.
-- It's intended for documentation, reference, and potential migration purposes.

-- Represents a user of the application (e.g., shop owner, employee).
CREATE TABLE "User" (
    "id" VARCHAR(255) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "photoURL" TEXT
);

-- Represents a business or shop within the application.
CREATE TABLE "Shop" (
    "id" VARCHAR(255) PRIMARY KEY,
    "ownerId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10, 8),
    "longitude" DECIMAL(11, 8),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "heroImageUrl" TEXT,
    "receiptTemplate" VARCHAR(50) DEFAULT 'template1',
    "printerIpAddress" VARCHAR(45),
    "printerPort" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
);

-- Represents a category of products.
CREATE TABLE "Category" (
    "id" VARCHAR(255) PRIMARY KEY,
    "shopId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE
);

-- Represents a product sold by the shop.
CREATE TABLE "Product" (
    "id" VARCHAR(255) PRIMARY KEY,
    "shopId" VARCHAR(255) NOT NULL,
    "categoryId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "salesPrice" DECIMAL(10, 2) NOT NULL,
    "purchasePrice" DECIMAL(10, 2),
    "quantity" INTEGER NOT NULL,
    "lowStockThreshold" INTEGER DEFAULT 10,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'pcs',
    "code" VARCHAR(255), -- Barcode/SKU
    "imageUrl" TEXT,
    "imageHint" TEXT,
    "variants" JSONB, -- For storing product variants like size, color, etc.
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);

-- Represents a customer of a shop.
CREATE TABLE "Customer" (
    "id" VARCHAR(255) PRIMARY KEY,
    "shopId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "avatarUrl" TEXT,
    "totalSpent" DECIMAL(12, 2) DEFAULT 0,
    "lastSeen" TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE
);

-- Represents a sales transaction.
CREATE TABLE "Transaction" (
    "id" VARCHAR(255) PRIMARY KEY,
    "shopId" VARCHAR(255) NOT NULL,
    "sellerId" VARCHAR(255) NOT NULL,
    "customerId" VARCHAR(255),
    "customerName" VARCHAR(255),
    "date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "isDebt" BOOLEAN DEFAULT FALSE,
    "amountPaid" DECIMAL(10, 2),
    "amountDue" DECIMAL(10, 2),
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE,
    FOREIGN KEY ("sellerId") REFERENCES "User"("id"),
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

-- Represents the items within a single transaction.
CREATE TABLE "TransactionItem" (
    "id" SERIAL PRIMARY KEY,
    "transactionId" VARCHAR(255) NOT NULL,
    "productId" VARCHAR(255) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- Defines the roles available within a shop (e.g., Admin, POS Seller).
CREATE TABLE "RoleDefinition" (
    "id" VARCHAR(255) PRIMARY KEY,
    "shopId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL, -- Storing permissions as a JSON object
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE
);

-- Maps users to their roles within a specific shop.
CREATE TABLE "UserShopRole" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "shopId" VARCHAR(255) NOT NULL,
    "roleId" VARCHAR(255) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE,
    FOREIGN KEY ("roleId") REFERENCES "RoleDefinition"("id") ON DELETE CASCADE,
    UNIQUE("userId", "shopId") -- A user can only have one role per shop
);

-- Represents a low stock alert for a product.
CREATE TABLE "StockAlert" (
    "id" VARCHAR(255) PRIMARY KEY,
    "productId" VARCHAR(255) NOT NULL,
    "shopId" VARCHAR(255) NOT NULL,
    "alertThreshold" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "alertDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE
);

-- For Super Admin roles.
CREATE TABLE "SuperAdminRole" (
    "userId" VARCHAR(255) PRIMARY KEY,
    "role" VARCHAR(50) NOT NULL DEFAULT 'super_admin',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
