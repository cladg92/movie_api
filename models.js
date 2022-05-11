const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'); // for hashing password

// Create schemas for collections

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: String,
        Death: String
    },
    Actors: [String],
    ReleaseYear: String,
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema ({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    BirthDate: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref:'Movie'}]
});

// hashing of submitted passwords
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
}

// compare submitted hash passwords with the hashed password stored in db
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

// Create models that use the schemas

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export the models

module.exports.Movie = Movie;
module.exports.User = User;