const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const Book = require('../models').Book;

// GET all books
router.get('/', (req, res, next) => {
    Book.findAll().then( (books) => {
        res.render('books/index', {books: books, title: 'Books'});
    }).catch( () => {
        next(createError(503));
    });
});

// GET new book form
router.get('/new', (req, res, next) => {
    res.render('books/new-book', {book: Book.build(), title: 'New Book'});
});

// POST new book form
router.post('/', (req, res, next) => {
    Book.create(req.body).then( (book) => {
        res.redirect(`/books/${book.id}`);
    }).catch( (err) => {
        if(err.name === 'SequelizeValidationError') {
          res.render('books/new-book', {book: Book.build(req.body), title: 'New Book', errors: err.errors});
        } else {
          throw err;
        }
      }).catch( () => {
        next(createError(501))
      });
});

// GET a specific book
router.get('/:id', (req, res, next) => {
    Book.findByPk(req.params.id).then( (book) => {
        if (book) {
            res.render('books/update-book', {book: book, title: book.title})
        } else {
            next(createError(404));
        }
    }).catch( () => {
        next(createError(503));
    })
});

// POST an update to a specific book
router.put('/:id', (req, res, next) => {
    Book.findByPk(req.params.id).then( (book) => {
      if(book) {
        return book.update(req.body);
      } else {
        next(createError(404));
      }
    }).then( (book) => {
      res.redirect(`/books/${book.id}`);
    }).catch( (err) => {
      if(err.name === 'SequelizeValidationError') {
        let book = Book.build(req.body);
        book.id =  req.params.id; 
        res.render('books/update-book', {book: book, title: 'Add details', errors: err.errors});
      } else {
        throw err;
      }
    }).catch( () => {
      next(createError(501));
    });
  });

// POST a delete for a specific book
router.delete('/:id', (req, res, next) => {
    Book.findByPk(req.params.id).then( (book) => {
      if(book) {
        return book.destroy();
      } else {
        next(createError(404));
      }
    }).then( () => {
      res.redirect('/books');
    }).catch( () => {
      next(createError(501));
    });
  });

module.exports = router;