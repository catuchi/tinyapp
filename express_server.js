const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { generateRandomString, urlsForUser, findUserByEmail } = require("./helperFunctions");
const { findUserId, findUser } = require("./helperFunctions");
const { urlDatabase, users } = require("./helperFunctions");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["paraguay"],

  maxAge: 24 * 60 * 60 * 1000
}))

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  if (req.session.user_id === undefined) {
    const templateVars = { user: null, urls: null };
    res.render("urls_index", templateVars);
  }

  const user = users[req.session.user_id];
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);

  const templateVars = { user: null, urls: userUrls };
  templateVars.user = user;
  if (user) {

    res.render("urls_index", templateVars);
  } else {
    const templateVars = { user: null, urls: userUrls };
    res.render("urls_index", templateVars)
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    const templateVars = { user: null };
    const user = users[req.session.user_id];
    templateVars.user = user;
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.get("/urls/:shortURL", (req, res) => {
  
  let user = users[req.session.user_id];
  let shortURL = req.params.shortURL;

  if (user.id === urlDatabase[shortURL].userID) {
    const templateVars = { user: users[req.session.user_id], shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
    res.render("urls_show", templateVars);
  } else if (user.id === urlDatabase[shortURL].userID) {
    res.redirect("/urls");
  } else {
    res.status(403).send("Please register/sign in");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(403).send("Please register/sign in");
  }

});

app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = randomStr
  urlDatabase[randomStr] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${randomStr}`);
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    const shortURL = req.params.shortUrl;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Please register/sign in");
  }

});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    const shortURL = req.params.id;
    const long = req.body.longURL;
    urlDatabase[shortURL].longURL = long;
    res.redirect("/urls");
  } else {
    res.status(403).send("Please register/sign in");
  }

});

app.post("/login", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  const emailTest = findUserByEmail(newUserEmail, users)
  if (emailTest === false) {
    res.status(403).send("Email can not be found");
    res.end();
  }

  const emailPwTest = findUser(newUserEmail, newUserPassword, users)
  if (emailPwTest === false) {
    res.status(403).send("Password does not match");
    res.end();
  }

  const newUserId = findUserId(newUserEmail, users)
  req.session.user_id = newUserId;

  if (newUserId) {
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls")
  } else {
    const templateVars = { user };
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = bcrypt.hashSync(req.body.password, 10);
  const newUserId = generateRandomString();

  if (newUserEmail === "" || newUserPassword === "") {
    res.status(400).send("Please enter valid email or password");
    res.end();
  }
  const user = findUserByEmail(newUserEmail, users);
  if (user) {
    res.status(400).send("Email already exist please enter new email");
  } else {
    users[newUserId] = { id: newUserId, email: newUserEmail, password: newUserPassword };
    req.session.user_id = newUserId;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls")
  } else {
    const templateVars = { user };
    res.render("newLoginPage", templateVars);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});