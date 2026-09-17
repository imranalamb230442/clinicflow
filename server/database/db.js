const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const databaseDir = path.join(__dirname, "../../database");
const databasePath = path.join(databaseDir, "clinicflow.db");

if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
}

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

console.log("✅ SQLite database connected");
console.log(`📁 Database: ${databasePath}`);
db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id INTEGER,
        patient_id INTEGER,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
`);

module.exports = db;
