const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');

const User = require('./models/User');
const Book = require('./models/Book');
const BorrowLog = require('./models/BorrowLog');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

User.hasMany(BorrowLog, { foreignKey: 'userId' });
BorrowLog.belongsTo(User, { foreignKey: 'userId' });

Book.hasMany(BorrowLog, { foreignKey: 'bookId' });
BorrowLog.belongsTo(Book, { foreignKey: 'bookId' });

sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database terhubung & Relasi sinkron.');
        app.listen(PORT, () => {
            console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('❌ Gagal koneksi database:', err));