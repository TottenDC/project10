// Modules
const express = require('express');
const createError = require('http-errors');
const Sequelize = require('sequelize');
const Book = require('../models').Book;
// Methods
const Op = Sequelize.Op;
const router = express.Router();

// GET all books
router.get('/', (req, res, next) => {
  // Determine the total number of books for pagination
  Book.findAll().then( (books) => {
    req.pageLength = Math.ceil(books.length / 10);
  });
  next();
}, (req, res, next) => {
  let offset = ( req.query.page - 1) * 10;
  Book.findAll({ offset: offset, limit: 10 }).then( (books) => {
      res.render('books/index', {books: books, title: 'Books', display: true, pages: req.pageLength});
  }).catch( () => {
      next(createError(503));
  });
});

// GET search results
  // Page display is turned off for returned results
router.get('/search', (req, res, next) => {
  if (isNaN(req.query.q)) {
    Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${req.query.q}%`
            }
          },
          {
            author: {
              [Op.like]: `%${req.query.q}%`
            }
          },
          {
            genre: {
              [Op.like]: `%${req.query.q}%`
            }
          }
        ]
      }
    }).then( (books) => {
      res.render('books/index', {books: books, title: 'Results', display: false});
    }).catch( () => {
      next(createError(503));
    });
  } else {
    Book.findAll({
      where: {
        year: {
          [Op.like]: `%${req.query.q}%`
        }
      }
    }).then( (books) => {
      res.render('books/index', {books: books, title: 'Results', display: false});
    }).catch( () => {
      next(createError(503));
    });
  }
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
        next(createError(500))
      });
});

// GET a specific book
router.get('/:id', (req, res, next) => {
    Book.findByPk(req.params.id).then( (book) => {
        if (book) {
            res.render('books/update-book', {book: book, title: book.title})
        } else {
            next(createError(400));
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
      next(createError(400));
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
    next(createError(500));
  });
});

// POST a delete for a specific book
router.delete('/:id', (req, res, next) => {
  Book.findByPk(req.params.id).then( (book) => {
    if(book) {
      return book.destroy();
    } else {
      next(createError(400));
    }
  }).then( () => {
    res.redirect('/books');
  }).catch( () => {
    next(createError(500));
  });
});

module.exports = router;