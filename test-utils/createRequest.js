// test-utils/createRequest.js
function createJSONRequest(bodyObj = {}) {
  const body = JSON.stringify(bodyObj);
  return new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
module.exports = { createJSONRequest };
