import mysql from "mysql2/promise";

const connect = () =>
mysql.createConnection({
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT || 4000),
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
});

export default async (req) => {
const db = await connect();
try {
if (req.method === "GET") {
const [rows] = await db.execute(
"SELECT id, author, title, created_at FROM notes ORDER BY id DESC LIMIT 200"
);
return Response.json(rows);
}
if (req.method === "POST") {
const body = await req.json();
const author = String(body.author || "").trim().slice(0, 60);
const title = String(body.title || "").trim().slice(0, 255);
if (!author || !title) return Response.json({ error: "ism va matn kerak" }, { status: 400 });
await db.execute("INSERT INTO notes (author, title) VALUES (?, ?)", [author, title]);
return Response.json({ ok: true });
}
return new Response("Method not allowed", { status: 405 });
} catch (e) {
return Response.json({ error: e.message }, { status: 500 });
} finally {
await db.end();
}
};

export const config = { path: "/api" };
