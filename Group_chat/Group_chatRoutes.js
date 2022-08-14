var express = require('express');
var router = express.Router();
var Group_chatController = require('./Group_chatController.js');

/*
 * GET
 */
router.get('/', Group_chatController.list);

/*
 * GET
 */
router.get('/:id', Group_chatController.show);

/*
 * POST
 */
router.post('/', Group_chatController.create);

/*
 * PUT
 */
router.put('/:id', Group_chatController.update);

/*
 * DELETE
 */
router.delete('/:id', Group_chatController.remove);

module.exports = router;
