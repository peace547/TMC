import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Flex, WhiteSpace, ListView, WingBlank, Modal, NavBar, Icon, Calendar, ActivityIndicator, PullToRefresh } from "antd-mobile"
import Bar from "./sub_component/Bar"
import axios from "axios"
import moment from "moment"


var CancelToken = axios.CancelToken
var source = CancelToken.source()

function Flight(props) {
  return (
    <div
      onClick={() => {
        props.click(props.flightData)
      }}
    >
      <WhiteSpace size="lg" />
      <Flex key={props.flightData.adultPrice} className="middleFont">
        <Flex.Item className="center">
          <div className="bigFont">
            {props.flightData.fromSegments[0].depEasyTime}
          </div>
          <div className="gray">
            {props.flightData.fromSegments[0].depAirport}
          </div>
        </Flex.Item>
        <Flex.Item className="center">
          <div className="littleFont">
            {props.flightData.fromSegments[0].time}
          </div>
          <div>
            <i className="iconfont icon-jiantou" />
          </div>
        </Flex.Item>
        <Flex.Item className="center">
          <div className="bigFont">
            {props.flightData.fromSegments[0].arrEasyTime}
          </div>
          <div className="gray">
            {props.flightData.fromSegments[0].arrAirport}
          </div>
        </Flex.Item>
        <Flex.Item className="center">
          <div className="highlight bigFont">{`￥${props.flightData.adultPrice +
            props.flightData.adultTax}`}</div>
          <WhiteSpace size="md" />
          <div className="infoColor smallFont">
            {props.flightData.fromSegments[0].seats === "A"
              ? ""
              : `剩余${props.flightData.fromSegments[0].seats}张`}
          </div>
        </Flex.Item>
      </Flex>
      <WhiteSpace size="md" />
      <WingBlank size="lg">
        <div className="highGray">
          {props.flightData.fromSegments[0].carrierCN}{" "}
          {props.flightData.fromSegments[0].flightNumber}{" "}
          {props.flightData.fromSegments[0].canbinClass === 1
            ? "经济舱"
            : "商务舱"}
        </div>
      </WingBlank>
      <WhiteSpace size="lg" />
    </div>
  )
}

function Policy(props) {
  return (
    <div className="gray" style={{ height: 260, overflow: "scroll" }}>
      <Flex>
        <Flex.Item className="padding littleFont">含税票价(元)</Flex.Item>
        <Flex.Item className="padding">
          <div>成人价</div>
          <div className="normalColor">
            {props.oneData.adultPrice + props.oneData.adultTax}
          </div>
        </Flex.Item>
        <Flex.Item className="padding">
          <div>儿童价</div>
          <div className="normalColor">
            {props.oneData.childPrice + props.oneData.childTax}
          </div>
        </Flex.Item>
      </Flex>
      <Flex>
        <Flex.Item className="padding littleFont">退票规则</Flex.Item>
        {props.refund.map(item => {
          return (
            <Flex.Item className="smallFont" key={item.explain}>
              <div>{item.explain}</div>
              <div className="normalColor littleFont">
                {item.amount === -1 ? "按航空公司规定" : item.amount}
              </div>
            </Flex.Item>
          )
        })}
      </Flex>
      <Flex>
        <Flex.Item className="padding littleFont">改签规则</Flex.Item>
        {props.change.map(item => {
          return (
            <Flex.Item className="smallFont" key={item.explain}>
              <div>{item.explain}</div>
              <div className="normalColor littleFont">
                {item.amount === -1 ? "按航空公司规定" : item.amount}
              </div>
            </Flex.Item>
          )
        })}
      </Flex>
      <Flex>
        <Flex.Item className="padding littleFont">行李额规则</Flex.Item>
        <Flex.Item className="smallFont">
          <div>是否提供</div>
          <div className="normalColor">
            {props.baggageRules.hasBaggage ? "是" : "否"}
          </div>
        </Flex.Item>
        <Flex.Item className="smallFont">
          <div>详情</div>
          <div className="normalColor">{`${props.baggageRules.bagCount}件${props.baggageRules.bagWeight}KG`}</div>
        </Flex.Item>
      </Flex>
    </div>
  )
}

