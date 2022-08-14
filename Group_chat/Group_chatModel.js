var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Group_chatSchema = new Schema({
	'group' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'Group'
	},
	'sender' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	},
	'reply_to' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'Group_chat'
	},
	'receivers' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'readers' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'message' : String
},{ timestamps: true });

module.exports = mongoose.model('Group_chat', Group_chatSchema);
