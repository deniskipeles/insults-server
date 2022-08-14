var express = require('express');
var router = express.Router();
var InsultController = require('./InsultController.js');
const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");

/*
 * GET
 */
router.get('/',authenticate, InsultController.list);
router.get('/my/posting/',authenticate, InsultController.listMyPost);
router.get('/top/ten/',authenticate, InsultController.top);

/*
 * GET
 */
router.get('/:id', InsultController.show);

/*
 * POST
 */
router.post('/', upload.single("image"), authenticate, InsultController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, InsultController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, InsultController.remove);

module.exports = router;
