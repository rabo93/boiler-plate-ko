const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser');

const config = require('./config/key');
const {User} = require("./models/User");

const cookieParser = require('cookie-parser');

// application/x-www-form-urlencoded 분석해서 가져올 수 있게 해주는 코드
app.use(bodyParser.urlencoded({extended: true}));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());

//----------------------------------------------------------------------
const mongoose = require('mongoose')
// 몽고DB 설치(npm install mongodb --save) 후 연결
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))
//----------------------------------------------------------------------
app.get('/', (req, res) => {
  res.send('Hello World! localhost:3000 이건 첫페이지 // nodemon install --start-dev 사용하면 서버 끄고 켜지 않아도 변경내용 확인 가능')
})

//----------------------------------------------------------------------
// [회원가입]
// 회원 가입할 때 필요한 정보들을 client에서 가져오면
// 그것들을 DB에 넣어준다.
// app.post('/register', (req, res) => {
//   const user = new User(req.body)
  
//   // 저장하기 전에 비밀번호 암호화 진행
  
//   user.save((err, userInfo) => {
//       if(err) return res.json( { success: false, err })
//       return res.status(200).json({
//       success: true
//     })
//   })
// })

//==> 위 코드로 postman으로 전송시 응답 에러가 자꾸 나서 아래의 코드로 변경 
app.post('/register', async (req, res) => {
  try {
    // 클라이언트에서 보낸 데이터로 User 인스턴스 생성
    const user = new User(req.body)
    // 콜백 넣지말고, 그냥 await만! (요즘 방식)
    const userInfo = await user.save()
    // 저장 성공시!
    return res.status(200).json({ success : true })

  } catch (err) {
    // 이메일 중복 에러 (unique index)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 이메일입니다."
      })
    }
    // 에러 메세지 표시
    console.error('[/register] 에러 메세지 :', err.message)
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
})

//------------------------------------------------------------------------
// [로그인]
// 1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
// 2. 요청된 이메일이 DB에 있다면 비밀번호가 맞는 비밀번호인지 확인
// 3. 비밀번호까지 맞다면 토큰 생성
// app.post('/login', (req, res) => {
  // 1번
  // User.findOne({ email : req.body.email }, (err, user) => { 
  //   // DB에 유저가 없을 경우
  //   if(!user) {
  //     return res.json({
  //       loginSuccess : false,
  //       message : "제공된 이메일에 해당하는 유저가 없습니다"
  //     })
  //   }
  // DB에 유저가 있을 경우 2번
  // user.comparePassword(req.body.password, (err, isMatch) => {
  //   if(!isMatch)
  //     return res.json({ loginSuccess : false, message : "비밀번호가 틀렸습니다."})
    
  //   // 비밀번호가 맞다면 3번
  //   user.generateToken((err, user) =>  {
  //     if(err) return res.status(400).send(err);
      
  //     // token을 저장 => 어디에? => 쿠키, 로컬스토리지 등..
  //     // 쿠키에 저장 => cookie-parser 라이브러리 설치 
  //     res.cookie("x_auth", user.token)
  //     .status(200)
  //     .json({ loginSuccess : true, userId : user._id})
  //   })
  // })
  
// ========> Mongoose 7에서는 findOne(query, callback) 방식이 완전히 금지됨. 아래의 async 코드로 전환.
app.post('/login', async (req, res) => {
  try {
    // 1번
    const user = await User.findOne({ email : req.body.email });
    // DB에 유저가 없을 경우
    if(!user) {
      return res.json({
        loginSuccess : false,
        message : "제공된 이메일에 해당하는 유저가 없습니다"
      })
    }

    // DB에 유저가 있을 경우 2번
    user.comparePassword(req.body.password, async (err, isMatch) => {
      if(err) return res.status(400).send(err)
      if(!isMatch) {
        return res.json({ loginSuccess : false, message : "비밀번호가 틀렸습니다."})
      }
      
      // 비밀번호가 맞다면 3번
      const updatedUser = await user.generateToken();

      // token을 저장 => 어디에? => 쿠키, 로컬스토리지 등..
      // 쿠키에 저장 => cookie-parser 라이브러리 설치 
      return res
        .cookie("x_auth", updatedUser.token)
        .status(200)
        .json({ loginSuccess : true, userId : updatedUser._id})
      })

  } catch(err) {
    return res.status(500).send(err);
  }
})











//------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})