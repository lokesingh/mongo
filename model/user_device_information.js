var  mongoose = require('mongoose');

var userdeviceInformationSchema = new mongoose.Schema({
	user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	device_type:{
		type:Number,
		default:''
	},
	device_token:{
		type:String,
		default:''
	},
	device_id:{
		type:String,
		default:''
	},
	is_login:{
		type:Boolean,
		default:false
	},
	last_login_time:{
		type:Date,
		default:''
	},
	create_on: {
    	type: Date,
    	default:''
	},
	update_on: {
	    type: Date,
	    default:''
	},
	is_deleted: {
	    type: Boolean,
	    default:false
	},is_active: {
	    type: Boolean,
	    default:true
	}

})
module.exports = mongoose.model('user_device_Information', userdeviceInformationSchema);