const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const BorrowLog = require('../models/BorrowLog');
const User = require('../models/User'); 
const { checkRole } = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
       
        const newUser = await User.create({ 
            username, 
            email, 
            password, 
            role: role || 'user' 
        });
        res.status(201).json({ message: "Registrasi berhasil", user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ where: { email, password } });

        if (!user) {
            return res.status(401).json({ message: "Email atau Password salah" });
        }

        res.json({
            message: "Login berhasil",
            data: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/books', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/books', checkRole('admin'), async (req, res) => {
    try {
        const { title, author, stock } = req.body;
        if (!title || !author) {
            return res.status(400).json({ message: "Title dan Author wajib diisi" });
        }
        const newBook = await Book.create({ title, author, stock });
        res.status(201).json(newBook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/books/:id', checkRole('admin'), async (req, res) => {
    try {
        const { title, author, stock } = req.body;
        await Book.update({ title, author, stock }, { where: { id: req.params.id } });
        res.json({ message: "Buku berhasil diupdate" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/books/:id', checkRole('admin'), async (req, res) => {
    try {
        await Book.destroy({ where: { id: req.params.id } });
        res.json({ message: "Buku berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/borrow', checkRole('user'), async (req, res) => {
    const userId = req.headers['x-user-id']; 
    const { bookId, latitude, longitude } = req.body;

    if (!userId) return res.status(400).json({ message: "Header x-user-id diperlukan" });

    try {
        const book = await Book.findByPk(bookId);
        
        if (!book || book.stock <= 0) {
            return res.status(400).json({ message: "Buku tidak tersedia atau stok habis" });
        }

        book.stock -= 1;
        await book.save();

        const log = await BorrowLog.create({
            userId,
            bookId,
            latitude,
            longitude
        });

        res.json({ message: "Peminjaman berhasil", data: log });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;