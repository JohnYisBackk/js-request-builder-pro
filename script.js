"use strict";

// ======================================================
// SELECT ELEMENTS
// ======================================================

const methodInput = document.getElementById("methodInput");

const urlInput = document.getElementById("urlInput");

const sendBtn = document.getElementById("sendBtn");

const resetBtn = document.getElementById("resetBtn");

const tabButtons = document.querySelectorAll(".tab-btn");

const tabContents = document.querySelectorAll(".tab-content");

const addHeaderBtn = document.getElementById("addHeaderBtn");

const headersList = document.getElementById("headersList");

const headersCount = document.getElementById("headersCount");

const headersEmptyState = document.getElementById("headersEmptyState");

const bodyInput = document.getElementById("bodyInput");

const formatBodyBtn = document.getElementById("formatBodyBtn");

const bodyStatus = document.getElementById("bodyStatus");

const bodyError = document.getElementById("bodyError");

const statusValue = document.getElementById("statusValue");

const timeValue = document.getElementById("timeValue");

const sizeValue = document.getElementById("sizeValue");

const responseOutput = document.getElementById("responseOutput");

const responseLoading = document.getElementById("responseLoading");

const requestError = document.getElementById("requestError");

const requestErrorMessage = document.getElementById("requestErrorMessage");

const copyResponseBtn = document.getElementById("copyResponseBtn");

const formatResponseBtn = document.getElementById("formatResponseBtn");

// ======================================================
// STATE
// ======================================================

let responseData = null;

// ======================================================
// SWITCH TABS
// ======================================================

