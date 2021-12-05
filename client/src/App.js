import React, { useEffect, useState } from 'react';
import './style.css';
import { Routes, Route, BrowserRouter, } from 'react-router-dom';
import { renewLogin, getAllPosts } from './utils/api';
import Navigator from "./components/Navbar";
import Footer from "./components/Footer";
import Main from "./pages/Main";

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  let center = [];
  let markers = [];
  let data;

  useEffect(() => {
    // credit: https://stackoverflow.com/questions/65049812/how-to-call-a-function-every-minute-in-a-react-component/65049865
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)loggedIn\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieValue) {
      setLoggedIn(true)
    }
    const interval = setInterval(async () => {
      const response = await renewLogin();
      if (response.ok && document.cookie) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    }, 140000);
      
    return () => clearInterval(interval); 
    // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  return (
    <BrowserRouter as='main'>
      <Navigator loggedIn={loggedIn}/>
      <Routes>
        <Route exact path='/' element={<Main />} />
      </Routes>
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;
