var help=require("../sources/help.js");
var expect=require("chai").expect;
var request=require("superagent")

var config=help.config;

describe('医生端登录流程相关测试',function()
{
	describe('获取UserID，验证手机号是否已注册',function()
	{
		var validPhoneNum=config.validDoc.username;
		var validReq=help.createRequest(config.baseUrl,config.routes.getUserID,{
																					"phoneNo":validPhoneNum
																				});
		it('已注册的手机号 param->'+validPhoneNum, function(done){

			request.get(validReq)
			.end(function(err, res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 0,
					"UserId": "U201705120008",
					"roles": [
						"doctor"
					],
					"mesg": "Get UserId Success!"
				});

				done();
			});
		});

		var invalidPhoneNum=help.createInvalidPhoneNumber();
		var invalidReq=help.createRequest(config.baseUrl,config.routes.getUserID,{
																					"phoneNo":invalidPhoneNum
																				});
		it('无效的手机号 param->'+invalidPhoneNum,function(done){

			request.get(invalidReq)
			.end(function(err,res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 1,
					"mesg": "User doesn't Exist!"
				});

				done();
			})
		})

		var blankReq=help.createRequest(config.baseUrl,config.routes.getUserID);
		it('空手机号 param->',function(done){

			request.get(blankReq)
			.end(function(err,res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 1,
					"mesg": "User doesn't Exist!"
				});

				done();
			})
		})
	});

	describe('重置密码',function(){

		var validPhoneNum=config.validDoc.username;
		var validReq=help.createRequest(config.baseUrl,config.routes.resetPassword,{
																						"phoneNo":validPhoneNum,
																						"password":"123456"
																					});

		it('有效用户修改密码 param->'+validPhoneNum,function(done)
		{
			request.post(validReq)
			.end(function(err,res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 0,
					"mesg": "password reset success!"
				});

				done();
			})
		})

		var invalidPhoneNum=help.createInvalidPhoneNumber();
		var invalidReq=help.createRequest(config.baseUrl,config.routes.resetPassword,{
																					"phoneNo":invalidPhoneNum,
																					"password":"123456"
																				});

		it('无效用户修改密码 param->'+invalidPhoneNum,function(done)
		{
			request.post(invalidReq)
			.end(function(err,res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 1,
					"mesg": "User doesn't Exist!"
				});

				done();
			})
		})

	})

	describe('注册新用户',function(){

		var validPhoneNum=help.createInvalidPhoneNumber();
		var validReq=help.createRequest(config.baseUrl,config.routes.register,{
																					"phoneNo":validPhoneNum,
																					"password":"123456",
																					"role":"doctor"
																				})

		var newUserNo;

		it('尚未注册过的用户进行注册 param->'+validPhoneNum,function(done){

			request.post(validReq)
			.end(function(err,res){

				var data=res.body;

				expect(data.results).to.be.equal(0);
				expect(data.mesg).to.be.equal("User Register Success!");
				expect(data).to.have.property("userNo");
				newUserNo=data.userNo;

				done();
			})
		})

		it('获取新注册用户的协议状态',function(done){

			request.get(help.createRequest(config.baseUrl,config.routes.getUserAgreement,{"userId":newUserNo}))
			.end(function(err,res){

				var data=res.body;
				expect(data).to.not.have.property("agreement");

				done();
			})
		})

		it.skip('修改新注册用户的协议状态',function(done){

			request.post(help.createRequest(config.baseUrl,config.routes.updateUserAgreement),{"userId":newUserNo,"agreement":1})
			.end(function(err,res){

				var data=res.body;
				expect(data.msg).to.be.equal("success!");
				expect(data.results.agreement).to.be.equal("1");

				done();
			})
		})

		it.skip('修改后重新获取新注册用户的协议状态',function(done){

			request.get(help.createRequest(config.baseUrl,config.routes.getUserAgreement,{"userId":newUserNo}))
			.end(function(err,res){

				var data=res.body;
				expect(data.results.agreement).to.be.equal("1");

				done();
			})
		})

		it('填写新注册用户的基本信息',function(done){

			var basicInfo=config.validDoc.basicInfo;
			basicInfo.userId=newUserNo;

			request.post(help.createRequest(config.baseUrl,config.routes.postDocBasic),basicInfo)
			.end(function(err,res){

				var data=res.body;

				expect(data.result).to.be.equal("新建成功");

				done();
			})
		})

		var invalidPhoneNum=config.validDoc.username;
		var invalidReq=help.createRequest(config.baseUrl,config.routes.register,{
																					"phoneNo":invalidPhoneNum,
																					"password":"123456",
																					"role":"doctor"
																				})

		it('已注册的用户再次进行注册 param->'+invalidPhoneNum,function(done){

			request.post(invalidReq)
			.end(function(err,res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 1,
					"userNo": "",
					"mesg": "User Already Exist!"
				});

				done();
			})
		})
	});

	describe('登录',function(){

		var validPhoneNum=config.validDoc.username;
		var validPassword=config.validDoc.password;
		var role="doctor";

		var validReq=help.createRequest(config.baseUrl,config.routes.login);

		it('有效用户登录',function(done){

			request.post(validReq,{"username":validPhoneNum,"password":validPassword,"role":role})	
			.end(function(err,res){

				var data=res.body;

				expect(data.results.status).to.be.equal(0);
				expect(data.results.userId).to.be.equal("U201705120008");
				expect(data.results).to.have.property("token");
				expect(data.results.mesg).to.be.equal("login success!")

				done();
			})
		})
		
		it('登录密码错误',function(done){

			request.post(validReq,{"username":validPhoneNum,"password":"12","role":role})
			.end(function(err,res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 1,
					"mesg": "User password isn't correct!"
				})

				done();
			})	
		})

		it('无效用户登录',function(done){

			request.post(validReq,{"username":help.createInvalidPhoneNumber(),"password":validPassword,"role":role})
			.end(function(err,res){

				var data=res.body;

				expect(data).to.be.deep.equal({
					"results": 1,
					"mesg": "User doesn't Exist!"
				})

				done();
			})	
		})
	})
})