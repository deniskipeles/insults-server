var mongoose = require('mongoose');
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
	'message' : String,
	'createdAt' : Date,
	'updatedAt' : Date
});


var ChatSchema = new Schema({
  'request_by':{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	},
	'users' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'messages' : [Chat_messageSchema],
	'last_message' : Date,
	'can_chat' : Boolean
},{ timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
