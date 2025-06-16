export default {
  input: "http://127.0.0.1:8089/schema/openapi.json",
  output: "client",
  plugins: ["@hey-api/client-axios"],
};
