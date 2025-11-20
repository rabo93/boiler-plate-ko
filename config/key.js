if(process.env.NODE_ENV === 'production') {
    module.exports = require('./prod'); //HEROKU
} else {
    module.exports = require('./dev'); //LOCAL
}