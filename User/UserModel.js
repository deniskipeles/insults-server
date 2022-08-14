var mongoose = require('mongoose');
const bcrypt = require("bcrypt");
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
	'email': {
	  type:String,
	  //unique:true
	 },
	'full_name' : String,
	'username' : {
	  type:String,
	  unique:true
	 },
	'password' : String,
	'contacts' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'photo' : {
      type: "String",
      required: false,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
	'last_seen' : Date,
	'online' : Boolean,
	'my_qualities' : [String],
	'interested_in' : [String],
	'gender' : String,
	'blocked_users' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}],
	'bookmarks' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'Insult'
	}]
},{ timestamps: true });


UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  const hash = bcrypt.hashSync(this.password, 8);
  this.password = hash;
  return next();
});

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
