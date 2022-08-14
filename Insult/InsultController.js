var InsultModel = require('./InsultModel.js');
var LikeModel = require('../Like/LikeModel.js');
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const mongoose = require('mongoose');
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const mkdir = require('../middlewares/mkdir');
const photo = fs.readFileSync(path.resolve('./ischat/insult.png'));


const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};


/**
 * InsultController.js
 *
 * @description :: Server-side logic for managing Insults.
 */
 
 
 
module.exports = {

    /**
     * InsultController.list()
     */
    top: function (req, res) {
      const user=mongoose.Types.ObjectId(req.user._id);
      //returnInsults(user);
        InsultModel.find(async function (err, Insults) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Insult.',
                    error: err
                });
            }
            let Insultss=await modifyInsultsList(Insults,user)

            return res.json(Insultss);
        })
        .sort({likes:-1,comments:-1})
        .limit(10)
        .populate({ path: 'posted_by', select: 'full_name photo last_seen username'})
        //.populate({ path: 'liked_by', select: 'photo'})
        .populate({ path: 'comments_data.user', select: 'full_name photo'})
        .exec();
    },
    
    list: function (req, res) {
      var skip=req.query.skip ? Number(req.query.skip) : 0;
      //console.log('skip',skip);
      var limit=req.query.limit ? Number(req.query.limit) : 20;
      const user=mongoose.Types.ObjectId(req.user._id);
      //returnInsults(user);
        InsultModel.find({},null,{limit,skip,sort:{'createdAt':-1}},async function (err, Insults) {
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
    
    
    listMyPost: function (req, res) {
      var skip=req.query.skip ? Number(req.query.skip) : 0;
      //console.log('skip',skip);
      var limit=req.query.limit ? Number(req.query.limit) : 20;
      const user=mongoose.Types.ObjectId(req.user._id);
      //returnInsults(user);
        InsultModel.find({posted_by:user},null,{limit,skip,sort:{'createdAt':-1}},async function (err, Insults) {
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
     * InsultController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        InsultModel.findOne({_id: id}, function (err, Insult) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Insult.',
                    error: err
                });
            }

            if (!Insult) {
                return res.status(404).json({
                    message: 'No such Insult'
                });
            }

            return res.json(Insult);
        })
        .populate({ path: 'user', select: 'full_name photo'})
        .populate({ path: 'comments_data.user', select: 'full_name photo'})
        //.populate({ path: 'liked_by', select: 'photo'})
        .exec();
    },

    /**
     * InsultController.create()
     */
    create: async function (req, res) {
        var file=(req.file ? `http://${req.headers.host}/${req.file.path}` : null)
        const user=mongoose.Types.ObjectId(req.user._id);
        
        if(file){
            /*
            const { filename: image } = req.file 
             await sharp(req.file.path)
              .resize(500)
              .jpeg({quality: 50})
              .toFile(
                  path.resolve(req.file.destination,'resized',image)
              )
              fs.unlinkSync(req.file.path)
              file=`http://${req.headers.host}/${req.file.destination}/resized/${image}`
             */ 
              
              
            //console.log(req.file);
          const data = await sharp(req.file.path).jpeg({ quality: 50 }).toBuffer();
          const stream = cloudinary.uploader.upload_stream(
            { folder: "DEV" },
            (error, result) => {
              if (error) return console.error(error);
              //return res.json({ URL: result.secure_url });
              file = result.secure_url
            }
          );
          bufferToStream(data).pipe(stream);
        }else{
          file=await addTextOnImage(req.body.insult)
          //file=`http://${req.headers.host}${dest}`
          //console.log(file);
        }
        var Insult = new InsultModel({
			insult : req.body.insult,
			posted_by : req.user._id,
			image : file,
			likes : 0,
			liked_by : [],
			comments : 0,
			comments_data : []
        });

        Insult.save(function (err, Insult) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Insult',
                    error: err
                });
            }
            
            Insult.populate({ path: 'posted_by', select: 'full_name photo'})
            .populate({ path: 'comments_data.user', select: 'full_name photo'}, async function(err, Insult){
              let modifyList = await  modifyInsultsList([Insult],user)
              //console.log(modifyList);
              return res.status(201).json(modifyList[0]);
            })
            //.populate({ path: 'liked_by', select: 'photo'})
            //.exec();

            //return res.status(201).json(Insult);
        });
    },

    /**
     * InsultController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        InsultModel.findOne({_id: id}, function (err, Insult) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Insult',
                    error: err
                });
            }

            if (!Insult) {
                return res.status(404).json({
                    message: 'No such Insult'
                });
            }

            Insult.insult = req.body.insult ? req.body.insult : Insult.insult;
			Insult.posted_by = req.body.posted_by ? req.body.posted_by : Insult.posted_by;
			Insult.image = req.body.image ? req.body.image : Insult.image;
			Insult.likes = req.body.likes ? req.body.likes : Insult.likes;
			Insult.liked_by = req.body.liked_by ? req.body.liked_by : Insult.liked_by;
			Insult.comments = req.body.comments ? req.body.comments : Insult.comments;
			Insult.comments_data = req.body.comments_data ? req.body.comments_data : Insult.comments_data;
			
            Insult.save(function (err, Insult) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Insult.',
                        error: err
                    });
                }

                return res.json(Insult);
            });
        });
    },

    /**
     * InsultController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        InsultModel.findByIdAndRemove(id, function (err, Insult) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Insult.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};




async function returnInsults(user) {
    const insults=await InsultModel.aggregate([
     { $lookup:
        {
           from: "likes",
           localField: "_id",
           foreignField: "insult",
           as: "users_who_liked"
        }
     },
      {
        $project: 
        {
          insult: 1,
          users_who_liked: 
          { 
            $filter: 
            { 
              input: "$users_who_liked",
              as: "liker", 
              cond: { $eq: [ "$$liker.user", user ] } 
            } 
          } 
        } 
      } 
    ]);
    //console.log(insults);
 }
 
 
 
 
 
 
 
 
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





function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}


 
function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}






async function addTextOnImage(text) {
  var color = random_rgba();
  var pat = new Date().toISOString().split(/T/)[0].toString().split('-').join('/');
  let pathh = `/uploads/${pat}/text`
  try{
    mkdir(pathh)
    pathh=pathh+`/${Date.now()}text-image.png`
    var arr=chunkString(text,30);
    //console.log(arr);
    const width = 200;
    const height = 150;
    
    let string='';
    let dy=10;
    for (var i = 0; i < arr.length; i++) {
      dy+=10
      const part=arr[i]
      string+=`<text x="90" y="${dy}" text-anchor="middle" class="title">${part}</text>`
    }
    
    const svgImage = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
      .title { fill: #001; font-size: 8px; font-weight: bold;}
      .title1 { fill: #9e2bf1; font-size: 8px; font-weight: bold;}
      </style>
      <text x="90" y="10" text-anchor="middle" class="title1">This is friendly insult don't take anything personal</text>
      ${string}
    </svg>
    `;
    
    
    const svgBuffer = Buffer.from(svgImage);
    
    const data = await sharp(photo)
      .resize({
        width: 200,
        height: 150
      })
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();
      //.toFile(path.resolve('.'+pathh));
      
      
      //const data = await sharp(req.file.buffer).webp({ quality: 50 }).toBuffer();
        const stream = cloudinary.uploader.upload_stream(
          { folder: "DEV" },
          (error, result) => {
            if (error) return console.error(error);
            //return res.json({ URL: result.secure_url });
            pathh = result.secure_url
          }
        );
        bufferToStream(data).pipe(stream);
    //console.log(image);
    return pathh;
  } catch (error) {
    //console.log(error);
    return null
  }
}



