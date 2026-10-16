-- Comments left on the gnycyouth.org prototype pages. One row per comment; deletions are soft.
-- page: the page key (hm, pf, pbe, ...); slot: the content-slot code the comment is about (HM-05), NULL for the whole page.
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  slot TEXT,
  parent_id INTEGER,            -- the comment this replies to; NULL for a comment that starts a thread
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS comments_page ON comments (page, created_at);
CREATE INDEX IF NOT EXISTS comments_slot ON comments (page, slot);
CREATE INDEX IF NOT EXISTS comments_ip ON comments (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS comments_parent ON comments (parent_id);
