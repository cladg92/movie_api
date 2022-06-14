const express = require("express");
const morgan = require("morgan");
const fs = require("fs"); // import built in node modules fs and path
const path = require("path");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { send } = require("process");
const mongoose = require("mongoose");
// import swagger tools for documentation
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
// import models
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const jwt_decode = require("jwt-decode");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { check, validationResult } = require("express-validator"); // for user input validation
const cors = require("cors");
// Define allowed domains (origins) for cross-origin resource sharing (CORS)
let allowedOrigins = [
  "http://localhost:8080",
  "https://myflixapi92.herokuapp.com/",
  "http://localhost:1234",
  "https://myflixapp92.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

// setup static for static files in 'public' folder
app.use(express.static("public"));

// Swagger options. Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "myFlix API",
      description: "Movie API",
      contact: {
        name: "Clara Di Gregorio",
      },
      servers: [
        {
          url: "http://localhost:8080",
          description: "Local server",
        },
        {
          url: "https://myflixapi92.herokuapp.com",
          description: "Production server",
        },
      ],
    },
  },
  // ['.routes/*.js']
  apis: ["index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
// Create endpoint for documentation
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
/**
 * @swagger
 * /:
 *  get:
 *    summary: Welcome page
 *    tags: [Welcome]
 *    responses:
 *      200:
 *        description: A successful response
 */
app.get("/", (req, res) => {
  res.status(200).send("Welcome to myFlix app!");
});

// Get list of all movies
/**
 * @swagger
 * /movies:
 *    get:
 *      summary: Get list of all movies
 *      tags: [Movies]
 *      responses:
 *         200:
 *            description: A successful response
 *            content:
 *               application/json
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get data about a single movie by title
/**
 * @swagger
 * /movies/{Title}:
 *    get:
 *      summary: Get data about a single movie by title
 *      tags: [Movies]
 *      parameters:
 *          - name: Title
 *            description: Title of movie
 *            schema:
 *              type: string
 *      responses:
 *           200:
 *               description: A successful response
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Return data about a genre (description) by name
/**
 * @swagger
 * /genres/{Name}:
 *    get:
 *      summary: Return data about a genre (description) by name
 *      tags: [Movies]
 *      parameters:
 *        - name: Name
 *          description: Name of genre
 *          schema:
 *            type: string
 *      responses:
 *         200:
 *           description: A successful response
 */
app.get(
  "/genres/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Return data about a director by name
/**
 * @swagger
 * /directors/{Name}:
 *    get:
 *      summary: Return data about a director by name
 *      tags: [Movies]
 *      parameters:
 *         - name: Name
 *           description: Name of director
 *           schema:
 *             type: string
 *             format: string
 *      responses:
 *         200:
 *           description: A successful response
 */
app.get(
  "/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get all users
/**
 * @swagger
 * /users:
 *    get:
 *      summary: Get all users
 *      tags: [Users]
 *      responses:
 *        200:
 *          description: A successful response
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .populate("FavoriteMovies")
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a user by username
/**
 * @swagger
 * /users/{Username}:
 *    get:
 *      summary: Get a user by username
 *      tags: [Users]
 *      parameters:
 *        - name: Username
 *          description: User username
 *          schema:
 *            type: string
 *            format: string
 *      responses:
 *        200:
 *          description: A successful response
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .populate("FavoriteMovies")
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Add a user
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Add a user (register)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: The user was successfully created
 */
app.post(
  "/users",
  // Validation logic here for request
  [
    check(
      "Username",
      "Username is required and must be at least 5 characters long"
    ).isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            BirthDate: req.body.BirthDate,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Update a user's info, by username
/**
 * @swagger
 * /users/{Username}:
 *  put:
 *    summary: Update a user's info, by username
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: Username
 *        schema:
 *          type: string
 *        required: true
 *        description: The user's username
 *    requestBody:
 *      required: true
 *    responses:
 *      200:
 *        description: The user was updated
 */
app.put(
  "/users/:Username",
  // Validation logic here for request
  check(
    "Username",
    "Username is required and must be at least 5 characters long"
  ).isLength({ min: 5 }),
  check(
    "Username",
    "Username contains non alphanumeric characters - not allowed."
  ).isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check("Email", "Email does not appear to be valid").isEmail(),
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // check for currently logged in user from token
    let authHeader = req.headers.authorization;
    let token = authHeader.split(" ")[1];
    let decoded = jwt_decode(token);
    let user = req.params.Username;
    if (decoded.Username !== user) {
      res.status(401).send("This operation is not possible");
    } else {
      // check the validation object for errors
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      let hashedPassword = Users.hashPassword(req.body.Password);
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            BirthDate: req.body.BirthDate,
          },
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.status(200).json(updatedUser);
          }
        }
      );
    }
  }
);

// Add a movie to a user's list of favorites
/**
 * @swagger
 * /users/{Username}/movies/{MovieID}:
 *   post:
 *     summary: Add a movie to a user's list of favorites by id
 *     tags: [Users]
 *     parameters:
 *       - name: Username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's username
 *       - name: MovieID
 *         required: true
 *         description: The movie ID
 *
 *     responses:
 *       201:
 *         description: The movie was added
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // check for currently logged in user from token
    let authHeader = req.headers.authorization;
    let token = authHeader.split(" ")[1];
    let decoded = jwt_decode(token);
    let user = req.params.Username;
    if (decoded.Username !== user) {
      res.status(401).send("This operation is not possible");
    } else {
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $push: { FavoriteMovies: req.params.MovieID },
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.status(201).json(updatedUser);
          }
        }
      );
    }
  }
);

// Remove a movie from a user's list of favorites
/**
 * @swagger
 * /users/{Username}/movies/{MovieID}:
 *   delete:
 *     summary: Remove a movie from a user's list of favorites by id
 *     tags: [Users]
 *     parameters:
 *       - name: Username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's username
 *       - name: MovieID
 *         required: true
 *         description: The movie ID
 *     responses:
 *       202:
 *         description: The movie was deleted
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // check for currently logged in user from token
    let authHeader = req.headers.authorization;
    let token = authHeader.split(" ")[1];
    let decoded = jwt_decode(token);
    let user = req.params.Username;
    if (decoded.Username !== user) {
      res.status(401).send("This operation is not possible");
    } else {
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $pull: { FavoriteMovies: req.params.MovieID },
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.status(202).json(updatedUser);
          }
        }
      );
    }
  }
);

// Delete a user by username
/**
 * @swagger
 * /users/{Username}:
 *   delete:
 *     summary: Delete a user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: Username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's username
 *
 *     responses:
 *       202:
 *         description: The user was deleted
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // check for currently logged in user from token
    let authHeader = req.headers.authorization;
    let token = authHeader.split(" ")[1];
    let decoded = jwt_decode(token);
    let user = req.params.Username;
    if (decoded.Username !== user) {
      res.status(401).send("This operation is not possible");
    } else {
      Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
          if (!user) {
            res.status(400).send(req.params.Username + " was not found");
          } else {
            res.status(202).send(req.params.Username + " was deleted.");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  }
);

// error-handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
