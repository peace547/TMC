import React, { Component } from 'react'
import { Flex, Menu, ActivityIndicator } from 'antd-mobile'

// 列表条件筛选 假数据
const data = [
  {
    value: '1',
    label: '舱位',
    children: [
      {
        label: '经济舱',
        value: '1',
      },
      {
        label: '商务舱',
        value: '2',
      }, {
        label: '头等舱',
        value: '3',
      }],
  }, {
    value: '2',
    label: '起飞时间',
    children: [
      {
        label: '00:00-06:00',
        value: '1',
      }, {
        label: '06:00-12:00',
        value: '2',
      }, {
        label: '12:00-18:00',
        value: '3',
      }, {
        label: '18:00-24:00',
        value: '4',
      }],
  },
  {
    value: '3',
    label: '到达机场',
    children: [
      {
        label: '宁波机场',
        value: '1',
      },
    ],
  },
  {
    value: '4',
    label: '出发机场',
    children: [
      {
        label: '杭州机场',
        value: '1',
      },
    ],
  },
  {
    value: '5',
    label: '航空公司',
    children: [
      {
        label: '南航',
        value: '1',
      },
    ],
  },
]

function PriceCom(props) {
  if (props.priceOrder === 1) {
    return (
      <div className="highlight">
        <i className="iconfont icon-paixu-sheng"></i>低->高
      </div>
    )
  }
  else if (props.priceOrder === 2) {
    return (
      <div className="highlight">
        <i className="iconfont icon-paixu-jiang"></i>高->低
      </div>
    )
  }
  else {
    return (
      <div>
        <i className="iconfont icon-paixu1"></i>价格
      </div>
    )
  }
}

class Bar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startTime: props.time,
      priceOrder: props.priceOrder,
      timeOrder: props.timeOrder,
      show: false,
      initData: ''
    }
  }

  //组件实例化后和接受新属性时将会调用getDerivedStateFromProps。它应该返回一个对象来更新状态，或者返回null来表明新属性不需要更新任何状态。
  //只要父组件重新渲染，这些生命周期函数就会被调用，不管这些props是否与以前“不同”。正因为如此，使用任何一个去 无条件 地覆盖覆盖state都是不安全的。这样做会导致状态更新丢失。
  static getDerivedStateFromProps(nextProps, prevState) {
    return { listData: nextProps.lists, priceOrder: nextProps.priceOrder, timeOrder: nextProps.timeOrder }
  }

  //条件筛选 相关方法
  handleCondition = (e) => {
    e.preventDefault()
    this.setState({
      show: !this.state.show,
    })
    if (!this.state.initData) {
      setTimeout(() => {
        this.setState({
          initData: data,
        })
      }, 500)
    }
  }
  onChange = (value) => {
  }
  onOk = (value) => {
    this.onCancel()
  }
  onCancel = () => {
    this.setState({ show: false })
  }
  onMaskClick = () => {
    this.setState({
      show: false,
    })
  }

  priceSort = (sort) => {
    let priceOrder
    if (sort === 0) {
      this.setState({ //升序
        priceOrder: 1,
        timeOrder: 0
      })
      priceOrder = 1
    }
    if (sort === 1) { //降序
      this.setState({
        priceOrder: 2,
        timeOrder: 0
      })
      priceOrder = 2
    }
    if (sort === 2) { //默认
      this.setState({
        priceOrder: 1,
        timeOrder: 0
      })
      priceOrder = 1
    }
    let listData = [...this.props.list]
    listData.sort((obj1, obj2) => {
      let a = obj1['adultPrice'] + obj1['adultTax']
      let b = obj2['adultPrice'] + obj2['adultTax']
      if (sort === 0 || sort === 2) { //升序
        return a - b
      } else {
        return b - a
      }
    })
    this.props.onClick(listData, priceOrder, 0)  // onClick = { this.getSortedList.bind(this) }
  }

  timeSort = (sort) => {
    let timeOrder
    if (sort === 0) {
      this.setState({ //升序
        timeOrder: 1,
        priceOrder: 0
      })
      timeOrder = 1
    }
    else if (sort === 1) { //降序
      this.setState({
        timeOrder: 2,
        priceOrder: 0
      })
      timeOrder = 2
    }
    else if (sort === 2) { //默认
      this.setState({
        timeOrder: 1,
        priceOrder: 0
      })
      timeOrder = 1
    }
    let listData = [...this.props.list]
    listData.sort((obj1, obj2) => {
      let a = obj1.fromSegments[0].depTime
      let b = obj2.fromSegments[0].depTime
      if (sort === 0 || sort === 2) { //升序
        return a - b
      } else {
        return b - a
      }
    })
    this.props.onClick(listData, 0, timeOrder)
  }

  render() {
    const { initData, show } = this.state
    const menuEl = (
      <Menu
        className="multi-foo-menu"
        data={initData}
        onChange={this.onChange}
        onOk={this.onOk}
        onCancel={this.onCancel}
        height={document.documentElement.clientHeight * 0.4}
        multiSelect
        style={{bottom: 0}}
      />
    )
    const loadingEl = (
      <div className="loading_icon" style={{ height: document.documentElement.clientHeight * 0.4 }}>
        <ActivityIndicator size="large" />
      </div>
    )
    return (
      <div>
        <Flex className={this.props.loading ? 'bar' : 'bar animate'}>
          <Flex.Item
            className="center littlePadding"
            onClick={this.handleCondition}>
            <i className="iconfont icon-shaixuan"></i>筛选
          </Flex.Item>
          <Flex.Item
            className="center littlePadding"
            onClick={ () => this.priceSort(this.state.priceOrder)}>
            <PriceCom priceOrder={this.state.priceOrder}></PriceCom>
          </Flex.Item>
          <Flex.Item
            className={this.state.timeOrder !== 0 ? 'highlight center littlePadding' : 'center littlePadding'}
            onClick={ () => this.timeSort(this.state.timeOrder)}>
            <i className="iconfont icon-web-icon-"></i>
            {this.state.timeOrder === 2 ? '晚->早' : this.state.timeOrder === 1 ? '早->晚' : '出发时间'}
          </Flex.Item>
        </Flex>

        <div className={show ? 'multi-menu-active' : ''}>
          {show ? initData ? menuEl : loadingEl : null}
          {show ? <div className="menu-mask" onClick={this.onMaskClick} /> : null}
        </div>
      </div>
    )
  }
}

export default Bar