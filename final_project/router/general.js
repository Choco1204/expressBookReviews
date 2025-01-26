const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

// Function to get the list of books using async-await
async function getBooksUsingAsyncAwait() {
  try {
    const response = await axios.get("http://localhost:5001/");
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Function to get book details by ISBN using Promise callbacks
function getBookByISBNUsingPromise(isbn) {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://localhost:5001/isbn/${isbn}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Function to get book details by Author using async-await
async function getBooksByAuthorUsingAsyncAwait(author) {
  try {
    const response = await axios.get(`http://localhost:5001/author/${author}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Function to get book details by Title using Promise callbacks
function getBooksByTitleUsingPromise(title) {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://localhost:5001/title/${title}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// registration endpoint
public_users.post("/register", (req, res) => {
  //Write your code here
  // Retrieve username and password from the request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username, password });

  // Return success response
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(200).json(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Return the book details
    return res.status(200).json(books[isbn]);
  } else {
    // Return a 404 error if the book is not found
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  // Retrieve the author from the request parameters
  const author = req.params.author;

  // Initialize an array to store matching books
  const matchingBooks = [];

  // Iterate through the books object
  for (const isbn in books) {
    if (books[isbn].author === author) {
      // Add the matching book to the array
      matchingBooks.push({
        isbn: isbn,
        title: books[isbn].title,
        reviews: books[isbn].reviews,
      });
    }
  }

  // Check if any books were found
  if (matchingBooks.length > 0) {
    // Return the matching books
    return res.status(200).json({ books: matchingBooks });
  } else {
    // Return a 404 error if no books are found
    return res
      .status(404)
      .json({ message: "No books found for the specified author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  // Retrieve the title from the request parameters
  const title = req.params.title;

  // Initialize an array to store matching books
  const matchingBooks = [];

  // Iterate through the books object
  for (const isbn in books) {
    if (books[isbn].title === title) {
      // Add the matching book to the array
      matchingBooks.push({
        isbn: isbn,
        author: books[isbn].author,
        reviews: books[isbn].reviews,
      });
    }
  }

  // Check if any books were found
  if (matchingBooks.length > 0) {
    // Return the matching books
    return res.status(200).json({ books: matchingBooks });
  } else {
    // Return a 404 error if no books are found
    return res
      .status(404)
      .json({ message: "No books found with the specified title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Return the reviews for the book
    return res.status(200).json({ reviews: books[isbn].reviews });
  } else {
    // Return a 404 error if the book is not found
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
