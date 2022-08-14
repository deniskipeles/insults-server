var express = require('express');
var router = express.Router();
var LikeController = require('./LikeController.js');
const authenticate = require("../middlewares/authenticate");

/*
 * GET
 */
router.get('/', LikeController.list);

/*
 * GET
 */
router.get('/:id', LikeController.show);

/*
 * POST
 */
router.post('/', authenticate, LikeController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, LikeController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, LikeController.remove);

module.exports = router;
