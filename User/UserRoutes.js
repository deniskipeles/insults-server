var express = require('express');
var router = express.Router();
var UserController = require('./UserController.js');
const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");


/*
 * GET
 */
router.get('/', authenticate, UserController.list);
router.get('/my/bookmarks/', authenticate, UserController.listMyBookmarks);

/*
 * GET
 */
router.get('/:id', authenticate, UserController.show);

/*
 * POST
 */
router.post('/', UserController.create);
router.post('/user/login', UserController.login);

/*
 * PUT
 */
router.put('/', upload.single("photo"), authenticate, UserController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, UserController.remove);
router.get('/my/account', authenticate, UserController.me);

router.post('/add/bookmark', authenticate, UserController.addBookmarks);
router.post('/remove/bookmark', authenticate, UserController.removeBookmarks);

module.exports = router;
