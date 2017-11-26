'use strict';
// 引入数据库操作db对象
const db = require('../models/db');

let userController = {

};


userController.doTest = (req,res,next)=>{
  db.q('select * from album_dir',[],(err,data)=>{
      if(err)return next(err);
      res.render('test.html',{
          text:data[0].dir
      })
  })
}

/**
 * 检查用户是否存在
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.checkUser = (req,res,next)=>{
  let username = req.body.username
  db.q('select * from users where username = ?', [username], (err, data) => {
    if (err) return next(err)
    if (!data.length) {
      return res.json({
        code: '001',
        msg: '可以注册'
      })
    } else {
      return res.json({
        code: '002',
        msg: '已被注册'
      }) 
    }

  })

}


/**
 * 注册
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.doRegister = (req, res, next) => {	
	let username = req.body.username
	let email = req.body.email
	let password = req.body.password
	let vcode = req.body.vcode

	//验证邮箱
	let regExp = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
	if (!regExp.test(email)) {
		return res.json({
			code: '04',
			msg: '邮箱不合法'
		})
	}

	//连接数据库
	db.q('select * from users where username = ? or email = ?', [username, email], (err, data) => {
		if(err) return next(err)

		
		//如果data有值 说明用户名或邮箱以存在
		if(data.length) {
			let userData = data[0]
			if (userData.email) {
				res.json({
					code: '002',
					msg: '邮箱已被注册'
				})
			}else {
				res.json({
					code: '002',
					msg: '用户名已存在'
				})
			}
			
		}
		//如果data里没有值 说明可以注册
		if(!data.length) {
			db.q('insert into users (username, password, email) values (?, ?, ?)', 
			[username, password, email], (err, data) => {
				if(err) return next(err)
				res.json({
					code: '001',
					msg: '成功'
				})


			})
		}

	})
}

/**
 * 登录接口
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.doLogin = (req, res, next) => {
	let formData = req.body
	let username = formData.username
	let password = formData.password
	db.q('select * from users where username = ?', [username], (err, data) => {
		if (err) return next(err)
		//如果没查询到数据
		// let obj = {}
		if (!data.length) {
			return res.json({
				code: '002',
				msg: '用户名或密码不存在'
			})
		}

		if(data[0].password !== password) {
			return res.json({
				code: '002',
				msg: '用户名或密码不存在'
			})
		}

		if (data[0].username === username && data[0].password === password) {
			//将登录信息保存在session里
			req.session.user = data[0];
			return res.json({
				code: '001',
				msg: '登录成功'
			})
			
			// console.log(req.session.user)
		}

		// res.json(obj)

	})


}


/**
 * 退出登录功能
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

userController.doLogout = (req, res, next) => {
	req.session.user = null
	res.json({
			code:'001',
			msg:'退出成功'
	})

}




/**
 * 前端登录页面展示
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.showLogin = (req, res, next) => {
	res.render('login.html')
}


/**
 * 前端注册页面展示
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
userController.showRegister = (req, res, next) => {
	res.render('register.html')
}



module.exports = userController