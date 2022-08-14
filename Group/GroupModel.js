var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var GroupSchema = new Schema({
	'name' : String,
	'created_by' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	},
	'purpose' : [String],
	'members' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'photo' : String,
	'description' : String
},{ timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
