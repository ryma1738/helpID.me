const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes')
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const app = express();

// Set up image Uploading
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // destination for files
        cb(null, './imageUploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5  // max file size is 5MB
    }
});

app.use(upload);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes)
 
// open react app during production build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
    });
});