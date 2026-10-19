/*
 * Gemini was used to assist in structuring for this assignment.
 */

const http = require("http");
const url = require("url");
const DatabaseManager = require("./db");
const { MESSAGES } = require("./messages/en/user");

class SqlApiServer {
    constructor(port, dbManager) {
        this.port = port;
        this.dbManager = dbManager;
        this.baseRoute = "/lab5/api/v1/sql";
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
    }

    setCorsHeaders(res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    sendJson(res, statusCode, payload) {
        this.setCorsHeaders(res);
        res.writeHead(statusCode, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
    }

    extractSqlFromUrl(parsedUrl) {
        const pathname = parsedUrl.pathname || "";

        // Query passed in URL path: /lab5/api/v1/sql/"select * from patient"
        if (pathname.startsWith(this.baseRoute + "/")) {
            const rawSegment = pathname.slice((this.baseRoute + "/").length);
            const decoded = decodeURIComponent(rawSegment).trim();
            // Strips surrounding quotes
            return decoded.replace(/^["']+|["']+$/g, "").trim();
        }

        // Query passed via ?query=... or ?sql=...
        if (pathname === this.baseRoute || pathname === this.baseRoute + "/") {
            const rawParam = parsedUrl.query.query || parsedUrl.query.sql || "";
            return rawParam.replace(/^["']+|["']+$/g, "").trim();
        }

        return null;
    }

    async handleGet(req, res, parsedUrl) {
        const sqlQuery = this.extractSqlFromUrl(parsedUrl);

        if (!sqlQuery) {
            return this.sendJson(res, 400, {
                success: false,
                error: MESSAGES.ERR_EMPTY_QUERY
            });
        }

        try {
            // Uses the SELECT-only database user (blocks DROP, DELETE, UPDATE, INSERT)
            const rows = await this.dbManager.executeReadQuery(sqlQuery);
            return this.sendJson(res, 200, {
                success: true,
                message: MESSAGES.MSG_QUERY_SUCCESS,
                data: rows
            });
        } catch (err) {
            return this.sendJson(res, 403, {
                success: false,
                error: err.message
            });
        }
    }

    handlePost(req, res) {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const parsedBody = body ? JSON.parse(body) : {};
                const customQuery = parsedBody.query ? parsedBody.query.trim() : "";

                // If a custom SQL query was sent via POST (e.g., an INSERT statement)
                if (customQuery) {
                    const result = await this.dbManager.executeWriteQuery(customQuery);
                    return this.sendJson(res, 200, {
                        success: true,
                        message: MESSAGES.MSG_QUERY_SUCCESS,
                        data: result
                    });
                }

                // Default behavior when clicking the Insert Button
                const result = await this.dbManager.insertDefaultRows();
                return this.sendJson(res, 200, {
                    success: true,
                    message: MESSAGES.MSG_DEFAULT_INSERT_SUCCESS,
                    affectedRows: result.affectedRows,
                    insertId: result.insertId
                });
            } catch (err) {
                return this.sendJson(res, 400, {
                    success: false,
                    error: err.message
                });
            }
        });
    }

    handleRequest(req, res) {
        if (req.method === "OPTIONS") {
            this.setCorsHeaders(res);
            res.writeHead(204);
            return res.end();
        }

        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname || "";

        if (!pathname.startsWith(this.baseRoute)) {
            return this.sendJson(res, 404, {
                success: false,
                error: MESSAGES.ERR_NOT_FOUND
            });
        }

        if (req.method === "GET") {
            return this.handleGet(req, res, parsedUrl);
        }

        if (req.method === "POST") {
            return this.handlePost(req, res);
        }

        return this.sendJson(res, 405, {
            success: false,
            error: MESSAGES.ERR_METHOD_NOT_ALLOWED
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`${MESSAGES.SERVER_RUNNING}${this.port}`);
        });
    }
}

const PORT = process.env.PORT || 3000;
const dbManager = new DatabaseManager();
const apiServer = new SqlApiServer(PORT, dbManager);
apiServer.start();