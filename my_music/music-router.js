'use strict';
const express = require('express');
const musicController = require('./controllers/musicController');
//配置路由规则 开始
let router = express.Router();
router
.get('/list-music',musicController.showMusicIndex) //显示音乐列表
.get('/add-music',musicController.showAddMusic)//添加音乐
.get('/edit-music',musicController.showEditMusic)//编辑音乐
//配置路由规则 结束

module.exports = router;