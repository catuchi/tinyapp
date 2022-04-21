const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const { generateRandomString } = require("./shortURL");

// middleware used to make data received from POST requests to be readable
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// instruct Express app to use EJS as templating engine
app.set("view engine", "ejs");


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "2"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "1"
  }
};
const urlsForUser = (id) => {
  const result = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === id) {
      result[shorturl] = urlDatabase[shorturl];
    }
  }
  return result;
}

// const users = { 
//   "user1": {
//     id: "1", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2": {
//     id: "2", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   },
//  "user3": {
//     id: "3", 
//     email: "user3@example.com", 
//     password: "dishwasher-funk"
//   }
// };

const users = {
  1: { id: 1, email: 'obiwan@gmail.com', password: 'helloThere' },
  2: { id: 2, email: 'gimli@gmail.com', password: 'andMyAxe' },
  3: { id: 3, email: 'a@b.com', password: '123' },
};

const findUserByEmail = (newUserEmail, database) => {
  // const givenEmail = email;
  for (let user in database) {
    // if givenEmail == the current user im looping through, then i found the right user
    if (database[user].email === newUserEmail) {
      console.log("the email:", database[user].email, "given email:", newUserEmail);
      // that means i found the right user
      return database[user];
      //  badd, dont do this line below !
      // return res.redirect(`/${userKey}`);
    }
  }
  return false;
}
const findUserId = (newUserEmail, database) => {
  for (let user in database) {
    if (database[user].email === newUserEmail) {
      return database[user].id;
    }
  }
  return false;
}
const findUser = (newUserEmail, newUserPw, database) => {
  for (let user in database) {
    if (database[user].email === newUserEmail) {
      if (database[user].password === newUserPw) {
        return database[user];
      }
    }

  }
  return false;
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
  const user = users[req.cookies.user_id];
  const userUrls = urlsForUser(req.cookies.user_id);

  const templateVars = { user: null, urls: userUrls };
  templateVars.user = user;
  if (user) {

    res.render("urls_index", templateVars);
  } else {
    // res.render("urls_index")
    res.status(403).send("Please register/sign in");
  }
  // const templateVars = { username: req.cookies["username"], urls: urlDatabase };
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;

  if (userId) {
    const templateVars = { user: null };
    const user = users[req.cookies.user_id];
    templateVars.user = user;
    // const templateVars = { username: req.cookies["username"] }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies.user_id];

  if (user) {

    const shortURL = req.params.shortURL;
    const templateVars = { user: null, shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
    const user = users[req.cookies.user_id];
    templateVars.user = user;
    // const templateVars = { username: req.cookies["username"], shortURL: shortURL, longURL: urlDatabase[shortURL] };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("Please register/sign in");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const user = users[req.cookies.user_id];

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
  urlDatabase[randomStr].longURL = req.body.longURL;
  // console.log(req.body.longURL);
  res.redirect(`/urls/${randomStr}`);
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  const user = users[req.cookies.user_id];

  if (user) {
    const shortURL = req.params.shortUrl;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Please register/sign in");
  }

});

app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];

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
  // const { email, password } = req.body;

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

  if (newUserId) {
    res.cookie("user_id", newUserId);
    res.redirect("/urls");
  }



  // console.log(req.body)
  // const user = req.body.username;
  // res.cookie("username", user);
  // res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  // console.log(req.body);
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const newUserId = generateRandomString();

  if (newUserEmail === "" || newUserPassword === "") {
    res.status(400).send("Please enter valid email or password");
    res.end();
  }
  // console.log(users) 
  const user = findUserByEmail(newUserEmail, users);
  console.log("user:", user)
  if (user) {
    res.status(400).send("Email already exist please enter new email");
    res.end();
  } else {
    users[newUserId] = { id: newUserId, email: newUserEmail, password: newUserPassword };
    res.cookie("user_id", newUserId);
    res.redirect("/urls");
  }
  // if (user) {
  //   res.cookie("user_id", user.id);
  //   return res.redirect("/urls");
  // }


  // res.send('Error, bad email, or pass!');
});

app.get("/login", (req, res) => {
  res.render("newLoginPage");
})




// setting up the server to listen to request from the client
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});