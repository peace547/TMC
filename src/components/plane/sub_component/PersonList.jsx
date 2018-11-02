import React, { Component } from "react"
import { List, InputItem, Button, Flex, Modal, SwipeAction, Picker, DatePicker, Checkbox } from "antd-mobile"
import { createForm } from "rc-form"
import axios from "axios"
import moment from "moment"

let Mock = require("mockjs")

const CheckboxItem = Checkbox.CheckboxItem
const gender = [
  {
    label: "男",
    value: "0"
  },
  {
    label: "女",
    value: "1"
  }
]

function PersonList(props) {
  if (props.list.length === 0) {
    return <div className="center padding gray">暂无乘机人信息</div>
  }
  //onChange={this.props.checkStatusClick}
  return props.list.map((person, index) => (
    <SwipeAction
      style={{ backgroundColor: "gray" }}
      autoClose
      key={person.id}
      right={[
        {
          text: "删除",
          onPress: () => props.deleteHandler(index, person),
          style: { backgroundColor: "#F4333C", color: "white" }
        },
        {
          text: "编辑",
          onPress: () => props.editHandler(person),
          style: { backgroundColor: "#108ee9", color: "white" }
        }
      ]}
    >
      <CheckboxItem onChange={() => props.onChange(person)}>
        {person.name}
        <List.Item.Brief>{person.idCardNumber}</List.Item.Brief>
      </CheckboxItem>
    </SwipeAction>
  ))
}

function PersonInput(props) {
  return (
    <div style={{ overflow: "scroll" }}>
      <List>
        <InputItem
          placeholder="请输入姓名"
          value={props.personInfo.name}
          clear
          onChange={props.onChange("name")}
        >
          姓名
        </InputItem>
        <Picker
          data={gender}
          cols={1}
          value={[props.personInfo.gender]}
          onChange={props.onChange("gender")}
        >
          <List.Item arrow="horizontal">性别</List.Item>
        </Picker>
        <DatePicker
          value={props.personInfo.birthDate}
          mode="date"
          title="选择出生日期"
          minDate={moment()
            .subtract(100, "years")
            .toDate()}
          maxDate={new Date()}
          onChange={props.onChange("birthDate")}
        >
          <List.Item arrow="horizontal" className="listItem">
            出生日期
          </List.Item>
        </DatePicker>
        <Picker
          data={props.cardTypes}
          cols={1}
          value={[props.personInfo.idCardType]}
          onChange={props.onChange("idCardType")}
        >
          <List.Item arrow="horizontal">证件类型</List.Item>
        </Picker>
        <DatePicker
          value={props.personInfo.idCardExpired}
          mode="date"
          minDate={new Date()}
          maxDate={moment()
            .add(100, "years")
            .toDate()}
          title="选择证件有效期"
          onChange={props.onChange("idCardExpired")}
        >
          <List.Item arrow="horizontal" className="listItem">
            证件有效期
          </List.Item>
        </DatePicker>
        <InputItem
          placeholder="请输入证件号码"
          value={props.personInfo.idCardNumber}
          clear
          onChange={props.onChange("idCardNumber")}
        >
          证件号码
        </InputItem>
        <InputItem
          placeholder="请输入手机号"
          value={props.personInfo.phone}
          clear
          onChange={props.onChange("phone")}
        >
          手机号
        </InputItem>
        <InputItem
          placeholder="请输入邮箱"
          value={props.personInfo.email}
          clear
          onChange={props.onChange("email")}
        >
          邮箱
        </InputItem>
        <InputItem
          placeholder="请输入国籍"
          value={props.personInfo.national}
          clear
          onChange={props.onChange("national")}
        >
          国籍
        </InputItem>
      </List>
    </div>
  )
}

class FlightInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showPersonInfo: false,
      cardType: [],
      personInfo: {},
      isAdd: false
    }
  }

  componentDidMount() {
    axios
      .post("https://weixin.iflying.com/flights/order/getCardType") // 获取证件类型
      .then(res => {
        res.data.data.forEach(item => {
          item.label = item.name
          delete item.name
        })
        this.setState({
          cardType: res.data.data
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  validatePhone = (rule, value, callback) => {
    if (/^1[3|4|5|7|8]\d{1}\s\d{4}\s\d{4}$/.test(value)) {
      callback()
    } else {
      callback(new Error("正确输入手机号码"))
    }
  }

  delete = (index, person) => {
    //删除人员 传回父组件
    let beforeList = [...this.props.list]
    beforeList.splice(index, 1)
    this.props.getPersonListClick(beforeList)
  }

  submit = info => {
    //personInfo 保存提交信息 传回父组件
    let beforeList = [...this.props.list]
    if (this.state.isAdd) {
      info.id = Mock.Random.integer()
      beforeList.push(info)
      this.setState({
        showPersonInfo: false
      })
    } else {
      this.setState({
        showPersonInfo: false,
        personInfo: info
      })
      beforeList.forEach((item, index) => {
        if (item.id === info.id) {
          beforeList.splice(index, 1, info)
        }
      })
    }
    this.props.getPersonListClick(beforeList) //getPersonListClick={ (list) => this.getPersonList(list) }
  }

  edit = info => {
    //person
    info.birthDate = moment(info.birthDate).toDate()
    info.idCardExpired = moment(info.idCardExpired).toDate()

    let cur_info = { ...info }
    this.setState({
      showPersonInfo: true,
      personInfo: cur_info,
      isAdd: false
    })
  }

  addNewPerson = () => {
    this.setState({
      isAdd: true,
      showPersonInfo: true,
      personInfo: {
        idCardType: "NI",
        gender: "0",
        selected: false
      }
    })
  }

  handleChange = input => e => {
    //人员信息修改
    let obj = []
    if (input === "gender" || input === "idCardType") {
      obj[input] = e[0]
    } else {
      obj[input] = e
    }
    this.setState({
      personInfo: Object.assign(this.state.personInfo, obj)
    })
  }

  onClose = key => () => {
    this.setState({
      [key]: false
    })
  }

  render() {
    return (
      <form>
        <List
          renderHeader={
            <Flex>
              <Flex.Item>乘机人信息</Flex.Item>
              <Flex.Item className="right">
                <div onClick={this.addNewPerson}>
                  <Button type="ghost" size="small" inline>
                    新增乘机人
                  </Button>
                </div>
              </Flex.Item>
            </Flex>
          }
        >
          <PersonList
            deleteHandler={this.delete}
            editHandler={this.edit}
            onChange={this.props.checkStatusClick}
            list={this.props.list}
          />
        </List>
        <Modal
          visible={this.state.showPersonInfo}
          transparent
          title="修改信息"
          footer={[
            {
              text: "取消",
              onPress: () => {
                this.onClose("showPersonInfo")()
              }
            },
            {
              text: "确认",
              onPress: () => {
                this.submit(this.state.personInfo)
              }
            }
          ]}
          wrapClassName="personModal"
        >
          <PersonInput
            cardTypes={this.state.cardType}
            personInfo={this.state.personInfo}
            onChange={this.handleChange}
          />
        </Modal>
      </form>
    )
  }
}

const BasicInputWrapper = createForm()(FlightInfo)

export default BasicInputWrapper
