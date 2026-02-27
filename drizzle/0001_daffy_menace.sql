CREATE TABLE `authorizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`guardianId` int NOT NULL,
	`isAuthorized` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authorizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `children` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int,
	`classroom` varchar(100),
	`photoUrl` text,
	`faceEmbedding` json,
	`parentPhone` varchar(20),
	`parentEmail` varchar(320),
	`parentName` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `children_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exitLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`guardianId` int,
	`guardianPhotoUrl` text,
	`childPhotoUrl` text,
	`isAuthorized` boolean NOT NULL,
	`matchConfidence` float,
	`status` enum('approved','denied','pending','manual_review') NOT NULL DEFAULT 'approved',
	`notes` text,
	`exitTime` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exitLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guardians` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(20) NOT NULL,
	`relationship` varchar(100),
	`phone` varchar(20),
	`email` varchar(320),
	`photoUrl` text,
	`faceEmbedding` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guardians_id` PRIMARY KEY(`id`),
	CONSTRAINT `guardians_cpf_unique` UNIQUE(`cpf`)
);
