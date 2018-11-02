import React, { Component } from 'react'
import logo from '../../assets/img/banner.jpg'
import { Flex, DatePicker, List, WingBlank, WhiteSpace, Modal, SearchBar, Tabs, NavBar, Icon, ActivityIndicator } from 'antd-mobile'
import { Link } from 'react-router-dom'
import axios from 'axios'
import _uniq from "lodash/uniqBy"
import moment from 'moment'

const now = new Date()
now.setDate(now.getDate() + 7)

const tabs = [
  { title: '国内' },
  { title: '国外' }
]

function Home(props) {
  return (
    <div style={{ 'height': props.height }}>
      {props.list.filter(item => {
        return item.country === 'CN'
      }).map(i => (
        <List.Item
          key={i.city}
          onClick={ () => { props.onClick(i) }}>{i.cityCnName}
          <span className="gray middleFont">({i.city})</span>
        </List.Item>
      ))}
    </div>
  )
}

function Aboard(props) {
  return (
    <div style={{ 'height': props.height }}>
      {props.list.filter(item => {
        return item.country !== 'CN'
      }).map(i => (
        <List.Item
          key={i.city}
          onClick={ () => { props.onClick(i) }}>{i.cityCnName}
          <span className="gray middleFont">({i.city})</span>
        </List.Item>
      ))}
    </div>
  )
}

function SearchList(props) {
  return (
    props.listData.map(i => (
      <List.Item
        key={i.city}
        onClick={() => { props.onClick(i) }}>{i.cityCnName}
        <span className="gray middleFont">({i.city})</span>
      </List.Item>
    ))
  )
}

