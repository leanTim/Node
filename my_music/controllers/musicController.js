// module.exports 默认是一空对象，和exports 是相等的
'use strict';
// 引入数据库操作db对象
const db = require('../models/db');
//解析文件上传
const formidable = require('formidable');
//引入path核心对象
const path = require('path');
//引如模板引擎
//配置模板引擎
// app.engine('html', require('express-art-template') );

/**
 * 添加音乐
 * @param {*} req  请求体
 * @param {*} res  响应体
 * @param {*} next 
 */

exports.addMusic = (req, res, next) => {
	//登陆以后才有的功能
	// if (!req.session.user) {
	// 	res.send(`
	// 		请先登录
	// 		<a href="/api/do-login">登录页。。</a>
	// 	`)
	// }
	// console.log(req.session.user)	
	var form = new formidable.IncomingForm();
	//设定文件上传的目录
	
	form.uploadDir = path.join(__dirname, '../',"public/files");
	
	form.parse(req, function(err, fields, files) {
		if (err) return next(err)
		let title = fields.title
		let time = fields.time
		let singer = fields.singer
		let dataArr = [title, time, singer]
		let sql = 'insert into musics (title, time, singer,'
		let params = ' values (?, ?, ?,'

		//判断是否上传了音乐文件
		console.log(files)
		if(files.file) {
			let filename = path.parse(files.file.path).base
			let fileDir = `/public/files/${filename}`
			dataArr.push(fileDir)
			sql += 'file,'
			params += ' ?,'
			
		}
		

		//判断是否上传了歌词
		if(files.filelrc) {
			let filename = path.parse(files.filelrc.path).base
			let fileDir = `/public/files/${filename}`
			dataArr.push(fileDir)
			sql += 'filelrc,'
			params += ' ?,'
						
		}
		sql = sql.substr(0, sql.length-1)
		params = params.substr(0, params.length-1)
		sql += ', uid)'
		params += ', ?)'
		dataArr.push(req.session.user.id)
		console.log(sql + params)
		console.log(dataArr)

		db.q(sql + params, dataArr, (err, data) => {
			if (err) return next(err)
			res.json({
				code: '001',
				msg: '添加成功'
			})

		})

	})

}

/**
 * 更新音乐列表
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updateMusic = (req, res, next) => {
		
		let form = new formidable.IncomingForm();
		//设定文件上传的目录
		form.uploadDir = path.join(__dirname, '../',"public/files");
		
		form.parse(req, function(err, fields, files) {
			if (err) return next(err)
			let title = fields.title
			let time = fields.time
			let singer = fields.singer
			let dataArr = [title, time, singer]
			let sql = 'update musics set title = ?, singer = ?, time = ?,'
				
			//判断是否上传了音乐文件
			if(files.file) {
				let filename = path.parse(files.file.path).base
				let fileDir = `/public/files/${filename}`
				dataArr.push(fileDir)
				sql += 'file = ?,'
							
			}
	
			//判断是否上传了歌词
			if(files.filelrc) {
				let filename = path.parse(files.filelrc.path).base
				let fileDir = `/public/files/${filename}`
				dataArr.push(fileDir)
				sql += 'filelrc = ?,'
											
			}
			sql = sql.substr(0, sql.length-1)
			
			sql += ' where id = ?'

			let sqlId = fields.id - 0

			dataArr.push(sqlId)

			db.q(sql, dataArr, (err, data) => {
				if (err) return next(err)
				res.json({
					code: '001',
					msg: '更新音乐成功'
				})
	
			})
	
		})
	
}

/**
 * 删除音乐
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

exports.deleteMusic = (req, res, next) => {
	//登陆以后才有的功能
	// if (!req.session.user) {
	// 	res.send(`
	// 		请先登录
	// 		<a href="/api/do-login">登录页。。</a>
	// 	`)
	// }

	let uid = req.session.user.id
	let id = req.query.id

	db.q('delete from musics where id = ? and uid = ?', [id, uid], (err, data) => {
		if (err) return next(err)
		
		if (data.affectedRows) {
			res.json({
				code: '001',
				msg: '删除成功'
			})
		} else {
			res.json({
				code: '002',
				msg: '删除失败'
			})
		}
	})
}


/**
 * 展示音乐列表页
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.showMusicIndex = (req, res, next) => {
	
	let uid = req.session.user.id
	// let uid = req.query.id
	db.q('select * from musics where uid = ?', [uid], (err, data) => {
		if (err) return next(err)
		// console.log(data)
		for (let i = 0; i < data.length; i++) {
			data[i].index = i + 1
			
		}
		
		res.render('index.html', {
			data: data
		})

	})

}

/**
 * 添加音乐页面渲染
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.showAddMusic = (req, res, next) => {
	res.render('add.html')


}

/**
 * 编辑音乐页面渲染
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.showEditMusic = (req, res, next) => {
	let id = req.query.id
	db.q('select * from musics where id = ?', [id], (err, data) => {
		res.render('edit.html', {data: data})
		
	})
}