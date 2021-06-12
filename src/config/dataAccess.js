const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user:  'midori', 
    password: 'root',
    database: 'quest'
})

module.exports = connection;