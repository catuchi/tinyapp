const bcrypt = require('bcryptjs');

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const urlsForUser = (id, urlDatabase) => {
  const result = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === id) {
      result[shorturl] = urlDatabase[shorturl];
    }
  }
  return result;
};

const findUserByEmail = (newUserEmail, database) => {
  for (let user in database) {
    if (database[user].email === newUserEmail) {
      return database[user];
    }
  }
  return undefined;
};

const findUserId = (newUserEmail, database) => {
  for (let user in database) {
    if (database[user].email === newUserEmail) {
      return database[user].id;
    }
  }
  return false;
};

const findUser = (newUserEmail, newUserPw, database) => {
  for (let user in database) {
    if (database[user].email === newUserEmail) {
      if (bcrypt.compareSync(newUserPw, database[user].password)) {
        return database[user];
      }
    }
  }
  return false;
};

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
  },
  QiiEEp: {
    longURL: "http://youtube.com",
    userID: "JEEOF1"
  },
  "4frbpi": {
    longURL: "http://yahoo.com",
    userID: "JEEOF1"
  },
  JuU2Qa: {
    longURL: "http://amazon.com",
    userID: "JEEOF1"
  },
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
  },
  JEEOF1: {
    id: 'JEEOF1',
    email: 'obiwan@gmail.com',
    password: '$2a$10$TqGh5H9ESrqboEWiFAKIfer.kP1UAQPuqa4V0XzzJg6rDUZpQi.pq'
  }
};

module.exports = {
  generateRandomString,
  urlsForUser,
  findUserByEmail,
  findUserId,
  findUser,
  urlDatabase,
  users
}