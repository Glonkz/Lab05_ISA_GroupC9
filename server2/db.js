/*
 * Gemini was used to assist in structuring for this assignment.
 */

// allows you to use async and await
const mysql = require("mysql2/promise");
const { SQL_QUERIES } = require("./messages/en/user");

/**
 * Sets up DB connection information.
 */
class DatabaseManager {
    constructor() {
        const host = process.env.DB_HOST || "localhost";
        const port = Number(process.env.DB_PORT) || 3306;
        // schema name
        const database = process.env.DB_NAME || "comp4537_lab5";

        // Read-only user (SELECT privilege only)
        this.readPool = mysql.createPool({
            host,
            port,
            database,
            user: process.env.DB_READ_USER || "patient_reader",
            password: process.env.DB_READ_PASSWORD || "StrongReaderPass123!",
            waitForConnections: true,
            connectionLimit: 5
        });

        // Write/Create user (SELECT, INSERT, CREATE privileges only)
        this.writePool = mysql.createPool({
            host,
            port,
            database,
            user: process.env.DB_WRITE_USER || "patient_writer",
            password: process.env.DB_WRITE_PASSWORD || "StrongWriterPass123!",
            waitForConnections: true,
            connectionLimit: 5
        });
    }

    async ensureTableExists() {
        await this.writePool.execute(SQL_QUERIES.CREATE_PATIENT_TABLE);
    }

    async insertDefaultRows() {
        await this.ensureTableExists();
        const [result] = await this.writePool.execute(SQL_QUERIES.INSERT_DEFAULT_PATIENTS);
        return result;
    }

    async executeWriteQuery(sqlQuery) {
        await this.ensureTableExists();
        const [result] = await this.writePool.query(sqlQuery);
        return result;
    }

    async executeReadQuery(sqlQuery) {
        const [rows] = await this.readPool.query(sqlQuery);
        return rows;
    }
}

module.exports = DatabaseManager;