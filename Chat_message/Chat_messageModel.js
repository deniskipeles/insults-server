var mongoose = require('mongoose');
var ChatModel = require('../Chat/ChatModel.js');
var Schema   = mongoose.Schema;

var Chat_messageSchema = new Schema({
	'sender' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	},
	'reply_to' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'Chat_message'
	},
	'receiver' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'readers' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'message' : String
},{ timestamps: true });

Chat_messageSchema.post("save", async function (doc) {
  const filter = { users: {$all: doc.receiver } };
  const chat = await ChatModel.find(filter);
  //console.log(chat);
  
  if(chat.length > 0){
    updateChat(doc);
  }else{
    var Chat = new ChatModel({
			  users : doc.receiver,
			  can_chat: false,
			  messages: [],
			  request_by: doc.sender
      });
      Chat.save();
  }
});

Chat_messageModel = mongoose.model('Chat_message', Chat_messageSchema);
module.exports = Chat_messageModel;












function updateChat(doc) {
    const filter = { users: {$all: doc.receiver } };
    
    var query = Chat_messageModel.find({receiver: {$all:doc.receiver, $size:2 } });
    query.sort({'createdAt': -1});
    query.limit(50);
    query.exec(async function(error, docs){
    //console.log(docs);
    var latest=docs[0].createdAt
    await ChatModel.updateOne(
        filter, 
        {
          messages:docs,
          last_message:latest
        }
    );
  });
}