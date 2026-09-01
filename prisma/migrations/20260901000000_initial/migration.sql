-- Better Auth and Habit Shaper initial schema.
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `emailVerified` BOOLEAN NOT NULL DEFAULT false,
  `image` TEXT NULL,
  `timeZone` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Session` (
  `id` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `ipAddress` VARCHAR(255) NULL,
  `userAgent` TEXT NULL,
  `userId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Session_token_key` (`token`),
  INDEX `Session_userId_idx` (`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Account` (
  `id` VARCHAR(191) NOT NULL,
  `issuer` VARCHAR(255) NOT NULL,
  `accountId` VARCHAR(255) NOT NULL,
  `providerId` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `accessToken` TEXT NULL,
  `refreshToken` TEXT NULL,
  `idToken` TEXT NULL,
  `accessTokenExpiresAt` DATETIME(3) NULL,
  `refreshTokenExpiresAt` DATETIME(3) NULL,
  `scope` TEXT NULL,
  `password` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Account_issuer_accountId_key` (`issuer`, `accountId`),
  INDEX `Account_userId_idx` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Verification` (
  `id` VARCHAR(191) NOT NULL,
  `identifier` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Verification_identifier_idx` (`identifier`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Habit` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `type` ENUM('BUILD', 'BREAK') NOT NULL,
  `startDate` DATE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Habit_id_type_key` (`id`, `type`),
  INDEX `Habit_userId_createdAt_idx` (`userId`, `createdAt`),
  CONSTRAINT `Habit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Goal` (
  `id` VARCHAR(191) NOT NULL,
  `habitId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Goal_habitId_idx` (`habitId`),
  CONSTRAINT `Goal_habitId_fkey` FOREIGN KEY (`habitId`) REFERENCES `Habit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Completion` (
  `habitId` VARCHAR(191) NOT NULL,
  `habitType` ENUM('BUILD', 'BREAK') NOT NULL DEFAULT 'BUILD',
  `trackingDay` DATE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`habitId`, `trackingDay`),
  INDEX `Completion_habitId_habitType_idx` (`habitId`, `habitType`),
  CONSTRAINT `Completion_habit_type_check` CHECK (`habitType` = 'BUILD'),
  CONSTRAINT `Completion_habitId_fkey` FOREIGN KEY (`habitId`) REFERENCES `Habit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Completion_habitId_habitType_fkey` FOREIGN KEY (`habitId`, `habitType`) REFERENCES `Habit` (`id`, `type`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Relapse` (
  `habitId` VARCHAR(191) NOT NULL,
  `habitType` ENUM('BUILD', 'BREAK') NOT NULL DEFAULT 'BREAK',
  `trackingDay` DATE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`habitId`, `trackingDay`),
  INDEX `Relapse_habitId_habitType_idx` (`habitId`, `habitType`),
  CONSTRAINT `Relapse_habit_type_check` CHECK (`habitType` = 'BREAK'),
  CONSTRAINT `Relapse_habitId_fkey` FOREIGN KEY (`habitId`) REFERENCES `Habit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Relapse_habitId_habitType_fkey` FOREIGN KEY (`habitId`, `habitType`) REFERENCES `Habit` (`id`, `type`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