function LetterList(props) {
  let arr = []
  for (let i = 0; i < 26; i++) {
    if ( i !== 8 && i !== 20 && i !== 21) {
      arr.push(String.fromCharCode(65 + i))
    }
  }

  return (
    <div className="letter_list">
      {arr.map(item => (
        <span
          key={item}
          className={item === props.curLetter ? 'curLetter' : ''}
          onClick={() => props.onClickLetter(item)}>
          {item}
        </span>
      ))}
    </div>
  )
}

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fromDate: now,
      //toDate: now,
      showCountries: false,
      fromCity: {city: 'BJS', cityCnName: '北京', cityJianPin: 'BJ', cityQuanPinN: 'beijing', country: 'CN'},
      toCity: {city: 'SHA', cityCnName: '上海', cityJianPin: 'SH', cityQuanPinN: 'shanghai', country: 'CN'},
      allCountryList: [],
      countryList: [],
      first: true,
      searchList: [],
      curLetter: 'A',
      height: document.documentElement.clientHeight - 87, //屏幕height除去两部分固定高度
      isLoading: false
    }
  }

  componentDidMount() {
    if (!sessionStorage.getItem('loginInfo')) {
      this.props.history.replace({
        pathname: '/'
      })
    }
    if (sessionStorage.getItem('searchInfo')) {
      let info = JSON.parse(sessionStorage.getItem('searchInfo'))
      info.fromDate = moment(info.fromDate).toDate()
      this.setState(info)
    }
    function getAllCountries () {
      return axios.post("https://weixin.iflying.com/flights/search/citySearch", {
        initials: "",
        count: 9999
      })
    }
    function getACountries(params) {
      return axios.post("https://weixin.iflying.com/flights/search/citySearch", {
        initials: "A",
        count: 9999
      })
    }

    axios.all([getAllCountries(), getACountries()])
      .then(axios.spread((res1, res2) => {
        this.setState({
          allCountryList: res1.data.data,
          countryList: res2.data.data
        })
      }))
      .catch(err => {
        console.log(err)
      })
  }

  componentWillUnmount() {
    this.setState = (state,callback)=>{
      return
    }
  }

  clickLetter = (letter) => {  //点击字母查询城市列表
    this.setState({
      isLoading: true
    })

    axios.post('https://weixin.iflying.com/flights/search/citySearch', {
      initials: letter,
      count: 9999
    }).then(res => {
      let arr = _uniq(res.data.data, 'city')
      this.setState({
        countryList: arr,
        curLetter: letter,
        isLoading: false
      })
      console.log(res.data.data)
    }).catch(err => {
      console.log(err)
    })
  }

  showModal = (key, id) => (e) => {  // 点击打开搜索城市列表
    e.preventDefault() // 修复 Android 上点击穿透
    this.setState({
      [key]: true,
      first: id,
      isLoading: true
    })
    this.clickLetter('A')
  }

  onClose = key => () => {  // 点击关闭搜索城市列表
    this.setState({
      [key]: false,
      searchList: []
    })
  }

  choose = city => {  // 点击选择某个城市
    if (this.state.first) {
      this.setState({
        fromCity: city,
        showCountries: false
      })
    } else {
      this.setState({
        toCity: city,
        showCountries: false
      })
    }
    this.setState({
      searchList: []
    })
  }

  changeCity = () => {  // 交换出发地目的地
    if (this.state.fromCity.cityCnName === '出发地' || this.state.toCity.cityCnName === '目的地') {
      return
    }
    this.setState({
      fromCity: this.state.toCity,
      toCity: this.state.fromCity
    })
  }

  searchCity = (val) => {  // 搜索城市 模糊搜索
    let arr = this.state.allCountryList.filter(item => {
      return item.cityCnName.indexOf(val) !== -1
    })
    let cityArr  = _uniq(arr, "city")
    this.setState({
      searchList: cityArr
    })
  }

  search = () => {
    let obj = {
      fromCity: this.state.fromCity,
      toCity: this.state.toCity,
      fromDate: this.state.fromDate
    }
    sessionStorage.setItem('searchInfo', JSON.stringify(obj))
  }

  goBack = () => {
    if (!sessionStorage.getItem('loginInfo')) {
      this.props.history.goBack()
    }
  }

  render() {
    return (
      <div className="search">
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          style={{
            display: sessionStorage.getItem('loginInfo') ? 'none' : 'block'
          }}
          onLeftClick={this.goBack}
        >机票搜索</NavBar>
        <header>
          <img src={logo} className="search-banner" alt="logo" width="100%"/>
        </header>
        <div style={{ backgroundColor: '#fff' }}>
          <ActivityIndicator
            toast
            text="Loading..."
            animating={this.state.isLoading} />
          <Flex className="middleFont">
            <Flex.Item
              className="center padding"
              onClick={this.showModal('showCountries', true)}>{this.state.fromCity.cityCnName}
            </Flex.Item>
            <Flex.Item
              className="center"
              onClick={ this.changeCity }>
              <i className="iconfont icon-jiantou1-copy"></i>
            </Flex.Item>
            <Flex.Item
              className="center padding"
              onClick={this.showModal('showCountries', false)}>{this.state.toCity.cityCnName}
            </Flex.Item>
          </Flex>
        </div>
        <Modal
          popup
          visible={this.state.showCountries}
          onClose={this.onClose('showCountries')}
          animationType="slide-up"
          wrapClassName="search_page" >
          <List renderHeader=
            {() =>
              <div>
                <SearchBar
                  placeholder="输入你要搜索的城市"
                  showCancelButton
                  maxLength={10}
                  onChange={this.searchCity}
                  onCancel={this.onClose('showCountries')} />
                <div className="searchList">
                  <SearchList
                    onClick={this.choose}
                    listData={this.state.searchList} />
                </div>
                <Tabs
                  tabs={tabs}
                  initialPage={0}>
                  <Home
                    onClick={ this.choose }
                    list={ this.state.countryList }
                    height={ this.state.height } />
                  <Aboard
                    onClick={ this.choose }
                    list={ this.state.countryList }
                    height={ this.state.height } />
                </Tabs>
              </div>
            }>
          </List>
          <LetterList
            onClickLetter={this.clickLetter}
            curLetter={this.state.curLetter}/>
        </Modal>
        <List>
          <DatePicker
            value={this.state.fromDate}
            mode="date"
            onChange={fromDate => this.setState({ fromDate })}>
            <List.Item arrow="horizontal" className="listItem">出发日期</List.Item>
          </DatePicker>
          {/* <DatePicker
            value={this.state.toDate}
            mode="date"
            onChange={toDate => this.setState({ toDate })}>
            <List.Item arrow="horizontal" className="listItem">返回日期</List.Item>
          </DatePicker> */}
        </List>
        <WhiteSpace size="md"/>
        <WingBlank size="md">
          <Link 
            to={{pathname:"/list", state:{fromCity: this.state.fromCity, toCity: this.state.toCity, fromDate: this.state.fromDate}}} 
            className="am-button am-button-primary" onClick={ this.search }>搜索</Link>
        </WingBlank>
      </div>
    )
  }
}

export default Search
