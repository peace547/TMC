let Mock = require('mockjs')
let time = new Date()
time.setFullYear(1993)
time.setMonth(10)
time.setDate(10)

// Mock.mock(rurl, template)
Mock.mock('person.json', {
    "list|1-3": [
      {
        "id|1-100.2": 1,
        "name|1": ["李明", "黄红", "张三", "王八"],
        "birthDate|1": [
          new Date(), time
        ],
        "idCardType|1": "NI",
        "idCardNumber|1": ["3306821989111230424", "330682199311100426"],
        "idCardExpired|1": [
          new Date()
        ],
        "gender|1": ["0", "1"],
        phone: /^1[0-9]{10}$/,
        "email|1": Mock.mock("@EMAIL()"),
        "national|1": ["中国", "美国", "英国"],
        seleted: false
      }
    ]
  })

  Mock.mock("user.json", {
    list: [
      {
        username: "123",
        password: "123"
      },
      {
        username: "456",
        password: "456"
      }
    ]
  })