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
      console.log("the email:", database[user].email, "given email:", newUserEmail);
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

module.exports = {
  generateRandomString,
  urlsForUser,
  findUserByEmail,
  findUserId,
  findUser
}