CREATE TABLE "Doujinshi" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title"         TEXT NOT NULL,
    "author"        TEXT NOT NULL,
    "genres"        TEXT[],
    "publishedDate" TIMESTAMPTZ NOT NULL,
    "thumbnailUrl"  TEXT,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);