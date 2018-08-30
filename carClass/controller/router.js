//汽车类别
var dangan=require("../models/carClass")
//汽车数据
var carClass=require("../models/carData");
//客户
var Student = require("../models/student.js");
//管理员
var user = require("../models/user.js");
var formidable = require("formidable");
var url = require("url");
var crypto = require('crypto');
//更改日期模块
var dateTime = require('date-time');
//租出模块
var Rented=require("../models/Rented");
//登录页
exports.showLogin=function (req,res,next) {
    res.render("login");
}
//检查用户登陆用户名、密码是否正确
exports.checklogin = function(req,res,next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;
        //先来检查用户名是否存在
        user.findUserByName(yonghuming,function(err,doc){
            if(!doc){
                //-1用户名不存在！！！
                res.json({"result":-1});
                return;
            }
            //密码和密码进行加密比对
            if(crypto.createHmac('sha256', mima).digest('hex') === doc.mima){
                //写session
                req.session.login = 1;
                req.session.yonghuming = yonghuming;
                //比较密码的正确性，加密的和加密的比较、
                res.json({"result":1});
                //跳转
                return;
            }else{
                res.json({"result":-2});
                return;
            }
        });
    });
}
//注册页
exports.showRegister=function(req,res,next){
    res.render("reg")
}
//验证用户名是否存在
exports.checkuserexist = function(req,res,next){
    var queryobj = url.parse(req.url,true).query;
    if(!queryobj.yonghuming){
        res.send("请提供yonghuming参数！");
        return;
    }
    //查询数据库中，用户是否存在，如果存在输出-1，不存在输出0
    user.findUserByName(queryobj.yonghuming,function(err,doc){
        if(doc){
            res.json({"result" : -1});
        }else{
            res.json({"result" : 0});
        }
    });
}
//执行注册，在真正执行注册的时候也要后台验证一下用户名是否占用
exports.doreg = function(req,res,next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;
        //在提交的时候再次检查用户名是否重复了
        user.findUserByName(yonghuming,function(err,doc){
            if(doc){
                //-1就是用户名存在
                res.json({"result" : -1});
                return;
            }
            //在数据库中添加一个user
            user.adduser(yonghuming,mima,function(err,doc){
                if(err){
                    //-2就是服务器错误
                    res.json({"result" : -2})
                    return;
                }
                //注册成功！！
                req.session.login = 1;
                req.session.yonghuming = yonghuming;
                res.json({"result" : 1})
            });
        });
    });
}
//首页
exports.showIndex=function (req,res,next) {
    res.render("index");
}
//显示客人查询页
exports.showQuery=function (req,res) {
    res.render("query");
}
//Ajax接口，得到所有客人
exports.getAllStudent = function(req,res){
    //读取page参数
    var page = url.parse(req.url,true).query.page - 1 || 0;
    var pagesize = 10;
    //寻找条目总数
    Student.count({},function(err,count){
        //分页的逻辑就是跳过（skip）多少条，读取（limit）多少条
        //比如每页两条
        //第1页： limit(2)  skip(0)
        //第2页： limit(2)  skip(2)
        //第3页： limit(2)  skip(4)
        //第4页： limit(2)  skip(6)
        //第5页： limit(2)  skip(8)
        //第6页： limit(2)  skip(10)
        Student.find({}).limit(pagesize).skip(pagesize * page).exec(function(err,results){
            res.json({
                "pageAmount" : Math.ceil(count / pagesize),
                "results" : results
            });
        });
    });
}
//执行添加
exports.doAddStudent = function(req,res){
    console.log("服务器收到了一个POST请求");
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //数据库持久
        Student.addStudent(fields,function(result){
            res.json({"result" : result});
        });
    });
}
//呈递更改客户的表单
exports.showUpdate = function(req,res){
    //拿到学号
    var sid = req.params.sid;
    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    Student.find({"sid" : sid},function(err,results){
        if(results.length == 0){
            res.send("查无此人，请检查网址");
            return;
        }
        //返回数据
        res.json({ "info" : results[0]})
    });
}
//更改客户的Ajax接口，是post请求接口
exports.updateStudent = function(req,res){
    var sid = req.params.sid;
    if(!sid){
        return;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //更改学生
        Student.find({"sid" : sid},function(err,results){
            if(results.length == 0){
                res.json({"result" : -1});
                return;
            }
            var thestudent = results[0];
            //更改属性
            thestudent.name = fields.name;
            thestudent.sex = fields.sex;
            thestudent.phone = fields.phone;
            thestudent.address = fields.address;
            thestudent.id = fields.id;
            thestudent.driver = fields.driver;
            //持久化
            thestudent.save(function(err){
                if(err){
                    res.json({"result" : -1});
                }else{
                    res.json({"result" : 1});
                }
            });
        });
    });
}
//删除客户
exports.deleteStudent = function(req,res){
    //拿到学号
    var sid = req.params.sid;
    //寻找这个学号的学生
    Student.find({"sid" : sid},function(err,results){
        if(err || results.length == 0){
            res.json({"result" : -1});
            return;
        }
        //删除
        results[0].remove(function(err){
            if(err){
                res.json({"result" : -1});
                return;
            }
            res.json({"result" : 1});
        });
    });
}
//退出系统
exports.exit=function (req,res,next) {
    console.log(req.session);
    req.session.login="";
    res.json({"result":1})
}


