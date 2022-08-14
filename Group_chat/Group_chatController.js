var Group_chatModel = require('./Group_chatModel.js');

/**
 * Group_chatController.js
 *
 * @description :: Server-side logic for managing Group_chats.
 */
module.exports = {

    /**
     * Group_chatController.list()
     */
    list: function (req, res) {
        Group_chatModel.find(function (err, Group_chats) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Group_chat.',
                    error: err
                });
            }

            return res.json(Group_chats);
        });
    },

    /**
     * Group_chatController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        Group_chatModel.findOne({_id: id}, function (err, Group_chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Group_chat.',
                    error: err
                });
            }

            if (!Group_chat) {
                return res.status(404).json({
                    message: 'No such Group_chat'
                });
            }

            return res.json(Group_chat);
        });
    },

    /**
     * Group_chatController.create()
     */
    create: function (req, res) {
        var Group_chat = new Group_chatModel({
			sender : req.body.sender,
			receivers : req.body.receivers,
			readers : req.body.readers,
			message : req.body.message
        });

        Group_chat.save(function (err, Group_chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Group_chat',
                    error: err
                });
            }

            return res.status(201).json(Group_chat);
        });
    },

    /**
     * Group_chatController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        Group_chatModel.findOne({_id: id}, function (err, Group_chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Group_chat',
                    error: err
                });
            }

            if (!Group_chat) {
                return res.status(404).json({
                    message: 'No such Group_chat'
                });
            }

            Group_chat.sender = req.body.sender ? req.body.sender : Group_chat.sender;
			Group_chat.receivers = req.body.receivers ? req.body.receivers : Group_chat.receivers;
			Group_chat.readers = req.body.readers ? req.body.readers : Group_chat.readers;
			Group_chat.message = req.body.message ? req.body.message : Group_chat.message;
			
            Group_chat.save(function (err, Group_chat) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Group_chat.',
                        error: err
                    });
                }

                return res.json(Group_chat);
            });
        });
    },

    /**
     * Group_chatController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        Group_chatModel.findByIdAndRemove(id, function (err, Group_chat) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Group_chat.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
