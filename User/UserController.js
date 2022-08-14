const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const { Readable } = require("stream");

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
var UserModel = require('./UserModel.js');
var InsultModel = require('../Insult/InsultModel.js');
var LikeModel = require('../Like/LikeModel.js');
//require("dotenv").config();
//require("process");
cloudinary.config( 
  cloud_name = process.env.CLOUDINARY_CLOUD_NAME, 
  api_key = process.env.CLOUDINARY_API_KEY, 
  api_secret = process.env.CLOUDINARY_API_SECRET,
  //secure = true
)


const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};


const newToken = (user) => {
  const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY);
  return token;
};
/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
 * 
 *
 */
module.exports = {

    /**
     * UserController.list()
     */
    list: function (req, res) {
      //console.log('keysssss%%');
      //console.log('keysssss',process.env.CLOUDINARY_API_SECRET);
      var skip=req.query.skip ? Number(req.query.skip) : 0;
      //console.log('skip',skip);
      var limit=req.query.limit ? Number(req.query.limit) : 20;
      const user=mongoose.Types.ObjectId(req.user._id);
        //console.log(req.user);
        UserModel.find({_id:{$ne:req.user._id}}, null, {limit,skip}, function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }
            Users=Users.map(user=>{
              return{
                _id:user._id,
                id:user._id,
                messageExcerpt:user.username,
                userName:user.full_name,
                userImage:user.photo,
                time:user.last_seen,
                unread:true,
              }
            })

            return res.json(Users);
        });
    },

    /**
     * UserController.show()
     */
    me: function (req, res) {
        var id = req.user._id;
        console.log(req.user);

        UserModel.findOne({_id: id}, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting your account.',
                    error: err
                });
            }

            if (!User) {
                return res.status(404).json({
                    message: 'No such Account'
                });
            }

            return res.json(User);
        });
    },
    
    
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }

            if (!User) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }

            return res.json(User);
        });
    },
    
    
    
    
    listMyBookmarks: async function (req, res) {
      var user_id = req.user._id || req.user.id;
      var skip=req.query.skip ? Number(req.query.skip) : 0;
      //console.log('skip',skip);
      var limit=req.query.limit ? Number(req.query.limit) : 20;
      const id=mongoose.Types.ObjectId(user_id);
      var user=await UserModel.findOne({_id: id})
      //console.log(user);
      //returnInsults(user);
      await InsultModel.find({_id:user.bookmarks},null,{limit,skip,sort:{'createdAt':-1}},async function (err, Insults) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Insult.',
                    error: err
                });
            }
            let Insultss=await modifyInsultsList(Insults,user)

            return res.json(Insultss);
        })
        .populate({ path: 'posted_by', select: 'full_name photo'})
        .populate({ path: 'comments_data.user', select: 'full_name photo'})
        //.populate({ path: 'liked_by', select: 'photo'})
        .exec();
    },
    

    /**
     * UserController.create()
     */
    create: function (req, res) {
        var User = new UserModel({
			full_name : req.body.full_name,
			username : req.body.username,
			email : req.body.email,
			password : req.body.password,
			contacts : req.body.contacts,
			photo : req.body.photo,
			last_seen : new Date(),
			online : req.body.online,
			my_qualities : req.body.my_qualities,
			interested_in : req.body.interested_in,
			gender : req.body.gender,
			blocked_users : req.body.blocked_users
        });

        User.save(function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating User',
                    error: err
                });
            }

            //return res.status(201).json(User);
            let user={
                id:User._id,
                _id:User._id,
                username:User.username,
                full_name:User.full_name,
                photo:User.photo,
                email:User.email
              }

              let token = newToken(user);
              return res.status(200).send({ user, token });
        });
    },

    /**
     * UserController.update()
     */
    update: async function (req, res) {
        var id = req.user._id;
        
        var file=(req.file ? `http://${req.headers.host}/${req.file.path}` : null)
        const user=mongoose.Types.ObjectId(req.user._id);
        //console.log(req.file);
        //console.log('suppose to log',process.env.JWT_SECRET_KEY);
        if(file){
          /*var dest=(req.file.destination).replace('./','/')
            const { filename: image } = req.file 
            let resolve_path=path.resolve(req.file.destination,'resized')
            await sharp(req.file.path)
              .resize(500)
              .jpeg({quality: 50})
              .toFile(
                  path.resolve(req.file.destination,'resized',image)
              )
              fs.unlinkSync(req.file.path)
              req.body.photo=`http://${req.headers.host}/${req.file.destination}/resized/${image}`
              */
          
          const data = await sharp(req.file.path).jpeg({ quality: 50 }).toBuffer();
          //cloudinary.uploader.upload("my_image.jpg", function(error, result) {console.log(result, error)});
          const stream = cloudinary.uploader.upload_stream(
            { folder: "DEV" },
            (error, result) => {
              if (error) return console.error(error);
              //return res.json({ URL: result.secure_url });
              req.body.photo = result.secure_url
            }
          );
          //bufferToStream(data).pipe(stream);
        }
        
        //console.log(req.body.photo);
        //console.log(req.file);

        UserModel.findOne({_id: id}, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User',
                    error: err
                });
            }

            if (!User) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }

            User.full_name = req.body.full_name ? req.body.full_name : User.full_name;
			User.username = req.body.username ? req.body.username : User.username;
			User.email = req.body.email ? req.body.email : User.email;
			User.password = req.body.password ? req.body.password : User.password;
			User.contacts = req.body.contacts ? req.body.contacts : User.contacts;
			User.photo = req.body.photo ? req.body.photo : User.photo;
			
			User.online = req.body.online ? req.body.online : User.online;
			User.my_qualities = req.body.my_qualities ? req.body.my_qualities : User.my_qualities;
			User.interested_in = req.body.interested_in ? req.body.interested_in : User.interested_in;
			User.gender = req.body.gender ? req.body.gender : User.gender;
			User.blocked_users = req.body.blocked_users ? req.body.blocked_users : User.blocked_users;
			
            User.save(function (err, User) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating User.',
                        error: err
                    });
                }
                return res.json(User);
            });
        });
    },

    /**
     * UserController.remove()
     */
    remove: function (req, res) {
        var id = req.user._id;

        UserModel.findByIdAndRemove(id, function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the User.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },
    
    addBookmarks: async function (req, res) {
        var id = req.user._id;
        const bookmark=mongoose.Types.ObjectId(req.body.post);
        if (req.body.post) {
          await UserModel.updateOne(
            { "_id": id},
            { "$addToSet": { "bookmarks": bookmark} },function(err,raw){
              if (err) {
                return res.status(500).json({
                    message: 'Error when saving to the bookmark.',
                    error: err
                });
              }
              return res.status(200).send("ok");
          });
        }
    },
    
    removeBookmarks: async function (req, res) {
        var id = req.user._id;
        const bookmark=mongoose.Types.ObjectId(req.body.post);
        if (req.body.post) {
          await UserModel.updateOne(
            { "_id": id},
            { "$pull": { "bookmarks": bookmark} },function(err,raw){
              if (err) {
                return res.status(500).json({
                    message: 'Error when removing from bookmark.',
                    error: err
                });
              }
              return res.status(200).send("ok");
          });
        }
    },
    
    login: async function (req, res) {
      try {
        let user = null;
        let err = null;
        if (req.body.identity) {
          user = await UserModel.findOne({
            username: req.body.identity
          },(err,user)=>{
            err=err;
            return user;
          });
          
          if(!user) user = await UserModel.findOne({
            email: req.body.identity
          },(err,user)=>{
            err=err;
            return user;
          });
          // console.log(user);
        }
    
        if (!user) {
          return res.status(500).json({
            message: 'User does not exist.',
            error: err
          });
        }
        
      
        let match = user.checkPassword(req.body.password);
        if (!match) return res.status(400).send("password is wrong");
        user={
          id:user._id,
          _id:user._id,
          username:user.username,
          full_name:user.full_name,
          photo:user.photo,
          email:user.email
        }
        let token = newToken(user);
        return res.status(200).send({ user, token });
      } catch (err) {
        return res.status(500).send(err.message);
      }
    }

};








async function modifyInsultsList(insults,user) {
  const ids=insults.map(insult=>insult._id);
  let liked= await LikeModel.find({insult:ids,user:user});/*,function (err,likes) {
    if (likes) {
      return likes.map(l=>(l.insult));
      //console.log(liked);
    }
    return []
  })*/
  liked=liked.map(l=>(l.insult)+'')
  //console.log(liked);
  let insultss=insults.map(insult=>{
     let ins={
                insultId: insult._id,
                userId: insult.posted_by._id,
                userName: insult.posted_by.full_name,
                userImage: insult.posted_by.photo,
                body:  insult.insult,
                time: insult.createdAt,
                bodyImg: insult.image,
                likes: insult.likes,
                liked_by: [],//insult.liked_by,
                thoughts: insult.comments,
                comments_data: insult.comments_data,
                liked: (liked.find(l=>(l==(insult._id+'')))) != undefined ? true :false
            }
      return ins;
  });
  //console.log(insultss);
  return insultss;
}
