const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  }),
);

app.use("/customer/auth/*", function auth(req, res, next) {
  //Write the authenication mechanism here
  // Check if the session contains the authorization token
  if (req.session.authorization) {
    // Extract the token from the session
    const token = req.session.authorization.accessToken;

    // Verify the token
    jwt.verify(token, "secretKey", (err, decoded) => {
      if (err) {
        // Token is invalid or expired
        return res.status(403).json({ message: "User not authenticated" });
      } else {
        // Token is valid, attach the decoded username to the request object
        req.username = decoded.username;
        next(); // Proceed to the next middleware or route handler
      }
    });
  } else {
    // No token found in the session
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
