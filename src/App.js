import React from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import Platform from './Platform.js';
import {ThemeContext} from './config/config.js';

const cookies = new Cookies();
const cookieID = "openITS-id";


class App extends React.Component {
  constructor() {
    super();
    if (!cookies.get(cookieID)) {
      let d = new Date();
      const id = Math.floor(Math.random() * 2 ** 16);
      d.setTime(d.getTime() + (3 * 365 * 24 * 60 * 60 * 1000)); // 3 years in the future
      cookies.set(cookieID, id, { path: "/", expires: d });
    }
    this.userID = cookies.get(cookieID);
  }

  render() {
    return (
      <ThemeContext.Provider value={this.userID}>
        <Platform />
      </ThemeContext.Provider>
    );
  }
}

export default App;
