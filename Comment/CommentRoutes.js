var express = require('express');
var router = express.Router();
var CommentController = require('./CommentController.js');
const authenticate = require("../middlewares/authenticate");

/*
 * GET
 */
router.get('/', CommentController.list);

/*
 * GET
 */
router.get('/:id', CommentController.show);

/*
 * POST
 */
router.post('/', authenticate, CommentController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, CommentController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, CommentController.remove);

module.exports = router;
