var express = require('express');
var router = express.Router();

/* Redirect home page. */
router.get('/', function(req, res, next) {
  res.redirect('/books?page=1')
});

module.exports = router;
