import React, { useEffect, useState } from 'react';
import './style.css';
import { Routes, Route, BrowserRouter, } from 'react-router-dom';
import { renewLogin } from './utils/api';
import Navigator from "./components/Navbar";
import Login from "./pages/Login";
import Signup from './pages/Signup';
// import Footer from "./components/Footer";
import Main from "./pages/Main";
import IndividualPost from './pages/IndividualPost';
import NotFound from './pages/NotFound';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // credit: https://stackoverflow.com/questions/65049812/how-to-call-a-function-every-minute-in-a-react-component/65049865
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)loggedIn\s*\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieValue) {
      renewLogin().then(response => {
        if (response.ok) {
          setLoggedIn(true)
        } else {
          setLoggedIn(false);
        }
      })
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
        <Route path='/' element={<Main />} />
        <Route path='/login' loggedIn={loggedIn} element={<Login />} />
        <Route path='/signup' loggedIn={loggedIn} element={<Signup />} />
        <Route path="/listing/:view/:postId" element={<IndividualPost loggedIn={loggedIn}/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;
