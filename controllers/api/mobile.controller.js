var express = require("express");
var router = express.Router(); 
var bcrypt = require('bcryptjs');
var path = require('path');  
var helpers = require("../../helpers/helpers");
var uniqid = require('uniqid');
var  mongoose = require('mongoose');   
var fs = require('fs');  
var service = require('../../services/service');
var User = service.User; 
var UserDevice = service.UserDeviceInformation;
var OrderType = service.OrderType;
var Order = service.Order;
var otpGenerator = require('otp-generator')
var FoodCategory = service.FoodCategory
var Resturants = service.Resturants;
var appDir = path.dirname(require.main.filename);
var Food = service.Food;
var cuisinesCategory = service.cuisinesCategory;
var tableReserveStatus = service.tableReserveStatus;
var Tables = service.Tables;
var Version =service.version
var config = require("../../config.json");
module.exports = router;

 
// register user
router.post('/signup', (req, res) => {
	var response={};
	var otp =otpGenerator.generate(6, {  digits:true,alphabets:false,upperCase:false,specialChars : false });
	
	var promise = User.findOne({user_email:req.body.email}).exec();
	var email=req.body.email;
	email=email.toLowerCase();
	var user_name = req.body.full_name;
	promise.then(function(user) {
			
	 	if(user){
	 		response={ status: 201, msg: 'email already exist'}
		       		res.send(response)
	 	} else{
	 		var  newUser = User({
		        user_name: req.body.full_name,
		        user_contact_no: req.body.contact_no,
		        user_email: req.body.email,
		        password: req.body.password,
		        role: 1,
		        otp:otp,
		       	create_on: new Date(),
				is_active: true,
				is_deleted:false,
				is_verify:false,
		       	login_type:req.body.login_type
		       	
    		})
    		// nested schema lat and long save
	    	newUser.address_detail.push({ // to push in first element
	            lat: req.body.lat,
	            lng: req.body.lng,
	            is_primary:1
	        });
    		newUser.save(function(err, usertDetail) {
		        if (err) {
		        	console.log(err);
		       		response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
		        } else {
		        	// save device id
		        	var newUserDevice = UserDevice({
		        		user_id:usertDetail._id,
				        device_id: req.body.device_id,
				        device_token: req.body.device_token,
				        device_type: req.body.device_type,
				       	create_on: new Date(),
				       	is_active: true
		    		})
		    		newUserDevice.save(function(err, usertDeviceDetail) {
				        if (err) {
				        	console.log(err);
				       		response={ status: 500, msg: 'Internale server error' }
				       		res.send(response)
				        } else {
				        	response={ status: 200, msg: 'success',data:usertDetail }
				       		res.send(response)
				        	var message='your otp no :'+otp+''
							var subject="fodo account verification";
							var html_content=`<html><head> <meta charset="utf-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1"> <link href="https://fonts.googleapis.com/css?family=Leckerli+One|Roboto:400,500,700&display=swap" rel="stylesheet"> <style>body{margin: 0; font-family: 'Roboto', sans-serif;}.tableContainer{width: 530px; margin: 30px auto; padding: 20px 0 0; border: 1px solid #e3ecef;}table{border-spacing: 0; border-collapse: collapse;}td, th{padding: 0;}*, *::before, *::after{box-sizing: border-box;}img{max-width: 100%;}.bd_personName h4{margin: 0 0; text-align: center; font-size: 74px; color: #fe5284;/* font-family: 'Leckerli One', cursive;*/ font-family: 'Lobster', cursive;}.tempContent p{margin: 0; text-align: center; font-size: 21px;}.tempContent{padding: 20px 40px 20px;}td.cake_image{text-align: center;}.cake_image img{max-width: 100%; margin: 0 auto;}.template_List > td{padding: 40px 100px 0;}.template_List td td h4{margin: 0 0 10px; font-size: 20px;}.template_List td td p{margin: 0;}.template_List td.spacer{padding: 20px 0;}.header_tr .header img{max-width: 90px;}.header_tr .header{text-align: center; padding: 0 0 20px; border-bottom: 1px solid #e3ecef; margin-bottom: 20px;}.header_tr > td{padding: 0 20px;}.template_List td td img{max-width: 48px;}.bannerTopContent h2{margin: 0 0 10px;}.bannerTopContent p{margin: 0;}.bannerTopContent td{padding: 0 20px 20px; text-align: center;}.bannerBottomContent p{margin: 0; text-align: center;}td.bannerBottomContent{padding: 25px 35px 35px;}.text-center{text-align: center;}.btn{display: inline-block; padding: 11px 41px; text-decoration: none; background: #ff3667; color: #fff !important;}body{color: #484848; font-size: 15px;}p{font-size: 15px;}h1, h2, h3, h4, h5, h6{color: #333; font-weight: 500;}.template_List td.ListIcon{width: 75px;}.footer_tr td{padding: 0 20px;}.footer_tr .footer{text-align: center; padding-top: 15px; border-top: 1px solid #e3ecef;}.footer_tr .footer ul.footerSocial li{display: inline-block; padding: 0 10px;}.footer_tr .footer ul.footerSocial li a{display: block;}.footer_tr .footer ul.footerSocial{padding: 20px 0 20px; margin: 0;}.footer_tr .footer ul.footerSocial li img{max-width: 22px; opacity: 0.4;}.footer_tr .footer p{margin: 0; color: #adadad; font-size: 13px;}.OPT_Message td{padding: 0 20px; text-align: center;}.OPT_Message td h4{margin: 0 0 15px; color: #ff3667; font-size: 30px; font-weight: 800;}.OPT_Message h2{margin: 0 0; font-size: 34px; color: #2b2b2b; font-weight: 600;}.OPT_Message h2 span{color: #ff3667; font-weight: 400;}.OPT_Message h5{font-size: 17px; margin: 0 0 7px;}@media(max-width:529px){.tableContainer{width: 100%;}.template_List > td{padding: 0 30px;}}</style></head><body> <div class="emailTemplate"> <table style="width: 100%;"> <tbody> <tr> <td> <div class="tableContainer"> <table> <tbody> <tr> <td> <table> <tbody> <tr class="header_tr"> <td> <div class="header"> <img src="${config.siteUrl}email_img/logo.png"> </div></td></tr><tr class="OPT_Message"> <td> <h2><span>Hi &nbsp;</span>${user_name}</h2> <p>Welcome to Fodo your one-stop destination for all your food delivery needs.</p><h5>Your verification code is</h5> <h4>${otp}</h4> </td></tr><!-- <tr class="bannerTopContent"> <td> <h2>Hurray! you joined your team and ours</h2> <p>Start working in Fodo and join in yout team's success.</p></td></tr>--> <tr class="bannerImage"> <td> <img src="${config.siteUrl}email_img/order-screen.jpg"> </td></tr><!-- <tr> <td class="bannerBottomContent"> <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the</p></td></tr>--> <tr class="template_List"> <td> <table> <tr> <td class="ListIcon"><img src="${config.siteUrl}email_img/drivethrough-orders.png"></td><td> <h4>Drivethrough Orders</h4> <p>Place your order from the parking lot and get it delivered straight to your car</p></td></tr><tr> <td class="spacer" colspan="2"></td></tr><tr> <td class="ListIcon"><img src="${config.siteUrl}email_img/scan-orders.png"></td><td> <h4>Scan Orders</h4> <p>Scan the QR on the table at any Fodo enabled restaurant and order your food right from the comfort of your table.</p></td></tr><tr> <td class="spacer" colspan="2"></td></tr><tr> <td class="ListIcon"><img src="${config.siteUrl}email_img/pickup-order.png"></td><td> <h4>Pickup Order</h4> <p>Place a pickup order and pick up it from your restaurant at the exact time without the hassle of waiting in queues.</p></td></tr></table> </td></tr><tr> <td class="text-center" style="padding: 40px 0;"> <a class="btn" href="#">Get Started</a> </td></tr><tr class="footer_tr"> <td> <div class="footer"> <p>It is a long established fact that a reader</p><ul class="footerSocial"> <li><a href="#"><img src="${config.siteUrl}email_img/facebook.png"></a></li><li><a href="#"><img src="${config.siteUrl}email_img/twitter.png"></a></li></ul> </div></td></tr></tbody> </table> </td></tr></tbody> </table> </div></td></tr></tbody> </table> </div></body></html>`
							helpers.sendMail(email,html_content,"",subject,function(flag,msg,send_res){
					  			console.log(flag)
					  		}); 
				        	
				       	}
				     })
		        }
		    })
	 	}
	  
	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
})

router.post('/login',async (req, res) => {	
	
	var password = req.body.password;
	var device_id = req.body.device_id;
	var device_token = req.body.device_token;
	var device_type = req.body.device_type;
	var success_data ={};
	var email = req.body.email;
	email=email.toLowerCase();
		
	await User.findOne({ user_email: email,role:1},async function (err, user) {
			if (err) {
				console.log(err);
			var	response={ status: 500, msg: 'Internale server error' }
			return	res.send(response)
			} 
			
			if (!user) { 
				response={ status: 201, msg: 'Email not registered.',data:[],is_verify:0 }
				return	res.send(response)
			}
			// email id verify or not check
			await User.findOne({ user_email: req.body.email,is_verify:true,role:1},async function (err, verify_user) {
					if (err) {
						console.log(err);
					var	response={ status: 500, msg: 'Internale server error' }
					return	res.send(response)
					} 
					if(!verify_user){
						response={ status: 202, msg: 'your account is not verified.',data:[],is_verify:0 }
						return	res.send(response)
					}  
				
				
					// after we found data with email, we crypt password and check with user pw
					var passwordIsValid = bcrypt.compareSync(password, user.password);		    

					if (!passwordIsValid){
						response={ status: 201, msg: 'Incorrect Password.',data:[],is_verify:0 }
						return	res.send(response)	
					} else{
						var user_id =  user._id
						var promiseUser = UserDevice.find({
									user_id:user_id,
									is_login:true,
									device_token: { $ne: device_token }}).exec( (err_device, device_info)=> {
								if(err_device) {
										console.log(err_device)
										var	response={ status: 500, msg: 'Internale server error device id',data:[] }
										return	res.send(response)
								}
								if(device_info.length>0){
										User.findOne({ _id: user_id}, function (err, user_data) {
															if (err) {
																console.log(err);
																var	response={ status: 500, msg: 'Internale server error' }
																return	res.send(response)
															} 
													success_data={id:user_id,full_name:user_data.user_name,password:user_data.password,email:user_data.user_email,contact_no:user_data.user_contact_no,login_type:user_data.login_type,image:user_data.user_image_url,address:user_data.address_detail,role:user_data.role,is_already:1} 
													// io.sockets.in(user_id).emit('logout_from_other_device',success_data);
													// helpers.pushNotification(device_token,device_type,"Logout account","Your account is login in another device.",2,'');		
												response={ status: 200, msg: 'login success',data:success_data,is_verify:1}
													return	res.send(response)	
											})	

								} else{
										// new insert device id

									var  newUserDevice = UserDevice({
										user_id: user_id,
										device_type: parseInt(device_type),
										device_token: device_token,
										device_id: device_id,
										is_login: true,
										create_on: new Date(),
										is_active: true
									})
								
									newUserDevice.save(function(err, newDeviceDetail) {
										if (err) {
											console.log(err);
											response={ status: 500, msg: 'Internale server error' }
											res.send(response)
										} else {
											
											User.findOne({ _id: user_id}, function (err, user_data) {
															if (err) {
																console.log(err);
																var	response={ status: 500, msg: 'Internale server error' }
																return	res.send(response)
															} 
													success_data={id:user_id,full_name:user_data.user_name,password:user_data.password,email:user_data.user_email,contact_no:user_data.user_contact_no,login_type:user_data.login_type,image:user_data.user_image_url,address:user_data.address_detail,role:user_data.role,is_already:0} 
													// io.sockets.in(user_id).emit('logout_from_other_device',success_data);
													// helpers.pushNotification(device_token,device_type,"Logout account","Your account is login in another device.",2,'');		
												response={ status: 200, msg: 'login success',data:success_data,is_verify:1}
													return	res.send(response)	
											})													
										}
									})	
										
								
								}

						})
					}			
			})	
	});
	
})
// update user device token when use is login
router.post('/updateDeviceToken',(req,res)=>{
	var device_token = req.body.device_token;
	var user_id = req.body.user_id;
	var device_id = req.body.device_id;
	var device_type = req.body.device_type
	UserDevice.updateMany({user_id:user_id},{ $set: {update_on:new Date(),is_login : false } },function(err_update,update_all_login_device) {
		if(err_update) {
			console.log(err_update)
			var	response={ status: 500, msg: 'Internale server error device id',data:[] }
			return	res.send(response)
		}
			// new insert device id

		var  newUserDevice = UserDevice({
			user_id: user_id,
			device_type: parseInt(device_type),
			device_token: device_token,
			device_id: device_id,
			is_login: true,
			create_on: new Date(),
			is_active: true
		})
	
		newUserDevice.save(function(err, newDeviceDetail) {
			if (err) {
				console.log(err);
				response={ status: 500, msg: 'Internale server error' }
				res.send(response)
			} else {
				
				User.findOne({ _id: user_id}, function (err, user_data) {
								if (err) {
									console.log(err);
									var	response={ status: 500, msg: 'Internale server error' }
									return	res.send(response)
								} 
						success_data={id:user_id,full_name:user_data.user_name,password:user_data.password,email:user_data.user_email,contact_no:user_data.user_contact_no,login_type:user_data.login_type,image:user_data.user_image_url,address:user_data.address_detail,role:user_data.role,is_already:0} 
						// io.sockets.in(user_id).emit('logout_from_other_device',success_data);
						// helpers.pushNotification(device_token,device_type,"Logout account","Your account is login in another device.",2,'');		
					response={ status: 200, msg: 'login success',data:success_data,is_verify:1}
						return	res.send(response)	
				})													
			}
		})	
												
	})

})



/*social link by login*/
router.post('/social_login', (req, res) => {	
	var password = req.body.password;
	var device_id = req.body.device_id;
	var device_token = req.body.device_token;
	var device_type = req.body.device_type;
	var social_id = req.body.social_id;
	var user_name= req.body.full_name;
    var user_contact_no= req.body.contact_no;
    var user_email= req.body.email;
	var lat=req.body.lat;
	var lng=req.body.lng;
	var user_image_url = req.body.profile_image_url;
	var success_data ={};
	
	User.findOne({ user_email: req.body.email,social_id:social_id,role:1}, function (err, user_social_data) {
	    if (err) {
	    	console.log(err);
	       var	response={ status: 500, msg: 'Internale server error' }
	       return	res.send(response)
	    } 
		
	    if(user_social_data){
	    	var user_id =  user_social_data._id;
	    	
								var promiseUser = UserDevice.find({
											user_id:user_id,
											is_login:true,
											device_token: { $ne: device_token }}).exec( (err_device, device_info)=> {
										if(err_device) {
												console.log(err_device)
												var	response={ status: 500, msg: 'Internale server error device id',data:[] }
												return	res.send(response)
										}
										if(device_info.length>0){
												User.findOne({ _id: user_id}, function (err, user_data) {
																	if (err) {
																		console.log(err);
																		var	response={ status: 500, msg: 'Internale server error' }
																		return	res.send(response)
																	} 
															success_data={id:user_id,full_name:user_data.user_name,password:user_data.password,email:user_data.user_email,contact_no:user_data.user_contact_no,login_type:user_data.login_type,image:user_data.user_image_url,address:user_data.address_detail,role:user_data.role,is_already:1} 
															// io.sockets.in(user_id).emit('logout_from_other_device',success_data);
															// helpers.pushNotification(device_token,device_type,"Logout account","Your account is login in another device.",2,'');		
														response={ status: 200, msg: 'login success',data:success_data,is_verify:1}
															return	res.send(response)	
													})	

										} else{
												// new insert device id

											var  newUserDevice = UserDevice({
												user_id: user_id,
												device_type: parseInt(device_type),
												device_token: device_token,
												device_id: device_id,
												is_login: true,
												create_on: new Date(),
												is_active: true
											})
										
											newUserDevice.save(function(err, newDeviceDetail) {
												if (err) {
													console.log(err);
													response={ status: 500, msg: 'Internale server error' }
													res.send(response)
												} else {
													
													User.findOne({ _id: user_id}, function (err, user_data) {
																	if (err) {
																		console.log(err);
																		var	response={ status: 500, msg: 'Internale server error' }
																		return	res.send(response)
																	} 
															success_data={id:user_id,full_name:user_data.user_name,password:user_data.password,email:user_data.user_email,contact_no:user_data.user_contact_no,login_type:user_data.login_type,image:user_data.user_image_url,address:user_data.address_detail,role:user_data.role,is_already:0} 
															// io.sockets.in(user_id).emit('logout_from_other_device',success_data);
															// helpers.pushNotification(device_token,device_type,"Logout account","Your account is login in another device.",2,'');		
														response={ status: 200, msg: 'login success',data:success_data,is_verify:1}
															return	res.send(response)	
													})													
												}
											})	
												
										
										}

								})
	    } else{

	    	// check login available or not
			var  newUser = User({
				user_name: req.body.full_name,
				user_contact_no: req.body.contact_no,
				user_email: req.body.email,
				social_id: req.body.social_id,
				user_email: req.body.email,
				user_image_url:user_image_url,
				password: '00',
				role: 1,
				create_on: new Date(),
				is_active: true,
				is_verify:true,
				login_type:req.body.login_type
			})
			// nested schema lat and long save
			newUser.address_detail.push({ // to push in first element
				lat: req.body.lat,
				lng: req.body.lng,
				is_primary:1
			});
			newUser.save(function(err, usertDetail) {
				if (err) {
					console.log(err);
					response={ status: 500, msg: 'Internale server error' }
					res.send(response)
				} else {
					// save device id
					var newUserDevice = UserDevice({
						user_id:usertDetail._id,
						device_id: req.body.device_id,
						device_token: req.body.device_token,
						device_type: req.body.device_type,
						create_on: new Date(),
						is_active: true
					})
					newUserDevice.save(function(err, usertDeviceDetail) {
						if (err) {
							console.log(err);
							response={ status: 500, msg: 'Internale server error' }
							res.send(response)
						} else {

						success_data={id:usertDetail._id,full_name:usertDetail.user_name,password:usertDetail.password,email:usertDetail.user_email,contact_no:usertDetail.user_contact_no,login_type:usertDetail.login_type,image:usertDetail.user_image_url,address:usertDetail.address_detail,role:usertDetail.role,is_already:0}
							
							response={ status: 200, msg: 'success',data:success_data }
							res.send(response)
						}
					})
				}
			})
		}
	});
})
	
/*account verify by otp 1-7-2019*/
router.post('/verify_otp', (req, res) => {
	var response={};
	var email=req.body.email;
	var device_id = req.body.device_id;
	var device_token = req.body.device_token;
	var device_type = req.body.device_type;
	var lat=req.body.lat;
	var lng=req.body.lng;
	var otp=req.body.otp;
	var success_data ={};
	var promise = User.findOne({user_email:req.body.email,is_verify:false,otp:otp}).exec();
	
	promise.then(function(user) {
		if(!user){
			response={ status: 201, msg: 'Incorrect Email or otp.',data:[] }
		       	return	res.send(response)
		}	
		User.updateOne({user_email:email},{ $set: {otp:otp,update_on : new Date(),is_verify : true } },function(err_update,update_date_time) {
            if(err_update) {
            	console.log(err_update)
                var	response={ status: 500, msg: 'Internale server error device id',data:[] }
       			return	res.send(response)
            }
            else 
            {
            	
            	var user_id = user._id
            	     
				if(user){
					// success data send
					
					var image=user.user_image_url;
					success_data={id:user.id,full_name:user.user_name,password:user.password,email:user.user_email,contact_no:user.user_contact_no,login_type:user.login_type,image:image,address:user.address_detail}
					UserDevice.updateOne({user_id:user._id},{ $set: {update_on:new Date(),last_login_time : new Date(),is_login : true } },function(err_update,update_date_time) {
			            if(err_update) {
			            	console.log(err_update)
			                var	response={ status: 500, msg: 'Internale server error device id',data:[] }
			       			return	res.send(response)
			            }
			            else 
			            {
			            	var address_length=user.address_detail;
			            	var address_id;
			            	for(var i=0;i<address_length.length;i++){
			            		if(address_length[i].is_primary==1){
			            			address_id=address_length[i]._id;
			            			break;
			            		} 
			            	}
			            	
			            	User.updateMany({ "address_detail._id": address_id }, {'$set': {'address_detail.$.lat': lat,'address_detail.$.lng': lng}}, function(err_lat_update,update_res) {
									if(err_lat_update){
										console.log(err_lat_update)
									}
									
				                response={ status: 200, msg: 'verify otp success',data:success_data}
			       				return	res.send(response)
			       			})	
			            }
			        });

				}
            }	
		});

	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
})	

/*resend otp send and update in database 1-7-2019*/
router.post('/resent_otp', (req, res) => {
	var response={};
	var email=req.body.email;
	var device_id = req.body.device_id;
	var device_token = req.body.device_token;
	var device_type = req.body.device_type;
	var lat=req.body.lat;
	var lng=req.body.lng;
	var success_data ={};
	var otp = otpGenerator.generate(6, {  digits:true,alphabets:false,upperCase:false,specialChars : false });
	var promise = User.findOne({user_email:req.body.email,is_verify:false}).exec();
	
	promise.then(function(user) {
		if(!user){
			response={ status: 201, msg: 'Incorrect Email.',data:[] }
		       	return	res.send(response)
		}	
		User.updateOne({user_email:email},{ $set: {otp:otp,update_on : new Date(),is_verify : false } },function(err_update,update_date_time) {
            if(err_update) {
            	console.log(err_update)
                var	response={ status: 500, msg: 'Internale server error device id',data:[] }
       			return	res.send(response)
            }
            else 
            {	
            	var user_id = user._id
				if(user){
					// success data send
					
					var image=user.user_image_url;
					success_data={id:user.id,full_name:user.user_name,password:user.password,email:user.user_email,contact_no:user.user_contact_no,login_type:user.login_type,image:image,address:user.address_detail,otp:otp}
					UserDevice.updateOne({user_id:user._id},{ $set: {update_on:new Date(),last_login_time : new Date(),is_login : true } },function(err_update,update_date_time) {
			            if(err_update) {
			            	console.log(err_update)
			                var	response={ status: 500, msg: 'Internale server error device id',data:[] }
			       			return	res.send(response)
			            }
			            else 
			            {
			            	var address_length=user.address_detail;
			            	var address_id;
			            	for(var i=0;i<address_length.length;i++){
			            		if(address_length[i].is_primary==1){
			            			address_id=address_length[i]._id;
			            			break;
			            		} 
			            	}
			            	
			            	User.updateMany({ "address_detail._id": address_id }, {'$set': {'address_detail.$.lat': lat,'address_detail.$.lng': lng}}, function(err_lat_update,update_res) {
									if(err_lat_update){
										console.log(err_lat_update)
									}
									
				                response={ status: 200, msg: 'login success',data:success_data}
			       				return	res.send(response)
			       			})	
			            }
			        });

				} 
            	var message='your otp no :'+otp+''
				var subject="fodo account verification";
				
				helpers.sendMail(email,message,"",subject,function(flag,msg,send_res){
		  			
		  		}); 
            }	
		});

	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
})

/*resend otp send and update in database 1-7-2019*/
router.post('/forgot_password', (req, res) => {
	var response={};
	var email=req.body.email;
	
	var promise = User.findOne({user_email:req.body.email,is_verify:true,role:1,is_active:true,is_deleted:false}).exec();
	email=email.toLowerCase();
	promise.then(function(user) {
		if(!user){
			response={ status: 201, msg: 'Incorrect Email.',data:[] }
		       	return	res.send(response)
		}	

		var password=  helpers.randomString(8, "verify_code");
		
		var hashedPassword = bcrypt.hashSync(password, 8);	
		var new_password = hashedPassword;
		
		User.updateOne({user_email:email},{ $set: {password:new_password,update_on : new Date()} },function(err_update,update_date_time) {
            if(err_update) {
            	console.log(err_update)
                var	response={ status: 500, msg: 'Internale server error device id',data:[] }
       			return	res.send(response)
            }
            	
            	
				response={ status: 200, msg: 'Password sent to your email id'}
       				return	res.send(response)		
				
		});
		var message=' new password :'+password+''
				var subject="fodo account forgot password";
				
				helpers.sendMail(req.body.email,message,"",subject,function(flag,msg,send_res){
		  			
		  		});

	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
})

/*get order type 1-7-2019*/
router.get('/get_order_type', (req, res) => {
	var response={};
	var promise = OrderType.find().exec();
	
	promise.then(function(order_type) {
		
		if(!order_type){
			response={ status: 201, msg: 'not found',data:[] }
		       	return	res.send(response)
		}	
		
		   response={ status: 200, msg: 'Order Type Successfully.',data:order_type}
	       	
			return	res.send(response)
	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
		
})

/*change password  1-7-2019*/
router.post('/change_password', (req, res) => {
	var response={};
	var user_id=req.body.user_id;
	var old_password=req.body.old_password;
	var password = req.body.new_password;
	var success_data ={};
	
	var promise = User.findOne({_id:user_id,is_verify:true,is_active:true}).exec();
	
	promise.then(function(user) {
		if(!user){
			response={ status: 201, msg: 'Incorrect user.',data:[] }
		       	return	res.send(response)
		}
		
		
		var passwordIsValid = bcrypt.compareSync(old_password, user.password);
		if(passwordIsValid){
				var hashedPassword = bcrypt.hashSync(password, 8);	
				
				var new_password = hashedPassword;
				User.updateOne({_id:user_id},{password:new_password,update_on : new Date() },function(err_update,update_date_time) {
	            if(err_update) {
	            	console.log(err_update)
					
	                var	response={ status: 500, msg: 'Internale server error device id',data:[] }
	       			return	res.send(response)
	            }
	            else 
	            {	
		
						// success data send
					var image=user.user_image_url;
					success_data={id:user.id,full_name:user.user_name,password:user.password,email:user.user_email,contact_no:user.user_contact_no,login_type:user.login_type,image:image,address:user.address_detail,password:new_password}
						
	                response={ status: 200, msg: 'password updated',data:success_data}
       				return	res.send(response)
				       			
	            }	
			});

		} else{
			response={ status: 201, msg: 'Old password does not match.',data:[] }
		       	return	res.send(response)
		}
			
		

	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
})

/*get user profile  detail by id 2-7-2019*/
router.post('/get_user_profile', (req, res) => {
	var response={};
	var user_id=req.body.user_id;
	
	var promise = User.findOne({_id:user_id,is_verify:true,is_active:true}).exec();
	
	promise.then(function(user) {
		if(!user){
			response={ status: 201, msg: 'Data not found',data:[] }
		       	return	res.send(response)
		}	
		user.user_image_url =user.user_image_url;
        response={ status: 200, msg: 'Profile Fetch Successfully',data:user}
			return	res.send(response)
				  
	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
})

/*get user vehicale detail by id 2-7-2019*/
router.post('/get_user_vehicle_detail', (req, res) => {
	var response={};
	var user_id=req.body.user_id;
	
	var promise = User.findOne({_id:user_id}).exec();
	
	promise.then(function(user) {
		if(!user){
			response={ status: 200, msg: 'vehicle detail  Fetch Successfully',  "data": {
				"user_vehicle_detail": []
			}}
			return	res.send(response)
		} else{
			response={ status: 200, msg: 'vehicle detail  Fetch Successfully',data:user}
			return	res.send(response)
		}	  
	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		res.send(response)
	});
})

/*update user vehicle detail by id 2-7-2019*/
router.post('/update_vehicle_detail', (req, res) => {
    var response={};
    var user_id=req.body.user_id;
    var vehicle_id= req.body.vehicle_id;
    var vehicle_no=req.body.vehicle_no;
    var is_primary=1; 
    var is_pri=0;
    // first all the is_primary 0 update
    var update_data1 = {'user_vehicle_detail.$.is_primary':parseInt(is_pri)} ;
            
    var promise_update = User.updateOne({_id:mongoose.Types.ObjectId(user_id),"user_vehicle_detail.is_primary":1},{$set:update_data1}).exec();
    promise_update.then(function(update_re_primary){
        
        var update_data = {'user_vehicle_detail.$.is_primary':parseInt(is_primary)} ;
            
        var promise = User.updateOne({'user_vehicle_detail._id':mongoose.Types.ObjectId(vehicle_id)},{$set:update_data}).exec();
        
        promise.then(function(update_re){
            
            
            var promise = User.findOne({_id:mongoose.Types.ObjectId(user_id)}).exec();
    
                promise.then(function(user) {
                    if(!user){
                        response={ status: 201, msg: 'Data not found',data:[] }
                            return  res.send(response)
                    }
                    
                    response={ status: 200, msg: 'vehicle detail  update and Fetch Successfully',data:user}
                        return  res.send(response)
                            
                })
                .catch(function(err){
                console.log('error:', err);
                response={ status: 500, msg: 'Internale server error' }
                    res.send(response)
                });
            
        }).catch(function(err){
                console.log('error:', err);
                response={ status: 500, msg: 'Internale server error' }
                res.send(response)
        });
    }).catch(function(err_pri){
        console.log('error:', err_pri);
        response={ status: 500, msg: 'Internale server error' }
        res.send(response)
    });     
})

/*update user profile  detail by id 2-7-2019*/
router.post('/update_profile', (req, res) => {
	var response={};
	var user_id=req.body.user_id;
	//console.log(req.body)
	
	
	var callback_image=function(flag,file_name){
		
		var promise = User.findOne({_id: user_id}).exec();
		
		promise.then(function(user) {
				if(!user){
					response={ status: 201, msg: 'Data not found',data:[] }
						return	res.send(response)
				}
			
			
			var update_data = {
		        user_name: req.body.user_name,
		        user_contact_no: req.body.user_contact_no,
		       	update_on: new Date(),
		       	is_active: true,
		       	
    		}
			
			
			if(file_name != ""){
				
				update_data.user_image_url = file_name ;
				var filePath = appDir+"/uploads/"+user.user_image_url; 
					
				//if (fs.existsSync(filePath)) {
	                 //  fs.unlinkSync(filePath);
	           // }
				     
		    }
			
			var  updateUser = User(update_data)
    		
    		User.updateOne({_id:user_id},update_data,function(err, usertDetail) {
			 	if(err) {
	            	console.log(err)
	                var	response={ status: 500, msg: 'Internale server error device id',data:[] }
	       				res.send(response)
						return
			 	}
				
				var user_update_data = User.findOne({_id: user_id}).exec();
				user_update_data.then(function(user_updated) {
					response={ status: 200, msg: 'user detail update Successfully',data:user_updated}
					res.send(response)
					return
					
				}).catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
			       		res.send(response)
		});
			 	
			
			 }) 
			  
		})
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
			       		res.send(response)
		});
	 }		
	if(Files){
	
	    /*update new photo*/
		var Files=req.files.user_image_url; 
	    var file_name = Files.name;
		var filenewname = helpers.getUtcTimestamp();
		var file_ext = ""; 
		 
		if (file_name != null && file_name != undefined) {
				  var temp = file_name.lastIndexOf('.');
				  file_ext = (temp < 0) ? '' : file_name.substr(temp);
		}

		filenewname ='profile_image/' + filenewname + file_ext;
		 
		helpers.uploadNewfile(Files,"/uploads/",filenewname,callback_image); 
	} else{ 
		 callback_image(false,"");
	}		
})

/*3-7-2019 get resturant category 3-7-2019*/
router.get('/get_food_category', (req, res) => {
	var response={};
	var promise = FoodCategory.find().exec();
	
	promise.then(function(food_category) {
		
		if(!food_category){
			response={ status: 201, msg: 'not found',data:[] }
		       	return	res.send(response)
		}	
		
		   response={ status: 200, msg: 'food category fetch Successfully.',data:food_category}
	       	
			return	res.send(response)
	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
		
})

/*4-7-2019 get resturant detail near by you*/
router.post('/get_restaurants_landing', (req, res) => {
	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
		            "coordinates": [ lng, lat ]
		        }, 
		        "maxDistance": 40000,
		        "spherical": true,
		        "distanceField": "distance"
			}}
			
		]).skip(perPage * page).limit(perPage).exec();

		promise.then(function(resturants) {

			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}
			
			//trending brands Resturants show 
			Resturants.aggregate([
						{ "$geoNear": {
							"near": {
								"type": "Point",
								"coordinates": [ lng, lat ]
							}, 
							"maxDistance": 40000,
							"spherical": true,
							"distanceField": "distance"
						}}
						,
			    		{
			    			$lookup: {from: "order_details",localField: "_id",foreignField: "restaurant_id",as: "brand_rest_detail"},
			    		},
			    		{
						      $unwind: '$brand_rest_detail'
					    },
					    { 
					    	$group : {
					            _id : "$_id",
					            count:{$sum:1},
					            detail: { "$first": "$$ROOT"},
					           
					    	}
						},
			    		{
							  $unwind: '$detail'
							  
						},
					    {
					        $project: {
					           _id: 1,
					           count: 1,
					           detail:1,
					           
					        }
						}
						
					    	
			    	]).exec((err_res, brand_res_info)=> {
			    		
							if (err_res) {
								console.log(err_res)
						       var	response={ status: 500, msg: 'Internale server error',data:[] }
						       	res.send(response)
						    }
						    response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:resturants,brands_res:brand_res_info}}
				       	
								return	res.send(response)	;   
											
					})
				   
		})
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		       	res.send(response)
		});
		
})

/*5-7-2019 get resturant detail near by you pagination*/
router.post('/get_near_restaurants_pagination', (req, res) => {
	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
		            "coordinates": [ lng, lat ]
		        }, 
		        "maxDistance": 40000,
		        "spherical": true,
		        "distanceField": "distance"
		    }},{
				$match:{is_deleted:false,is_active:true}
			}
		]).skip(perPage * page).limit(perPage).exec();

		promise.then(function(resturants) {

			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}
			
						    response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:resturants}}
				       	
								return	res.send(response)	;
				   
		})
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		       	res.send(response)
		});
		
})

