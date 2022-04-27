const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');

const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let Top10Movies = [
    {id: 1, title: "title1"},
    {id: 2, title: "title2"},
    {id: 3, title: "title3"},
    {id: 4, title: "title3"},
    {id: 5, title: "title5"},
    {id: 6, title: "title6"},
    {id: 7, title: "title7"},
    {id: 8, title: "title8"},
    {id: 9, title: "title9"},
    {id: 10, title: "title9"},
]

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// setup static
app.use(express.static('public'));


//setting endpoints for API
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/movies', (req, res) => {
  res.json(Top10Movies);
});

// error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});