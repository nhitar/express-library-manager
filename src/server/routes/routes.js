const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

const jsonPath = path.join(__dirname, '../../../data/library.json');
const libraryJSON = require(jsonPath);

function saveLibrary() {
    fs.writeFile(jsonPath, JSON.stringify(libraryJSON, null, 2), (err) => {
        if (err) throw err;
    });
}

router.get('/', (req, res) => {
    res.redirect('/books');
})

router.get('/books', (req, res) => {
    const { status, returnDate } = req.query;
    let books = libraryJSON.library.books;

    if (status == 'available') {
        books = books.filter(function(book) { return book.isAvailable === true });
    } else if (status == 'borrowed') {
        books = books.filter(function(book) { return book.isAvailable === false });
    }

    if (returnDate) {
        books = books.filter(function(book) { return book.returnDate >= returnDate });
    }

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.json(books);
    } else {
        res.render('booksList', { 
            books: books
        });
    }
});

router.post('/books', (req, res) => {
    const { author, title, genre, releaseDate, pages } = req.body;

    const newBook = {
        id: uuidv4(),
        author,
        title,
        genre,
        isAvailable: true
    };

    if (genre) newBook.genre = genre;
    if (releaseDate) newBook.releaseDate = releaseDate;
    if (pages) newBook.pages = parseInt(pages);

    libraryJSON.library.books.push(newBook);
    saveLibrary();
    res.redirect('/books');
});

router.get('/books/:id', (req, res) => {
    const id = req.params.id;
    libraryJSON.library.books.forEach(book => {
        if (book.id === id) {
            res.render('bookCard', {
                book: book
            });
            return;
        }
    });
});

router.post('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const { readerName } = req.body;
    if (readerName) {
        libraryJSON.library.books.forEach(book => {
            if (book.id === bookId) {
                const returnDate = new Date();
                returnDate.setDate(returnDate.getDate() + 7);
    
                book.isAvailable = false;
                book.borrowedBy = readerName;
                book.borrowDate = new Date().toISOString().split('T')[0];
                book.returnDate = returnDate.toISOString().split('T')[0];
                return;
            }
        });
    } else {
        libraryJSON.library.books.forEach(book => {
            if (book.id === bookId) {
                book.isAvailable = true;
                book.borrowedBy = null;
                book.borrowDate = null;
                book.returnDate = null;
                return;
            }
        });
    }
    saveLibrary();
    res.redirect(`/books/${bookId}`);
});

router.delete('/books/:id', (req, res) => {
    const bookId = req.params.id;

    libraryJSON.library.books = libraryJSON.library.books.filter(book => book.id !== bookId);
    libraryJSON.library.totalBooks = libraryJSON.library.books.length;
    
    saveLibrary();
    res.redirect('/books');
});

module.exports = router;