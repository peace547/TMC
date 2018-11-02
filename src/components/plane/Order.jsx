import React, { Component } from 'react'
import { NavBar, Icon, List, Button, Flex, Modal, Steps, Toast, InputItem } from 'antd-mobile'
import BasicInputWrapper from './sub_component/PersonList'
import _pullAll from 'lodash/pullAll'
import moment from 'moment'
import axios from 'axios'
import '../../assets/mock.js'

const Item = List.Item
const Brief = Item.Brief
const Step = Steps.Step

function FlightDatail(props) {
  return (
    <div style={{ overflow: 'scroll' }}>
      <Steps className="left">
        <Step
          title={
            <div style={{ fontWeight: "normal" }}>
              {props.detail.fromSegments[0].depAirport}
              <span className="highlight"> {props.timeFormat(props.detail.fromSegments[0].depTime)}</span>
            </div>}
          description={
            <div className="gray smallFont">
              <div></div>
              <div>{props.detail.fromSegments[0].flightNumber} {props.detail.fromSegments[0].canbinClass === 1 ? '经济舱' : '商务舱'}</div>
              <div>{props.detail.fromSegments[0].carrierCN}</div>
            </div>}
          icon={<i className="iconfont bigFont icon-qifei"></i>} />
        <Step
          title={
            <div style={{ fontWeight: "normal" }}>
              {props.detail.fromSegments[0].arrAirport}
              <span className="highlight"> {props.timeFormat(props.detail.fromSegments[0].arrTime)}</span>
            </div>}
          icon={<i className="iconfont bigFont icon-jiangluo"></i>} />
      </Steps>
    </div>
  )
}

class Order extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orderData: props.location.state.data,
      showPriceDetail: false,
      showFlightDetail: false,
      priceArr: [
        {
          label: "成人含税价",
          value: props.location.state.data.adultPrice + props.location.state.data.adultTax
        },
        {
          label: "儿童含税价",
          value: props.location.state.data.childPrice + props.location.state.data.childTax
        }
      ],
      adult: 0,
      child: 0,
      total: 0,
      personList: [],
      selectedPersonList: [],
      contact: {}
    }
  }

  componentDidMount () {
    axios.get("person.json")
      .then(data => {
        this.setState({
          personList: data.data.list
        })
      })
      .catch(err => {
        console.log(err)
      })
  }
  componentWillUnmount() {
    this.setState = (state,callback)=>{
      return
    }
  }

  goBack = () => {
    this.props.history.goBack()
  };

  showModal = key => e => {
    // 显示价格详情 航班详情
    e.preventDefault()
    this.setState({
      [key]: true
    })
  };

  onClose = key => () => {
    this.setState({
      [key]: false
    })
  };

  timeFormat = time => {
    return `${time.substr(8, 2)}:${time.substr(10, 2)} ${time.substr(
      0,
      4
    )}.${time.substr(4, 2)}.${time.substr(6, 2)}`
  };

  checkBoxChange = item => {
    //乘机人员变化
    item.seleted = !item.seleted
    if (item.seleted) {
      this.state.selectedPersonList.push(item)
    } else {
      _pullAll(this.state.selectedPersonList, [item])
    }

    this.calculateTotal(this.state.selectedPersonList)
  };

  calculateTotal = list => {
    // 计算总价 传最终selectedPersonList
    var adult = 0, child = 0
    list.forEach(item => {
      if (moment(item.birthDate).isBefore(moment().subtract(12, "year"), "day")) {
        adult++
      } else {
        child++
      }
    })
    this.setState({
      selectedPersonList: list,
      adult: adult,
      child: child,
      total:
        adult * this.state.priceArr[0].value +
        child * this.state.priceArr[1].value
    })
  };

  getPersonList = list => {
    // 给子组件调用修改乘机人员列表
    this.setState({
      personList: list
    })
    let tempList = [] // 在子组件里删除以及修改信息后 重新计算
    list.forEach(item => {
      if (item.seleted) {
        tempList.push(item)
      }
    })
    this.setState({
      selectedPersonList: tempList
    })
    this.calculateTotal(tempList)
  };

  contactInput = input => e => {
    let obj = {}
    obj[input] = e
    this.setState({
      contact: Object.assign(this.state.contact, obj)
    })
  };
  
  toPay = () => {
    if (this.state.selectedPersonList.length === 0) {
      Toast.fail('请填写或选择乘机人员~', 2)
      return
    } else if (!this.state.contact.name || !this.state.contact.phone) {
      Toast.fail('请正确输入联系人信息~', 2)
      return
    } else {
      Toast.success('下单成功', 2)
    }
  }

  render() {
    return (
      <div>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={this.goBack}
        >
          {this.state.orderData.fromCity.cityCnName} <i className="iconfont icon-jiantou1-copy" /> {this.state.orderData.toCity.cityCnName}
        </NavBar>
        <List>
          <Item
            arrow="horizontal"
            thumb="https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=14950970,2601553202&fm=27&gp=0.jpg"
            multipleLine
            onClick={this.showModal("showFlightDetail")}
          >
            {" "}
            {this.state.orderData.fromCity.cityCnName} <i className="iconfont icon-jiantou1-copy" /> {this.state.orderData.toCity.cityCnName}
            <Brief>
              {this.state.orderData.fromSegments[0].depEasyTime} -{" "}
              {this.state.orderData.fromSegments[0].arrEasyTime}
            </Brief>
          </Item>
        </List>
        <BasicInputWrapper
          list={this.state.personList}
          selectedList={this.state.selectedPersonList}
          checkStatusClick={this.checkBoxChange}
          getPersonListClick={list => this.getPersonList(list)}
        />
        <List renderHeader={() => "联系人信息"} >
          <InputItem
            placeholder="请输入联系人姓名"
            value={this.state.contact.name}
            onChange={this.contactInput('name')}
          >
            姓名
          </InputItem>
          <InputItem
            placeholder="请输入联系人号码"
            type="phone"
            value={this.state.contact.phone}
            onChange={this.contactInput('phone')}
          >
            手机号
          </InputItem>
        </List>
        <Modal
          visible={this.state.showFlightDetail}
          transparent
          onClose={this.onClose("showFlightDetail")}
          title="航班详情"
          footer={[{ text: "确认", onPress: this.onClose("showFlightDetail") }]}
          wrapClassName="flightModal"
        >
          <FlightDatail
            detail={this.state.orderData}
            timeFormat={this.timeFormat}
          />
        </Modal>
        <Flex className="orderBar">
          <Flex.Item
            className="center largeFont"
            onClick={this.showModal("showPriceDetail")}
          >
            ￥ {this.state.total}
          </Flex.Item>
          <Flex.Item
            className="center"
            onClick={this.toPay}
          >
            <Button type="primary">去付款</Button>
          </Flex.Item>
        </Flex>
        <Modal
          popup
          wrapClassName="wrapClass"
          visible={this.state.showPriceDetail}
          onClose={this.onClose("showPriceDetail")}
          animationType="slide-up"
        >
          <List renderHeader={() => "价格详情(单位:元)"}>
            {this.state.priceArr.map((i, index) => (
              <Item
                className="listItem"
                key={index}
                extra={
                  <div>
                    <b>{i.value}</b> *{" "}
                    <span>
                      {index === 0 ? this.state.adult : this.state.child}
                    </span>
                  </div>
                }
              >
                {i.label}
              </Item>
            ))}
            <Item
              className="listItem"
              extra={<b className="highlight">￥{this.state.total}</b>}
            >
              总计
            </Item>
          </List>
        </Modal>
      </div>
    )
  }
}


export default Order