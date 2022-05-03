const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session');
const { generateRandomString, urlsForUser, findUserByEmail } = require("./helperFunctions");
const { findUserId, findUser } = require("./helperFunctions");

// middleware used to make data received from POST requests to be readable
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ["paraguay"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// instruct Express app to use EJS as templating engine
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "nkzSdf"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "nkzSdf"
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "nkzSdf"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "nkzSdf"
  }
};


const users = { 
  "user1": {
    id: "user1", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2": {
    id: "user2", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
 "user3": {
    id: "user3", 
    email: "user3@example.com", 
    password: "dishwasher-funk"
  },
  nkzSdf: {
    id: 'nkzSdf',
    email: 'bigfish@ocean.ca',
    password: '$2a$10$qeJUBb5zboOqPTLiCI.30eRqqw2r4rhH1VnUs0JuNGjwxYm.aM7Fa'
  }
};


// for a get request of / this server is sending hello
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// add route /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log("sess", req.session.user_id)
  console.log("cook", req.cookies)

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
    console.log("shorturl:", shortURL)
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

// app.get("/urls/:id", (req, res) => {

// });

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
  console.log(req.body)
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
    res.cookie("user_id", req.session.user_id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls")
  } else {
    res.render("register");
  }
  // res.render("register");
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
    // res.end();
  } else {
    users[newUserId] = { id: newUserId, email: newUserEmail, password: newUserPassword };
    req.session.user_id = newUserId;
    res.cookie("user_id", req.session.user_id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls")
  } else {
    res.render("newLoginPage");
  }
  // res.render("newLoginPage");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});