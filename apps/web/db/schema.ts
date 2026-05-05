// This is where you define every database table.
// Instead of writing raw SQL, you describe tables as TypeScript objects and Drizzle generates the SQL for you.

// ReviewerTier never used
import {
    pgTable,
    uuid,
    text,
    integer,
    timestamp,
    boolean,
    index,
    vector,
    jsonb,
} from "drizzle-orm/pg-core"
import type { UserRole } from "@repo/shared/types/users"
import type { ModelStatus, ModelFormat, Annotation, AIVerdict } from "@repo/shared/types/models"

// creates table for user data
export const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    role: text("role").$type<UserRole>().default("user").notNull(),
    reputation: integer("reputation").notNull().default(0),
    reviewer_tier: integer("reviewer_tier").notNull().default(0),
    created_at: timestamp("created_at").defaultNow().notNull(),
})

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year"),
    category: text("category").notNull(),
    slug: text("slug").notNull().unique(),
    created_at: timestamp("created_at").defaultNow().notNull(),
})

export const models = pgTable("models", {
    id: uuid("id").primaryKey().defaultRandom(),
    device_id: uuid("device_id")
        .notNull()
        .references(() => devices.id),
    contributor_id: uuid("contributor_id")
        .notNull()
        .references(() => users.id),
    status: text("status").$type<ModelStatus>().notNull().default("pending"),
    format: text("format").$type<ModelFormat>().notNull(),
    raw_file_url: text("raw_file_url"),
    glb_url: text("glb_url"),
    thumbnail_urls: jsonb("thumbnail_urls").$type<string[]>(),
    annotations: jsonb("annotations").$type<Annotation[]>(),
    ai_verdict: jsonb("ai_verdict").$type<AIVerdict>(),
    review_count: integer("review_count").notNull().default(0),
    created_at: timestamp("created_at").defaultNow().notNull(),
})

export const threads = pgTable(
    "threads",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        device_id: uuid("device_id")
            .notNull()
            .references(() => devices.id),
        user_id: uuid("user_id")
            .notNull()
            .references(() => users.id),
        title: text("title").notNull(),
        body: text("body").notNull(),
        embedding: vector("embedding", { dimensions: 1536 }),
        // no .references() — comments reference threads, making this a circular FK
        accepted_answer_id: uuid("accepted_answer_id"),
        upvotes: integer("upvotes").notNull().default(0),
        bounty: integer("bounty").notNull().default(0),
        created_at: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => [index("threads_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops"))]
)

export const comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    thread_id: uuid("thread_id")
        .notNull()
        .references(() => threads.id),
    author_id: uuid("author_id")
        .notNull()
        .references(() => users.id),
    body: text("body").notNull(),
    is_ai_generated: boolean("is_ai_generated").notNull().default(false),
    upvotes: integer("upvotes").notNull().default(0),
    created_at: timestamp("created_at").defaultNow().notNull(),
})

export const model_requests = pgTable("model_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    device_id: uuid("device_id").references(() => devices.id),
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id),
    description: text("description").notNull(),
    bounty: integer("bounty").notNull().default(0),
    fulfilled: boolean("fulfilled").notNull().default(false),
    created_at: timestamp("created_at").defaultNow().notNull(),
})

export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id),
    type: text("type").notNull(),
    payload: jsonb("payload"),
    read: boolean("read").notNull().default(false),
    created_at: timestamp("created_at").defaultNow().notNull(),
})