/*8-7-2019 get restaurants by id */
// router.post('/get_restaurants_details_by_id',(req,res)=>{
// 	var user_id = req.body.user_id;
// 	var device_token = req.body.device_token;
// 	var device_type = req.body.device_type;
// 	var lat = req.body.lat;
// 	var lng = req.body.lng;
// 	var resturants_id = req.body.restaurant_id;
	
// 	var promise = Resturants.findOne({_id:req.body.restaurant_id,is_active:true,is_deleted:false}).exec();
// 	promise.then(function(restaurant_result) {
// 		if(!restaurant_result){
// 			response={ status: 201, msg: 'not found',data:[] }
// 		       	return	res.send(response)
// 		}	
// 			// get food category with food and resturant detail
// 			FoodCategory.aggregate([
// 			    		{	
// 			    			$lookup:{
// 			    				from: "foods",
// 			    				localField:"_id",
// 			    				foreignField:"food_category_id",
// 			    				as:'item_detail'
// 			    			}
// 			    		},{"$match":{"item_detail.resturants_id":mongoose.Types.ObjectId(resturants_id),"item_detail.is_deleted":false,"item_detail.is_active":true}},

// 			]).exec((err_food, food_detail)=> {
// 	    		if(err_food){
// 	    			console.log(err_food)
// 				       var	response={ status: 500, msg: 'Internale server error',data:[] }
// 				       	res.send(response)
// 				}

