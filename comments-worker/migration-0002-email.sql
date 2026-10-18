-- 0002: signed-in comments. The poster's email (from the Cloudflare Access sign-in on the staff copy) is kept so a
-- comment can be traced and rate-limited per person; the service never returns it. Older comments keep email NULL.
-- Additive only: no existing row or column changes. Rollback: the column can stay; the old Worker ignores it.
-- SQLite has no ADD COLUMN IF NOT EXISTS: run the ALTER only if `SELECT name FROM pragma_table_info('comments') WHERE
-- name = 'email'` returns no row, and send the two statements separately so a repeat cannot skip the index.
ALTER TABLE comments ADD COLUMN email TEXT;
CREATE INDEX IF NOT EXISTS comments_email ON comments (email, created_at);
