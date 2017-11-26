'use strict'

const express = require('express')

const userController = require('./controllers/userController.js')

const musicController = require('./controllers/musicController.js')

let router = express.Router()

router.get('/test',userController.doTest)
//检查用户名是否存在
.post('/check-user',userController.checkUser)
//注册功能
.post('/do-register',userController.doRegister)
//登录功能
.post('/do-login',userController.doLogin)
//添加音乐
.post('/add-music',musicController.addMusic)
//更新音乐
.put('/update-music',musicController.updateMusic)
//删除音乐
.delete('/del-music', musicController.deleteMusic)
//退出登录
.get('/logout', userController.doLogout)

//配置路由规则 结束

module.exports = router;