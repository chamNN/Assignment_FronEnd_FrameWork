const express = require('express');
const app = express();

const until = require('node:util');
const ketNoi = require('./connect-mysql');
app.set('view engine', 'ejs');
const PORT = process.env.PORT || 8000;
//body-parser
const bodyParser = require('body-parser');
const { read } = require('node:fs');
app.use(bodyParser.urlencoded({
     extended: false 
}));
//theoeadassasform
const query = until.promisify(ketNoi.query).bind(ketNoi);

app.use(express.static('public'));
app.get('/', function (req, res) {
    let sql_xuat = "SELECT * FROM sanpham WHERE loai = 'Áo' OR loai = 'Quần' OR loai = 'Áo Khoác' LIMIT 8";
    ketNoi.query(sql_xuat, function (err, data) {
    res.render('home', {
        title: "sanPham",
        data: data,
    });
    });
});
app.get('/cua-hang', async function (req, res) {
    let sotrang = req.query.page ? parseInt(req.query.page) : 1;
    //sử dụng hàm để không bắt đồng bọ, until
    let Data = await query("SELECT COUNT(*) as total FROM sanpham");
    let totalRow = Data[0].total;

    let _limit = 8;
    let _start = (_limit * (sotrang - 1));
    let totalPage = Math.ceil(totalRow / _limit);
    let sql_xuat = "SELECT * FROM sanpham";
    let Name = req.query.name;
    if (Name) {
        sql_xuat += " WHERE TenSanPham LIKE '%" + Name + "%'";
    }
    sql_xuat += " ORDER BY ID ASC LIMIT " + _start + ", " + _limit;
    ketNoi.query(sql_xuat, function (err, data) {
        res.render('cuaHang', {
            title: "sanPham",
            data: data,
            totalPage: totalPage,
            currentPage: sotrang 
        });
    });

});
app.get('/lien-he', function (req, res) {
    res.render('contact');
});

//đăng nhập
app.get('/dang-nhap', function (req, res) {
        
    res.render('login');

});
app.post('/dang-nhap', async (req, res) => {
    let email = req.body.email;
    let password = req.body.matkhau;

    try {
      
        const sqlQuery = "SELECT * FROM taikhoan WHERE Email = ? AND MatKhau = ?";
        const data = await query(sqlQuery, [email, password]);

        
        if (data.length > 0) {
            
            res.redirect('/');;
        } else {
            
            res.render('kiemLoi', { messenge: 'Thông tin đăng nhập không chính xác', code: 401 });
        }
    } catch (error) {
        console.error('Lỗi rồi:', error);
        res.render('kiemLoi', { messenge: 'Lỗi server', code: 500 });
    }
});


//đăng ký
app.get('/dang-ky', function (req, res) {
    res.render('register');
});



app.post('/dang-ky',  function (req, res) {
    let sql_inser = "INSERT INTO taikhoan SET ?";
    ketNoi.query(sql_inser, req.body, function (err, data) {
        if(err) {
            let msg = '';

            if(err.errno == 1451) {
                msg = 'Tên tài khoản đã tồn tại';
            }
            else if(err.errno == 2000) {
                msg = 'Tên tài khoản không hợp lệ';
            }
            else {
                msg = 'Không hợp lệ vui lòng thử lại!';
            }

            res.render('kiemLoi', {
                messenge: msg,
                code: err.errno,

            });
        }
        else {
            res.render('success', { message: 'Đăng ký thành công' });
        }
    });

});


app.get('/error', function(req, res) {
    res.render('kiemLoi', { code: 404, messenger: 'Trang không tồn tại' });
});


//Danh sách sản phẩm


