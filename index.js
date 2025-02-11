require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const validUrl = require('is-valid-http-url');
const mongoose = require('mongoose');
const shortId = require('shortid');
const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  }
)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let urlSchema = new mongoose.Schema({
  original_url : String,
  short_url : String,
})

let URL = mongoose.model('URL', urlSchema);

URL.createCollection();


app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/', (req,res)=>{
  const original_url = req.body.url;
  const short_url = shortId.generate();
  if(validUrl(original_url)){
    const url = new URL({
      original_url: original_url,
      short_url: short_url,
    })
    url.save();
    res.json(url);
  }
  else {
    res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short_url', (req,res)=>{
  console.log(req.params.short_url)
  const short_url = req.params.short_url;
  URL.findOne({short_url: short_url}, (err,data)=>{
    return res.redirect(data.original_url);
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
