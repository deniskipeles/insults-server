var GroupModel = require('./GroupModel.js');

/**
 * GroupController.js
 *
 * @description :: Server-side logic for managing Groups.
 */
module.exports = {

    /**
     * GroupController.list()
     */
    list: function (req, res) {
        GroupModel.find(function (err, Groups) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Group.',
                    error: err
                });
            }

            return res.json(Groups);
        });
    },

    /**
     * GroupController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        GroupModel.findOne({_id: id}, function (err, Group) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Group.',
                    error: err
                });
            }

            if (!Group) {
                return res.status(404).json({
                    message: 'No such Group'
                });
            }

            return res.json(Group);
        });
    },

    /**
     * GroupController.create()
     */
    create: function (req, res) {
        var Group = new GroupModel({
			name : req.body.name,
			created_by : req.body.created_by,
			purpose : req.body.purpose,
			members : req.body.members,
			photo : req.body.photo,
			description : req.body.description
        });

        Group.save(function (err, Group) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Group',
                    error: err
                });
            }

            return res.status(201).json(Group);
        });
    },

    /**
     * GroupController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        GroupModel.findOne({_id: id}, function (err, Group) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Group',
                    error: err
                });
            }

            if (!Group) {
                return res.status(404).json({
                    message: 'No such Group'
                });
            }

            Group.name = req.body.name ? req.body.name : Group.name;
			Group.created_by = req.body.created_by ? req.body.created_by : Group.created_by;
			Group.purpose = req.body.purpose ? req.body.purpose : Group.purpose;
			Group.members = req.body.members ? req.body.members : Group.members;
			Group.photo = req.body.photo ? req.body.photo : Group.photo;
			Group.description = req.body.description ? req.body.description : Group.description;
			
            Group.save(function (err, Group) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Group.',
                        error: err
                    });
                }

                return res.json(Group);
            });
        });
    },

    /**
     * GroupController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        GroupModel.findByIdAndRemove(id, function (err, Group) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Group.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
