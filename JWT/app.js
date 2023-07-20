// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');



const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Your JWT secret key. Replace this with your actual secret in production!
const jwtSecretKey = 'your-secret-key';

// Your JWT expiration time (in seconds). Adjust as per your requirements.
const jwtExpirationTime = 3600;

// Function to generate a JWT token
function generateToken(data) {
    return jwt.sign(data, jwtSecretKey, { expiresIn: jwtExpirationTime });
}

// Function to verify a JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, jwtSecretKey);
    } catch (err) {
        return null; // Token verification failed
    }
}

// Sample hardcoded user data. Replace this with your user authentication logic.
const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' },
];

// Middleware to check if a valid JWT token is present
function requireAuth(req, res, next) {
    const token = req.cookies.jwt;
    const decodedToken = verifyToken(token);
    console.log(`Decoded token is ${JSON.stringify(decodedToken) }`);
    if (decodedToken) {
        req.user = decodedToken;
        next(); // Token is valid, proceed to the next middleware/route
    } else {
        res.redirect('/login');
    }
}

// Route to handle user login and set the JWT token in a HttpOnly cookie
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
        const token = generateToken({ id: user.id, username: user.username });
        console.log(`token is : ${token}`);
        res.cookie('jwt', token, { httpOnly: true, secure: true });
        res.redirect('/protected');
    } else {
        res.send('Invalid credentials');
    }
});

// Route to handle user logout and clear the HttpOnly cookie
app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
});

// Protected route - only accessible if a valid JWT token is present
app.get('/protected', requireAuth, (req, res) => {
    // Access the authenticated user details via req.user
    const user = req.user;
    res.render('protected', { user });
});

// Route to render the login page
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/', (req, res) => {
    const token = req.cookies.jwt;
    const decodedToken = verifyToken(token);

    // Render the home page (home.ejs) and pass the user object to the template
    res.render('home', { user: decodedToken });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
