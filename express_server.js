const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const { generateRandomString } = require("./shortURL");

// middleware used to make data received from POST requests to be readable
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

// instruct Express app to use EJS as templating engine
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "user1": {
    id: "1", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2": {
    id: "2", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
 "user3": {
    id: "3", 
    email: "user3@example.com", 
    password: "dishwasher-funk"
  }
};

const findUserByEmail = (email) => {
  const givenEmail = email;
  // loop through my object of users
  // i will "authenticate them"!
  for (let userKey in users) {
    console.log(userKey);
    console.log(users[userKey]);
    // if givenEmail == the current user im looping through, then i found the right user
    if (users[userKey].email === givenEmail) {
      // that means i found the right user
      return users[userKey];
      //  badd, dont do this line below !
      // return res.redirect(`/${userKey}`);

    }
  }
  return undefined;
}

// for a get request of / this server is sending hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

// add route /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  // console.log(req.body.longURL);
  res.redirect(`/urls/${randomStr}`);
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  const shortURL = req.params.shortUrl;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const long = req.body.longURL;
  urlDatabase[shortURL] = long;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  // console.log(req.body);
  const user = findUserByEmail(req.body.email);
  if (user) {
    res.cookie('user_id', user.id);
    return res.redirect('/');
  }

  return res.send('Error, bad email, or pass!');
})




// setting up the server to listen to request from the client
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});