class Lists extends Component {
  constructor(props) {
    super(props)
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    })
    this.state = {
      dataSource,
      refreshing: true,
      fromCity: props.location.state.fromCity,
      toCity: props.location.state.toCity,
      isLoading: true,
      height: document.documentElement.clientHeight,
      listData: [],
      showRules: false,
      showCalendar: false,
      baggageRules: {},
      change: [],
      refund: [],
      priceOrder: 0,
      timeOrder: 0,
      startTime: moment(props.location.state.fromDate).format("YYYY-MM-DD"),
      singleData: {}
    }
  }

  onRefresh = () => {
    this.setState({ refreshing: true, isLoading: true })
    this.getList(moment(this.state.startTime).format("YYYYMMDD"))
  };

  timeFormat(value) {
    const arr = value.split("").slice(-4)
    arr.splice(2, 0, ":")
    return arr.join("")
  }

  duration(totalTime) {
    //计算航程时间
    return (
      Math.floor(totalTime / 60) + "h" + (totalTime % 60 === 0 ? "" : (totalTime % 60) + "m")
    )
  }

  formatBaggage(baggage) {
    //格式化行李额数据
    const result = []
    const ruleArr = baggage.split(";")
    ruleArr.forEach(item => {
      if (item === "-") {
        result.push({ count: 0, weight: 0 })
      } else {
        result.push({ count: item.split("-")[0], weight: item.split("-")[1] })
      }
    })
    return result
  }

  showModal = key => e => {
    //打开日历 和 航班规则
    e.preventDefault()
    this.setState({
      [key]: true
    })
  }

  onClose = key => () => {
    this.setState({
      [key]: false
    })
  }

  onPress = () => {
    // 下单界面 路由传参（航班规则）
    this.setState({
      showRules: false
    })
    let obj = Object.assign(this.state.singleData, {fromCity: this.state.fromCity, toCity: this.state.toCity})
    this.props.history.push({
      pathname: "/order",
      state: { data: obj }
    })
  }

  openRules = data => {
    // 显示航班规则
    const baggage = this.formatBaggage(data.rule.baggage)
    data.rule.bagCount = baggage[0].count
    data.rule.bagWeight = baggage[0].weight
    this.setState({
      showRules: true,
      baggageRules: data.rule,
      change: data.rule.change,
      refund: data.rule.refund,
      singleData: data
    })
  }

  // formatRules (rule) {
  //   const result = []
  //   const ruleArr = rule.split('-')
  //   let str = ''
  //   for (let i = 0; i < ruleArr.length - 1; i += 2) {
  //     str = `起飞前${ruleArr[i + 1]}`

  //     if (ruleArr[i - 1] === undefined) {
  //       result.push([str + '小时外', ruleArr[i]])
  //     } else {
  //       result.push([`${str}小时至${ruleArr[i - 1]}小时`, ruleArr[i]])
  //     }
  //   }
  //   str = ruleArr.pop()
  //   if (str === '*') {
  //     result.push(['起飞后', '不允许'])
  //   } else if (str === '') {
  //     result.push(['起飞后', '按航空公司规定'])
  //   }
  //   return result
  // }

  openCalendar = () => {
    // 打开日历
    this.setState({
      showCalendar: true
    })
  }

  onCancel = () => {
    //document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY
    this.setState({
      showCalendar: false
    })
  }

  onConfirm = startTime => {
    //修改日期 重新查询
    //document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY
    this.setState({
      showCalendar: false,
      startTime: moment(startTime).format("YYYY-MM-DD"),
      isLoading: true
    })
    this.getList(moment(startTime).format("YYYYMMDD"))
  }

  goBack = () => {
    this.props.history.goBack()
  }

  getSortedList = (sortedList, priceOrder, timeOrder) => {
    // 子组件调用更新list
    let listData = sortedList
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(listData),
      listData,
      priceOrder,
      timeOrder
    })
  }

  getList(time) {
    const hei = document.documentElement.clientHeight - ReactDOM.findDOMNode(this.lv).parentNode.offsetTop - 86 //除去固定两部分高度
    axios.post("https://weixin.iflying.com/flights/search/index", {
        tripType: 1,
        fromCity: this.state.fromCity.city,
        toCity: this.state.toCity.city,
        fromDate: time,
        retDate: "",
        adultNum: 1,
        childNum: 0
      }, {
        cancelToken: source.token
      })
      .then(res => {
        let listData = res.data.data.flights
        let carries = res.data.data.airCompany
        let airline_info = res.data.data.airline_info
        listData.forEach(item => {
          item.fromSegments.forEach(cur => {
            cur.time = this.duration(cur.duration)
            cur.depEasyTime = this.timeFormat(cur.depTime)
            cur.arrEasyTime = this.timeFormat(cur.arrTime)
            carries.forEach(carry => {
              if (carry.airlinecode === cur.carrier) {
                cur.carrierCN = carry.airlineNameCN
              }
            })
            airline_info.forEach(line => {
              if (cur.depAirport === line.code) {
                cur.depAirport = line.codeCn
              }
              if (cur.arrAirport === line.code) {
                cur.arrAirport = line.codeCn
              }
            })
          })
        })
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(listData),
          isLoading: false,
          height: hei,
          listData: listData,
          priceOrder: 0,
          timeOrder: 0,
          refreshing: false
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  onScroll(e) {
    const top = e.target.scrollTop

    console.log(top)
  }

  componentDidMount() {
    this.getList(moment(this.state.startTime).format("YYYYMMDD"))
  }

  componentWillUnmount() {
    source.cancel('Operation canceled by the user.')
  }
  
  render() {
    const separator = (sectionID, rowID) => (
      <div key={rowID} style={{ borderTop: "3px solid #ECECED" }} />
    )
    let length = this.state.listData.length, row, index = 0
    if (index < 0) {
      row = () => {
        return <div className="center">暂无结果</div>
      }
    } else {
      row = (rowData, sectionID, rowID) => {
        if (index < length) {
          const obj = this.state.listData[index]
          index++
          return <Flight flightData={obj} click={this.openRules} />
        }
      }
    }

    return (
      <div>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={this.goBack}
        >
          {this.state.fromCity.cityCnName} <i className="iconfont icon-jiantou1-copy" /> {this.state.toCity.cityCnName}
        </NavBar>
        <div onClick={this.openCalendar} className="calendarTop">
          修改机票日期
          <div style={{ float: "right" }}>{this.state.startTime}</div>
        </div>
        <ListView
          ref={el => (this.lv = el)}
          dataSource={this.state.dataSource}
          onScroll={this.onScroll}
          renderFooter={() => (
            <div className="center">
              {!this.state.isLoading ? this.state.listData.length === 0 ? "当天没有相关机票记录，请修改日期重新搜索" : "完成" : "加载中..."}
            </div>
          )}
          renderRow={row}
          renderSeparator={separator}
          style={{
            height: this.state.height,
            overflow: "auto"
          }}
          pullToRefresh={
            <PullToRefresh
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
          }
        />
        <Calendar
          type="one"
          visible={this.state.showCalendar}
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          defaultDate={new Date(this.state.startTime)}
          defaultValue={[new Date(this.state.startTime)]}
        />
        <Bar
          loading={this.state.isLoading}
          priceOrder={this.state.priceOrder}
          timeOrder={this.state.timeOrder}
          list={this.state.listData}
          onClick={this.getSortedList.bind(this)}
        />
        <ActivityIndicator
          toast
          text="Loading..."
          animating={this.state.isLoading}
        />
        <Modal
          wrapClassName="ruleModal"
          visible={this.state.showRules}
          transparent
          onClose={this.onClose("showRules")}
          title="查看详情"
          footer={[{ text: "确认下单", onPress: this.onPress }]}
        >
          <Policy
            oneData={this.state.singleData}
            refund={this.state.refund}
            change={this.state.change}
            baggageRules={this.state.baggageRules}
          />
        </Modal>
      </div>
    )
  }
}

export default Lists
