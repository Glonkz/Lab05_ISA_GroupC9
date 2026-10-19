/*
 * Gemini was used to assist in structuring for this assignment.
 */

const MESSAGES = {
    SERVER_RUNNING: "Server 2 (SQL API) is running on port ",
    ERR_METHOD_NOT_ALLOWED: "Method Not Allowed. Use GET for SELECT and POST for INSERT.",
    ERR_NOT_FOUND: "Endpoint not found. Expected /lab5/api/v1/sql",
    ERR_EMPTY_QUERY: "No SQL query provided.",
    ERR_INVALID_JSON: "Invalid request body.",
    MSG_DEFAULT_INSERT_SUCCESS: "Successfully inserted 4 default patient rows.",
    MSG_QUERY_SUCCESS: "Query executed successfully."
};

const SQL_QUERIES = {
    CREATE_PATIENT_TABLE: `
        CREATE TABLE IF NOT EXISTS patient (
            patientid INT(11) AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            dateOfBirth DATETIME NOT NULL
        ) ENGINE=InnoDB;
    `,
    INSERT_DEFAULT_PATIENTS: `
        INSERT INTO patient (name, dateOfBirth) VALUES
        ('Sara Brown', '1901-01-01'),
        ('John Smith', '1941-01-01'),
        ('Jack Ma', '1961-01-30'),
        ('Elon Musk', '1999-01-01');
    `
};

module.exports = { MESSAGES, SQL_QUERIES };