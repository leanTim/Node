"use strict";

const express = require("express");
//引入数据库对象
const mysql = require("mysql");

//引入art-template
let artTemplate = require("express-art-template");

//文件功能增强的包
const fse = require('fs-extra');
//解析上传文件的包
const formidable = require('formidable');

//解析post请求体数据
const bodyParser = require('body-parser');

//引入path核心对象
const path = require('path')



const pool = mysql.createPool({
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "123",
  database: "album"
})

//服务器对象
let app = express();



//建立模板引擎
app.engine("html", artTemplate);

app.listen(8888);

//配置路由规则
let router = express.Router();

router.get("/", (req, res, next) => {
  pool.getConnection(function(err, connection) {
    connection.query("SELECT * FROM album_dir", (error, results,fields) => {
      //查询完毕以后，释放连接
      connection.release();

      if (error) return next(err)
      // console.log(results[0])
			res.render('index.html', {
        album: results       
			})
      
    })
  })
})
//显示照片列表
.get('/showDir', (req, res, next) => {
  let dirname = req.query.dir
  //根据文件夹名称， 从数据库中查询数据
  pool.getConnection(function(err, connection) {
    connection.query("SELECT * FROM album_file where dir = ?", [dirname], (error, results,fields) => {
      //查询完毕以后，释放连接
      connection.release();
      // console.log(results)

      if (error) return next(err)
      // console.log(results[0])
			res.render('album.html', {
        album: results,
        dir: dirname
			})    
    })
  })
})
//照片上传
.post('/addPic', (req, res, next) => {
  //初始化文件上传工具
  var form = new formidable.IncomingForm();
  //设置图片保存的根目录
  let rootDir = path.join(__dirname, 'resource')
  form.uploadDir = rootDir

  form.parse(req, function (err, fields, files) {
    //console.log(fields) //{ dir: 'love' }
    if (err) return next(err)
    //console.log(files)
    //files.pic.path 结果为包含文件名的文件路径
    let oldPath = files.pic.path
    

    let filename = path.parse(oldPath).base
    // console.log(filename)
    //移动文件到指定目录下
    let finPath = path.join(__dirname, '/resource',fields.dir, filename)

    //移动文件
    fse.move(oldPath, finPath, (err) => {
      if(err) return next(err)
      //将数据保存到数据库
      let db_filename = `/resource/${fields.dir}/${filename}`
      // console.log(db_filename)
      let db_dir = fields.dir

      pool.getConnection(function(err, connection) {
        connection.query("insert into album_file values (? , ?)", [db_filename, db_dir], (error, results,fields) => {
          //查询完毕以后，释放连接
          connection.release();
    
          if (error) return next(err)
          // console.log(results[0])
          res.redirect('/showDir?dir=' +db_dir)    
        })
      })

    })

  })


})
//新建相册
.post('/addDir', (req, res, err) => {
  let dirname = req.body.dirname
  //连接数据库
  pool.getConnection(function(err, connection) {
    connection.query("insert into album_dir values (?)", [dirname], (error, results,fields) => {
      //查询完毕以后，释放连接
      connection.release();
      // console.log(results)

      if (error) return next(err)
      // console.log(results[0])
      //重定向
      res.redirect('/showDir?dir=' + dirname)
			   
    })
  })


})


//处理静态文件
app.use('/public', express.static('./public/'))
//处理图片
app.use('/resource', express.static('./resource/'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//处理错误的中间件
app.use((err, req, res, next) => {
  res.send(`
  您要访问的页面出异常拉...请稍后再试..
  <a href="/">去首页玩</a>
`)
})



app.use(router)


