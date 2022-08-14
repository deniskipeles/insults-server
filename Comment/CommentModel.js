var mongoose = require('mongoose');
var InsultModel = require('../Insult/InsultModel.js');
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
	'comment' : String
}, { timestamps: true });


CommentSchema.post("save", function (doc) {
  updateComments(doc);
});

const CommentModel = mongoose.model('Comment', CommentSchema);
module.exports = CommentModel;









function updateComments(doc) {
  CommentModel.countDocuments({
    insult: doc.insult
  }, function(errCount, c) {
    if(c){
        const filter = { insult: doc.insult };
        var query = CommentModel.find(filter);
        query.sort({'createdAt': -1});
        query.limit(20);
        query.exec(async function(error, docs){
        //console.log(docs);
        await InsultModel.findOne(
            {_id:doc.insult}, function(err,UpdateThis){
              UpdateThis.comments_data=docs
              UpdateThis.comments=c
              UpdateThis.save();
              //console.log(UpdateThis);
            });
      });
    }
  });
}
