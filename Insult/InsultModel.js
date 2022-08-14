var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


var CommentSchema = new Schema({
	'insult' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'Insult'
	},
	'user' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	},
	'comment' : String,
	'createdAt' : Date,
	'updatedAt' : Date
});



var InsultSchema = new Schema({
	'insult' : String,
	'posted_by' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	},
	'image' : String,
	'likes' : Number,
	'liked_by' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'comments' : Number,
	'comments_data' : [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Insult', InsultSchema);