// 				var food_cats = [] ;
// 				var foods_arr=[] ;
				
			
// 	    			 response={ status: 200, msg: 'restaurant detail fetch Successfully.',data:{restaurant_result:restaurant_result,food_detail:food_detail}}
   	
// 					return	res.send(response)
				
// 			})
// 	})
// 	.catch(function(err){
// 	  console.log('error:', err);
// 	  response={ status: 500, msg: 'Internale server error' }
// 		       		res.send(response)
// 	});
// })
router.post('/get_restaurants_details_by_id',(req,res)=>{
	var resturants_id = req.body.restaurant_id;
	
	var promise = Resturants.findOne({_id:req.body.restaurant_id,is_active:true,is_deleted:false}).exec();
	promise.then(function(restaurant_result) {
		if(!restaurant_result){
			response={ status: 201, msg: 'not found',data:[] }
		       	return	res.send(response)
		}
		var promise = FoodCategory.find().lean().exec();
	
		promise.then(async function(food_category) {
			
			if(!food_category){
				response={ status: 201, msg: 'not found',data:[] }
					   return	res.send(response)
			}	
			var count=0;
			var category_result = food_category
			var finalcategory = [];
			for(var i=0;i<category_result.length;i++){
				
					count++
					var food_category_id= category_result[i]._id;
				
					var food_details = await getFoodDetail(food_category_id,resturants_id);
					if(food_details.length>0){
						category_result[i].item_detail=food_details
						finalcategory.push(category_result[i])
					} 
					
			}
			
			if(count>=category_result.length){
				response={ status: 200, msg: 'restaurant detail fetch Successfully.',data:{restaurant_result:restaurant_result,food_detail:finalcategory}}
   	
				return	res.send(response)
			}
			
		})
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
						   res.send(response)
		});	
		
	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
		       		res.send(response)
	});
	async function getFoodDetail(food_category_id,resturants_id){
		
		return await Food.find({resturants_id:mongoose.Types.ObjectId(resturants_id),food_category_id:mongoose.Types.ObjectId(food_category_id),is_deleted:false,is_active:true}, (err_food,food_data)=>{  
			if(err_food){
				console.log('error:', err_food);
				return null;
			}  
			return food_data;
			
		})
	}
})

/*8-7-2019 get resturants recommended foods by id */
router.post('/get_restaurants_recommended_food__by_id',(req,res)=>{
        
    var resturants_id = req.body.restaurant_id;
        var page_no = parseFloat(req.body.page_no)
        var perPage = 5, page = Math.max(0, page_no)
        Order.aggregate([
                        {"$match":{"restaurant_id":mongoose.Types.ObjectId(resturants_id)}},
                        
                        {
                          $unwind: '$order_product'
                        },
                        { 
                            $group : {
                                _id : "$order_product.food_id",
                                count:{$sum:1}
                            }
                        }
                            
                    ]).sort({count:-1}).skip(perPage * page).limit(perPage).exec((err_res,res_info)=> {
                        
                        var food_data=[];
                            var count=0;
                            if (err_res) {
                                console.log(err_res)
                               var  response={ status: 500, msg: 'Internale server error',data:[] }
                                res.send(response)
                            }
                            
                            if(!res_info){
                                response={ status: 200, msg: 'not found',data:[] }
                                        return  res.send(response)
                            }
                            
                              if(res_info){
                                 
                                    res_info.forEach(function(u) {
                                        
                                        Food.findOne({ _id: u._id,resturants_id:mongoose.Types.ObjectId(resturants_id),is_active:true,is_deleted:false}, function (err, food_detail) {
                                        
                                            if (err) {
                                                console.log(err);
                                               var  response={ status: 500, msg: 'Internale server error' }
                                               return   res.send(response)
                                            } 
                                            count++;
                                           
                                            if(food_detail)
                                            {
                                                food_data.push(food_detail)
                                            }
                                            if(count>=res_info.length){

                                             response={ status: 200, msg: 'Resturants recommended food detail fetch Successfully.',data:food_data}
                                                return  res.send(response); 
                                            }
                                        }) 
                                          
                                     });
                        }else{
                            response={ status: 200, msg: 'Resturants recommended food detail fetch Successfully.',data:[]}
                                                return  res.send(response); 
                        }           
                         
                            
                    })
    
})

router.post('/get_restaurants_recommended_food_pagination_by_id',(req,res)=>{
        
    var resturants_id = req.body.restaurant_id;
        var page_no = parseFloat(req.body.page_no)
        var perPage = 5, page = Math.max(0, page_no)
        Order.aggregate([
                        {"$match":{"restaurant_id":mongoose.Types.ObjectId(resturants_id)}},
                        
                        {
                          $unwind: '$order_product'
                        },
                        { 
                            $group : {
                                _id : "$order_product.food_id",
                                count:{$sum:1}
                            }
                        }
                            
                    ]).sort({count:-1}).skip(perPage * page).limit(perPage).exec((err_res,res_info)=> {
                            var food_data=[];
                            var count=0;
                            if (err_res) {
                                console.log(err_res)
                               var  response={ status: 500, msg: 'Internale server error',data:[] }
                                res.send(response)
                            }
                            if(res_info.length>0){
                                    res_info.forEach(function(u) {
                                        Food.findOne({ _id: u._id,is_active:true,is_deleted:false}, function (err, food_detail) {
                                            if (err) {
                                                console.log(err);
                                               var  response={ status: 500, msg: 'Internale server error' }
                                               return   res.send(response)
                                            } 
                                            count++;
                                           
                                            
                                            if(food_detail)
                                            {
                                                food_data.push(food_detail)
                                            }

                                            if(count>=res_info.length){

                                             response={ status: 200, msg: 'Resturants recommended food detail fetch Successfully.',data:food_data}
                                                return  res.send(response); 
                                            }
                                        }) 
                                          
                                     });
                        }else{
                            response={ status: 200, msg: 'Resturants recommended food detail fetch Successfully.',data:[]}
                                                return  res.send(response); 
                        }           
                            
                    })
    
})

router.post('/get_filter_category', (req, res) => {	
	
		var	response={};
		cuisinesCategory.find({is_active:true,is_deleted:false},function (err, cuisines_detail) {
		if (err) {
			console.log(err);
		   var	response={ status: 500, msg: 'Internale server error' }
		   return	res.send(response)
		} 
		
		response={ status: 200, msg: 'cuisines detail fetch success',data:cuisines_detail}
			return	res.send(response)
	  
	})		       			
		   
})

router.post('/save_order', (req, res) => {	
	
	var	response={};
	var restaurent_id = req.body.restaurent_id;
	var user_id = req.body.user_id;
	var table_id = req.body.table_id;
	var order_type = parseInt(req.body.order_type);
	var order_amount = parseFloat(req.body.order_amount);
	var order_total_amount = parseFloat(req.body.order_total_amount);
	var discount_price = parseFloat(req.body.discount_price);
	var item_quantity = parseInt(req.body.item_quantity);
	var tax = parseFloat(req.body.tax);
	var order_products = JSON.parse(req.body.order_items) ;
    var ref_number = '' ;
	if(order_type == 3){
		ref_number=  helpers.randomString(6, "refrence_code");
	}
	if(order_type == 1){
        table_id=  mongoose.Types.ObjectId(table_id);
    }
	
	 var  newOrder = Order({
		        restaurant_id: restaurent_id,
				user_id: user_id,
				table_id:table_id,
		        order_date: new Date(),
		        discount_price:discount_price,
		        order_amount: order_amount,
		        order_total_amount: order_total_amount,
				order_status: 0,
				tax:tax,
				refrence_number:ref_number,
		        order_type:order_type,
				order_total_quantity:item_quantity,
		       	create_on: new Date(),
				update_on: new Date(),
		       	is_active: true,
		        is_deleted : false
    		})
    		
			 for(var i=0;i<order_products.length;i++){
				 
				   var extra_item_arr = []
				   var extraa_items_get =  order_products[i].item_extras ;
				   for(var j=0;j< extraa_items_get.length;j++){
					   
					   extra_item_arr.push({extra_id:extraa_items_get[j].extra_id,
					    extra_price:extraa_items_get[j].extra_price
					   });
				   }
				   var food_price =0
				  var food_size=parseInt(order_products[i].food_size)
				  if(food_size==0){
					food_price=  parseFloat(order_products[i].food_half_price)
				  } else{
					food_price=  parseFloat(order_products[i].food_full_price)
				  }
				   
		         newOrder.order_product.push({ 
					 food_id: order_products[i].food_id,
					 food_qty: parseInt(order_products[i].food_qty),
					 food_size:parseInt(order_products[i].food_size),
					 food_price:food_price,
					 
					 customized_id:order_products[i].customized_id,
					 customize_price:parseFloat(order_products[i].customized_price),
					 item_extras: extra_item_arr
	            });
	         }
	
			
    		newOrder.save(function(err, orderDetail) {
				
			  if(err) {
				console.log(err);
				var	response={ status: 500, msg: 'Internale server error' }
				return	res.send(response)
		      } 
		     
			   
			  response ={status : 200 ,msg:"order saved successfully",data:orderDetail};
		  
		      res.send(response);
		  
		      /* emit socket for restuarent recived order */
			  
			  var promise = Resturants.findOne({_id:restaurent_id}).exec();

				promise.then(function(rest_details){
					 
					  if(!rest_details){
						  
						  var emit_data = {status:500}
						  req.io.sockets.in(to_user_id).emit('order_placed',emit_data);
						  return ;
					  }
					  	if(table_id !=''){
							//update table status
							
							Tables.updateOne({_id:table_id},{ $set: {update_on:new Date(),is_status:1} },function(err_update,table_update_status) {
							
								if(err_update){
									console.log('loke',err_update);
									var emit_data = {status:500}
									req.io.sockets.in(to_user_id).emit('order_placed',emit_data);
									return ;
								}
							})
						}
						
						var to_user_id = rest_details.user_id;
						var order_id = orderDetail._id;
						
						var data_socket = {status:200,form_user_id:user_id,to_user_id:to_user_id,order_id:order_id}
						
						req.io.sockets.in(to_user_id).emit('order_recived',data_socket);
						
						mailReciveOrder(to_user_id);
					
				});
			  
			  
			  
			});
		
})

function mailReciveOrder(to_user_id){

}

