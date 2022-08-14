const {Server} = require("socket.io");
var ChatModel = require('./Chat/ChatModel.js');
var UserModel = require('./User/UserModel.js');
var mongoose = require("mongoose");
const jwt = require("jsonwebtoken");



var userTokenDecode = (token) => {
  return jwt.decode(token, process.env.JWT_SECRET_KEY) || null;
}

let tracker=[];

module.exports = (server)=> {
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

  //const io = new Server(server);
  io.on('connection', function (socket) {
    let token = socket.handshake.auth.token;
    token = token ? token.split(" ")[1] : null;
  let user;
  try {
    user = userTokenDecode(token);
    user=user.user
    try{
      if (user._id) {
        const f=async()=>{
          await UserModel.updateOne({_id:user._id},{last_seen:new Date()})
        }
        f()
      }
    }catch(e){console.log(e);}
  } catch (err) {
    console.log("authorization token was not provided or was not valid");
  }
    console.log("client connected");
    //console.log(socket.handshake.query['my-key']);
    //console.log(token);
    //console.log(user);
    const client={
      ...user,
      socketId:socket.id
    }
    
    tracker.push(client)
    //console.log(tracker);

    
    //showing user typing
    socket.on("connect-to-view-online-user", function(data) {
      if (data.user_id) {
        socket.join("online-user-"+data.user_id);
        //console.log(data,"online-user-");
      }
    });
    
    socket.on("connect-to-view-post", function(data) {
      if (data.post_id) {
        socket.join("post-"+data.post_id);
        //console.log(data,"online-user-");
      }
    });
    
    // user typing text in a room
    socket.on("join-room",
      function(data) {
        socket.join("room-"+data.room);
        //console.log(data);
    });
      
    socket.on("typing",
      function(data) {
        socket.to("room-"+data.room).emit("incoming-typing", data);
    });


    //start message actions
    socket.on('sendMessage',
      (data) => {
        let user=tracker.find(user=>((data.readers[0]==user._id)||(data.readers[0]==user.id)));
        user=(user!=undefined ? user : null)
        if(user){
          //socket.join("user-"+user._id);
          chatContainer(socket,data,user)
        }
    });
    socket.on('comment-a-post',
      (data) => {
        console.log(data);
        if(data.insult) {
          socket.to("post-"+data.insult).emit("incoming-comment", data);
        }
    });
    
    socket.on('readMessage',
      (data) => {
        //chatSocket.readMessage(data);
      });
    socket.on('deleteMessage',
      (data) => {
        //chatSocket.deleteMessage(data);
      });
    //end message actions


    socket.on('disconnect',
      function () {
        try{
          if (user._id) {
            const f=async()=>{
              await UserModel.updateOne({_id:user._id},{last_seen:new Date()})
            }
            f()
          }
        }catch(e){console.log(e);}
        tracker=tracker.filter(obj=>(obj.socketId!=socket.id))
        console.log("client disconnect");
        //console.log(tracker);
    });
  });

}





const setMessages = (user1,chats) => {
  
  const newMessages = chats.map(messages=>{
    let user={};
    user.container=messages._id;
    user.typing=false;
    const you=messages.users.find(obj=>(obj._id+'')!=(user1+''));
    const me=messages.users.find(obj=>(obj._id+'')==(user1+''));
    if(me){
      user.userName=me.username;
      user.full_name=me.full_name;
      user.userImage=me.photo;
      user.lastSeen=me.last_seen;
      user.id=me._id;
      user._id=me._id;
    }
    if(messages.messages.length > 0){
      user.messages=messages.messages.map(message=>{
        let msg={};
        msg.time=message.createdAt
        msg.unread=((''+message.readers[0]) == (you._id+''))
        //console.log(message.readers[0],user1,msg.unread)
        msg.message=message.message
        msg.sender=((message.sender+'')==(you._id+'') ? 'me' : 'other')
        return msg;
      })
    }
    return user;
  });
  return newMessages;
}


function chatContainer (socket, data, userData) {
  var id = data.room;
  var user = mongoose.Types.ObjectId(data.sender);
  ChatModel.findOne({_id: id}, function (err, Chat) {
            if (err) {
                console.log('Error when getting Chat.');
            }

            if (!Chat) {
                console.log('No such Chat');
            }
            
            const container = setMessages(user,[Chat])

            const data=container[0];
            //console.log(data);
            //socket.to("room-"+id).emit("incoming-message", data);
            socket.to(userData.socketId).emit("incoming-message", data);
        })
        .populate({ path: 'users', _id: {$eq: user}, select: 'username full_name photo last_seen'})
        .exec();
}