app.get('/danh-sach', async function (req, res) {
 
    let sotrang = req.query.page ? parseInt(req.query.page) : 1;

    let Data = await query("SELECT COUNT(*) as total FROM sanpham");
    let totalRow = Data[0].total;

    let _limit = 5;
    let _start = (_limit * (sotrang - 1));
    let totalPage = Math.ceil(totalRow / _limit);
    let sql_xuat = "SELECT * FROM sanpham";
    let Name = req.query.name;
    if (Name) {
        sql_xuat += " WHERE TenSanPham LIKE '%" + Name + "%'";
    }
    sql_xuat += " ORDER BY ID ASC LIMIT " + _start + ", " + _limit;
    ketNoi.query(sql_xuat, function (err, data) {
        res.render('danhSach', {
            title: "sanPham",
            data: data,
            totalPage: totalPage,
            currentPage: sotrang 
        });
    });
});

//xóa sản phẩm

app.get('/xoa-san-pham/:id', function (req, res) {
    let id = req.params.id;
    let sql_delete = "DELETE FROM sanpham where ID = ?";

    ketNoi.query(sql_delete, [id], function (err, data) {

        if(err) {
            let msg = '';

            if(err.errno == 1451) {
                msg = 'Tên sản phẩm đang tồn tại';
            }
            else if(err.errno == 2000) {
                msg = 'Tên sản phẩm trùng khóa';
            }
            else {
                msg = 'Không hợp lệ vui lòng thử lại!';
            }
            res.render('kiemLoi', {
                messenge: msg,
                code: err.errno,

            });
        }
        else {
            res.render('success', { message: 'Xóa sản phẩm thành công' });
        }
    });

});
/*
//download để thêm hình ảnh
//npm install multer
//npm install path

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img'); // Đường dẫn đến thư mục lưu trữ ảnh
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Tên tập tin được lưu trữ là timestamp + phần mở rộng
    }
});
*/
//thêm sản phẩm
app.get('/them-san-pham', function (req, res) {
    res.render('themSanPham');
});

app.post('/them-san-pham',  function (req, res) {
    let sql_inser = "INSERT INTO sanpham SET ?";
    ketNoi.query(sql_inser, req.body, function (err, data) {
        if(err) {
            let msg = '';

            if(err.errno == 1451) {
                msg = 'Tên sản phẩm đã tồn tại';
            }
            else if(err.errno == 2000) {
                msg = 'Tên sản phẩm không hợp lệ';
            }
            else {
                msg = 'Không hợp lệ vui lòng thử lại!';
            }

            res.render('kiemLoi', {
                messenge: msg,
                code: err.errno,

            });
        }
        else {
            res.render('success', { message: 'Thêm sản phẩm thành công' });
        }
    });

});

//thêm sản phẩm end


//sửa sản phẩm
app.get('/sua-san-pham/:id', function (req, res) {
    let id = req.params.id;
    let sql_select = "SELECT * FROM sanpham where ID =?";
    ketNoi.query(sql_select, [id], function (err, dat) {
        if (err) {
            console.error(err); 
            res.render('kiemLoi', { code: 500, messenger: 'Lỗi truy vấn cơ sở dữ liệu' });
            return;
        }
        
        if (dat && dat.length > 0) {
            res.render('suaSanPham', {
                layDL: dat[0] 
            });
        } else {
            res.render('kiemLoi', { code: 404, messenger: 'Không tìm thấy sản phẩm' });
        }
    });
});


app.post('/sua-san-pham/:id',  function (req, res) {
    let id = req.params.id;
    let sql_inser = "UPDATE sanpham SET ? WHERE ID = ?";
    ketNoi.query(sql_inser, [req.body, id], function (err, data) {
        if(err) {
            let msg = '';

            if(err.errno == 1451) {
                msg = 'Tên sản phẩm đã tồn tại';
            }
            else if(err.errno == 2000) {
                msg = 'Tên sản phẩm không hợp lệ';
            }
            else {
                msg = 'Không hợp lệ vui lòng thử lại!';
            }

            res.render('kiemLoi', {
                messenge: msg,
                code: err.errno,

            });
        }
        else {
            res.render('success', { message: 'Sửa sản phẩm thành công' });
        }
    });

});


app.listen(PORT, function() {
    console.log('Server is running on http://localhost:' + PORT);
});

//package example
  // "scripts": {
  //   "test": "echo \"Error: no test specified\" && exit 1"
  // },