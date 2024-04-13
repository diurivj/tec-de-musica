CREATE TABLE `classrooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (cast (unixepoch () as int)),
	`updated_at` integer DEFAULT (cast (unixepoch () as int))
);
--> statement-breakpoint
CREATE TABLE `instruments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (cast (unixepoch () as int)),
	`updated_at` integer DEFAULT (cast (unixepoch () as int))
);
--> statement-breakpoint
CREATE TABLE `instruments_to_classrooms` (
	`classroom_id` integer NOT NULL,
	`instrument_id` integer NOT NULL,
	PRIMARY KEY(`classroom_id`, `instrument_id`),
	FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `instruments_to_users` (
	`user_id` integer NOT NULL,
	`instrument_id` integer NOT NULL,
	PRIMARY KEY(`instrument_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`teacher_id` integer NOT NULL,
	`reporter_id` integer NOT NULL,
	`instrument_id` integer NOT NULL,
	`classroom_id` integer NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`type` text,
	`origin_id` integer,
	`created_at` integer DEFAULT (cast (unixepoch () as int)),
	`updated_at` integer DEFAULT (cast (unixepoch () as int))
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`reporter_id` integer NOT NULL,
	`created_at` integer DEFAULT (cast (unixepoch () as int)),
	`updated_at` integer DEFAULT (cast (unixepoch () as int))
);
--> statement-breakpoint
CREATE TABLE `passwords` (
	`hash` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`lastname` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`birthdate` text,
	`phone_number` text,
	`profile_picture` text,
	`created_at` integer DEFAULT (cast (unixepoch () as int)),
	`updated_at` integer DEFAULT (cast (unixepoch () as int))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classrooms_name_unique` ON `classrooms` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `instruments_name_unique` ON `instruments` (`name`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `lessons` (`type`);--> statement-breakpoint
CREATE INDEX `start_date_idx` ON `lessons` (`start_date`);--> statement-breakpoint
CREATE INDEX `end_date_idx` ON `lessons` (`end_date`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `lessons` (`student_id`);--> statement-breakpoint
CREATE INDEX `teacher_idx` ON `lessons` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `reporter_idx` ON `lessons` (`reporter_id`);--> statement-breakpoint
CREATE INDEX `instrument_idx` ON `lessons` (`instrument_id`);--> statement-breakpoint
CREATE INDEX `classroom_idx` ON `lessons` (`classroom_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `users` (`created_at`);--> statement-breakpoint
CREATE INDEX `updated_at_idx` ON `users` (`updated_at`);