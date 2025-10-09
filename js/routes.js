const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

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

router.post('/books', (req, res, next) => {
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
    const { readerName } = req.body;
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
    saveLibrary();
    res.redirect(`/books/${bookId}`);
});

router.delete('/books/:id', (req, res, next) => {
    const bookId = req.params.id;

    libraryJSON.library.books = libraryJSON.library.books.filter(book => book.id !== bookId);
    libraryJSON.library.totalBooks = libraryJSON.library.books.length;
    
    saveLibrary();
    res.redirect('/books');
});

module.exports = router;