router.post('/add_in_order', (req, res) => {    
    
    var response={};
    var restaurent_id = req.body.restaurent_id;
    var order_id = req.body.order_id;
    var user_id = req.body.user_id;
   
    var order_amount = parseFloat(req.body.order_amount);
    var order_total_amount = parseFloat(req.body.order_total_amount);
    var discount_price = parseFloat(req.body.discount_price);
    var item_quantity = parseInt(req.body.item_quantity);
    var order_products = JSON.parse(req.body.order_items) ;
    var order_type =  parseInt(req.body.order_type);
    var tax = parseFloat(req.body.tax);
    var customized_id = req.body.customized_id;
    var customize_price = req.body.customize_price;
	
    var food_arr= [];
        var  newOrder = {
                discount_price:discount_price,
                order_amount: order_amount,
                order_total_amount: order_total_amount,
               
                order_type:order_type,
                order_total_quantity:item_quantity,
                tax:tax,
                restaurant_id: restaurent_id,
                user_id: user_id,
              
                order_id:order_id,
                update_on: new Date()
            }
            
            Order.find({_id:order_id},(err_order,result_order)=>{
                if(err_order) {
                    console.log(err_order);
                    var response={ status: 500, msg: 'Internale server error' }
                    return  res.send(response)
                } 

                if(result_order)
                {
                    for(let i=0;i<result_order[0].order_product.length;i++ )
                    {
                        food_arr.push(result_order[0].order_product[i])
                    }
                    var fetch_order_amount = parseFloat(result_order[0].order_amount)
                    var fetch_tax = parseFloat(result_order[0].tax)
                    var fetch_order_total_amount = parseFloat(result_order[0].order_total_amount)
                    newOrder.order_amount = fetch_order_amount + order_amount
                    newOrder.tax =  (newOrder.order_amount * tax)/100
                    newOrder.order_total_amount = fetch_order_total_amount + order_total_amount

                }
                
             for(let i=0;i<order_products.length;i++){
                   var extra_item_arr = []
                   var extraa_items_get =  order_products[i].item_extras ;
                  
                   if(extraa_items_get.length>0)
                   {
                    for(var j=0;j< extraa_items_get.length;j++){
                       
                        extra_item_arr.push({extra_id:extraa_items_get[j].extra_id,
                         extra_price:extraa_items_get[j].extra_price
                        });
                    }
                   }
                   
				   var food_price =0
				   var food_size=parseInt(order_products[i].food_size)
				   if(food_size==0){
					 food_price=  parseFloat(order_products[i].food_half_price)
				   } else{
					 food_price=  parseFloat(order_products[i].food_full_price)
				   }
                food_arr.push({ 
                     food_id: order_products[i].food_id,
                     food_qty: parseInt(order_products[i].food_qty),
                     food_price:food_price,
                     food_size:parseInt(order_products[i].food_size),
                     customized_id:order_products[i].customized_id,
                     customize_price:parseFloat(order_products[i].customized_price),
                     item_extras: extra_item_arr
                });
                newOrder.order_product = food_arr;
             }
             
             Order.findOneAndUpdate({_id:order_id},{ $set:newOrder},{new:true},function(err, orderDetail) {
                
              if(err) {
                console.log(err);
                var response={ status: 500, msg: 'Internale server error' }
                return  res.send(response)
              } 
              
               
              response ={status : 200 ,msg:"order saved successfully",data:orderDetail};
              res.send(response);
          
              /* emit socket for restuarent recived order */
              
              var promise = Resturants.findOne({_id:restaurent_id}).exec();

                promise.then(function(rest_details){
                     
                      if(!rest_details){
                        
                          var emit_data = {status:500}
                          req.io.sockets.in(to_user_id).emit('order_updated',emit_data);
                          return ;
                      }
                      
                      var to_user_id = rest_details.user_id;
                      var order_id = orderDetail._id;
                      
                      var data_socket = {status:200,form_user_id:user_id,to_user_id:to_user_id,order_id:order_id}
                      
                      req.io.sockets.in(to_user_id).emit('order_updated',data_socket);
                     
                      mailUpdateOrder(to_user_id);
                    
                 });
              
            });
        })
})

router.post('/update_order', (req, res) => {    
    
    var response={};
    var restaurent_id = req.body.restaurent_id;
    var order_id = req.body.order_id;
    var restaurent_id = req.body.restaurent_id;
    var user_id = req.body.user_id;
   
    var order_type = parseInt(req.body.order_type);
    var order_amount = parseFloat(req.body.order_amount);
    var order_total_amount = parseFloat(req.body.order_total_amount);
    var discount_price = parseFloat(req.body.discount_price);
    var item_quantity = parseInt(req.body.item_quantity);
    var food_arr=[];
    var order_products = JSON.parse(req.body.order_items) ;
    var tax = parseFloat(req.body.tax);
	
		// tax calculation 
		var tax_amout = (order_amount*tax)/100
        var  newOrder = {
                restaurant_id: restaurent_id,
                user_id: user_id,
               
                order_id:order_id,
                discount_price:discount_price,
                order_amount: order_amount,
                order_total_amount: order_total_amount,
                order_status: 0,
                order_type:order_type,
                tax:tax_amout,
                order_total_quantity:item_quantity,
                update_on: new Date()
            }
            
             for(var i=0;i<order_products.length;i++){
                 
                   var extra_item_arr = []
                   var extraa_items_get =  order_products[i].item_extras ;
                   for(var j=0;j< extraa_items_get.length;j++){
                       
                       extra_item_arr.push({extra_id:extraa_items_get[j].extra_id,
                        extra_price:extraa_items_get[j].extra_price
                       });
                   }
				   
				   var food_price =0
				   var food_size=parseInt(order_products[i].food_size)
				   if(food_size==0){
					 food_price=  parseFloat(order_products[i].food_half_price)
				   } else{
					 food_price=  parseFloat(order_products[i].food_full_price)
				   }
                food_arr.push({ 
                     food_id: order_products[i].food_id,
                     food_qty: parseInt(order_products[i].food_qty),
                     food_price:food_price,
                     food_size:parseInt(order_products[i].food_size),
                     customized_id:order_products[i].customized_id,
                     customize_price:parseFloat(order_products[i].customized_price),
                     item_extras: extra_item_arr
                });
                    newOrder.order_product  = food_arr
             }
    
            
             Order.findOneAndUpdate({_id:order_id},{ $set:newOrder},{new:true},function(err, orderDetail) {
                
              if(err) {
                console.log(err);
                var response={ status: 500, msg: 'Internale server error' }
                return  res.send(response)
              } 
              
               
              response ={status : 200 ,msg:"order updated successfully",data:orderDetail};
          
              res.send(response);
          
              /* emit socket for restuarent recived order */
              
              var promise = Resturants.findOne({_id:restaurent_id}).exec();

                promise.then(function(rest_details){
                     
                      if(!rest_details){
                          
                          var emit_data = {status:500}
                          req.io.sockets.in(to_user_id).emit('order_updated',emit_data);
                          return ;
                      }
                      
                      
                      var to_user_id = rest_details.user_id;
                      var order_id = orderDetail._id;
                      
                      var data_socket = {status:200,form_user_id:user_id,to_user_id:to_user_id,order_id:order_id}
                      
                      req.io.sockets.in(to_user_id).emit('order_updated',data_socket);
                     
                      mailUpdateOrder(to_user_id);
                    
                 });
              
            });
})

function mailUpdateOrder(to_user_id){
}

router.post('save_order_pickup_time',(req,res)=>{
 var order_id = req.body.order_id ;
 var pickup_time = req.body.pickup_time // Date();

 Order.findOneAndUpdate({_id:order_id},{$set:{pickup_time:pickup_time}},function(err,order_details){

   if(err){
     console.log(err);
	 var	response={ status: 500, msg: 'Internale server error' }
	return	res.send(response)
   }
 
   var restaurant_id = order_details.restaurant_id
   var user_id = order_details.restaurant_id
   Promise = Resturants.findOne({_id:restaurant_id}).select('user_id').exec();
  
   Promise.then(function(rest_details){
    if(!rest_details){
		var	response={ status: 500, msg: 'Internale server error' }
		return	res.send(response)
	}  
	 var res_owner_id = rest_details.user_id ;

	 var data_socket = {status:200,form_user_id:user_id,order_id:order_id,pickup_time:pickup_time}
	 req.io.sockets.in(res_owner_id).emit('pickup_for_order',data_socket);

	 mailPickupOrder(res_owner_id,order_id);

   });

 });

});

function mailPickupOrder(to_user_id,order_id){

}
///////////////////////////// Testing ///////////////////////////////

router.post('/save_food_test', (req, res) => {	
	
		var	response={};
	
  	
		
		var  newUser = Food({
		        resturants_id: '5d1da7386d488d219232fa13',
		        food_category_id: '5d22e85f1fd020251cf4b334',
		        food_name: 'test food',
		        food_description: 'test dec',
		        food_photo: [],
		        food_size_half: 1,
		        food_size_full: 1,
		        food_half_price:25.30,
				food_full_price:50.60,
				food_type:1,
		       	create_on: new Date(),
				update_on: new Date(),
		       	is_active: true,
		        is_deleted : false
		       	
    		})
    		// nested schema lat and long save
	    	newUser.extras_food.push({ // to push in first element
	            extras_food_name: 'coke',
	            extras_description: '',
	            extra_price:2,
				is_deleted:false,
				is_active:true
	        });
			newUser.customize_food.push({ // to push in first element
	            customize_food_name: 'test custome',
	            customize_price: 30.00,
	            is_deleted:false,
				is_active:true
	        });
    		newUser.save(function(err, usertDetail) {
				
				if (err) {
				console.log(err);
				var	response={ status: 500, msg: 'Internale server error' }
				return	res.send(response)
		      } 
		
		   
			  res.send("success");
			});
		
			       			
		   
})

router.post('/save_order_test', (req, res) => {	
	
		var	response={};
	
		var  newUser = Order({
		        restaurant_id: '5d1da7386d488d219232fa13',
		        user_id: '5d1db8257cdaae04207271a5',
		        order_date: new Date(),
		        discount_price:0,
		        order_amount: 250,
		        order_total_amount: 260,
		        order_status: 0,
		        order_type:1,
				order_total_quantity:1,
				food_type:1,
		       	create_on: new Date(),
				update_on: new Date(),
		       	is_active: true,
		        is_deleted : false
		       	
    		})
    		// nested schema lat and long save
			
			var extra_items_arr = [{extra_id:'5d31a482aec04b2b2c0d7677',extra_price:4}]
			
	    	newUser.order_product.push({ // to push in first element
	            food_id: '5d31a482aec04b2b2c0d7676',
	            food_qty: 1,
	            food_price:25.63,
				food_size:0,
				customized_id:'5d31a482aec04b2b2c0d7678',
				customize_price:0,
				item_extras: extra_items_arr
	        });
			
    		newUser.save(function(err, usertDetail) {
				
				if (err) {
				console.log(err);
				var	response={ status: 500, msg: 'Internale server error' }
				return	res.send(response)
		      } 
		
			  res.send("success");
			});
})

router.post('/add_vehicle_details', (req, res) => {
    var response={};
    var vehicle_name = req.body.vehicle_name;
    var Files=req.files; 
    var vehicle_modal_no =  req.body.vehicle_modal_no;
    var vehicle_no = req.body.vehicle_no;
    var user_id =req.body.user_id;

    callback_image =function(flag,file_name){
        //update is_primary=0
        User.updateMany({_id:user_id,"user_vehicle_detail.is_primary":1},{$set:{'user_vehicle_detail.$.is_primary':0}},function (err, update_detail) {
            
            if(err) {                  
               console.log('1'+err)
               var  response={ status: 500, msg: 'Internale server error ',data:[] }
               return  res.send(response)
                   
             }
             
            //new save
            var vehicle_detail = { vehicle_no:vehicle_no,vehicle_name:vehicle_name,vehicle_image:file_name,vehicle_modal_no:vehicle_modal_no,is_primary:1 };

            User.update({ _id: user_id },{ $push: { user_vehicle_detail: vehicle_detail  } },function (err, vehicle_detail) {
                        if (err) {
                                console.log('1'+err)
                                var response={ status: 500, msg: 'Internale server error ',data:[] }
                                return  res.send(response)
                                
                            
                        } 
                        response={ status: 200, msg: 'user vehicle save success',data:vehicle_detail.user_vehicle_detail}
                    return  res.send(response)
            })
        
        })  
    }   
    if(Files){
        
        /*update new photo*/
        var Files=req.files.vehicle_image; 
        var file_name = Files.name;
        var filenewname = helpers.getUtcTimestamp();
        var file_ext = ""; 
         
        if (file_name != null && file_name != undefined) {
            var temp = file_name.lastIndexOf('.');
            file_ext = (temp < 0) ? '' : file_name.substr(temp);
        }

        filenewname ='vehicle_image/' + filenewname + file_ext;
         
        helpers.uploadNewfile(Files,"/uploads/",filenewname,callback_image); 
    }
    else
    {   
      
         callback_image(false,"");
    }           
})

router.post('/delete_vehicle_details', (req, res) => {
    var response={};
    var vehicle_id = req.body.vehicle_id;
    
    User.update({"user_vehicle_detail._id":vehicle_id},{$pull: {"user_vehicle_detail": {_id:vehicle_id} }},{multi:true} ,function(err,response){
        if(err) {                  
            console.log('1'+err)
            var response={ status: 500, msg: 'Internale server error ',data:[] }
            return  res.send(response)
        }
        response={ status: 200, msg: 'vehicle detail delete success'}
        return  res.send(response)
    })
})

router.post('/update_vehicle_array_detail', (req, res) => {
    
    var response={}; 
    var vehicle_name=req.body.vehicle_name;
    var vehicle_modal_no = req.body.vehicle_modal_no;
    var is_primary = 1//parseInt(req.body.is_primary); 
    var user_id=req.body.user_id;
    var vehicle_no=req.body.vehicle_no;
    var vehicle_id= req.body.vehicle_id;
    
    var Files=req.files; 
    //var vehicle_type = req.body.vehicle_type;
    //var old_image_url = req.body.old_image_url;
    var update_data;
    var callback_image=function(flag,file_name){
        	if(file_name){
        	 update_data = {'user_vehicle_detail.$.vehicle_image':file_name,'user_vehicle_detail.$.vehicle_no':vehicle_no,'user_vehicle_detail.$.vehicle_name':vehicle_name,'user_vehicle_detail.$.vehicle_modal_no':vehicle_modal_no,'user_vehicle_detail.$.is_primary':is_primary} ;
        	} else{
        		 update_data = {'user_vehicle_detail.$.vehicle_no':vehicle_no,'user_vehicle_detail.$.vehicle_name':vehicle_name,'user_vehicle_detail.$.vehicle_modal_no':vehicle_modal_no,'user_vehicle_detail.$.is_primary':is_primary} ;
        	}
	    	
	        
	   		var promise = User.updateOne({'user_vehicle_detail._id':vehicle_id},{$set:update_data}).exec();
	        
	        promise.then(function(update_re){
	            if(!update_re){
	                response={ status: 201, msg: 'Data not update',data:[] }
	                    return  res.send(response)
	            }

	               var Promise1 = User.find().select('user_vehicle_detail').exec();
	                Promise1.then(function(rest_details){
	                  if(!rest_details){
	                    var response={ status: 500, msg: 'Internale server error' }
	                    return  res.send(response)
	                  }  
	                
	                  response={status: 200, data:rest_details}
	                  res.send(response)
	                     
	                }).catch(function(err){
	                    console.log('error:', err);
	                    response={ status: 500, msg: 'Internale server error' }
	                    res.send(response)
	                 });

	        }).catch(function(err){
	                console.log('error:', err);
	                response={ status: 500, msg: 'Internale server error' }
	                res.send(response)
	        });
    }     
    if(Files){
        
        /*update new photo*/
        var Files=req.files.vehicle_image; 

        var file_name = Files.name;
        var filenewname = helpers.getUtcTimestamp();
        var file_ext = ""; 
        if (file_name != null && file_name != undefined) {
            var temp = file_name.lastIndexOf('.');
            file_ext = (temp < 0) ? '' : file_name.substr(temp);
        }

        filenewname ='vehicle_image/' + filenewname + file_ext;
         
        helpers.uploadNewfile(Files,"/uploads/",filenewname,callback_image); 
    }
    else
    {   
      
         callback_image(false,"");
    }      
})

