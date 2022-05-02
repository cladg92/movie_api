const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
const { send } = require('process');

const app = express();
app.use(bodyParser.json());
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let movies = [
    {id: 1, title: "title1"},
    {id: 2, title: "title2"},
    {id: 3, title: "title3"},
    {id: 4, title: "title3"},
    {id: 5, title: "title5"},
    {id: 6, title: "title6"},
    {id: 7, title: "title7"},
    {id: 8, title: "title8"},
    {id: 9, title: "title9"},
    {id: 10, title: "title9"}
];

let genres = [
  {id: 1, name: "Thriller"},
  {id: 2, name: "name2"},
  {id: 3, name: "name3"},
  {id: 4, name: "name3"}
];

let directors = [
  {name: "name1"},
  {name: "name2"},
  {name: "name3"},
  {name: "name3"}
];

let users = [
  {id: 1, username: "username1"},
  {id: 2, username: "username2"},
  {id: 3, username: "username3"},
  {id: 4, username: "username4"}
];

let favorites = [];


// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// setup static
app.use(express.static('public'));


//setting endpoints for API


app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});

// Get list of all movies

app.get('/movies', (req, res) => {
  res.json(movies);
});

// Get data about a single movie by title

app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) => { return movie.title == req.params.title }));
});

// Return data about a genre (description) by name

app.get('/genres/:name', (req, res) => {
  res.json(genres.find((genre) => { return genre.name == req.params.name }));
  //res.send('Successful GET request returning data on genre');
});

// Return data about a director by name

app.get('/directors/:name', (req, res) => {
  res.json(directors.find((director) => { return director.name == req.params.name }));
  // res.send('Successful GET request returning data on director');
});

// Get list of all users

app.get('/users', (req, res) => {
  res.json(users);
});

// Add new user

app.post('/users', (req, res) => {
  let newUser = req.body;
    if (!newUser.username) {
        const message = 'Missing "name" in request body';
        res.status(400).send(message);
    } else {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

// Update user info (username) by ID

app.put('/users/:id/:username', (req, res) => {
  let user = users.find((user) => { return user.id == req.params.id });

  if (user) {
    user.username = req.params.username;
    res.status(201).send('User' + req.params.id + ' was updated to ' + req.params.username);
  } else {
    res.status(404).send('User with ID ' + req.params.id + ' was not found.');
  }
});

// Add movie to list of favorites

app.get('/users/:username/favorites', (req, res) => {
  res.json(favorites);
});

app.post('/users/:username/favorites', (req, res) => {
  let newMovie = req.body;
    if (!newMovie.title) {
        const message = 'Missing "title" in request body';
        res.status(400).send(message);
    } else {
        newMovie.id = uuid.v4();
        favorites.push(newMovie);
        res.status(201).send(newMovie.title + ' was added to your list of favorites');
    }
});

// Remove movie from list of favorites

app.delete('/users/:username/favorites/:title', (req, res) => {
  res.send('Successful DELETE request of movie from favorites');
});

// Remove user (deregister)

app.delete('/users/:id', (req, res) => {
  let user = users.find((user) => { return user.id == req.params.id });

  if (user) {
    const index = users.indexOf(user);
    users.splice(index, 1);
  }
  res.send('Successful DELETE request of user ' + user.username);
});

// error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});