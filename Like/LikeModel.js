var mongoose = require('mongoose');
var InsultModel = require('../Insult/InsultModel.js');
var Schema   = mongoose.Schema;

var LikeSchema = new Schema({
	'insult' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'Insult'
	},
	'user' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'User'
	}
}, { timestamps: true });


LikeSchema.index({ 'insult': 1, 'user': 1}, { unique: true });

LikeSchema.post("save", async function (doc) {
  //console.log(doc);
  await countLikes(doc.insult);
  await updateLikes(doc);
});


LikeSchema.post("remove", async function (doc) {
  await countLikes(doc.insult);
  await deleteLikes(doc);
});


const LikeModel = mongoose.model('Like', LikeSchema);
module.exports = LikeModel;








async function updateLikes(doc) {
  await InsultModel.findOne({ _id:doc.insult }, async function(error, insult){
      if (insult.liked_by.length < 3) {
        await InsultModel.updateOne(
          { "_id": doc.insult},
          { "$addToSet": { "liked_by": doc.user} },function(err,raw){});
      }
  });
}

async function countLikes(post) {
  await LikeModel.countDocuments({
    insult: post
  }, function(errCount, c) {
    //console.log('count',c);
    if(c){
      InsultModel.findOne({_id:post},function(err,Insult){
        Insult.likes=c;
        Insult.save()
      })
    }
  });
}


async function deleteLikes(doc) {
  await InsultModel.findOne({ _id:doc.insult }, function(error, insult){
      if (insult.liked_by.length > 0) {
        InsultModel.updateOne(
        { "_id": doc.insult},
        { "$pull": { "liked_by": doc.user } },
        function (err, raw) {});
      }
  });
}