//租凭登记页
exports.showLease=function (req,res,next) {
    res.render("Lease")
}
//显示汽车类
exports.showGetLease=function(req,res,next) {
    dangan.find({}).exec(function (err, results) {
        res.json({"carClass": results})
    })
}
//获取客人信息
exports.getAllkehu=function(req,res,next){
    Student.find({}).exec(function(err,results){
        res.json({
            "results" : results
        });
    });
}
//获取单个类型车的数据
exports.carData=function(req,res,next){
    var name=req.query.class;
    carClass.find({"type":name}).exec(function(err,results){
        res.json({
            "results" : results
        });
    });
}
exports.carsid=function(req,res,next){
    var name=req.query.type;
    var sid=req.query.sid;
    carClass.find({"type":name,"sid":sid}).exec(function(err,results){
        res.json({
            "results" : results[0]
        });
    });
}

//租出
exports.zuchu=function(req,res,next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // 租出起始时间
      fields.start=dateTime(),
          //到期时间
      fields.Operator=req.session.yonghuming
        //添加到数据库
      Rented.addStudent(fields,function (result) {
          carClass.check(fields.sid,function (data) {
              data.b=true;
              data.save();
          })
            res.json({"result":1})
        })

    });
}
//租出
exports.zuchu1=function(req,res,next){
    Rented.find({"d":true}).exec(function(err,results){
        res.json({
            "results" : results
        });
        // console.log(results)
    });
}

//归还页面
exports.showReturn=function (req,res,next) {
    res.render("Return")
}
// 归还页面渲染
exports.guihuan=function(req,res,next){
    Rented.find({"d":false}).exec(function(err,results){
        res.json({
            "results" : results
        });
    });
}
//点击归还
exports.quehuan=function(req,res,next){
    var sid=req.params.sid
    Rented.find({"sid":sid,"d":true}).exec(function(err,results){
        res.json({
            "result" : results[0]
        });
    });
}
// 归还汽车
exports.returnCar=function(req,res,next){
    var sid=req.query.sid;
    var id=req.query.id;
    Rented.find({"id":id}).exec(function(err,results){
        results[0].d=false;
        results[0].save();
        carClass.find({"sid":sid}).exec(function(err,result){
           result[0].b=false;
            result[0].save();
            res.json({"result":1})
        });
    });
}

// 显示统计分析页
exports.showStatistics=function (req,res,next) {
    res.render("Statistics")
}

