var express = require('express');
var router = express.Router();
var ChatController = require('./ChatController.js');
const authenticate = require("../middlewares/authenticate");

/*
 * GET
 */
router.get('/', authenticate, ChatController.list);

/*
 * GET
 */
router.get('/:id', authenticate, ChatController.show);

/*
 * POST
 */
router.post('/', authenticate, ChatController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, ChatController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, ChatController.remove);

module.exports = router;
