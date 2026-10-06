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

// Task 1 & Task 10: Get the book list available in the shop using async/await and Promises
public_users.get('/', async function (req, res) {
  try {
    const fetchBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const bookList = await fetchBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve books", error: error.message });
  }
});

// Task 2 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const fetchBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  fetchBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});

// Task 3 & Task 12: Get book details based on author using Promises / async-await
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();

  const fetchBooksByAuthor = () => {
    return new Promise((resolve, reject) => {
      let filteredBooks = {};
      const keys = Object.keys(books);
      keys.forEach((key) => {
        if (books[key].author.toLowerCase() === authorParam) {
          filteredBooks[key] = books[key];
        }
      });
      if (Object.keys(filteredBooks).length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ status: 404, message: "No books found for the given author" });
      }
    });
  };

  try {
    const result = await fetchBooksByAuthor();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 4 & Task 13: Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  const fetchBooksByTitle = new Promise((resolve, reject) => {
    let filteredBooks = {};
    const keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === titleParam) {
        filteredBooks[key] = books[key];
      }
    });
    if (Object.keys(filteredBooks).length > 0) {
      resolve(filteredBooks);
    } else {
      reject({ status: 404, message: "No books found with the given title" });
    }
  });

  fetchBooksByTitle
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((error) => {
      return res.status(error.status || 500).json({ message: error.message });
    });
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

module.exports.general = public_users;
