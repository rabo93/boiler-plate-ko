// mongoDB Schema 설정
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');



const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 중간에 스페이스(공백) 없애줌
        unique: 1
    },
    password: {
        type: String,
        // maxlength: 50 // bcrypt 해시는 60글자라 max 안두는게 안전
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }

})

// 저장 전 비밀번호 암호화 진행
userSchema.pre('save', function( next ) {
    var user = this; // 위 userSchema를 가리킴

    // 비밀번호가 변경되지 않았으면 그냥 통과
    if(!user.isModified('password')) return next()

    // 비밀번호 변경된 경우에만 해시 (https://www.npmjs.com/package/bcrypt에 적혀진 구조 확인)
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) return next(err)

        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err)
            user.password = hash

            next()
        })
    })    
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword:1234 / 암호화된 비밀번호:$2b$10$pNhkB.zMvSdNTwYfzAPbNe8f4mw2yQsKlKiv64Key/KAoIuVEYkwW 
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = async function(cb) {
    var user = this;

    //jsonwebtoken을 이용해서 token 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token 
    
    user.token = token

    // user.save(function(err, user) {
    //     if(err) return cb(err)
    //     cb(null, user)
    // })
    // => 콜백 버전 말고 async 버전으로!
    await user.save()
    return user;
}


const User = mongoose.model('User', userSchema)
module.exports = {User}

