var express = require('express');
var router = express.Router();
var Chat_messageController = require('./Chat_messageController.js');
const authenticate = require("../middlewares/authenticate");

/*
 * GET
 */
router.get('/', authenticate, Chat_messageController.list);

/*
 * GET
 */
router.get('/:id', authenticate,  Chat_messageController.show);

/*
 * POST
 */
router.post('/', authenticate, Chat_messageController.create);
router.post('/read/message/', authenticate, Chat_messageController.updateRead);

/*
 * PUT
 */
router.put('/', authenticate, Chat_messageController.update);

/*
 * DELETE
 */
router.delete('/', authenticate, Chat_messageController.remove);

module.exports = router;
