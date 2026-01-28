
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 
const sequelize = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');


const app = express();
const PORT = 3000;


app.use(cors()); 
app.use(bodyParser.json()); 


app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', apiRoutes);

sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database terhubung & Tabel tersinkronisasi.');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Gagal koneksi database:', err);
    });