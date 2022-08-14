var mongoose = require('mongoose');
var ChatModel = require('./ChatModel.js');


const setMessages = (user1,chats) => {
  const newMessages = chats.map(messages=>{
    let user={};
    user.messages=[];
    user.container=messages._id;
    user.typing=false;
    const u=messages.users.filter(obj=>(obj._id+'')!=(user1+''));
    if(u.length>0){
      user.userName=u[0].username;
      user.full_name=u[0].full_name;
      user.userImage=u[0].photo;
      user.lastSeen=u[0].last_seen;
      user.last_seen=u[0].last_seen;
      user.id=u[0]._id;
      user._id=u[0]._id;
    }
    if(messages.messages.length > 0){
      user.messages=messages.messages.map(message=>{
        let msg={};
        msg.time=message.createdAt
        msg.unread=((''+(message.readers[0])) == (''+user1))
        //console.log(message.readers[0],user1,msg.unread)
        msg.message=message.message
        msg.sender=((''+message.sender)==(''+user1) ? 'me' : 'other')
        return msg;
      })
    }
    return user;
  });
  return newMessages;
}
    
/**
 * ChatController.js
 *
 * @description :: Server-side logic for managing Chats.
 */
module.exports = {

    /**
     * ChatController.list()
     */
    list: function (req, res) {
        const user = mongoose.Types.ObjectId(req.user._id);
        //console.log(user);
        ChatModel.find({users:user},function (err, Chats) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Chat.',
                    error: err
                });
            }
            const messages = setMessages(user,Chats);

            return res.json(messages);
        })
        .sort({last_message:-1})
        .populate({ path: 'users', _id: {$ne: user}, select: 'username full_name photo last_seen'})
        .exec();
    },

    /**
     * ChatController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        var user = mongoose.Types.ObjectId(req.user._id);

        ChatModel.findOne({_id: id}, function (err, Chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Chat.',
                    error: err
                });
            }

            if (!Chat) {
                return res.status(404).json({
                    message: 'No such Chat'
                });
            }
            
            const container = setMessages(user,[Chat])

            return res.json(container[0]);
        })
        .populate({ path: 'users', _id: {$ne: user}, select: 'username full_name photo last_seen'})
        .exec();
    },

    /**
     * ChatController.create()
     */
    create: async function (req, res) {
      var request_from=mongoose.Types.ObjectId(req.user._id);
      var request_to=mongoose.Types.ObjectId(req.body.receiver);
      var users = [request_to,request_from];
      const filter = { users: {$all: users } };
      const chat = await ChatModel.find(filter)
        .populate({ path: 'users', _id: {$eq: request_to}, select: 'username full_name photo last_seen'})
        .exec();
        
      console.log(chat);
  
      if(chat.length > 0){
        //return res.status(201).json(chat[0]);
        const container = setMessages(request_from,[chat[0]]);
        return res.json(container[0]);
      }else{
        var Chat = new ChatModel({
    			  users : users,
    			  can_chat: false,
    			  messages: [],
    			  request_by: request_from
          });
        Chat.save(function (err, Chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Chat',
                    error: err
                });
            }
            Chat.populate({path:"users", select:'_id username full_name photo last_seen'}, function(err, Chat) {
              console.log(Chat);
              //return res.status(201).json(Chat);
              const container = setMessages(request_from,[Chat])
              console.log('container',container);
              return res.json(container[0]);
            });
        });
      }
    },

    /**
     * ChatController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        ChatModel.findOne({_id: id}, function (err, Chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Chat',
                    error: err
                });
            }

            if (!Chat) {
                return res.status(404).json({
                    message: 'No such Chat'
                });
            }

            Chat.users = req.body.users ? req.body.users : Chat.users;
			
            Chat.save(function (err, Chat) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Chat.',
                        error: err
                    });
                }

                return res.json(Chat);
            });
        });
    },

    /**
     * ChatController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        ChatModel.findByIdAndRemove(id, function (err, Chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Chat.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
