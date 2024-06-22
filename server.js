const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Serve index.html as the root page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// POST endpoint for handling login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Example logic to check credentials (replace with your actual authentication logic)
  if (username === "im" && password === "awesome") {
    // Set session variables upon successful login
    req.session.loggedIn = true;
    req.session.username = username;

    console.log("Login successful. Session:", req.session);

    res.status(200).json({ message: "Login successful" });
  } else {
    console.log("Login failed. Invalid username or password");
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// Route middleware to ensure user is authenticated
function requireLogin(req, res, next) {
  console.log("Session state:", req.session);

  if (req.session.loggedIn) {
    next(); // Allow the request to continue to the next middleware or route handler
  } else {
    console.log("Unauthorized access attempt");
    res.redirect("/"); // Redirect to login page if not logged in
  }
}

// Route handler for serving dashboard.html with authentication protection
app.get("/dashboard.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// POST endpoint for handling logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    // Clear the session cookie
    res.clearCookie('connect.sid', { path: '/' });

    // Clear client-side storage: cookies, session storage, local storage
    res.setHeader('Clear-Site-Data', '"cookies", "storage"');

    // Redirect to homepage after logout with logout parameter
    res.redirect("/?logout=1");
  });
});

// Error handling middleware (handle all errors here)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!"); // Generic error response
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
