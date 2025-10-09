const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const jsonPath = path.join(__dirname, '../json/library.json');
const libraryJSON = require(jsonPath);

function saveLibrary() {
    fs.writeFile(jsonPath, JSON.stringify(libraryJSON, null, 2), (err) => {
        if (err) throw err;
        console.log('JSON сохранён!');
    });
}

router.get('/', (req, res, next) => {
    res.redirect('/books');
})

router.get('/books', (req, res, next) => {
    const { status, returnDate } = req.query;
    let books = libraryJSON.library.books;

    if (status == 'available') {
        books = books.filter(function(book) { return book.isAvailable === true });
    } else if (status == 'borrowed') {
        books = books.filter(function(book) { return book.isAvailable === false });
    }

    if (returnDate) {
        books = books.filter(function(book) { return book.returnDate <= returnDate });
    }

    res.render('booksList', { 
        books: books
    });
});

router.get('/books/:id', (req, res, next) => {
    const id = req.params.id;
    libraryJSON.library.books.forEach(book => {
        if (book.id === id) {
            res.render('bookPage', {
                book: book
            });
            return;
        }
    });
});

router.post('/books/:id', (req, res, next) => {
    const bookId = req.params.id;
    const { readerName, returnDate } = req.body;
    libraryJSON.library.books.forEach(book => {
        if (book.id === bookId) {
            book.isAvailable = false;
            book.borrowedBy = readerName;
            book.borrowDate = "2025-01-01";
            book.returnDate = returnDate;
            return;
        }
    });
    saveLibrary();
    res.redirect('/books');
});

router.delete('/books/:id', (req, res, next) => {
    const bookId = req.params.id;

    libraryJSON.library.books = libraryJSON.library.books.filter(book => book.id !== bookId);
    libraryJSON.library.totalBooks = libraryJSON.library.books.length;
    
    saveLibrary();
    res.redirect('/books');
});

module.exports = router;