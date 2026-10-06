const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve books", error: error.message });
  }
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  let filteredBooks = {};
  const keys = Object.keys(books);
  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === authorParam) {
      filteredBooks[key] = books[key];
    }
  });

  if (Object.keys(filteredBooks).length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const titleParam = req.params.title.toLowerCase();
  let filteredBooks = {};
  const keys = Object.keys(books);
  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === titleParam) {
      filteredBooks[key] = books[key];
    }
  });

  if (Object.keys(filteredBooks).length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with the given title" });
  }
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ============================================================================
// Tasks 10 to 13: Asynchronous methods using Promise callbacks / async-await with Axios
// ============================================================================

// Task 10: Get all books using async/await with Axios
async function getBookList() {
  try {
    const response = await axios.get("http://localhost:5000/");
    return response.data;
  } catch (error) {
    console.error("Error fetching book list:", error);
    throw error;
  }
}

// Task 11: Get book details based on ISBN using Promises with Axios
function getFromISBN(isbn) {
  return new Promise((resolve, reject) => {
    axios.get("http://localhost:5000/isbn/" + isbn)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Task 12: Get book details based on author using async/await with Axios
async function getFromAuthor(author) {
  try {
    const response = await axios.get("http://localhost:5000/author/" + encodeURIComponent(author));
    return response.data;
  } catch (error) {
    console.error("Error fetching books by author:", error);
    throw error;
  }
}

// Task 13: Get all books based on title using Promises with Axios
function getFromTitle(title) {
  return new Promise((resolve, reject) => {
    axios.get("http://localhost:5000/title/" + encodeURIComponent(title))
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

module.exports.general = public_users;
module.exports.getBookList = getBookList;
module.exports.getFromISBN = getFromISBN;
module.exports.getFromAuthor = getFromAuthor;
module.exports.getFromTitle = getFromTitle;
