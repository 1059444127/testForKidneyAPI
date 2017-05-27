var help=require("../sources/help.js");
var expect=require("chai").expect;
var request=require("superagent")
var userid='';
var config=help.config;

describe('患者端登录流程相关测试zyh',function()
{
	describe('未注册手机号->',function()
	{
		var invarlidPhoneNum=help.createInvalidPhoneNumber();
	
		// console.log('beforeEach Array');
		var setpasswordReq=help.createRequest(config.baseUrl,config.routes.register,{
																					phoneNo:invarlidPhoneNum,
																					password:'1234567',
																					role:"patient"
																				});
		it('设置密码 param->'+invarlidPhoneNum, function(done){

			request.post(setpasswordReq)
			.end(function(err, res){

				var data=res.body;
				userid=data.userNo;
				// console.log(userid)

				expect(data.results).to.be.equal(0);

				done();
			});
		});
    });
    describe('签协议->',function()
	{
		var agreeReq=help.createRequest(config.baseUrl,config.routes.updateUserAgreement,{
																					userId:userid,
																					agreement:"0"
																				});
		it('签协议 param->'+userid,function(done){
			console.log(userid)

			request.post(agreeReq)
			.end(function(err,res){

				var data=res.body;

				expect(data.results).to.be.equal(null
					
				);

				done();
			})
		});
    });
    describe('新建患者->',function()
	{

		it('新建患者 param->'+userid,function(done){

		var newPatientReq=help.createRequest(config.baseUrl,config.routes.newPatientDetail,{});
		console.log(newPatientReq)
			request.post(newPatientReq,{
										"userId":userid,
										"name":"测试人名",
										"photoUrl":"http://pp.jpg", 
										"birthday":"2017-04-04",
										"gender":"1", 
										"IDNo":"123456123456781234", 
										"height":"188", 
										"occupation":"教师", 
										"bloodType":"2", 
										"nation":"中国", 
										"province":"浙江", 
										"city":"杭州", 
										"class":"class1", 
										"class_info":["classInfo1"], 
									    "operationTime":"2017-04-01", 
									    "hypertension":"1", 
									    "lastVisittime":"2017-04-12", 
									    "lastVisithospital":"浙江省人民医院", 
									    "lastVisitdiagnosis":"慢性肾炎"
									    })
			.end(function(err,res){

				var data=res.body;
				// console.log(data)
				expect(data.result).to.be.equal("新建成功"
					
				);

				done();
			})
		})
	})
})