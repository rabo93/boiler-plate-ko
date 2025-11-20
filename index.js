const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');

const config = require('./config/key');

const {User} = require("./models/User");

// application/x-www-form-urlencoded 분석해서 가져올 수 있게 해주는 코드
app.use(bodyParser.urlencoded({extended: true}));
// application/json
app.use(bodyParser.json());



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
// 회원 가입할 때 필요한 정보들을 client에서 가져오면
// 그것들을 DB에 넣어준다.

// app.post('/register', (req, res) => {
//   const user = new User(req.body)
  
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
    // DB에 저장
    await user.save()
    // 성공 응답
    return res.status(200).json({ success: true })

  } catch (err) {
    // MongoDB duplicate email 에러 처리
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 이메일입니다."
      })
    }

    console.error('[/register] error:', err.message)
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
})

//------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})