router.post('/create_qr',(req,res)=>{
	
var qr = require('qr-image');  

var data = '{"id":"123456","table_number":"12"}' ;

var code = qr.image(data, { type: 'png' });  
var output = fs.createWriteStream('qr1.png')

code.pipe(output);
res.send("success");
})

//22-08-2019 filter of Restaurants_filter 
router.post('/get_restaurants_filter', (req, res) => {
	
    // var cuisine_serve_res = 5d2cc3e523358227dcf93ef1,5d2cc405ae685e336c1e1e0b,5d2cc51278c7ff0a444ec0a3,5d2cc52078c7ff0a444ec0a4,5d2cc53e78c7ff0a444ec0a5
     var cuisine_serve_res = req.body.cuisine_serve_res ? req.body.cuisine_serve_res.split(',') : ''
     var max_cost = req.body.max_cost ? req.body.max_cost : 5000
     var min_cost = req.body.min_cost ? req.body.min_cost : 0
     var close_time = req.body.close_time ? req.body.close_time : 0 ; 
     var is_accept_card = parseInt(req.body.is_accept_card) ? parseInt(req.body.is_accept_card) : 0;
     var res_food_type = parseInt(req.body.res_food_type) ? parseInt(req.body.res_food_type) : 1;
     var sort_by = parseInt(req.body.sort_by) ?  parseInt(req.body.sort_by) : 0
     var is_scan_type = parseInt(req.body.is_scan_type) ? parseInt(req.body.is_scan_type):5
     var sort_arrange
     var response={};
 
     var page_no = parseFloat(req.body.page_no)
     var perPage = 20, page = Math.max(0, page_no)
 
     var lng = parseFloat(req.body.lng);
     var lat = parseFloat(req.body.lat);

    //  var filters = {} 
     var filter_restaurants=[]
 
     //Max_cost and Min_cost filter
     var filters = {averageCost: { $gte: parseInt(min_cost), $lte: parseInt(max_cost) },is_deleted:false,is_active:true}
 
     //Sort_by filter
     if(sort_by == 0)  //1 means checked and 0 means unchecked
     {
         sort_arrange = { averageCost : 1} //Assending order
     }
     else
     {
         if(sort_by == 1)
         {
             sort_arrange = { averageCost : 1 }   //Assending order
         }
         if(sort_by == 2)
         {
             sort_arrange = { averageCost : -1 }   //Disending order
         }
         if(sort_by == 3)
         {
             sort_arrange = { order_count : -1 }   // popularity 
         }
     }
     //Accept_card filter
     if(is_accept_card == 1)   //1 means checked and 0 means unchecked
     {
         filters.is_accept_card =  true 
     }
 
      //Food_type filter
	 if(res_food_type == 1)   //1 means veg and 2 means Nonveg 
     {
         filters.$or =  [{ res_food_type: 1 }, { res_food_type: 0 }]  
     }else{
         filters.$or =  [{ res_food_type: 2 }, { res_food_type: 0 }]
     }
     
     //select (0) for is_scan_status  select (2) for is_drivethrough_status    select (1) for is_pickup_status   select (3) for is_reserve_status
    if(is_scan_type == 0 ) 
    {
        filters.is_scan_status =  true  
    }
 
    if(is_scan_type == 2 )
    {
        filters.is_drivethrough_status =  true  
    }
 
    if(is_scan_type == 1 )
    {
        filters.is_pickup_status =  true  
    }
 
    if(is_scan_type == 3 )
    {
        filters.is_reserve_status =  true  
    }

     var promise = Resturants.aggregate([
        { "$geoNear": {
            "near": {
                "type": "Point",
                "coordinates": [ lng, lat ],
            }, 
            "maxDistance": 40000,
            "spherical": true,
            "distanceField": "distance"
        }},
        { $match: filters }]).sort(sort_arrange).skip(perPage * page).limit(perPage).exec();
     
     promise.then(function(resturants) {
         
          for(let i=0;i<resturants.length;i++){
                 var is_in = false
                 if(cuisine_serve_res.length > 0)
                 { 
                     for(let j=0;j<resturants[i].cuisine_serve_res.length;j++)
                     {
                         for(let k=0;k<cuisine_serve_res.length;k++)
                         {
                               if(resturants[i].cuisine_serve_res[j].cuisine_id==cuisine_serve_res[k])
                             {
                                is_in = true
                             } 
                         }  
                     }
                 }
                 else
                 {
                   is_in=true
                 }
                
                 //time condition
                 if(close_time == 1)   //1 means checked and 0 means unchecked
                 {
                     var hour = new Date();
                     var today_time = hour.getHours() +":"+ hour.getMinutes()
                     var open_time = helpers.gettimeFunction(resturants[i].open_time)
                     var close_time1= helpers.gettimeFunction(resturants[i].close_time)

                     if(today_time<=close_time1){
                        is_in = true
                     }else{
                        is_in = false
                     }
                 }
                 if(is_in == true)
                 { 
                     filter_restaurants.push(resturants[i])
                 }
             }

             response={ status: 200, msg: 'Restaurant fetch Successfully.',data:{filter_restaurants}}
             return res.send(response)  ;  
        
     }).catch(function(err){
       console.log('error:', err);
       response={ status: 500, msg: 'Internal server error' }
       res.send(response)
     });
})

router.post('/get_restaurants_filter_by_pagination', (req, res) => {
	// var cuisine_serve_res = 5d2cc3e523358227dcf93ef1,5d2cc405ae685e336c1e1e0b,5d2cc51278c7ff0a444ec0a3,5d2cc52078c7ff0a444ec0a4,5d2cc53e78c7ff0a444ec0a5
	var cuisine_serve_res = req.body.cuisine_serve_res ? req.body.cuisine_serve_res.split(',') : ''
	var max_cost = req.body.max_cost ? req.body.max_cost : 5000
	var min_cost = req.body.min_cost ? req.body.min_cost : 0
	var close_time = req.body.close_time ? req.body.close_time : 0 ; 
	var is_accept_card = parseInt(req.body.is_accept_card) ? parseInt(req.body.is_accept_card) : 0;
	var res_food_type = parseInt(req.body.res_food_type) ? parseInt(req.body.res_food_type) : 1;
	var sort_by = parseInt(req.body.sort_by) ?  parseInt(req.body.sort_by) : 0
	var is_scan_type = parseInt(req.body.is_scan_type) ? parseInt(req.body.is_scan_type):0
	var sort_arrange
	var response={};
 
	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
 
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
 
   //  var filters = {} 
	var filter_restaurants=[]
 
	//Max_cost and Min_cost filter
	var filters = {averageCost: { $gte: parseInt(min_cost), $lte: parseInt(max_cost) },is_deleted:false,is_active:true}
 
	//Sort_by filter
	if(sort_by == 0)  //1 means checked and 0 means unchecked
	{
		sort_arrange = { averageCost : 1} //Assending order
	}
	else
	{
		if(sort_by == 1)
		{
			sort_arrange = { averageCost : 1 }   //Assending order
		}
		if(sort_by == 2)
		{
			sort_arrange = { averageCost : -1 }   //Disending order
		}
		if(sort_by == 3)
		{
			sort_arrange = { order_count : -1 }   // popularity 
		}
	}
	//Accept_card filter
	if(is_accept_card == 1)   //1 means checked and 0 means unchecked
	{
		filters.is_accept_card =  true 
	}
 
	//Food_type filter
	if(res_food_type == 1)   //1 means veg and 2 means Nonveg 
    {
         filters.$or =  [{ res_food_type: 1 }, { res_food_type: 0 }]  
    }else{
         filters.$or =  [{ res_food_type: 2 }, { res_food_type: 0 }]
    }
	
	//select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
   if(is_scan_type == 1 ) 
   {
	   filters.is_scan_status =  true  
   }
 
   if(is_scan_type == 2 )
   {
	   filters.is_drivethrough_status =  true  
   }
 
   if(is_scan_type == 3 )
   {
	   filters.is_pickup_status =  true  
   }
 
   if(is_scan_type == 4 )
   {
	   filters.is_reserve_status =  true  
   }
 
	var promise = Resturants.aggregate([
	   { "$geoNear": {
		   "near": {
			   "type": "Point",
			   "coordinates": [ lng, lat ],
		   }, 
		   "maxDistance": 40000,
		   "spherical": true,
		   "distanceField": "distance"
	   }},
	   { $match: filters }]).sort(sort_arrange).skip(perPage * page).limit(perPage).exec();
	
	promise.then(function(resturants) {
		
		 for(let i=0;i<resturants.length;i++){
				var is_in = false
				if(cuisine_serve_res.length > 0)
				{ 
					for(let j=0;j<resturants[i].cuisine_serve_res.length;j++)
					{
						for(let k=0;k<cuisine_serve_res.length;k++)
						{
							  if(resturants[i].cuisine_serve_res[j].cuisine_id==cuisine_serve_res[k])
							{
							   is_in = true
							} 
						}  
					}
				}
				else
				{
				  is_in=true
				}
			   
				//time condition
				if(close_time == 1)   //1 means checked and 0 means unchecked
				{
					var hour = new Date();
					var today_time = hour.getHours() +":"+ hour.getMinutes()
					var open_time = helpers.gettimeFunction(resturants[i].open_time)
					var close_time1= helpers.gettimeFunction(resturants[i].close_time)
 
					if(today_time<=close_time1){
					   is_in = true
					}else{
					   is_in = false
					}
				}
				if(is_in == true)
				{ 
					filter_restaurants.push(resturants[i])
				}
			}
 
			response={ status: 200, msg: 'Restaurant fetch Successfully.',data:{filter_restaurants}}
			return res.send(response)  ;  
	   
	}).catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internal server error' }
	  res.send(response)
	});
})
//22-08-2019 filter of Restaurants_filter by nearby and all restaurants 
router.post('/get_restaurants_data_bysearch', (req, res) => {
	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var is_scan_type = parseInt(req.body.is_scan_type);
	
	//select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
	if(is_scan_type == 1 ) 
	{
		var query={is_deleted:false,is_active:true, is_scan_status : true }
		var query2= {is_deleted:false,is_active:true,is_scan_status : true};
	}

	if(is_scan_type == 2 )
	{
		var query={is_deleted:false,is_active:true, is_drivethrough_status : true }
		var query2 =  {is_deleted:false,is_active:true,is_drivethrough_status : true }
	}

	if(is_scan_type == 3 )
	{
		var query={is_deleted:false,is_active:true, is_pickup_status : true }
		var query2 = {is_deleted:false,is_active:true,is_pickup_status : true}
	}

	if(is_scan_type == 4 )
	{
		var query={ is_deleted:false,is_active:true,is_reserve_status : true }
		var query2 = {is_deleted:false,is_active:true,is_reserve_status : true }
	}

	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
					"coordinates": [ lng, lat ],
		        }, 
		        "maxDistance": 40000,
		        "spherical": true,
		        "distanceField": "distance"
			}},
			{
			    $match: query
			}
						 
		]).skip(perPage * page).limit(perPage).exec();

		promise.then(function(resturants) {
			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}

			//trending brands Resturants show 
			Resturants.aggregate([

				{ "$geoNear": {
					"near": {
						"type": "Point",
						"coordinates": [ lng, lat ],
					}, 
					"maxDistance": 40000,
					"spherical": true,
					"distanceField": "distance"
				}},
				
				
				{
					$lookup: {from: "order_details",localField: "_id",foreignField: "restaurant_id",as: "brand_rest_detail"},
				}
				,
			{
			    $match: query
			},
				{
					  $unwind: '$brand_rest_detail'
				},
				{ 
					$group : {
						_id : "$_id",
						count:{$sum:1},
						detail: { "$first": "$$ROOT"},
					   
					}
				},
				{
					  $unwind: '$detail'
				},
			
				{
					$project: {
					   _id: 1,
					   count: 1,
					   detail:1,
					   
					}
				}
				
					
			]).exec((err_res, brand_rest_detail)=> {
				
					if (err_res) {
						console.log(err_res)
					   var	response={ status: 500, msg: 'Internale server error',data:[] }
						   res.send(response)
					}
					response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:resturants,All_rest_data:brand_rest_detail}}

				return	res.send(response)	;   
									
			})
			
		 })
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		
		       	res.send(response)
		 });
		
}) 

router.post('/get_restaurants_data_bysearch_nearbypagination', (req, res) => {
    var cuisine_serve_res = req.body.cuisine_serve_res ? req.body.cuisine_serve_res.split(',') : ''
    var max_cost = req.body.max_cost ? req.body.max_cost : 5000
    var min_cost = req.body.min_cost ? req.body.min_cost : 0
    var close_time = req.body.close_time ? req.body.close_time : 0 ; 
    var is_accept_card = parseInt(req.body.is_accept_card) ? parseInt(req.body.is_accept_card) : 0;
    var res_food_type = parseInt(req.body.res_food_type) ? parseInt(req.body.res_food_type) : 1;
    var sort_by = parseInt(req.body.sort_by) ?  parseInt(req.body.sort_by) : 0
    var lng = parseFloat(req.body.lng);
    var lat = parseFloat(req.body.lat);
    var is_scan_type = parseInt(req.body.is_scan_type);
    
    var sort_arrange
    var filters = {} 
    var restaurants_nearby_filter=[]
    var filter_restaurants=[]
 
    
    var response={};
 
      //Max_cost and Min_cost filter
      filters = {averageCost: { $gte: parseInt(min_cost), $lte: parseInt(max_cost) },is_deleted:false}
    
      //open_time filter
      if(close_time == 1)   //1 means checked and 0 means unchecked
      {
          var hour = new Date();
          var time = hour.getHours() +":"+ hour.getMinutes()
          filters = {close_time: { $gte : time  }}
      }
 
      //Accept_card filter
      if(is_accept_card == 1)   //1 means checked and 0 means unchecked
      {
          filters.is_accept_card =  true 
      }
 
      //Food_type filter
	  if(res_food_type == 1)   //1 means veg and 2 means Nonveg 
	  {
		  filters.$or =  [{ res_food_type: 1 }, { res_food_type: 0 }]  
	  }else{
 filters.$or =  [{ res_food_type: 2 }, { res_food_type: 0 }]
 }
 
    //select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
    if(is_scan_type == 1 ) 
    {
       // var filters={ is_scan_status : true }
        filters.is_scan_status =  true  
    }
 
    if(is_scan_type == 2 )
    {
       // var filters={ is_drivethrough_status : true }
        filters.is_drivethrough_status =  true  
    }
 
    if(is_scan_type == 3 )
    {
        //var filters={ is_pickup_status : true }
        filters.is_pickup_status =  true  
    }
 
    if(is_scan_type == 4 )
    {
       // var filters={ is_reserve_status : true }
        filters.is_reserve_status =  true  
    }
 
    //Sort_by filter
    if(sort_by == 0)  //1 means checked and 0 means unchecked
    {
        sort_arrange = { averageCost : 1} //Assending order
    }
    else
    {
        if(sort_by == 1)
        {
            sort_arrange = { averageCost : 1 }   //Assending order
        }
        if(sort_by == 2)
        {
            sort_arrange = { averageCost : -1 }   //Disending order
        }
        if(sort_by == 3)
        {
            sort_arrange = { order_count : -1 }   // popularity 
        }
    }
    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)
    
    var promise = Resturants.aggregate([
            { "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [ lng, lat ],
                }, 
                "maxDistance": 40000,
                "spherical": true,
                "distanceField": "distance"
            }},
            { 
                $match: filters 
            }
        ]).sort(sort_arrange).skip(perPage * page).limit(perPage).exec();
 
        promise.then(function(resturants) {

         if(!resturants){
            response={ status: 201, msg: 'not found',data:[] }
            return  res.send(response)
         }
         if(cuisine_serve_res.length == '')
         {
             restaurants_nearby_filter = resturants
         }
         else
         {
          for(let i=0;i<resturants.length;i++)
             {
                 var is_in = false
                 if(cuisine_serve_res.length > 0)
                 { 
                     for(let j=0;j<resturants[i].cuisine_serve_res.length;j++)
                     {
                         for(let k=0;k<cuisine_serve_res.length;k++)
                         {
                               if(resturants[i].cuisine_serve_res[j].cuisine_id==cuisine_serve_res[k])
                             {
                                is_in = true
                             } 
                         }  
                     }
                 }
                 else
                 {
                   is_in=true
                 }
                 if(is_in == true)
                 { 
                     restaurants_nearby_filter.push(resturants[i])
                 }
             }
             
         }
         response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:{restaurants_nearby_filter}}}
                     return res.send(response)  ;
         }).catch(function(err){
             console.log('error:', err);
             response={ status: 500, msg: 'Internale server error' }
               res.send(response)
         });
        
})

