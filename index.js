const express = require('express')
const app = express()
const port = 3000

const mongoose = require('mongoose')

// 몽고DB 설치(npm install mongodb --save) 후 연결
mongoose.connect('mongodb+srv://bborara93_db_user:6iIG3Ho0yXkI8mGM@boilerplate.jvp0xbm.mongodb.net/?appName=boilerplate', {
useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('Hello World! localhost:3000 웹페이지에서 보여질 내용임~~~')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
