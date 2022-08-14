var mongoose = require('mongoose');
var LikeModel = require('./LikeModel.js');
var InsultModel = require('../Insult/InsultModel.js');
/**
 * LikeController.js
 *
 * @description :: Server-side logic for managing Likes.
 */
module.exports = {

    /**
     * LikeController.list()
     */
    list: function (req, res) {
        LikeModel.find(function (err, Likes) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Like.',
                    error: err
                });
            }

            return res.json(Likes);
        });
    },

    /**
     * LikeController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        LikeModel.findOne({_id: id}, function (err, Like) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Like.',
                    error: err
                });
            }

            if (!Like) {
                return res.status(404).json({
                    message: 'No such Like'
                });
            }

            return res.json(Like);
        });
    },

    /**
     * LikeController.create()
     */
    create: async function (req, res) {
      
      const user=mongoose.Types.ObjectId(req.user._id);
      //returnInsults(user);
      const insult = await InsultModel.find({_id:req.body.insult},function (err, Insults) {
            if (err) {
                return []
            }
            return Insults;
        })
        .populate({ path: 'posted_by', select: 'full_name photo last_seen username'})
        //.populate({ path: 'liked_by', select: 'photo'})
        .populate({ path: 'comments_data.user', select: 'full_name photo'})
        .exec();
        
        //console.log(insult[0].comments_data);
        
        
        var Like = new LikeModel({
			insult : req.body.insult,
			user : req.user._id
        });
        
        
        
        
        LikeModel.findOne({insult : req.body.insult,user : req.user._id}, function (errFind, LikeFind) {
            if (errFind) {
                return res.status(500).json({
                    message: 'Error when getting Like.',
                    error: errFind
                });
            }

            if (!LikeFind) {
                Like.save(function (errSave, LikeSave) {
                  if (errSave) {
                      return res.status(500).json({
                          message: 'Error when creating Like',
                          error: errSave
                      });
                  }
                  var saved =modifyInsultsList(insult,true)
                  //console.log(saved);
                  saved.likes += 1
      
                  return res.status(201).json(saved);
              });
            }
            
            if (LikeFind) {
              LikeFind.remove();
              var deleted=modifyInsultsList(insult,false);
              //console.log(deleted);
              deleted.likes -= 1
              return res.status(201).json(deleted);
            }
        });
        
    },

    /**
     * LikeController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        LikeModel.findOne({_id: id}, function (err, Like) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Like',
                    error: err
                });
            }

            if (!Like) {
                return res.status(404).json({
                    message: 'No such Like'
                });
            }

            Like.insult = req.body.insult ? req.body.insult : Like.insult;
			Like.user = req.body.user ? req.body.user : Like.user;
			
            Like.save(function (err, Like) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Like.',
                        error: err
                    });
                }

                return res.json(Like);
            });
        });
    },

    /**
     * LikeController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        LikeModel.findByIdAndRemove(id, function (err, Like) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Like.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};





function modifyInsultsList(insults,liked) {
  let insultss=insults.map(insult=>{
     let ins={
                insultId: insult._id,
                comments_data: insult.comments_data,
                userId: insult.posted_by._id,
                userName: insult.posted_by.full_name,
                userImage: insult.posted_by.photo,
                body:  insult.insult,
                time: insult.createdAt,
                bodyImg: insult.image,
                likes: insult.likes,
                thoughts: insult.comments,
                liked
            }
      return ins;
  });
  //console.log(insultss);
  return insultss[0];
}
