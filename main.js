const http = require('http');
const cloudinary = require("cloudinary").v2;

var express = require('express');
var cors = require('cors');
//var sql = require('sql');
var logger = require('morgan');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var UserRoutes = require('./User/UserRoutes.js');
var ChatMessageRoutes = require('./Chat_message/Chat_messageRoutes.js');
var InsultRoutes = require('./Insult/InsultRoutes.js');
var LikeRoutes = require('./Like/LikeRoutes.js');
var CommentRoutes = require('./Comment/CommentRoutes.js');
var ChatRoutes = require('./Chat/ChatRoutes.js');
var socket = require('./socket.js');
//const { Server } = require("socket.io");


require("dotenv").config();
cloudinary.config( 
  cloud_name = process.env.CLOUDINARY_CLOUD_NAME, 
  api_key = process.env.CLOUDINARY_API_KEY, 
  api_secret = process.env.CLOUDINARY_API_SECRET,
  //secure = true
)







const PORT = 8000;
const app = express();
const server = http.createServer(app);
socket(server);









mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
//mongoose.connect('mongodb://localhost:27017/chatdb',
mongoose.connect(process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    //useFindAndModify: false,
    useUnifiedTopology: true
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("DB Connected successfully");
});


var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

//app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'))
//app.use(cors({ allowedHeaders: ["content-type"] }))
app.use('/',UserRoutes)
app.use('/chat/one-to-one-message',ChatMessageRoutes)
app.use('/chat/one-to-one',ChatRoutes)
app.use('/insult/post',InsultRoutes)
app.use('/insult/like',LikeRoutes)
app.use('/insult/comment',CommentRoutes)




server.listen(PORT,()=>{
  console.log(`server listening on port ${PORT}`);
})