router.post('/get_restaurants_data_bysearch_filterbypagination', (req, res) => {
	var cuisine_serve_res = req.body.cuisine_serve_res ? req.body.cuisine_serve_res.split(',') : ''
	var max_cost = req.body.max_cost ? req.body.max_cost : 5000
	var min_cost = req.body.min_cost ? req.body.min_cost : 0
	var close_time = req.body.close_time ? req.body.close_time : 0 ; 
	var is_accept_card = parseInt(req.body.is_accept_card) ? parseInt(req.body.is_accept_card) : 0;
	var res_food_type = parseInt(req.body.res_food_type) ? parseInt(req.body.res_food_type) : 1;
	var sort_by = parseInt(req.body.sort_by) ?  parseInt(req.body.sort_by) : 0
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var is_scan_type = parseInt(req.body.is_scan_type);
	
	var sort_arrange
	var filters = {} 
	var restaurants_nearby_filter=[]
	var filter_restaurants=[]
 
	
	var response={};
 
	  //Max_cost and Min_cost filter
	  filters = {averageCost: { $gte: parseInt(min_cost), $lte: parseInt(max_cost) },is_deleted:false}
	
	  //open_time filter
	  if(close_time == 1)   //1 means checked and 0 means unchecked
	  {
		  var hour = new Date();
		  var time = hour.getHours() +":"+ hour.getMinutes()
		  filters = {close_time: { $gte : time  }}
	  }
 
	  //Accept_card filter
	  if(is_accept_card == 1)   //1 means checked and 0 means unchecked
	  {
		  filters.is_accept_card =  true 
	  }
 
	  if(res_food_type == 1)   //1 means veg and 2 means Nonveg 
	  {
		  filters.$or =  [{ res_food_type: 1 }, { res_food_type: 0 }]  
	  }else{
 filters.$or =  [{ res_food_type: 2 }, { res_food_type: 0 }]
 }
 
	//select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
	if(is_scan_type == 1 ) 
	{
	   // var filters={ is_scan_status : true }
		filters.is_scan_status =  true  
	}
 
	if(is_scan_type == 2 )
	{
	   // var filters={ is_drivethrough_status : true }
		filters.is_drivethrough_status =  true  
	}
 
	if(is_scan_type == 3 )
	{
		//var filters={ is_pickup_status : true }
		filters.is_pickup_status =  true  
	}
 
	if(is_scan_type == 4 )
	{
	   // var filters={ is_reserve_status : true }
		filters.is_reserve_status =  true  
	}
 
	//Sort_by filter
	if(sort_by == 0)  //1 means checked and 0 means unchecked
	{
		sort_arrange = { averageCost : 1} //Assending order
	}
	else
	{
		if(sort_by == 1)
		{
			sort_arrange = { averageCost : 1 }   //Assending order
		}
		if(sort_by == 2)
		{
			sort_arrange = { averageCost : -1 }   //Disending order
		}
		if(sort_by == 3)
		{
			sort_arrange = { order_count : -1 }   // popularity 
		}
	}
	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
			var promise1 = Resturants.aggregate([
					{ 
						$match: filters 
					}
			 ]).sort(sort_arrange).skip(perPage * page).limit(perPage).exec();
			 promise1.then(function(rest_detail) {
 
				 if(cuisine_serve_res.length == '')
				 {
					 filter_restaurants = rest_detail
					 response={ status: 200, msg: 'Resturants fetch Successfully.',data:{All_rest_data:{filter_restaurants}}}
					 return	res.send(response)	; 
				 }
				 else
				 {
					 for(let i=0;i<rest_detail.length;i++)
						 {
							 var is_in = false
							 if(cuisine_serve_res.length > 0)
							 { 
								 for(let j=0;j<rest_detail[i].cuisine_serve_res.length;j++)
								 {
									 for(let k=0;k<cuisine_serve_res.length;k++)
									 {
										 if(rest_detail[i].cuisine_serve_res[j].cuisine_id==cuisine_serve_res[k])
										 {
										 is_in = true
										 } 
									 }	
								 }
							 }
							 else
							 {
							 is_in=true
							 }
							 if(is_in == true)
							 { 
								 filter_restaurants.push(rest_detail[i])
							 }
						 }
						 response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:{All_rest_data:{filter_restaurants}}}}
						 return	res.send(response)	;  
				 }
				   
			  }).catch(function(err){
				 console.log('error:', err);
				 response={ status: 500, msg: 'Internale server error' }
				 res.send(response)
			 });
		//  }).catch(function(err){
		// 	 console.log('error:', err);
		// 	 response={ status: 500, msg: 'Internale server error' }
		// 	   res.send(response)
		//  });
		
})
//22-08-2019 filter of Restaurants fetch nearby by page 
router.post('/get_restaurants_fetch_distance_pagenition', (req, res) => {
	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var is_scan_type = parseInt(req.body.is_scan_type);

	//select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
	if(is_scan_type == 1 ) 
	{
		var query={ is_scan_status : true }
	}

	if(is_scan_type == 2 )
	{
		var query={ is_drivethrough_status : true }
	}

	if(is_scan_type == 3 )
	{
		var query={ is_pickup_status : true }
	}

	if(is_scan_type == 4 )
	{
		var query={ is_reserve_status : true }
	}

	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
					"coordinates": [ lng, lat ],
		        }, 
		        "maxDistance": 400000,
		        "spherical": true,
		        "distanceField": "distance"
			}},
			{
			    $match: query
			}
						 
		]).skip(perPage * page).limit(perPage).exec();

		promise.then(function(resturants) {
			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}
			
			response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:resturants}}
			return	res.send(response)	; 
			
		 })
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		
		       	res.send(response)
		 });
		
})

//22-08-2019 filter of Restaurants fetch all restaurants by page 
router.post('/get_restaurants_all_data_fetch_pagenition', (req, res) => {
	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var is_scan_type = parseInt(req.body.is_scan_type);

	//select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
	if(is_scan_type == 1 ) 
	{
		var query={ is_scan_status : true }
	}

	if(is_scan_type == 2 )
	{
		var query={ is_drivethrough_status : true }
	}

	if(is_scan_type == 3 )
	{
		var query={ is_pickup_status : true }
	}

	if(is_scan_type == 4 )
	{
		var query={ is_reserve_status : true }
	}

	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
					"coordinates": [ lng, lat ],
		        }, 
		        "maxDistance": 40000,
		        "spherical": true,
		        "distanceField": "distance"
			}},
			{
			    $match: query
			}
						 
		])

		promise.then(function(resturants) {
			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}
			//trending brands Resturants show 
			Resturants.find({is_deleted:false},(err,brand_rest_detail)=>{
				response={ status: 200, msg: 'Resturants fetch Successfully.',data:{All_rest_data:brand_rest_detail}}
				return	res.send(response)	; 
			}).skip(perPage * page).limit(perPage).exec();
			
		 })
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		
		       	res.send(response)
		 });
		
})

//22-08-2019 Api for history order with reserve type
router.post('/get_order_history_restype', (req, res) => {
	var user_id = req.body.user_id ? req.body.user_id : " "

	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)

	var promise = Order.aggregate([
		{ 
			$match: { 
				user_id : mongoose.Types.ObjectId(user_id) ,
				order_status : 4,
				order_type : 4 
			}
		},
		{	
			$lookup:{
				from: "resturants",
				localField:"restaurant_id",
				foreignField:"_id",
				as:'restrorent_data'
			}
		},
		{
			  $unwind: '$restrorent_data'
		}, 
		{
			$project: {
				 _id: 1,
  				 order_date: 1,
				 name: '$restrorent_data.name',
				 address: '$resturants_data.address1',
				 res_banner_photo: '$restaurant_data.res_banner_photo',
				 order_product : 1,
				 refrence_number:1,
				 discount_price:1,
				 order_amount:1,
				 order_total_amount:1,
				 order_total_quantity:1,
				 order_status:1,
				 user_id:1,
				 restaurant_id:1,
				 estimated_delivery_time:1,
				 tax:1,
				 order_accept_time:1,
				 create_on:1,
			}
		}
	]).skip(perPage * page).limit(perPage).exec();

	promise.then(function(order_data){
		if(!order_data){
			response={ status: 201, msg: 'not found',data:[] }
				return	res.send(response)
		}

		response={ status: 200, msg: 'Order history data fetch for reserve ',data:{Order_rest_data:order_data}}
			return	res.send(response)	; 
	
	}).catch(function(err){
			console.log('error:', err);
			response={ status: 500, msg: 'Internal server error' }
			res.send(response)
	});
})

//06-09-2019 Api for history order pagination of reserve type 
router.post('/get_order_history_restype_pagination', (req, res) => {
    var user_id = req.body.user_id ? req.body.user_id : " "
    
    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)
    
    var date = new Date();
    var promise = tableReserveStatus.aggregate([
        { 
            $match: { 
                user_id : mongoose.Types.ObjectId(user_id) ,
                booking_date_time:{ $lte : date  }
            }
        },
        {   
            $lookup:{
                from: "resturants",
                localField:"restaurant_id",
                foreignField:"_id",
                as:'restaurant_data'
            }
        },
        {
              $unwind: '$restaurant_data'
        },
        {
            $project: {
                 _id: 1,
                 total_member:1,
                 slot:1,
                 is_pending:1,
                 restaurant_id:1,
                 user_id:1,
                 booking_date_time: 1,
                 create_on:1,
                 is_active:1,
                 is_deleted:1,
                 restaurant_name: '$restaurant_data.name',
                 res_banner_photo: '$restaurant_data.res_banner_photo',
                 address: '$restaurant_data.address1'
                 
            }
        }
        ]).sort({create_on:-1}).skip(perPage * page).limit(perPage).exec();
    
        promise.then(function(order_data_history_data){
            
            response={ status: 200, msg: 'Order date for reserve',data:{order_data_history_data:order_data_history_data}}
                return  res.send(response)  ; 
        
            }).catch(function(err){
                console.log('error:', err);
                response={ status: 500, msg: 'Internal server error' }
                res.send(response)
        });
})
//22-08-2019 Api for Upcoming order with reserve type
router.post('/get_order_upcoming_restype', (req, res) => {
    var user_id = req.body.user_id 
    
    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)
    
    var date = new Date();
    var promise = tableReserveStatus.aggregate([
        { 
            $match: { 
                user_id : mongoose.Types.ObjectId(user_id) ,
                booking_date_time:{ $gte : date  }
            }
        },
        {   
            $lookup:{
                from: "resturants",
                localField:"restaurant_id",
                foreignField:"_id",
                as:'restaurant_data'
            }
        },
        {
              $unwind: '$restaurant_data'
        },
        {
            $project: {
                 _id: 1,
                 total_member:1,
                 slot:1,
                 is_pending:1,
                 restaurant_id:1,
                 user_id:1,
                 booking_date_time: 1,
                 create_on:1,
                 is_active:1,
                 is_deleted:1,
                 restaurant_name: '$restaurant_data.name',
                 res_banner_photo: '$restaurant_data.res_banner_photo',
                 address: '$restaurant_data.address1'
                 
            }
        }
    ]).sort({create_on:-1}).skip(perPage * page).limit(perPage).exec();

    promise.then(function(Order_upcoming_reserved_data){
        
        var promise1 = tableReserveStatus.aggregate([
            { 
                $match: { 
                    user_id : mongoose.Types.ObjectId(user_id) ,
                    booking_date_time:{ $lte : date  }
                }
            },
            {   
                $lookup:{
                    from: "resturants",
                    localField:"restaurant_id",
                    foreignField:"_id",
                    as:'restaurant_data'
                }
            },
            {
                  $unwind: '$restaurant_data'
            },
            {
                $project: {
                     _id: 1,
                     total_member:1,
                     slot:1,
                     is_pending:1,
                     restaurant_id:1,
                     user_id:1,
                     booking_date_time: 1,
                     create_on:1,
                     is_active:1,
                     is_deleted:1,
                     restaurant_name: '$restaurant_data.name',
                     res_banner_photo: '$restaurant_data.res_banner_photo',
                     address: '$restaurant_data.address1'
                     
                }
            }
            
        ]).sort({create_on:-1}).skip(perPage * page).limit(perPage).exec();
    
        promise1.then(function(order_data_history_data){
            
            response={ status: 200, msg: 'Order date for reserve ',data:{order_data_history_data:order_data_history_data,Order_upcoming_reserved_data:Order_upcoming_reserved_data}}
                return  res.send(response)  ; 
        
            }).catch(function(err){
                console.log('error:', err);
                response={ status: 500, msg: 'Internal server error' }
                res.send(response)
        });

    }).catch(function(err){
            console.log('error:', err);
            response={ status: 500, msg: 'Internal server error' }
            res.send(response)
    });
})
//06-09-2019 Api for Upcoming order pagination of reserve type 
router.post('/get_order_upcoming_restype_pagination', (req, res) => {
    var user_id = req.body.user_id ? req.body.user_id : " "
    
    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)
    
    var date = new Date();
    var promise = tableReserveStatus.aggregate([
        { 
            $match: { 
                user_id : mongoose.Types.ObjectId(user_id) ,
                booking_date_time:{ $gte : date  }
            }
        },
        {   
            $lookup:{
                from: "resturants",
                localField:"restaurant_id",
                foreignField:"_id",
                as:'restaurant_data'
            }
        },
        {
              $unwind: '$restaurant_data'
        },
        {
            $project: {
                 _id: 1,
                 total_member:1,
                 slot:1,
                 is_pending:1,
                 restaurant_id:1,
                 user_id:1,
                 booking_date_time: 1,
                 create_on:1,
                 is_active:1,
                 is_deleted:1,
                 restaurant_name: '$restaurant_data.name',
                 res_banner_photo: '$restaurant_data.res_banner_photo',
                 address: '$restaurant_data.address1'
            }
        }
    ]).sort({create_on:-1}).skip(perPage * page).limit(perPage).exec();

    promise.then(function(Order_upcoming_reserved_data){
        response={ status: 200, msg: 'Order date for reserve',data:{Order_upcoming_reserved_data:Order_upcoming_reserved_data}}
        return  res.send(response)  ; 
    }).catch(function(err){
            console.log('error:', err);
            response={ status: 500, msg: 'Internal server error' }
            res.send(response)
    });
})

