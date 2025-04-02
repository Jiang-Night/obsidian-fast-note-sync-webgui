import './style.css'
import './src/login.css'
import { setupLogin } from './src/login.js'

document.querySelector('#app').innerHTML = `
  <div id="loginContainer"></div>
`

setupLogin(document.querySelector('#loginContainer'))