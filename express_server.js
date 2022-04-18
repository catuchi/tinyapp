const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// for a get request of / this server is sending hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

// setting up the server to listen to request from the client
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});