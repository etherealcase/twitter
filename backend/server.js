import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport  from 'passport';


import users from './router/user';
import posts from './router/posts';
import profile from './router/profile';


mongoose.connect("mongodb://localhost:27017/twitter", { useNewUrlParser: true})
    .then( () => console.log('MongoDb Connected'))
    .catch( err => console.log(err));


const app = express();
app.use(passport.initialize());
require('./config/passport')(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/uploads',express.static('uploads'));

app.use('/users', users);
app.use('/posts', posts);
app.use('/profile', profile);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
});