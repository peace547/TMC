import React, { Component } from "react"
import { InputItem, List, Button, WhiteSpace, NavBar, ActivityIndicator, Toast } from "antd-mobile"
import axios from "axios"
import _find from 'lodash/find'
import '../../assets/mock.js'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      username: "",
      password: ""
    }
  }
  componentDidMount() {
    if (sessionStorage.getItem('loginInfo')) {
      this.props.history.replace({
        pathname: '/search'
      })
    }
  }

  onChange = input => e => {
    if (input === "password") {
      this.setState({
        password: e
      })
    } else {
      this.setState({
        username: e
      })
    }
  }

  showToast = text => {
    Toast.fail(text, 2)
  }

  login = () => {
    if (this.state.username && this.state.password) {
      axios.get("user.json").then(data => {
        this.setState({
          isLoading: true
        })
        let userList = data.data.list
        let obj = {
          username: this.state.username,
          password: this.state.password
        }
        if (_find(userList, obj)) {
          //Toast.success('登陆成功', 1)
          setTimeout(() => {
            this.props.history.push({
              pathname: "/search"
            })
          }, 2000)
          let loginInfo = {
            username: this.state.username,
            password: this.state.password
          }
          sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo))
        } else {
          this.showToast("账号或密码错误,请重新输入")
          this.setState({
            username: '',
            password: '',
            isLoading: false
          })
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      this.showToast("账号或者密码不能为空")
    }
  }

  render() {
    return (
      <div className="login">
        <NavBar mode="light">登录</NavBar>
        <div className="loginForm">
          <ActivityIndicator
            toast
            text="Loading..."
            animating={this.state.isLoading}
          />
          <List>
            <InputItem
              clear
              value={this.state.username}
              placeholder="用户名"
              onChange={this.onChange("username")}
            >
              <div className="iconfont icon-yonghu bigFont" />
            </InputItem>
            <InputItem
              clear
              placeholder="密码"
              type="password"
              value={this.state.password}
              onChange={this.onChange("password")}
            >
              <div className="iconfont icon-mima1 bigFont" />
            </InputItem>
          </List>
          <WhiteSpace />
          <Button type="" onClick={this.login}>
            登录
          </Button>
        </div>
      </div>
    )
  }
}

export default Login
