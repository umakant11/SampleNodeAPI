const path = require('path');
const rootDir = require('./helpers/path'); 

const express = require('express');
const bodyParser = require('body-parser');
const {engine} = require('express-handlebars');

const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.engine('handlebars', engine({extname: "handlebars",defaultLayout: false,layoutsDir: "views/layouts/"}));
app.set('view engine', 'handlebars');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir,'public')));

const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

app.use('/user',userRoutes);
app.use('/api/user', adminRoutes);

const errorController = require('./controllers/error');
app.use(errorController.get404);

mongoose.set('strictQuery', false); 
mongoose.connect(
    'mongodb://localhost:27017/user-service'
).then(result =>{
    app.listen(3000);
}).catch( err=>{
    console.log(err);
});
