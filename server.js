var express = require("express");
var app = express();
var router = express.Router();   
var session = require('express-session');
var path = require("path");
var fileUpload = require('express-fileupload');
var server = require('https');
var fs = require('fs');
var forceSsl = require('express-force-ssl');
var crypto = require('crypto');
var config = require('./config.json');
var cookieParser = require('cookie-parser');
var sess; 
var cronJob = require('cron').CronJob;
var uniqid = require('uniqid'); 
var bodyParser = require('body-parser');
var services = require('./services/service') 
var User = services.User;
var Order = services.Order;
var Resturants = services.Resturants;
var UserDevice = services.UserDeviceInformation;
var helpers = require("./helpers/helpers");

var service = require('./services/service');
var Tables = service.Tables;
var mongoose = require('mongoose');  
/**** Set path for static assets *****/
app.use(express.static(__dirname, { dotfiles: 'allow' } ));
app.use(express.static(path.join(__dirname, 'uploads/')));
app.use(express.static(path.join(__dirname, 'uploads/*')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload()); 

/**** Set headers ****/
app.use(function (req, res, next) {
	
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    // Pass to next layer of middleware
    next();
});

/***** Bind server to https *****/


var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/fodo.ae/privkey.pem', 'utf8'),
  cert: fs.readFileSync('/etc/letsencrypt/live/fodo.ae/cert.pem', 'utf8'),
  ca:fs.readFileSync('/etc/letsencrypt/live/fodo.ae/chain.pem', 'utf8'),
  rejectUnauthorized: false
};

var Server = server.createServer(options,app);

/*** Start Socket connection ****/

var io = require('socket.io').listen(Server, {
   pingInterval: 10000,
   pingTimeout: 5000
});

