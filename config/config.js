// //defining config.js for using our database and node environment
// //for Local mongoDB Database

const config = {
    production: {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },

    default: {
        SECRET: "mysecretkey",
        DATABASE: "mongodb+srv://login-api:s6954ZAFLQ0ozAwn@cluster0.wmqic.mongodb.net/login-api?retryWrites=true&w=majority"
    }
}

exports.get = function get(env){
    return config[env] || config.default
}