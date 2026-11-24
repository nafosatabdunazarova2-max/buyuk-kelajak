mport mysql from "mysql2/promise";

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
let db;
try {
db = await connect();

await db.execute(
CREATE TABLE IF NOT EXISTS notes (
id INT AUTO_INCREMENT PRIMARY KEY,
author VARCHAR(100) NOT NULL,
title VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
);

if (req.method === "GET") {
const [rows] = await db.execute(
"SELECT id, author, title, created_at FROM notes ORDER BY id DESC LIMIT 200"
);
return Response.json(rows);
}

if (req.method === "POST") {
const body = await req.json();
const author = String(body.author || "Mehmon").trim().slice(0, 60);
const title = String(body.title || "").trim().slice(0, 255);
if (!title) {
return Response.json({ error: "Xabar matni kerak" }, { status: 400 });
}
await db.execute("INSERT INTO notes (author, title) VALUES (?, ?)", [
author,
title,
]);
return Response.json({ ok: true });
}

return new Response("Method not allowed", { status: 405 });
} catch (e) {
return Response.json({ error: e.message }, { status: 500 });
} finally {
if (db) await db.end();
}
};
