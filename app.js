const path = require('path');
const rootDir = require('./helpers/path'); 

const express = require('express');
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const cron = require("node-cron");

const {engine} = require('express-handlebars');

const mongoose = require('mongoose');

console.log("In app.js");

const multer = require('multer');

console.log("Here 2");

const app = express();
app.use(express.json());


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

app.engine('handlebars', engine({extname: "handlebars",defaultLayout: false,layoutsDir: "views/layouts/"}));
app.set('view engine', 'handlebars');
app.set('views', 'views');

app.use(multer({storage: fileStorage}).single('file'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir,'public')));



const webRoutes = require('./routes/web');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const signNowRoutes = require('./routes/signnow');

app.use('/user',webRoutes);
app.use('/api/admin/user', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/signnow', signNowRoutes);

const errorController = require('./controllers/error');
app.use(errorController.get404);

// Creating a cron job which runs on every 10 second
// cron.schedule("*/10 * * * * *", function() {
//     console.log("running a task every 10 second");
// });


// Set up Global configuration access
dotenv.config();
let PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false); 
mongoose.connect(
    'mongodb://localhost:27017/user-service'
).then(result =>{
    app.listen(PORT, () => {
        console.log(`Server is up and running on ${PORT} ...`);
    });
}).catch( err=>{
    console.log(err);
});
