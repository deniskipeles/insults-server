var Chat_messageModel = require('./Chat_messageModel.js');
var ChatModel = require('../Chat/ChatModel.js');
var mongoose = require('mongoose');
/**
 * Chat_messageController.js
 *
 * @description :: Server-side logic for managing Chat_messages.
 */
module.exports = {

    /**
     * Chat_messageController.list()
     */
    list: function (req, res) {
        Chat_messageModel.find(function (err, Chat_messages) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Chat_message.',
                    error: err
                });
            }

            return res.json(Chat_messages);
        });
    },

    /**
     * Chat_messageController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        Chat_messageModel.findOne({_id: id}, function (err, Chat_message) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Chat_message.',
                    error: err
                });
            }

            if (!Chat_message) {
                return res.status(404).json({
                    message: 'No such Chat_message'
                });
            }

            return res.json(Chat_message);
        });
    },

    /**
     * Chat_messageController.create()
     */
    create: function (req, res) {
        var Chat_message = new Chat_messageModel({
			sender : req.user._id,
			receiver : [req.user._id,req.body.receiver],
			message : req.body.message,
			reply_to : req.body.reply_to,
			readers : [req.body.receiver]
        });

        Chat_message.save(function (err, Chat_message) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating message',
                    error: err
                });
            }

            return res.status(201).json(Chat_message);
        });
    },

    /**
     * Chat_messageController.update()
     */
    updateRead: async function (req, res) {
        try{
        var reader = mongoose.Types.ObjectId(req.user._id);
        var chatmate = mongoose.Types.ObjectId(req.body.chatmate);
        var receiver=[reader,chatmate]
        
        await Chat_messageModel.updateMany({receiver: {$all:receiver, $size:2 },readers:reader }, { readers: [] });

        updateChat(receiver);
          return res.send('ok');
        }catch(err){
          console.log(err);
          return res.status(500).json({
                        message: 'Error when updating Chat_message.',
                        error: err
                    });
        }
    },
    
    update: function (req, res) {
        var id = req.params.id;

        Chat_messageModel.findOne({_id: id}, function (err, Chat_message) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Chat_message',
                    error: err
                });
            }

            if (!Chat_message) {
                return res.status(404).json({
                    message: 'No such Chat_message'
                });
            }

            Chat_message.sender = req.user._id ? req.user._id : Chat_message.sender;
			Chat_message.receiver = req.body.receiver ? req.body.receiver : Chat_message.receiver;
			Chat_message.message = req.body.message ? req.body.message : Chat_message.message;
			
            Chat_message.save(function (err, Chat_message) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Chat_message.',
                        error: err
                    });
                }

                return res.json(Chat_message);
            });
        });
    },

    /**
     * Chat_messageController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        Chat_messageModel.findByIdAndRemove(id, function (err, Chat_message) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Chat_message.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};



function updateChat(chatmates) {
    const filter = { users: {$all:chatmates } };
    
    var query = Chat_messageModel.find({receiver: {$all:chatmates, $size:2 } });
    query.sort({'createdAt': -1});
    query.limit(50);
    query.exec(async function(error, docs){
    //console.log(docs);
    await ChatModel.updateOne(
        filter, 
        {messages:docs}
    );
  });
}