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

// Task 1: Get the book list available in the shop using async/await and Promise
public_users.get('/', async function (req, res) {
  try {
    const fetchBooks = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject({ status: 500, message: "Unable to retrieve book catalog" });
      }
    });
    const bookList = await fetchBooks;
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 2: Get book details based on ISBN using async/await and Promise
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const fetchBook = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ status: 404, message: "Book with ISBN " + isbn + " not found" });
      }
    });
    const book = await fetchBook;
    return res.status(200).json(book);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 3: Get book details based on author using async/await and Promise
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  try {
    const fetchBooksByAuthor = new Promise((resolve, reject) => {
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
        reject({ status: 404, message: "No books found for author " + authorParam });
      }
    });
    const result = await fetchBooksByAuthor;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 4: Get all books based on title using async/await and Promise
public_users.get('/title/:title', async function (req, res) {
  const titleParam = req.params.title.toLowerCase();
  try {
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
        reject({ status: 404, message: "No books found with title " + titleParam });
      }
    });
    const result = await fetchBooksByTitle;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
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
    console.log("Books retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching book list:", error.message);
    throw new Error(error.response ? error.response.data.message : error.message);
  }
}

// Task 11: Get book details based on ISBN using Promises with Axios
function getFromISBN(isbn) {
  return new Promise((resolve, reject) => {
    axios.get("http://localhost:5000/isbn/" + isbn)
      .then(response => {
        console.log("Book details retrieved for ISBN " + isbn + ":", response.data);
        resolve(response.data);
      })
      .catch(error => {
        console.error("Error retrieving book for ISBN " + isbn + ":", error.message);
        reject(error);
      });
  });
}

// Task 12: Get book details based on author using async/await with Axios
async function getFromAuthor(author) {
  try {
    const response = await axios.get("http://localhost:5000/author/" + encodeURIComponent(author));
    console.log("Books retrieved for author " + author + ":", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by author " + author + ":", error.message);
    throw new Error(error.response ? error.response.data.message : error.message);
  }
}

// Task 13: Get all books based on title using Promises with Axios
function getFromTitle(title) {
  return new Promise((resolve, reject) => {
    axios.get("http://localhost:5000/title/" + encodeURIComponent(title))
      .then(response => {
        console.log("Books retrieved for title " + title + ":", response.data);
        resolve(response.data);
      })
      .catch(error => {
        console.error("Error retrieving books for title " + title + ":", error.message);
        reject(error);
      });
  });
}

module.exports.general = public_users;
module.exports.getBookList = getBookList;
module.exports.getFromISBN = getFromISBN;
module.exports.getFromAuthor = getFromAuthor;
module.exports.getFromTitle = getFromTitle;