function switchTab(tabName) {
  tabButtons.forEach((button) => {
    if (button.dataset.tab === tabName) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  tabContents.forEach((content) => {
    if (content.dataset.content === tabName) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}

// ======================================================
// CREATE HEADER ROW
// ======================================================

function createHeaderRow() {
  const headerRow = document.createElement("div");

  headerRow.classList.add("header-row");

  headerRow.innerHTML = `
    <input
      type="text"
      class="header-key"
      placeholder="Header name"
    />

    <input
      type="text"
      class="header-value"
      placeholder="Header value"
    />

    <button
      class="remove-header-btn"
      type="button"
      aria-label="Remove header"
    >
      ×
    </button>
  `;

  headersList.append(headerRow);

  updateHeadersUI();
}

// ======================================================
// REMOVE HEADER ROW
// ======================================================ň

function removeHeaderRow(button) {
  const headerRow = button.closest(".header-row");

  headerRow.remove();

  updateHeadersUI();
}

// ======================================================
// UPDATE HEADERS UI
// ======================================================

function updateHeadersUI() {
  const headerRows = document.querySelectorAll(".header-row");

  headersCount.textContent = headerRows.length;

  if (headerRows.length === 0) {
    headersList.classList.add("hidden");

    headersEmptyState.classList.remove("hidden");
  } else {
    headersList.classList.remove("hidden");

    headersEmptyState.classList.add("hidden");
  }
}

// ======================================================
// GET REQUEST HEADERS
// ======================================================

function getRequestHeaders() {
  let headers = {};

  const headerRows = document.querySelectorAll(".header-row");

  headerRows.forEach((row) => {
    const key = row.querySelector(".header-key").value.trim();
    const value = row.querySelector(".header-value").value.trim();

    if (key !== "") {
      headers[key] = value;
    }
  });

  return headers;
}

// ======================================================
// VALIDATE JSON BODY
// ======================================================

function validateJsonBody() {
  const bodyValue = bodyInput.value.trim();

  if (bodyValue === "") {
    bodyError.textContent = "";
    bodyStatus.textContent = "Ready";

    return true;
  }

  try {
    JSON.parse(bodyValue);

    bodyStatus.textContent = "Valid JSON";
    bodyError.textContent = "";

    return true;
  } catch (error) {
    bodyStatus.textContent = "Invalid JSON";
    bodyError.textContent = error.message;

    return false;
  }
}

// ======================================================
// FORMAT REQUEST BODY
// ======================================================

function formatRequestBody() {
  const bodyValue = bodyInput.value.trim();

  if (bodyValue === "") return;

  try {
    const data = JSON.parse(bodyValue);

    const formattedJson = JSON.stringify(data, null, 2);

    bodyInput.value = formattedJson;

    bodyError.textContent = "";
    bodyStatus.textContent = "Valid JSON";
  } catch (error) {
    bodyStatus.textContent = "Invalid JSON";
    bodyError.textContent = error.message;
  }
}

// ======================================================
// GET REQUEST BODY
// ======================================================

function getRequestBody() {
  const method = methodInput.value;

  if (method === "GET" || method === "DELETE") {
    return null;
  }

  const bodyValue = bodyInput.value.trim();

  if (bodyValue === "") {
    return null;
  }

  try {
    JSON.parse(bodyValue);
  } catch {
    throw new Error("Request body contains invalid JSON.");
  }

  return bodyValue;
}

// ======================================================
// SET LOADING STATE
// ======================================================

function setLoadingState(isLoading) {
  sendBtn.disabled = isLoading;

  sendBtn.classList.toggle("loading", isLoading);

  responseLoading.classList.toggle("hidden", !isLoading);

  if (isLoading) {
    requestError.classList.add("hidden");
  }
}

// ======================================================
// GET RESPONSE SIZE
// ======================================================

function getResponseSize(text) {
  const bytes = new Blob([text]).size;

  const kilobytes = bytes / 1024;

  return `${kilobytes.toFixed(2)} KB`;
}

// ======================================================
// GET STATUS CLASS
// ======================================================

function getStatusClass(status) {
  if (status >= 200 && status <= 299) {
    return "status-success";
  }

  if (status >= 300 && status <= 399) {
    return "status-warning";
  }

  return "status-error";
}

// ======================================================
// RENDER RESPONSE
// ======================================================

function renderResponse(response, responseText, requestTime) {
  responseData = responseText;

  statusValue.textContent = `${response.status} ${response.statusText}`;

  statusValue.classList.remove(
    "status-neutral",
    "status-success",
    "status-warning",
    "status-error",
  );

  statusValue.classList.add(getStatusClass(response.status));

  timeValue.textContent = `${requestTime} ms`;

  sizeValue.textContent = getResponseSize(responseText);

  try {
    const parsedData = JSON.parse(responseText);

    responseOutput.textContent = JSON.stringify(parsedData, null, 2);
  } catch {
    responseOutput.textContent = responseText;
  }

  copyResponseBtn.disabled = false;
  formatResponseBtn.disabled = false;
}

// ======================================================
// RENDER ERROR
// ======================================================

function renderError(error) {
  requestError.classList.remove("hidden");

  requestErrorMessage.textContent = error.message;

  responseOutput.textContent = "Request could not be completed.";

  statusValue.textContent = "Error";

  statusValue.classList.remove(
    "status-neutral",
    "status-success",
    "status-warning",
    "status-error",
  );

  statusValue.classList.add("status-error");

  timeValue.textContent = "— ms";
  sizeValue.textContent = "— KB";

  copyResponseBtn.disabled = true;
  formatResponseBtn.disabled = true;
}

// ======================================================
// SEND REQUEST
// ======================================================

async function sendRequest() {
  const method = methodInput.value;

  const url = urlInput.value.trim();

  if (url === "") {
    renderError(new Error("Please enter a request URL."));
    return;
  }

  try {
    const requestOptions = {
      method: method,
      headers: getRequestHeaders(),
    };

    const body = getRequestBody();

    if (body !== null) {
      requestOptions.body = body;
    }

    setLoadingState(true);

    const startTime = performance.now();

    const response = await fetch(url, requestOptions);

    const responseText = await response.text();

    const endTime = performance.now();

    const requestTime = Math.round(endTime - startTime);

    renderResponse(response, responseText, requestTime);
  } catch (error) {
    renderError(error);
  } finally {
    setLoadingState(false);
  }
}

// ======================================================
// FORMAT RESPONSE
// ======================================================

function formatResponse() {
  if (!responseData) return;

  try {
    const parsedData = JSON.parse(responseData);

    responseOutput.textContent = JSON.stringify(parsedData, null, 2);
  } catch {
    responseOutput.textContent = responseData;
  }
}

// ======================================================
// COPY RESPONSE
// ======================================================

async function copyResponse() {
  if (!responseData) return;

  try {
    await navigator.clipboard.writeText(responseOutput.textContent);

    copyResponseBtn.textContent = "Copied ✓";

    setTimeout(() => {
      copyResponseBtn.textContent = "Copy Response";
    }, 1500);
  } catch {
    copyResponseBtn.textContent = "Copy failed";
  }
}

// ======================================================
// RESET REQUEST
// ======================================================

function resetRequest() {
  methodInput.value = "GET";

  urlInput.value = "";
  bodyInput.value = "";

  bodyError.textContent = "";
  bodyStatus.textContent = "Ready";

  headersList.innerHTML = "";

  headersList.innerHTML = `
    <div class="header-row">
      <input
        type="text"
        class="header-key"
        value="Content-Type"
        placeholder="Header name"
      />

      <input
        type="text"
        class="header-value"
        value="application/json"
        placeholder="Header value"
      />

      <button
        class="remove-header-btn"
        type="button"
        aria-label="Remove header"
      >
        ×
      </button>
    </div>
  `;

  responseData = null;

  responseOutput.textContent = "Send a request to display the server response.";

  statusValue.textContent = "—";
  timeValue.textContent = "— ms";
  sizeValue.textContent = "— KB";

  statusValue.classList.remove(
    "status-success",
    "status-warning",
    "status-error",
  );

  statusValue.classList.add("status-neutral");

  copyResponseBtn.disabled = true;
  formatResponseBtn.disabled = true;

  requestError.classList.add("hidden");

  updateHeadersUI();

  switchTab("headers");

  handleMethodChange();
}

// ======================================================
// HANDLE METHOD CHANGE
// ======================================================

function handleMethodChange() {
  const method = methodInput.value;

  if (method === "GET" || method === "DELETE") {
    bodyInput.disabled = true;

    bodyInput.placeholder = "This HTTP method does not use a request body.";
  } else {
    bodyInput.disabled = false;

    bodyInput.placeholder = `{
  "title": "Frontend Developer",
  "completed": false
}`;
  }
}

// ======================================================
// EVENT LISTENERS
// ======================================================

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;

    switchTab(tabName);
  });
});

addHeaderBtn.addEventListener("click", createHeaderRow);

headersList.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-header-btn")) {
    removeHeaderRow(event.target);
  }
});

bodyInput.addEventListener("input", validateJsonBody);

formatBodyBtn.addEventListener("click", formatRequestBody);

methodInput.addEventListener("change", handleMethodChange);

sendBtn.addEventListener("click", sendRequest);

resetBtn.addEventListener("click", resetRequest);

copyResponseBtn.addEventListener("click", copyResponse);

formatResponseBtn.addEventListener("click", formatResponse);

urlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendRequest();
  }
});

// ======================================================
// INITIALIZE APP
// ======================================================

updateHeadersUI();

handleMethodChange();

switchTab("headers");
