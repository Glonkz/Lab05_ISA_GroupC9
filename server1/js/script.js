/*
 * Gemini was used to assist in structuring for this assignment.
 */

class PatientApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async insertDefaultPatients() {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        return response.json();
    }

    async sendSqlQuery(sqlQuery) {
        const trimmed = sqlQuery.trim();
        const isInsert = /^INSERT\b/i.test(trimmed);

        if (isInsert) {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmed })
            });
            return response.json();
        } else {
            const encodedSql = encodeURIComponent(`"${trimmed}"`);
            const requestUrl = `${this.baseUrl}/${encodedSql}`;
            const response = await fetch(requestUrl, {
                method: "GET"
            });
            return response.json();
        }
    }
}

class PatientAppUI {
    constructor(apiClient, messages) {
        this.apiClient = apiClient;
        this.messages = messages;

        this.pageTitleEl = document.getElementById("pageTitle");
        this.insertHeaderEl = document.getElementById("insertHeader");
        this.insertBtnEl = document.getElementById("insertBtn");
        this.queryHeaderEl = document.getElementById("queryHeader");
        this.sqlInputEl = document.getElementById("sqlInput");
        this.submitQueryBtnEl = document.getElementById("submitQueryBtn");
        this.responseHeaderEl = document.getElementById("responseHeader");
        this.responseOutputEl = document.getElementById("responseOutput");

        this.initializeStrings();
        this.bindEvents();
    }

    // gets texts from lang/ folder.
    initializeStrings() {
        this.pageTitleEl.textContent = this.messages.PAGE_TITLE;
        this.insertHeaderEl.textContent = this.messages.SECTION_INSERT_HEADER;
        this.insertBtnEl.textContent = this.messages.BTN_INSERT_TEXT;
        this.queryHeaderEl.textContent = this.messages.SECTION_QUERY_HEADER;
        this.sqlInputEl.placeholder = this.messages.TEXTAREA_PLACEHOLDER;
        this.sqlInputEl.value = this.messages.TEXTAREA_PLACEHOLDER;
        this.submitQueryBtnEl.textContent = this.messages.BTN_SUBMIT_QUERY_TEXT;
        this.responseHeaderEl.textContent = this.messages.RESPONSE_HEADER;
    }

    bindEvents() {
        this.insertBtnEl.addEventListener("click", () => this.handleInsertClick());
        this.submitQueryBtnEl.addEventListener("click", () => this.handleQuerySubmit());
    }

    displayResponse(data) {
        this.responseOutputEl.textContent = JSON.stringify(data, null, 2);
    }

    async handleInsertClick() {
        this.responseOutputEl.textContent = this.messages.STATUS_LOADING;
        try {
            const result = await this.apiClient.insertDefaultPatients();
            this.displayResponse(result);
        } catch (err) {
            this.responseOutputEl.textContent = `${this.messages.ERR_NETWORK}${err.message}`;
        }
    }

    async handleQuerySubmit() {
        const query = this.sqlInputEl.value.trim();
        if (!query) {
            this.responseOutputEl.textContent = this.messages.ERR_EMPTY_SQL;
            return;
        }

        this.responseOutputEl.textContent = this.messages.STATUS_LOADING;
        try {
            const result = await this.apiClient.sendSqlQuery(query);
            this.displayResponse(result);
        } catch (err) {
            this.responseOutputEl.textContent = `${this.messages.ERR_NETWORK}${err.message}`;
        }
    }
}


const API_BASE_URL = "https://lab05isagroupc9-production.up.railway.app/lab5/api/v1/sql";

const apiClient = new PatientApiClient(API_BASE_URL);
const appUI = new PatientAppUI(apiClient, USER_MESSAGES);