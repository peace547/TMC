import React from "react"
import ReactDOM from "react-dom"
import "antd-mobile/dist/antd-mobile.css"
import "./assets/css/common.css"
import "./assets/css/index.css"
import Search from "./components/plane/Search"
import Lists from "./components/plane/List"
import Order from "./components/plane/Order"
import Login from "./components/user/Login"
import registerServiceWorker from "./registerServiceWorker"
import FastClick from "fastclick"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import qs from "qs"
import axios from "axios"

if ("addEventListener" in document) {
  document.addEventListener(
    "DOMContentLoaded",
    function() {
      FastClick.attach(document.body)
    },
    false
  )
}
if (!window.Promise) {
  document.writeln(
    `<script src="https://as.alipayobjects.com/g/component/es6-promise/3.2.2/es6-promise.min.js"></script>`
  )
}

// document.body.addEventListener('touchstart', (e) => {
//   e.preventDefault()
// },{ passive: false, capture: true })

// axios.defaults.baseURL = "https://weixin.iflying.com/flights/"

//调接口配置
function requestInterceptor(config) {
  if (config.method === "post" && config.headers.post["Content-Type"] === "application/x-www-form-urlencoded") {
    config.data = qs.stringify(config.data)
  }
  return config
}

axios.interceptors.request.use(
  config => {
    return requestInterceptor(config)
  },
  err => {
    return Promise.reject(err)
  }
)

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/search" component={Search} />
      <Route path="/list" component={Lists} />
      <Route path="/order" component={Order} />
      <Route path="/" component={Login} />
    </Switch>
  </main>
)

ReactDOM.render(
  <BrowserRouter>
    <Main />
  </BrowserRouter>,
  document.getElementById("root")
)

registerServiceWorker()