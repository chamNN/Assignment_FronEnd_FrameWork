const mysql = require('mysql');

const ketnoi = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'teashop'
});

ketnoi.connect(function (err) {
    if (err){
        console.log('Kết nối CDSL thất bại, kiểm tra lại CSDL!');
    }
    
});

module.exports = ketnoi;