//显示汽车类别页
exports.showCategory = function (req, res) {
    res.render("category")
}
//获取所有汽车类别
exports.getAllCategory = function(req,res){
    //读取page参数
    var page = url.parse(req.url,true).query.page - 1 || 0;
    var pagesize = 10;
    //寻找条目总数
    dangan.count({},function(err,count){
        //第6页： limit(2)  skip(10)
        dangan.find({}).limit(pagesize).skip(pagesize * page).exec(function(err,results){
            res.json({
                "pageAmount" : Math.ceil(count / pagesize),
                "results" : results
            });
        });
    });
}
//执行添加汽车类别
exports.addCategory = function(req,res){
    console.log("服务器收到了一个POST请求");
    var car=[]
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //数据库持久
        dangan.addCategory(fields,function(result){
            res.json({"result" : result});
        });
    });
}
//显示汽车类别
exports.showUpdate1 = function(req,res){
    //拿到学号
    var sid = req.params.sid;
    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    dangan.find({"sid" : sid},function(err,results){
        if(results.length == 0){
            res.send("查无此人，请检查网址");
            return;
        }
        //返回数据
        res.json({ "info" : results[0]})
    });
}
//更改汽车类别
exports.updatedangan = function(req,res){
    var sid = req.params.sid;
    if(!sid){
        return;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //更改学生
        dangan.find({"sid" : sid},function(err,results){
            console.log(results);
            if(results.length == 0){
                res.json({"result" : -1});
                return;
            }
            var thestudent = results[0];
            //更改属性
            thestudent.name = fields.name;
            //持久化
            thestudent.save(function(err){
                if(err){
                    res.json({"result" : -1});
                }else{
                    res.json({"result" : 1});
                }
            });
        });
    });
}
//删除汽车类别
exports.deletedangan = function(req,res){
    //拿到学号
    var sid = req.params.sid;
    //寻找这个学号的学生
    dangan.find({"sid" : sid},function(err,results){
        if(err || results.length == 0){
            res.json({"result" : -1});
            return;
        }
        //删除
        results[0].remove(function(err){
            if(err){
                res.json({"result" : -1});
                return;
            }
            res.json({"result" : 1});
        });
    });
}


//汽车档案
exports.showCarfiles=function(req,res){
    res.render("carfiles");
}
//Ajax接口，得到所有汽车档案
exports.getAllCarfiles = function(req,res){
    //读取page参数
    var page = url.parse(req.url,true).query.page - 1 || 0;
    var pagesize = 10;
    //寻找条目总数
    carClass.count({},function(err,count){
        //分页的逻辑就是跳过（skip）多少条，读取（limit）多少条
        //比如每页两条
        //第1页： limit(2)  skip(0)
        //第2页： limit(2)  skip(2)
        //第3页： limit(2)  skip(4)
        //第4页： limit(2)  skip(6)
        //第5页： limit(2)  skip(8)
        //第6页： limit(2)  skip(10)
        carClass.find({}).limit(pagesize).skip(pagesize * page).exec(function(err,results){
            res.json({
                "pageAmount" : Math.ceil(count / pagesize),
                "results" : results
            });
        });
    });
}
// //执行添加汽车档案
exports.addCarfiles = function(req,res){
    console.log("服务器收到了一个POST请求");
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //数据库持久
        carClass.addStudent(fields,function(result){
            res.json({"result" : result});
        });
    });
}
//呈递更改汽车档案的表单
exports.showUpdateCarfiles = function(req,res){
    //拿到学号
    var sid = req.params.sid;
    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    carClass.find({"sid" : sid},function(err,results){
        if(results.length == 0){
            res.send("查无此人，请检查网址");
            return;
        }
        //返回数据
        res.json({ "info" : results[0]})
    });
}
//更改汽车档案的Ajax接口，是post请求接口
exports.updateCarfiles = function(req,res){
    var sid = req.params.sid;
    if(!sid){
        return;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //更改学生
        carClass.find({"sid" : sid},function(err,results){
            console.log(results);
            if(results.length == 0){
                res.json({"result" : -1});
                return;
            }
            var thestudent = results[0];
            //更改属性
            thestudent.name = fields.name;
            thestudent.type = fields.type;
            thestudent.price = fields.price;
            thestudent.day = fields.day;
            //持久化
            thestudent.save(function(err){
                if(err){
                    res.json({"result" : -1});
                }else{
                    res.json({"result" : 1});
                }
            });
        });
    });
}
//删除汽车档案
exports.deleteCarfiles = function(req,res){
    //拿到学号
    var sid = req.params.sid;
    //寻找这个学号的学生
    carClass.find({"sid" : sid},function(err,results){
        if(err || results.length == 0){
            res.json({"result" : -1});
            return;
        }
        //删除
        results[0].remove(function(err){
            if(err){
                res.json({"result" : -1});
                return;
            }
            res.json({"result" : 1});
        });
    });
}