//22-08-2019 Get cuisines by id
router.post('/get_cuisines_filter', (req, res) => {
	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var cuisines_id = req.body.cuisines_id;

	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
		            "coordinates": [ lng, lat ]
		        }, 
		        "maxDistance": 40000,
		        "spherical": true,
		        "distanceField": "distance"
			}},
			{
				$match:{'cuisine_serve_res.cuisine_id':mongoose.Types.ObjectId(cuisines_id) ,is_deleted:false}
		    }
			
		]).skip(perPage * page).limit(perPage).exec();

		promise.then(function(resturants) {
         
			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}
			//trending brands Resturants show 
			Resturants.aggregate([
			    		{
			    			$lookup: {from: "order_details",localField: "_id",foreignField: "restaurant_id",as: "brand_rest_detail"},
						},
						{
							$match:{'cuisine_serve_res.cuisine_id':mongoose.Types.ObjectId(cuisines_id) ,is_deleted:false}
						},
			    		{
						      $unwind: '$brand_rest_detail'
					    },
					    { 
					    	$group : {
					            _id : "$_id",
					            count:{$sum:1},
					            detail: { "$first": "$$ROOT"},
					           
					    	}
						},
			    		{
						      $unwind: '$detail'
					    },
					    {
					        $project: {
					           _id: 1,
					           count: 1,
					           detail:1,
					           
					        }
					    }
			    	]).exec((err_res, brand_res_info)=> {
							if (err_res) {
								console.log(err_res)
						       var	response={ status: 500, msg: 'Internale server error',data:[] }
						       	res.send(response)
						    }
						    response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:resturants,brands_res:brand_res_info}}
							return	res.send(response)	;   
											
					})
		})
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		       	res.send(response)
		});
		
})

router.post('/get_cuisines_filter_location_pagination', (req, res) => {

	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var cuisines_id = req.body.cuisines_id;

	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
		            "coordinates": [ lng, lat ]
		        }, 
		        "maxDistance": 40000,
		        "spherical": true,
		        "distanceField": "distance"
			}},
			{
				$match:{'cuisine_serve_res.cuisine_id':mongoose.Types.ObjectId(cuisines_id) ,is_deleted:false}
		    }
			
		]).skip(perPage * page).limit(perPage).exec();

		promise.then(function(resturants) {
         
			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}
			response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:resturants,brands_res:brand_res_info}}
			return	res.send(response)	;   
		
		})
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		       	res.send(response)
		});
		
})

router.post('/get_cuisines_filter_bylocation_and_order_pagination', (req, res) => {

	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var cuisines_id = req.body.cuisines_id;

	var page_no = parseFloat(req.body.page_no)
	var perPage = 1, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
		    { "$geoNear": {
		        "near": {
		            "type": "Point",
		            "coordinates": [ lng, lat ]
		        }, 
		        "maxDistance": 40000,
		        "spherical": true,
		        "distanceField": "distance"
			}},
			{
				$match:{'cuisine_serve_res.cuisine_id':mongoose.Types.ObjectId(cuisines_id) ,is_deleted:false}
		    }
			
		]).skip(perPage * page).limit(perPage).exec();

		promise.then(function(resturants) {
         
			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
			       	return	res.send(response)
			}
			//trending brands Resturants show 
			Resturants.aggregate([
			    		{
			    			$lookup: {from: "order_details",localField: "_id",foreignField: "restaurant_id",as: "brand_rest_detail"},
						},
						{
							$match:{'cuisine_serve_res.cuisine_id':mongoose.Types.ObjectId(cuisines_id) ,is_deleted:false}
						},
			    		{
						      $unwind: '$brand_rest_detail'
					    },
					    { 
					    	$group : {
					            _id : "$_id",
					            count:{$sum:1},
					            detail: { "$first": "$$ROOT"},
					           
					    	}
						},
			    		{
						      $unwind: '$detail'
					    },
					    {
					        $project: {
					           _id: 1,
					           count: 1,
					           detail:1,
					           
					        }
					    }
			    	]).skip(perPage * page).limit(perPage).exec((err_res, brand_res_info)=> {
							if (err_res) {
								console.log(err_res)
						       var	response={ status: 500, msg: 'Internale server error',data:[] }
						       	res.send(response)
						    }
						    response={ status: 200, msg: 'Resturants fetch Successfully.',data:{brands_res:brand_res_info}}
								return	res.send(response)	;   
					})
		})
		.catch(function(err){
		  console.log('error:', err);
		  response={ status: 500, msg: 'Internale server error' }
		       	res.send(response)
		});
		
})

//24-08-2019
router.post('/get_restaurants_search_by_type_and_location', (req, res) => {
    var response={};
    var lng = parseFloat(req.body.lng);
    var lat = parseFloat(req.body.lat);
    var is_scan_type = parseInt(req.body.is_scan_type) ? parseInt(req.body.is_scan_type):0;
    
    var keyword_name = req.body.keyword_name ? req.body.keyword_name : ''

    //select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
    if(keyword_name == '' ) 
    {
        keyword_name =''
    }

    if(is_scan_type == 0 ) 
    {
        var query={ }
    }

    if(is_scan_type == 1 ) 
    {
        var query={ is_scan_status : true }
    }

    if(is_scan_type == 2 )
    {
        var query={ is_drivethrough_status : true }
    }

    if(is_scan_type == 3 )
    {
        var query={ is_pickup_status : true }
    }
    
    if(is_scan_type == 4 )
    {
        var query={ is_reserve_status : true }
    }

    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)

    var promise = Resturants.aggregate([
        { "$geoNear": {
            "near": {
                "type": "Point",
                "coordinates": [ lng, lat ],
            }, 
            "maxDistance": 40000,
            "spherical": true,
            "distanceField": "distance"
        }},
        { 
            $match: { name : { '$regex': keyword_name ,"$options" : "i"} } 
        },
        {
            $match: query
        }
        
                         
    ]).skip(perPage * page).limit(perPage).exec();

    promise.then(function(resturants) {
        if(!resturants){
        response={ status: 201, msg: 'not found',data:[] }
                   return   res.send(response)
        }
        response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_data:resturants}}
        return  res.send(response)  ; 

    })
    .catch(function(err){
      console.log('error:', err);
      response={ status: 500, msg: 'Internale server error' }
               res.send(response)
     });

})

router.post('/get_restaurants_search_by_type_and_location_by_pagination', (req, res) => {
	var response={};
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var is_scan_type = parseInt(req.body.is_scan_type) ? parseInt(req.body.is_scan_type):0;
	
	var keyword_name = req.body.keyword_name ? req.body.keyword_name : ''

	//select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
	if(keyword_name == '' ) 
	{
		keyword_name =''
	}

	if(is_scan_type == 0 ) 
	{
		var query={ }
	}

	if(is_scan_type == 1 ) 
	{
		var query={ is_scan_status : true }
	}

	if(is_scan_type == 2 )
	{
		var query={ is_drivethrough_status : true }
	}

	if(is_scan_type == 3 )
	{
		var query={ is_pickup_status : true }
	}
	
	if(is_scan_type == 4 )
	{
		var query={ is_reserve_status : true }
	}

	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)

	var promise = Resturants.aggregate([
		{ "$geoNear": {
			"near": {
				"type": "Point",
				"coordinates": [ lng, lat ],
			}, 
			"maxDistance": 40000,
			"spherical": true,
			"distanceField": "distance"
		}},
		{ 
			$match: { name : { '$regex': keyword_name,"$options" : "i" } } 
		},
		{
			$match: query
		}
		
						 
	]).skip(perPage * page).limit(perPage).exec();

	promise.then(function(resturants) {
		if(!resturants){
		response={ status: 201, msg: 'not found',data:[] }
				   return	res.send(response)
		}
		response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_data:resturants}}
		return	res.send(response)	; 

	})
	.catch(function(err){
	  console.log('error:', err);
	  response={ status: 500, msg: 'Internale server error' }
			   res.send(response)
	 });

})


//22-08-2019 update on 24-08-2019 filter of Restaurants_filter by nearby and all restaurants 

/*router.post('/get_restaurants_data_bysearch', (req, res) => {
	var cuisine_serve_res = req.body.cuisine_serve_res ? req.body.cuisine_serve_res.split(',') : ''
	var max_cost = req.body.max_cost ? req.body.max_cost : 5000
	var min_cost = req.body.min_cost ? req.body.min_cost : 0
	var close_time = req.body.close_time ? req.body.close_time : 0 ; 
	var is_accept_card = parseInt(req.body.is_accept_card) ? parseInt(req.body.is_accept_card) : 0;
	var res_food_type = parseInt(req.body.res_food_type) ? parseInt(req.body.res_food_type) : 1;
	var sort_by = parseInt(req.body.sort_by) ?  parseInt(req.body.sort_by) : 0
	var lng = parseFloat(req.body.lng);
	var lat = parseFloat(req.body.lat);
	var is_scan_type = parseInt(req.body.is_scan_type);
	
	var sort_arrange
	var filters = {} 
	var restaurants_nearby_filter=[]
	var filter_restaurants=[]
 
	
	var response={};
 
	  //Max_cost and Min_cost filter
	  filters = {averageCost: { $gte: parseInt(min_cost), $lte: parseInt(max_cost) },is_deleted:false}
	
	  //open_time filter
	  if(close_time == 1)   //1 means checked and 0 means unchecked
	  {
		  var hour = new Date();
		  var time = hour.getHours() +":"+ hour.getMinutes()
		  filters = {close_time: { $gte : time  }}
	  }
 
	  //Accept_card filter
	  if(is_accept_card == 1)   //1 means checked and 0 means unchecked
	  {
		  filters.is_accept_card =  true 
	  }
 
	  //Food_type filter
	  if(res_food_type == 1)   //1 means veg and 2 means veg
	  {
		  filters.res_food_type =  1  
	  }
	  else
	  {
		  filters.res_food_type = 2   
	  }
 
	//select (1) for is_scan_status       select (2) for is_drivethrough_status    select (3) for is_pickup_status   select (4) for is_reserve_status
	if(is_scan_type == 1 ) 
	{
	   // var filters={ is_scan_status : true }
		filters.is_scan_status =  true  
	}
 
	if(is_scan_type == 2 )
	{
	   // var filters={ is_drivethrough_status : true }
		filters.is_drivethrough_status =  true  
	}
 
	if(is_scan_type == 3 )
	{
		//var filters={ is_pickup_status : true }
		filters.is_pickup_status =  true  
	}
 
	if(is_scan_type == 4 )
	{
	   // var filters={ is_reserve_status : true }
		filters.is_reserve_status =  true  
	}
 
	//Sort_by filter
	if(sort_by == 0)  //1 means checked and 0 means unchecked
	{
		sort_arrange = { averageCost : 1} //Assending order
	}
	else
	{
		if(sort_by == 1)
		{
			sort_arrange = { averageCost : 1 }   //Assending order
		}
		if(sort_by == 2)
		{
			sort_arrange = { averageCost : -1 }   //Disending order
		}
		if(sort_by == 3)
		{
			sort_arrange = { order_count : -1 }   // popularity 
		}
	}
	var page_no = parseFloat(req.body.page_no)
	var perPage = 20, page = Math.max(0, page_no)
	
	var promise = Resturants.aggregate([
			{ "$geoNear": {
				"near": {
					"type": "Point",
					"coordinates": [ lng, lat ],
				}, 
				"maxDistance": 40000,
				"spherical": true,
				"distanceField": "distance"
			}},
			{ 
				$match: filters 
			}
		]).sort(sort_arrange).skip(perPage * page).limit(perPage).exec();
 
		promise.then(function(resturants) {
 
		 if(cuisine_serve_res.length == '')
		 {
			 restaurants_nearby_filter = resturants
		 }
		 else
		 {
		  for(let i=0;i<resturants.length;i++)
			 {
				 var is_in = false
				 if(cuisine_serve_res.length > 0)
				 { 
					 for(let j=0;j<resturants[i].cuisine_serve_res.length;j++)
					 {
						 for(let k=0;k<cuisine_serve_res.length;k++)
						 {
							   if(resturants[i].cuisine_serve_res[j].cuisine_id==cuisine_serve_res[k])
							 {
								is_in = true
							 } 
						 }	
					 }
				 }
				 else
				 {
				   is_in=true
				 }
				 if(is_in == true)
				 { 
					 restaurants_nearby_filter.push(resturants[i])
				 }
			 }
		 }
		 
			if(!resturants){
			response={ status: 201, msg: 'not found',data:[] }
					   return	res.send(response)
			}
			var promise1 = Resturants.aggregate([
					{ 
						$match: filters 
					}
			 ]).sort(sort_arrange).skip(perPage * page).limit(perPage).exec();
			 promise1.then(function(rest_detail) {
 
				 if(cuisine_serve_res.length == '')
				 {
					 filter_restaurants = rest_detail
					 response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:{restaurants_nearby_filter},All_rest_data:{filter_restaurants}}}
					 return	res.send(response)	; 
				 }
				 else
				 {
					 for(let i=0;i<rest_detail.length;i++)
						 {
							 var is_in = false
							 if(cuisine_serve_res.length > 0)
							 { 
								 for(let j=0;j<rest_detail[i].cuisine_serve_res.length;j++)
								 {
									 for(let k=0;k<cuisine_serve_res.length;k++)
									 {
										 if(rest_detail[i].cuisine_serve_res[j].cuisine_id==cuisine_serve_res[k])
										 {
										 is_in = true
										 } 
									 }	
								 }
							 }
							 else
							 {
							 is_in=true
							 }
							 if(is_in == true)
							 { 
								 filter_restaurants.push(rest_detail[i])
							 }
						 }
						 response={ status: 200, msg: 'Resturants fetch Successfully.',data:{rest_near_by_data:{restaurants_nearby_filter},All_rest_data:{filter_restaurants}}}
						 return	res.send(response)	;  
				 }
				   
			  }).catch(function(err){
				 console.log('error:', err);
				 response={ status: 500, msg: 'Internale server error' }
				 res.send(response)
			 });
		 }).catch(function(err){
			 console.log('error:', err);
			 response={ status: 500, msg: 'Internale server error' }
			   res.send(response)
		 });
		
})
*/

 


