var express=require("express");
var app=express();
var router=require("./controller/router")
var session = require('express-session');
//使用session中间件
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/car');
app.set('view engine', 'ejs')
app.use(express.static('static'));
app.get("/",router.showLogin)//显示登录页
app.post("/checklogin",router.checklogin);//校验
app.get("/zhuce",router.showRegister)//注册页
app.get("/checkuserexist",router.checkuserexist);//验证用户名是否被占用
app.post("/doreg",router.doreg);//实现用户注册

app.get("/index",router.showIndex)//显示首页
app.get("/query",router.showQuery)//显示客人查询页
app.get('/student',router.getAllStudent);//Ajax接口得到所有客户
app.post('/student',router.doAddStudent);//Ajax接口添加客户
app.get('/student/:sid', router.showUpdate);//呈递更改客户表
app.post('/student/:sid', router.updateStudent);//更改客户
app.delete('/student/:sid',router.deleteStudent);//删除客户


app.get("/lease",router.showLease)//显示租赁登记页
app.get("/getLease",router.showGetLease)//显示汽车租赁类
app.get("/kehu",router.getAllkehu)//获取所有客户
app.get("/carData",router.carData)//获取单独类型车的数据
app.get("/carsid",router.carsid)//获取汽车价格
app.post("/zuchu",router.zuchu)//租出汽车

app.get("/return",router.showReturn)//显示归还登记页
app.get("/guihuan",router.guihuan)//归还页渲染
app.get("/quedinghuan/:sid",router.quehuan)//查看所交的钱，以及退款
app.get("/returnCar",router.returnCar)//确定归还汽车

app.get("/statistics",router.showStatistics)//显示统计分析页
app.post("/zuchu1",router.zuchu1)//租出汽车



app.get("/statistics",router.showStatistics)//显示统计分析页

app.get("/category",router.showCategory)//显示类别档案页
app.get('/category1',router.getAllCategory);//Ajax接口得到所有汽车类别
app.post("/category",router.addCategory)//显示汽车类别档案页
app.get('/category2/:sid', router.showUpdate1);//呈递更改汽车类别
app.post('/category2/:sid', router.updatedangan);//更改汽车类别
app.delete('/category/:sid',router.deletedangan);//删除汽车类别

app.get("/carfiles",router.showCarfiles);//显示汽车档案页
app.get("/carfiles1",router.getAllCarfiles);//显示汽车档案Ajax接口得到的所有汽车类型
app.post("/carfiles",router.addCarfiles);//显示汽车档案页
app.get("/carfiles2/:sid",router.showUpdateCarfiles);//呈递更改汽车类型表
app.post("/carfiles2/:sid",router.updateCarfiles);//显示更改后汽车类型表
app.delete("/carfiles/:sid",router.deleteCarfiles);//删除汽车类型


// app.get("/data",router.showData)//显示数据展示页
app.get("/tui",router.exit)//退出系统
app.listen(3000);
console.log("3000")