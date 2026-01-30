const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const BorrowLog = require('../models/BorrowLog');
const User = require('../models/User'); 
const { checkRole } = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const newUser = await User.create({ username, email, password, role: role || 'user' });
        res.status(201).json({ message: "Registrasi berhasil", user: newUser });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email, password } });
        if (!user) return res.status(401).json({ message: "Email atau Password salah" });
        res.json({ message: "Login berhasil", data: { id: user.id, username: user.username, role: user.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/books', async (req, res) => {
    try { const books = await Book.findAll(); res.json(books); } 
    catch (err) { res.status(500).json({ error: err.message }); }
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
        await Book.create({ title, author, stock });
        res.status(201).json({ message: "Buku ditambah" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/books/:id', checkRole('admin'), async (req, res) => {
    try {
        await Book.update(req.body, { where: { id: req.params.id } });
        res.json({ message: "Buku diupdate" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/books/:id', checkRole('admin'), async (req, res) => {
    try {
        await Book.destroy({ where: { id: req.params.id } });
        res.json({ message: "Buku dihapus" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/borrow', checkRole('user'), async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { bookId, latitude, longitude } = req.body;
    try {
        const book = await Book.findByPk(bookId);
        if (!book || book.stock <= 0) return res.status(400).json({ message: "Stok habis/Buku tidak ada" });

        book.stock -= 1;
        await book.save();
        await BorrowLog.create({ userId, bookId, latitude, longitude });

        res.json({ message: "Peminjaman berhasil dicatat!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/reports', checkRole('admin'), async (req, res) => {
    try {
        const logs = await BorrowLog.findAll({
            include: [
                { model: User, attributes: ['username'] },
                { model: Book, attributes: ['title'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;