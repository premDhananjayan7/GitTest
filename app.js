require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Url = require('./models/urlModel');
const app = express();

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // mongodb connection string
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mongoDB connected.');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// connect to mongoDB
connectDB();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware for handling JSON, URL-encoded data, and serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));


// start the server and listen on PORT 7000
app.listen(process.env.PORT || PORT, () => {
  console.log(`App running on port 7001`);
});

app.post('/shorten', async (req, res) => {
  try {
    const url = new Url({ fullUrl: req.body.fullUrl });
    await url.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Invalid URL');
  }
});

app.get('/', async (req, res) => {
  try {
    const urls = await Url.find();
    res.render('index', { urls });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = req.params.shortUrl;
    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(400).send('URL not found');
    }
 // Increment the click count and save the updated URL
    url.clicks++;
    url.save();
    res.redirect(url.fullUrl);
  } catch (error) {
    res.status(500).send('URL not found');
  }
});
