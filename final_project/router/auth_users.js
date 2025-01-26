const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.some(
    (user) => user.username === username && user.password === password,
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  // Retrieve username and password from the request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the user is authenticated
  if (authenticatedUser(username, password)) {
    // Generate a JWT for the session
    const accessToken = jwt.sign({ username }, "secretKey", {
      expiresIn: "1h",
    });

    // Save the JWT in the session (optional, depending on your use case)
    req.session.authorization = { accessToken, username };

    // Return the JWT in the response
    return res.status(200).json({ message: "Login successful", accessToken });
  } else {
    // Return an error if authentication fails
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Retrieve the review from the request query
  const review = req.query.review;

  // Retrieve the username from the session
  const username = req.session.authorization?.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has already posted a review for this ISBN
  if (books[isbn].reviews[username]) {
    // Update the existing review
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  } else {
    // Add a new review for the user
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added successfully" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Retrieve the username from the session
  const username = req.session.authorization?.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has posted a review for this ISBN
  if (books[isbn].reviews[username]) {
    // Delete the review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    // Return an error if the user has not posted a review for this ISBN
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
