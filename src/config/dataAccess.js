const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user:  'midori', 
    password: 'root',
    database: 'quest'
})

// const connection = mysql.createConnection({
//     host: 'mysql://quest.ci9zoznfu9jo.us-east-1.rds.amazonaws.com',
//     port: 3306,
//     user:  'quest', 
//     password: 'BM$]4W!<saH+',
//     database: 'quest'
// })

module.exports = connection;