io.on('connection', function(socket) {
	
  socket.on('error', function (err) {
		console.log(err);
   });

 // console.log("sockect connected1 ");
   
  socket.on('join_fodo',function(data){
	//  console.log("user joined socket "+data);
      var uid = data;
	  socket.user_id = uid;
      socket.join(uid);
	  
	  User.updateOne({_id:uid},{ $set: {is_online:true} },function(err_update,update_status) {
			
			 if(err_update){
				 console.log(err_update);
			 }
			 
			 io.sockets.in(uid).emit('join_fodo', "joined fodo success");
		});
  }); 
  
  
   socket.on('disconnect', function(){ 
        
		var user_id = socket.user_id;
		//console.log('disconnect')
		User.updateOne({_id:mongoose.Types.ObjectId(user_id)},{ $set: {is_online:false} },function(err_update,update_status) {
			
			 if(err_update){
				 console.log(err_update);
			 }
			io.sockets.in(user_id).emit('disconnect_fodo', "disconnect fodo success");
		});
		
		
	});

    
	/*order accepted from restaurant*/
	socket.on('order_confirm',function(data){
      var order_id = data.order_id;
	  var customer_id;
	  var order_type = data.order_type; 
	  var user_id =  data.user_id;
	  var estimated_time = data.prepared_time;
	  var type = data.type;
	  var order_accepted_time = data.order_accepted_time;
		var address = data.address;
		var  refrence_number = data.refrence_number
		var res_name = data.res_name 
		Order.findOne({_id:mongoose.Types.ObjectId(order_id)},{"user_id":1},function(err,get_order_detail){
			customer_id = get_order_detail.user_id
			if(err){
				if(err_update){
					console.log(err_update);
					data.status = 500 ;
					io.sockets.in(customer_id).emit('order_accepted',data);
					// resturant side emit 
					io.sockets.in(user_id).emit('order_accepted',data);
					return ;
				}
			}
			if(order_type==2){
						// here status updat according to condition like pick up order_type=2, drive through = 3
				Order.updateOne({_id:mongoose.Types.ObjectId(order_id)},{ $set: {estimated_delivery_time:estimated_time,order_accept_time:new Date(),order_status:1} },function(err_update,update_status) {
					
					if(err_update){
						console.log(err_update);
						data.status = 500 ;
						io.sockets.in(customer_id).emit('order_accepted',data);
						// resturant side emit 
						io.sockets.in(user_id).emit('order_accepted',data);
						return ;
					}
					
					data.status = 200 ;
					data.order_id = order_id;
					data.estimated_time = estimated_time;
					
					data.order_type = order_type;
					data.type=type;
					data.order_accepted_time  = order_accepted_time
					//data.address = address
					// resturant side emit 
					io.sockets.in(user_id).emit('order_accepted',data);
					// mobile side user emit
					socket.join(customer_id);
					io.sockets.in(customer_id).emit('order_accepted',data);
				
					/*send notification to customer*/
					
					UserDevice.findOne({user_id:mongoose.Types.ObjectId(customer_id),is_login:true}, function (err_device, user_device) {
						
						if (err_device) { 
							console.log(err_update);
							data.status = 500 ;
							io.sockets.in(customer_id).emit('order_accepted',data);
							// resturant side emit 
							io.sockets.in(user_id).emit('order_accepted',data);
							return ;
						}
						if(user_device)
						{
							var device_token = user_device.device_token
							var device_type = user_device.device_type;
						}else{
							var device_token = 0
							var device_type = 0
						}
						
						data.type=1
						helpers.pushNotification(device_token,device_type,"Order Accepted","Your order is accepted by '"+res_name+"' restuarant",1,estimated_time,order_id);
						
					});
				});
			}else if(order_type == 3){
				// here status updat according to condition like pick up type=0, drive through =3
				Order.updateOne({_id:mongoose.Types.ObjectId(order_id)},{ $set: {estimated_delivery_time:estimated_time,order_accept_time:new Date(),order_status:1} },function(err_update,update_status) {
					
					if(err_update){
						console.log(err_update);
						data.status = 500 ;
						io.sockets.in(customer_id).emit('order_accepted',data);
						// resturant side emit 
						io.sockets.in(user_id).emit('order_accepted',data);
						return ;
					}
					
					data.order_id = order_id;
					data.estimated_time = estimated_time;
					data.address= address;
					data.refrence_number = refrence_number;
					data.status = 200 ;
					data.order_type = order_type;
					data.type=type;
					data.order_accepted_time  = order_accepted_time
					// resturant side emit 
					io.sockets.in(user_id).emit('order_accepted',data);
					// mobile side user emit
					socket.join(customer_id);
					io.sockets.in(customer_id).emit('order_accepted',data);
					
				
					/*send notification to customer*/
					
					UserDevice.findOne({user_id:mongoose.Types.ObjectId(customer_id),is_login:true}, function (err_device, user_device) {
						
						if (err_device) { 
								console.log(err_update);
							data.status = 500 ;
							io.sockets.in(customer_id).emit('order_accepted',data);
							// resturant side emit 
							io.sockets.in(user_id).emit('order_accepted',data);
							return ;
						}
						if(user_device)
						{
							var device_token = user_device.device_token
							var device_type = user_device.device_type;
						}else{
							var device_token = 0
							var device_type = 0
						}
						
						helpers.pushNotification(device_token,device_type,"Order Accepted","Your order is accepted by '"+res_name+"' restuarant",1,estimated_time,order_id);
						
					});
				});
			} else{
					
					Order.updateOne({_id:mongoose.Types.ObjectId(order_id)},{ $set: {estimated_delivery_time:estimated_time,order_accept_time:new Date(),order_status:1} },function(err_update,update_status) {
						
						if(err_update){
							console.log(err_update);
							data.status = 500 ;
							io.sockets.in(customer_id).emit('order_accepted',data);
							// resturant side emit 
							io.sockets.in(user_id).emit('order_accepted',data);
							return ;
						}
						
						data.order_id = order_id;
						data.estimated_time =estimated_time;
						data.status = 200 ;
						data.order_type = order_type;
						data.type=type;
						data.order_accepted_time  = order_accepted_time
					//	console.log('acceptedtime',data.order_accepted_time )
						// resturant side emit 
						io.sockets.in(user_id).emit('order_accepted',data);
						// mobile side user emit
						socket.join(customer_id);
						io.sockets.in(customer_id).emit('order_accepted',data);
					//	console.log('custmer id',customer_id)
						/*send notification to customer*/
						
						UserDevice.findOne({user_id:mongoose.Types.ObjectId(customer_id),is_login:true}, function (err, user_device) {
							
							if (!user_device) { 
								return
							}
							if(user_device)
						    {
						  	   var device_token = user_device.device_token
							   var device_type = user_device.device_type;
						    }else{
							   var device_token = 0
							   var device_type = 0
						    }
							
							helpers.pushNotification(device_token,device_type,"Order Accepted","Your order is accepted by '"+res_name+"' restuarant",1,estimated_time,order_id);
							
						});
					});
				
			}
		})
 	}); 

	 socket.on('cancel_order_by_customer',function(data){
		var order_id = data.order_id;
		var user_id = data.user_id;
		var restuarant_id = data.restaurant_id;
		var table_id = data.table_id;
	
		Resturants.findOne({_id:restuarant_id}, function (err, restuarant_details) {
					 
			if (err) { 
				data.msg = "error";
				data.status = 500 ;
				io.sockets.in(customer_id).emit('cancel_order_by_customer',data);
				return
			  }
			  var rest_owner_id = restuarant_details.user_id
				// find table no
				Tables.findOne({_id:table_id}, function (err, table_details) {
					 
					if (err) { 
						data.msg = "error";
						data.status = 500 ;
						io.sockets.in(customer_id).emit('cancel_order_by_customer',data);
						return
					}
					var table_no = table_details.table_no
					  var rest_owner_id = restuarant_details.user_id  
						  // table status update
						Tables.updateOne({_id:table_id},{ $set: {update_on:new Date(),is_status:0} },function(err_table_update,update_table_status) {
							if(err_table_update){ 
								data.status = 500 ;
								data.msg = "error";
								io.sockets.in(user_id).emit('cancel_order_by_customer',data);
								return
							}  
							
							Order.updateOne({_id:order_id},{ $set: {update_on:new Date(),order_status:2} },function(err_update,update_status) {
								if(err_update){ 
									data.status = 500 ;
									data.msg = "error";
									io.sockets.in(user_id).emit('cancel_order_by_customer',data);
									return
								}
							
								data.status = 200 ;
								data.table_no = table_no;
								data.msg = "order cancelled successfully";
								 socket.join(user_id);
								io.sockets.in(user_id).emit('cancel_order_by_customer',data);
								io.sockets.in(rest_owner_id).emit('cancel_order_by_customer',data);
								
								
							})
						})
				})
		 });
	
	  })
 
	socket.on('ping_restuarant',function(data){
		var order_id = data.order_id ;
		var restaurant_id =  data.restaurant_id ;
		var customer_id = data.user_id ;
		var table_id= data.table_id
		var ping_msg = data.ping_msg ;
		
		Resturants.findOne({_id:restaurant_id}, function (err, restuarant_details) {
			if(err){
				data.status = 500 ;
				data.msg = "error";
				io.sockets.in(customer_id).emit('ping_restuarant',data);
			return 
			}
			var rest_owner_id = restuarant_details.user_id;
			//table no get
			Tables.findOne({_id:table_id}, function (err_table, table_details) {
				if(err){
					data.status = 500 ;
					data.msg = "error";
					io.sockets.in(customer_id).emit('ping_restuarant',data);
				return 
				}
				var table_no  = table_details.table_no ; 

				data.status = 200 ;
				data.msg = "ping sent successfully";
				data.table_no=table_no;
				io.sockets.in(rest_owner_id).emit('ping_restuarant',data);
				socket.join(customer_id);
				io.sockets.in(customer_id).emit('ping_restuarant',data);
		});

		});
	})

  	socket.on('order_delivered',function(data){
		var order_id = data.order_id;
		var res_owner_user_id=data.user_id
		var customer_id;
		var order_type = data.order_type;
		var type = data.type
		Order.findOne({_id:mongoose.Types.ObjectId(order_id)},function(err,get_order_detail){
			customer_id = get_order_detail.user_id
			if (err) { 
				data.msg = "error";
				data.status = 500 ;
				io.sockets.in(res_owner_user_id).emit('order_delivered',data);
				io.sockets.in(customer_id).emit('order_delivered',data);
				return
			}
			
			UserDevice.findOne({user_id:mongoose.Types.ObjectId(customer_id),is_login:true}, function (err_user_device, user_device) {
					
				if (err_user_device) { 
					data.msg = "error";
					data.status = 500 ;
					io.sockets.in(res_owner_user_id).emit('order_delivered',data);
					io.sockets.in(customer_id).emit('order_delivered',data);
					return
				}
				
				if(user_device)
				{
					var device_token = user_device.device_token
					var device_type = user_device.device_type;
				}else{
					var device_token = 0
					var device_type = 0
				}
				
				
				
				Order.updateOne({_id:mongoose.Types.ObjectId(order_id)},{ $set: {update_on:new Date(),order_delivered_time:new Date(),order_status:3} },function(err_update,update_status) {
					if(err_update){
						data.status = 500 ;
						data.msg = "error";
						io.sockets.in(res_owner_user_id).emit('order_delivered',data);
						io.sockets.in(customer_id).emit('order_delivered',data);
						return
					}
					data.estimated_time = new Date(get_order_detail.estimated_delivery_time)
					data.estimated_time= data.estimated_time.toString() ;
					data.order_accepted_time = get_order_detail.order_accept_time
					data.status = 200 ;
					data.msg = "order delivered";
					data.order_id = order_id;
					data.order_type = order_type;
					data.type=type
					data.order_delivered_time = new Date()
					
					io.sockets.in(res_owner_user_id).emit('order_delivered',data);
					socket.join(customer_id);
					io.sockets.in(customer_id).emit('order_delivered',data);
					helpers.pushNotification(device_token,device_type,"Order delivered","Your order is deliverd",3,'',order_id);
				})

			});
		})

  	});


  	socket.on('order_completed',function(data){
		var order_id = data.order_id;
		var customer_id,table_id ;
		var res_owner_user_id=data.user_id;
		var order_type = data.order_type;
		var type = data.type
		Order.findOne({_id:mongoose.Types.ObjectId(order_id)},function(err,get_order_detail){
			customer_id = get_order_detail.user_id
			if(get_order_detail.table_id!=''){
				table_id = get_order_detail.table_id
			}
			
			if (err) { 
				data.msg = "error";
				data.status = 500 ;
				io.sockets.in(res_owner_user_id).emit('order_completed',data);
				io.sockets.in(customer_id).emit('order_completed',data);
				return
			}
			
			UserDevice.findOne({user_id:customer_id,is_login:true}, function (err_device, user_device) {
						
				if (err_device) { 
					data.msg = "error";
					data.status = 500 ;
					io.sockets.in(customer_id).emit('order_completed',data);
					return
				}
				
				if(user_device)
				{
					var device_token = user_device.device_token
					var device_type = user_device.device_type;
				}else{
					var device_token = 0
					var device_type = 0
				}
				data.order_id = order_id;
				
				Order.updateOne({_id:order_id},{ $set: {update_on:new Date(),order_status:4} },function(err_order_update,update_status) {
					if(err_order_update){
						data.status = 500 ;
						data.msg = "error";
						io.sockets.in(customer_id).emit('order_completed',data);
						return
					}
					if(table_id!=''){
						//again table status update blank
						Tables.updateOne({_id:table_id},{ $set: {update_on:new Date(),is_status:0} },function(err_table_update,table_update_status) {
							
							if(err_table_update){
							
								var emit_data = {status:500}
								io.sockets.in(customer_id).emit('order_completed',emit_data);
								return ;
							}
						})
					}
						// get user device detail
						UserDevice.findOne({user_id:customer_id,is_login:true}, function (err_device, user_device) {
						
							if (err_device) { 
								data.msg = "error";
								data.status = 500 ;
								io.sockets.in(customer_id).emit('order_completed',data);
								return
							}
							
							if(user_device)
						     {
							   var device_token = user_device.device_token
							   var device_type = user_device.device_type;
						     }else{
							   var device_token = 0
							   var device_type = 0
						     }
							data.status = 200 ;
							data.msg = "order completed";
							data.order_type = order_type;
							data.type=type;
							data.order_completed_time = new Date().toString()
							data.estimated_time = new Date(get_order_detail.estimated_delivery_time)
							data.estimated_time= data.estimated_time.toString() ;
							data.order_accepted_time = get_order_detail.order_accept_time
							io.sockets.in(res_owner_user_id).emit('order_completed',data);
							socket.join(customer_id);
							io.sockets.in(customer_id).emit('order_completed',data);

							helpers.pushNotification(device_token,device_type,"Order completed","Your order is completed",4,'',order_id);
						})
					
				})	
			});
		})

  	});

  // order cancel by resturant owner
  socket.on('cancel_order_by_resturant_owner',function(data){
	var order_id = data.order_id;

	//resturant user_id
	var user_id = data.user_id;
	var restuarant_id = data.restuarant_id
		Order.findOne({_id:mongoose.Types.ObjectId(order_id)}, function (err, order_details) {
					
			if (err) { 
				data.msg = "error";
				data.status = 500 ;
				io.sockets.in(user_id).emit('reject_order_by_restaurant',data);
				io.sockets.in(customer_id).emit('reject_order_by_restaurant',data);
				return
			}
			data.estimated_time = order_details.estimated_delivery_time
			data.order_accepted_time = order_details.order_accept_time
			var customer_id = order_details.user_id
		
			// table status update
			if(order_details.table_id){
				Tables.updateOne({_id:order_details.table_id},{ $set: {is_status:0}},function (err_table, update_table_detail) {
					if (err_table) {
						console.log(err_table);
						var response={ status: 500, msg: 'Internale server error' }
						return  res.send(response)
					}  
				})
			}
				Order.updateOne({_id:mongoose.Types.ObjectId(order_id)},{ $set: {update_on:new Date(),order_status:5} },function(err_update,update_status) {
					if(err_update){
						data.status = 500 ;
						data.msg = "error";
						io.sockets.in(user_id).emit('reject_order_by_restaurant',data);
						io.sockets.in(customer_id).emit('reject_order_by_restaurant',data);
						return
					}
						// get user device detail
						UserDevice.findOne({user_id:customer_id,is_login:true}, function (err_device, user_device) {
						
							if (err_device) { 
								data.msg = "error";
								data.status = 500 ;
								io.sockets.in(customer_id).emit('order_completed',data);
								return
							}
							if(user_device)
						    {
							   var device_token = user_device.device_token
							   var device_type = user_device.device_type;
						    }else{
							   var device_token = 0
							   var device_type = 0
						    }
						 	data.status = 200 ;
							data.msg = "order cancelled successfully";
							data.order_id = order_id;
							
							io.sockets.in(user_id).emit('reject_order_by_restaurant',data);
							socket.join(customer_id);
							io.sockets.in(customer_id).emit('reject_order_by_restaurant',data);
							helpers.pushNotification(device_token,device_type,"Order rejected","Your order is rejected",2,'');
						})
				})

		});

  });
  //customer current location
   //customer current location
   socket.on('customer_current_location',function(data){
    var order_id = data.order_id;
    var restuarant_id = data.restaurant_id;
    var location = data.location;
    var user_id  = data.user_id;// customer id

    var order_id  = data.order_id;
    var user_lat = data.userLat
    var user_lng = data.userLong
	
  
    Resturants.findOne({_id:mongoose.Types.ObjectId(restuarant_id)}, function (err, restuarant_details) {
        if (err) { 
            data.msg = "error";
            data.status = 500 ;
            io.sockets.in(user_id).emit('customer_current_location',data);
            return
        }   
		
        Order.updateOne({_id:order_id},{$set:{ user_lat:user_lat,user_lng:user_lng}}, function (order_err, order_details) {
            if (order_err) { 
                data.msg = "error";
                data.status = 500 ;
                io.sockets.in(order_id).emit('customer_current_location',data);
                return
            }   
            data.status = 200 ;
            data.location = location;
            data.msg = "location fetch successfully";
			
				 var rest_owner_id = restuarant_details.user_id
			
           
			socket.join(user_id);
            io.sockets.in(user_id).emit('customer_current_location',data);
            io.sockets.in(rest_owner_id).emit('customer_current_location',data);
        })
     });    
  });
  //socket call on when customer available in parking i am here 
  	socket.on('drivethroughAcceptBY',function(data){
		
		var order_id = data.order_id;
		var restuarant_id = data.restaurant_id;
		var user_id // customer id;
		//get user id
		
		Order.findOne({_id:mongoose.Types.ObjectId(data.order_id)}, function (err, order_details) {
				
				user_id = order_details.user_id
				
					
			if (err) { 
				data.msg = "error";
				data.status = 500 ;
			
				io.sockets.in(user_id).emit('reject_order_by_restaurant',data);
				return
			}
	
				Resturants.findOne({_id:mongoose.Types.ObjectId(restuarant_id)}, function (err, restuarant_details) {
					
					if (err) { 
						data.msg = "error";
						data.status = 500 ;
						io.sockets.in(user_id).emit('drivethroughAcceptBY',data);
						return
					}		
					data.status = 200 ;
				
					data.msg = "Customer available in your parking";
				
						var rest_owner_id = restuarant_details.user_id
					
				

						//get customer name
						User.findOne({ _id: order_details.user_id},function (err, user) {
							if (err) {
								console.log(err);
							var	response={ status: 500, msg: 'Internale server error' }
							return	res.send(response)
							} 
							
							
								data.user_name =  user.user_name;
									socket.join(user_id);
								io.sockets.in(rest_owner_id).emit('i_am_here',data);
								io.sockets.in(user_id).emit('drivethroughAcceptBY',data);
						})
				})
		})
	})
	// single user 
	// single user 
	socket.on('is_login_device', function(data){ 
		var user_id = data.user_id;
		
		var device_token = data.device_token;

		UserDevice.findOne({user_id:mongoose.Types.ObjectId(user_id),is_login:true},function(err_login,result_login) {

		if(err_login){
		console.log(err_login);
		}
		console.log('login res',result_login)

		var login_data ={};
		login_data.msg ="Login device successfully"
		login_data.status =200;
		login_data.data = result_login
		io.sockets.in(user_id).emit('is_login_device', login_data);
		return
		});
	});
});

/*** Make io socket accessible to our router ***/
app.use(function(req,res,next){
    req.io = io;
    next();
});

/*** routitng statrt here ****/
app.use("/api/web",require("./controllers/api/web.controller"));
app.use("/api/mobile",require("./controllers/api/mobile.controller"));
app.get('/privacy_policy', function(req, res) {
    res.sendFile(path.join(__dirname + '/privacy_policy.html'));
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/*', function(req, res) {
     res.sendFile(path.join(__dirname,  'client/build','index.html'));
});

/**** Bind server to specifc port ****/


Server.listen(443,function(){
  console.log('Server listening at http://'+Server.domain+':'+Server.defaultPort);
}); 


var http = require('http');

http.createServer(function (req, res) {
  
  // return res.redirect('wss://' + req.headers.host + req.url)  
  
  console.log(req.headers['host'] + req.url);
  console.log(req.headers['host'] + req.url);
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80); 