//30-08-2019 save update for  reserve table 
router.post('/resver_table_booking_request', (req, res) => {
	
	var date = req.body.date;
	var time = req.body.time ;
	var restaurant_id = req.body.restaurant_id ;
	var total_member = parseInt(req.body.total_member) ;

	
	// save reserve table data 
	var ReserveTable  = tableReserveStatus({
		restaurant_id: req.body.restaurant_id,
		table_id:'',
		user_id:req.body.user_id,
		total_member: total_member,
		booking_date_time:date,
		create_on: new Date(),
		is_active: true,
		is_deleted:false,  
		slot:parseInt(req.body.slot),
		is_pending:0
	})
	
	ReserveTable.save(function(err, reserveTableDetail) {
		if (err) {
			console.log(err);
			response={ status: 500, msg: 'Internale server error' }
			res.send(response)
		}
		// find resturant id behalf on user id
		Resturants.findOne({_id:restaurant_id,is_active:true,is_deleted:false},function(err_resturant, resturantDetail) {
			if(err_resturant){
				console.log(err_resturant);
				response={ status: 500, msg: 'Internale server error' }
				res.send(response)
			}
			var res_owner_id = resturantDetail.user_id
			
			var data_socket = {status:200,msg:"reserve table request successfully ",table_id:''}
			req.io.sockets.in(res_owner_id).emit('reserve_table_for_request',data_socket);
			response={ status: 200, msg: 'pedning',data:reserveTableDetail}
				return   res.send(response)
		})
		
	})
	

})

//6-9-2019
router.post('/get_orders_upcoming_history', (req, res) => {
    var user_id = req.body.user_id ? req.body.user_id : " "
    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)
    var promise =  Order.aggregate([
        { 
            $match: { 
                user_id : mongoose.Types.ObjectId(user_id) ,
                order_status: { $in: [0,1,3,5] } ,
                order_type : { $in: [1,2,3] } 
            }
        },
        {   
            $lookup:{
                from: "resturants",
                localField:"restaurant_id",
                foreignField:"_id",
                as:'restrorent_data'
            }
        },
        {
              $unwind: '$restrorent_data'
		}, 
		{   
            $lookup:{
                from: "tables",
                localField:"table_id",
                foreignField:"_id",
                as:'table_data'
            }
        },
        {
            "$unwind":{path:"$table_data",preserveNullAndEmptyArrays:true}
        },
        {
            $project: {
                 _id: 1,
                 order_date: 1,
				 name: '$restrorent_data.name',
				 address: '$resturants_data.address1',
				 res_banner_photo:'$restrorent_data.res_banner_photo',
				 rest_geofence:'$restrorent_data.rest_geofence',
                 order_product : 1,
                 refrence_number:1,
                 discount_price:1,
                 order_amount:1,
                 order_total_amount:1,
                 order_total_quantity:1,
				 order_status:1,
				 user_id:1,
				 restaurant_id:1,
				 estimated_delivery_time:1,
				 tax:1,
				 order_type:1,
				 order_accept_time:1,
				 create_on:1,
				 table_id:1,
                 table_no: '$table_data.table_no',
				 order_delivered_time:1
            }
        }
    ]).sort({order_date:-1}).skip(perPage * page).limit(perPage).exec();

    promise.then(async function(order_upcoming_data){
        
        for( let i=0;i<order_upcoming_data.length;i++)
        {
            for(let j=0;j<=order_upcoming_data[i].order_product.length-1;j++)
            {
              await Food.findOne({_id:order_upcoming_data[i].order_product[j].food_id,is_active:true,is_deleted:false},(err,food_result)=>{
                    if(err)
                    {
                        console.log('error:', err);
                        response={ status: 500, msg: 'Internal server error' }
                        return res.send(response)
					}
					if(food_result){
						order_upcoming_data[i].order_product[j].food_name = food_result.food_name
						order_upcoming_data[i].order_product[j].food_type = food_result.food_type
					} else{
						order_upcoming_data[i].order_product[j].food_name = ''
						order_upcoming_data[i].order_product[j].food_type = ''
					}
                   
                })
            }
            
        }
        var promise1 = Order.aggregate([
                { 
                    $match: { 
                        user_id : mongoose.Types.ObjectId(user_id) ,
                        order_status : 4,
                        order_type : { $in: [1,2,3 ] } 
                    }
                },
                {   
                    $lookup:{
                        from: "resturants",
                        localField:"restaurant_id",
                        foreignField:"_id",
                        as:'restrorent_data'
                    }
                },
                {
                    $unwind: '$restrorent_data'
				}, 
				{   
					$lookup:{
						from: "tables",
						localField:"table_id",
						foreignField:"_id",
						as:'table_data'
					}
				},
				{
					"$unwind":{path:"$table_data",preserveNullAndEmptyArrays:true}
				},
                {
                    $project: {
                        _id: 1,
                        order_date: 1,
						name: '$restrorent_data.name',
						address: '$resturants_data.address1',
						res_banner_photo:'$restrorent_data.res_banner_photo',
						rest_geofence:'$restrorent_data.rest_geofence',
                        order_product : 1,
                        refrence_number:1,
                        discount_price:1,
                        order_amount:1,
                        order_total_amount:1,
                        order_total_quantity:1,
						order_status:1,
						user_id:1,
					 	restaurant_id:1,
						estimated_delivery_time:1,
						tax:1,
						order_type:1,
						order_accept_time:1,
						create_on:1,
						table_id:1,
						table_no: '$table_data.table_no',
				        order_delivered_time:1
                    }
                }
            ]).sort({order_date:-1}).skip(perPage * page).limit(perPage).exec();
        
             promise1.then(async function(order_history_data){
                for(let i=0;i<order_history_data.length;i++)
                {
                    for(let j=0;j<order_history_data[i].order_product.length;j++)
                    {
                       await Food.findOne({_id:order_history_data[i].order_product[j].food_id},(err_history,food_history_result)=>{
                            if(err_history)
                            {
                                console.log('error:', err_history);
                                response={ status: 500, msg: 'Internal server error' }
                                return res.send(response)
							}
							if(food_history_result){
								order_history_data[i].order_product[j].food_name = food_history_result.food_name
								order_history_data[i].order_product[j].food_type = food_history_result.food_type
							} else{
								order_history_data[i].order_product[j].food_name = ''
								order_history_data[i].order_product[j].food_type = ''
							}
                          
                        })
                    }
                }
                
                response=  { status: 200, msg: 'Order data for upcoming ',data:{order_upcoming_data:order_upcoming_data,order_history_data:order_history_data}}
                return  res.send(response)  ; 
            
            }).catch(function(err){
                    console.log('error:', err);
                    response={ status: 500, msg: 'Internal server error' }
                    res.send(response)
            });

    }).catch(function(err){
            console.log('error:', err);
            response={ status: 500, msg: 'Internal server error' }
            res.send(response)
    });
})

router.post('/get_orders_upcoming_pagination', (req, res) => {

    var user_id = req.body.user_id ? req.body.user_id : " "
    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)
    var promise =  Order.aggregate([
        { 
            $match: { 
                user_id : mongoose.Types.ObjectId(user_id) ,
                order_status: { $in: [0,1,3,5] } ,
                order_type : { $in: [1,2,3] } 
            }
        },
        {   
            $lookup:{
                from: "resturants",
                localField:"restaurant_id",
                foreignField:"_id",
                as:'restrorent_data'
            }
        },
        {
              $unwind: '$restrorent_data'
		}, 
		{   
            $lookup:{
                from: "tables",
                localField:"table_id",
                foreignField:"_id",
                as:'table_data'
            }
        },
        {
            "$unwind":{path:"$table_data",preserveNullAndEmptyArrays:true}
		},
		
        
        {
            $project: {
                 _id: 1,
                 order_date: 1,
				 name: '$restrorent_data.name',
				 address: '$resturants_data.address1',
				 res_banner_photo:'$restrorent_data.res_banner_photo',
				 rest_geofence:'$restrorent_data.rest_geofence',
                 order_product : 1,
                 refrence_number:1,
                 discount_price:1,
                 order_amount:1,
                 order_total_amount:1,
                 order_total_quantity:1,
				 order_status:1,
				 user_id:1,
				 restaurant_id:1,
				 estimated_delivery_time:1,
				 tax:1,
				 refrence_number:1,
				 order_total_quantity:1,
				 order_type:1,
				 order_accept_time:1,
				 create_on:1,
				 table_id:1,
				 table_no: '$table_data.table_no',
				 order_delivered_time:1

            }
        }
    ]).sort({order_date:-1}).skip(perPage * page).limit(perPage).exec();

    promise.then(async function(order_upcoming_data){
        
        for( let i=0;i<order_upcoming_data.length;i++)
        {
            for(let j=0;j<=order_upcoming_data[i].order_product.length-1;j++)
            {
              await Food.findOne({_id:order_upcoming_data[i].order_product[j].food_id,is_active:true,is_deleted:false},(err,food_result)=>{
                    if(err)
                    {
                        console.log('error:', err);
                        response={ status: 500, msg: 'Internal server error' }
                        return res.send(response)
					}
					if(food_result){
						order_upcoming_data[i].order_product[j].food_name = food_result.food_name
						order_upcoming_data[i].order_product[j].food_type = food_result.food_type 
					} else{
						order_upcoming_data[i].order_product[j].food_name =''
						order_upcoming_data[i].order_product[j].food_type = ''
					}
                  
                })
            }
            
        }
                
        response=  { status: 200, msg: 'Order data for upcoming ',data:{order_upcoming_data:order_upcoming_data}}
        return  res.send(response)  ; 
            
        
    }).catch(function(err){
            console.log('error:', err);
            response={ status: 500, msg: 'Internal server error' }
            res.send(response)
    });
})

router.post('/get_orders_history_pagination', (req, res) => {
    var user_id = req.body.user_id ? req.body.user_id : " "
    var page_no = parseFloat(req.body.page_no)
    var perPage = 20, page = Math.max(0, page_no)
    
    var promise = Order.aggregate([
                { 
                    $match: { 
                        user_id : mongoose.Types.ObjectId(user_id) ,
                        order_status : 4,
                        order_type : { $in: [1,2,3 ] } 
                    }
                },
                {   
                    $lookup:{
                        from: "resturants",
                        localField:"restaurant_id",
                        foreignField:"_id",
                        as:'restrorent_data'
                    }
                },
                {
                    $unwind: '$restrorent_data'
				}, 
				{   
					$lookup:{
						from: "tables",
						localField:"table_id",
						foreignField:"_id",
						as:'table_data'
					}
				},
				{
					"$unwind":{path:"$table_data",preserveNullAndEmptyArrays:true}
				},
                {
                    $project: {
                        _id: 1,
                        order_date: 1,
						name: '$restrorent_data.name',
						address: '$resturants_data.address1',
						res_banner_photo:'$restrorent_data.res_banner_photo',
						rest_geofence:'$restrorent_data.rest_geofence',
                        order_product : 1,
                        order_total_quantity:1,
						order_status:1,
						order_product : 1,
						refrence_number:1,
						discount_price:1,
						order_amount:1,
						order_total_amount:1,
						order_total_quantity:1,
						order_status:1,
						user_id:1,
						restaurant_id:1,
						estimated_delivery_time:1,
						tax:1,
						table_id:1,
						table_no: '$table_data.table_no',
						order_total_quantity:1,
						order_accept_time:1,
						 create_on:1,
                    }
                }
            ]).sort({order_date:-1}).skip(perPage * page).limit(perPage).exec();
        
             promise.then(async function(order_history_data){
                for(let i=0;i<order_history_data.length;i++)
                {
                    for(let j=0;j<order_history_data[i].order_product.length;j++)
                    {
                       await Food.findOne({_id:order_history_data[i].order_product[j].food_id,is_active:true,is_deleted:false},(err_history,food_history_result)=>{
                            if(err_history)
                            {
                                console.log('error:', err_history);
                                response={ status: 500, msg: 'Internal server error' }
                                return res.send(response)
							}
							if(food_history_result){
								order_history_data[i].order_product[j].food_name = food_history_result.food_name
								order_history_data[i].order_product[j].food_type = food_history_result.food_type
							} else{
								order_history_data[i].order_product[j].food_name = ''
								order_history_data[i].order_product[j].food_type =''
							}
                           
                        })
                    }
                }
                
                response=  { status: 200, msg: 'Order data for upcoming ',data:{order_history_data:order_history_data}}
                return  res.send(response)  ; 
            
            }).catch(function(err){
                    console.log('error:', err);
                    response={ status: 500, msg: 'Internal server error' }
                    res.send(response)
    });
    
})




/*9-09-2019 cusomter update address*/
router.post('/update_user_location',async (req, res) => {
    var user_id = req.body.user_id 
    var lat=req.body.lat; //22.7232119
    var lng=req.body.lng; //75.8825656 

    await User.findOne({_id:user_id},async (err_user,result_user)=>{

        if (err_user) {
          console.log(err_user);
          response={ status: 500, msg: 'Internale server error' }
          res.send(response)
        }
      var address_id=result_user.address_detail[0]._id

      await  User.updateMany({ "address_detail._id": address_id }, {'$set': {'address_detail.$.lat': lat,'address_detail.$.lng': lng}},async (err_addres,address_result)=>{
         
        if (err_addres) {
          console.log(err_addres);
          response={ status: 500, msg: 'Internale server error' }
          res.send(response)
        }
      
      
        await User.find({_id:user_id}, (err_location,update_location)=>{
        if(err_location)
        {
            console.log(err_location);
            response={ status: 500, msg: 'Internale server error' }
            res.send(response)
        }

        response={ status: 200, msg: 'User location Update',update_location:update_location}
        return  res.send(response)  ; 
      })
        
    })
      
    })
   
})

/*12-9-2019 update parking  */
router.post('/parking_upadation', (req, res) => {
    var order_id = req.body.order_id ;
    var keyword = req.body.keyword ;
	var customer_id;
    Order.findOneAndUpdate({_id:mongoose.Types.ObjectId(order_id)},{ $set: {parking : keyword } },function(err_parking,update_parking) {
      if(err_parking) {
          console.log(err_parking)
          var response={ status: 500, msg: 'Internale server error device id',data:[] }
             return   res.send(response)
	  }		
	  customer_id = update_parking.user_id;
		  // find resturant id
		  
	  			var promise = Resturants.findOne({_id:update_parking.restaurant_id}).exec();

				promise.then(function(rest_details){
					
						if(!rest_details){
							
							var emit_data = {status:500}
							req.io.sockets.in(to_user_id).emit('i_am_here',emit_data);
							return ;
						}
							
						
						var to_user_id = rest_details.user_id;
					
						// find customer name user name
						User.findOne({ _id: customer_id,is_deleted:false},('user_name') ,function (err, user) {
							if (err) {
								console.log(err);
							   var	response={ status: 500, msg: 'Internale server error' }
							   return	res.send(response)
							} 

									req.io.sockets.in(to_user_id).emit('i_am_here',user);
									response={ status: 200, msg: 'parking keyword update succesfully'}
									return  res.send(response);
						})
					}).catch(function(err){
						console.log('error:', err);
						response={ status: 500, msg: 'Internal server error' }
						res.send(response)
					});
    })
})

router.post('/get_version', (req, res) => {
    var version = req.body.version
    Version.find((err,result)=>{
       if(result[0].version<=version)
       {
            response={ status: 200, msg: 'true'}
            return  res.send(response)  ; 
       }
       else
       {
            response={ status: 200, msg: 'false'}
            return  res.send(response)  ; 
       }    

    })
    // var newversion = Version({
    //  version: version,
    // })
    // newversion.save(function(version) {
    //  console.log("version save")
    // });
    
})

router.post('/logout_user', (req, res) => {
	var user_id = req.body.user_id ;
	UserDevice.updateMany({user_id:mongoose.Types.ObjectId(user_id)},{ $set: {update_on:new Date(),is_login : false } },function(err_update,update_all_logout_device) {
	  if(err_update) {
		  console.log(err_update)
		  var response={ status: 500, msg: 'Internale server error device id',data:[] }
			 return   res.send(response)
	  }
	  var response={ status: 200, msg: 'User Logout succesfully'}
			 return   res.send(response)
	})
})