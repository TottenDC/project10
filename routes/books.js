const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

// GET all books
router.get('/', (req, res, next) => {
    Book.findAll().then(function (books) {
        res.render('books/index', {books: books, title: 'Books'});
    }).catch(function (err) {
        res.send(500);
    });
});

// GET new book form
router.get('/new', (req, res, next) => {
    res.render('books/new-book', {book: Book.build(), title: 'New Book'});
});

// POST new book form
router.post('/new', (req, res, next) => {
    Book.create(req.body).then(function (book) {
        res.redirect(`/books/${book.id}`);
    }).catch(function(err) {
        if(err.name === 'SequelizeValidationError') {
          res.render('books/new-book', {book: Book.build(req.body), title: 'New Book', errors: err.errors});
        } else {
          throw err;
        }
      }).catch(function(err) {
        res.send(500);
      });
});

// GET a specific book
router.get('/:id', (req, res, next) => {
    Book.findById(req.params.id).then(function (book) {
        if (book) {
            res.render('books/update-book', {book: book, title: book.title})
        } else {
            res.send(404);
        }
    }).catch(function(err) {
        res.send(500);
    })
});

// POST an update to a specific book
router.put('/:id', (req, res, next) => {
    Book.findById(req.params.id).then(function(book) {
      if(book) {
        return book.update(req.body);
      } else {
        res.send(404);
      }
    }).then(function(book) {
      res.redirect(`/books/${book.id}`);
    }).catch(function(err) {
      if(err.name === 'SequelizeValidationError') {
        let book = Book.build(req.body);
        book.id =  req.params.id; 
        res.render('books/update-book', {book: book, title: 'Add details', errors: err.errors});
      } else {
        throw err;
      }
    }).catch(function(err) {
      res.send(500);
    });
  });

// POST a delete for a specific book
router.delete('/:id', (req, res, next) => {
    Book.findById(req.params.id).then(function(book) {
      if(book) {
        return book.destroy();
      } else {
        res.send(404);
      }
    }).then(function(){
      res.redirect('/books');
    }).catch(function(err) {
      res.send(500);
    });
  });

module.exports = router;