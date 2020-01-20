var  mongoose = require('mongoose');

const url = process.env.MONGODB_URI || ""  // this is a kind of mongodb config, mernstack is db name

try {
    mongoose.connect(url, {
        //useMongoClient: true
        useNewUrlParser: true  // solve error DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
    })    
} catch (error) {
    console.log(error)
}

module.exports = {

    User: require('../model/user_model'),
    FoodCategory:require('../model/food_category_model'),
    Food:require('../model/food_model'),
    Order:require('../model/order_model'),
    Resturants:require('../model/resturants_model'),
    Tables:require('../model/tables_model'),
    Table_status:require('../model/table_status_model'),
    UserDeviceInformation:require('../model/user_device_information'),
    OrderType:require('../model/order_type_model'),
    cuisinesCategory:require('../model/cuisines_serve_category_model'),
    tableReserveStatus:require('../model/table_reserve_status'),
    version:require('../model/version')
};