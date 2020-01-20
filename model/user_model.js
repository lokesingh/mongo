var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
//nested schema
var vehicle_detail_schema = new mongoose.Schema({
  vehicle_no:{
    type: String, default: null
  },
  vehicle_name:{
    type:String, default: null
  },
  vehicle_image:{ 
    type:String, default: null
  },
  vehicle_modal_no:{
    type:String, default: null
  },
  vehicle_type:{
    type:String, default: null // 2 wheeler and 4 wheller
  }
  ,
  is_primary:{
    type:Number, default: 0
  }
})
// address nested schema
var address_detail_schema  = new mongoose.Schema({
  zip_code: {
    type: String, default: ""
  },
  lat: {
    type: Number, default: 0
  },
  lng: {
    type: Number, default: 0
  },
  address1: {
    type: String, default:""
  },
  address2: {
    type: String, default: ""
  },
  country: {
    type: String, default: ""
  },
  state: {
    type: String, default: ''
  }, 
  is_primary:{
    type: Number, default: 0
  }
})
var userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true
  },
  social_id: {
    type: String, default: ""
  },
  user_first_name: {
    type: String, default: ""
  },
  user_last_name: {
    type: String, default: ""
  },
  user_image_url: {
    type: String, default: ""
  },
  user_contact_no: {
    type: Number, default: ""
  },
  user_email: {
    type: String,
    required: true,
    lowercase: true 
  },
  password: {
    type: String
  },role: {  // 1=user,11=admin(resturant owner),111=super_admin
    type: Number
  },description: {
    type: String, default: ""
  },is_verify: {
    type: Boolean
  },
  login_type: {
    type: Number // 1=app, 2=fb, 3=gmail 4= web
  },
  otp: {
    type: String
  },create_on: {
    type: Date
  },update_on: {
    type: Date
  },is_online: {
    type:Boolean,default:false
  },
  is_deleted: {
    type: Boolean,
    defult:false
  },is_active: {
    type: Boolean
  },

  user_vehicle_detail:[vehicle_detail_schema],
  address_detail:[address_detail_schema],
  expiry_date: {
    type: Date
  },
});

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await bcrypt.hashSync(this.password, 8);
    this.password = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
});


module.exports = mongoose.model('users', userSchema);