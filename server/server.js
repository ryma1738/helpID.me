const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', routes);
app.use(express.static("public"));

db.once('open', () => {
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
    });
});