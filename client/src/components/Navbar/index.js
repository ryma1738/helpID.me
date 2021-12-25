import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Offcanvas, Modal } from "react-bootstrap";
import { checkNotifications, logout, getUserInfo } from '../../utils/api';
import { createPhoneNumber } from '../../utils/helpers';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 

const Navigator = (props) => {

    const [notifications, setNotifications] = useState([]);
    const [showAccount, setShowAccount] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pastNumber, setPastNumber] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleEditClose = () => setShowEdit(false);
    const handleShowEdit = () => setShowEdit(true);

    const handleAccountClose = () => setShowAccount(false);
    const handleShowAccount = () => setShowAccount(true);

    const navItems = [
        {
            html: (
                <a href="/about" key="about">
                    About Us
                </a>
            )
        },
        {
            html: (
                <a href="/" key="posts">
                    View Posts
                </a>
            )
        },
        {
            skip: props.loggedIn ? false : true,
            html: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" key="notify"  viewBox="0 0 16 16">
                    <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1H5.5z" />
                    <path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
            ) // make this a drop down or modal
        },
        {
            html: props.loggedIn ? (
                <button type="button" className="noButton" key="Account" onClick={handleShowAccount}>
                    Account
                </button>
            ) : (
                <a href="/login" key="login">
                        Login / Signup
                </a>
            )
        }
    ]

    useEffect(async () => {
        if (props.loggedIn) {
            const response = await getUserInfo();
            if (response.ok) {
                const userData = await response.json();
                setUserInfo(userData);
                setNotifications(userData.notifications);
                setEmail(userData.email);
                setUsername(userData.username);
                if (userData.phoneNumber) {
                    setPhoneNumber(userData.phoneNumber);
                }
            }  
        }

        const interval = setInterval(async () => {
            const response = await checkNotifications();
            if (response.ok) {
                setNotifications(true);
            } else {
                setNotifications(false);
            }
            console.log(response.status)
        }, 300000);

        return () => clearInterval(interval);
    }, [props.loggedIn])
    
    function signOff() {
        handleAccountClose();
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='signOutDiv p-4'>
                        <h3 className='text-center'>Are you sure you want to sign out?</h3>
                        <div className='d-flex px-2' style={{ height: "8vh"}}>
                            <button type="button" className="button fs-5 mt-auto me-auto"
                                onClick={() => confirmSignOff()}>Sign Out</button>
                            <button type="button" className="button fs-5 px-4 mt-auto"
                                onClick={() => onClose()}>No</button>
                        </div>
                        
                        {/* create custom alert UI */}
                    </div>
                );
            }
        });
    }

    async function confirmSignOff() {
        await logout();
        window.location.replace('/');
    }

    return (
        <Container fluid className="navMain sticky-top">
        <Container fluid="xxl">
            <Row>
                <Col lg={5} md={6} sm={8} xs={10}>
                    <div className="d-flex justify-content-start align-items-center">
                        <img className="navbarLogo" alt="helpID.me Logo"/>
                    </div>
                </Col>
                <Col as="nav" lg={7} md={6} sm={4} xs={2} className="mt-auto">
                    <div className="">
                        <ul className="navList d-flex justify-content-end align-items-center" >
                            {navItems.map((item, index) => {
                                if (!item.skip) {
                                    return (
                                        <>
                                            {index === 0 ? "" : "|"}
                                            <li className="navListItems" key={index}>
                                                {item.html}
                                            </li>
                                        </>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                </Col>
            </Row>
        </Container>
            <Offcanvas show={showAccount} onHide={handleAccountClose} backdrop={false} enforceFocus={false} 
            scroll={true} placement="end" className="accountOffCanvas">
                <Offcanvas.Header closeButton style={{borderBottom: "5px solid var(--cyan)"}}>
                    <Offcanvas.Title >{userInfo ? userInfo.username + "'s" : ""} Account</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <div className="accountSelection py-2 ps-3">
                        <a href="/" className="fs-5">View Your Posts</a>
                    </div>
                    <div className="accountSelection py-2 ps-3" onClick={() => {setShowEdit(true); setShowAccount(false);}}>
                        <button className="noButton fs-5">Edit Account</button>
                    </div>
                    <div className="accountSelection py-2 ps-3" onClick={() => signOff()}>
                        <button className="noButton fs-5">Sign Out</button>
                    </div>
                    
                </Offcanvas.Body>
            </Offcanvas>
            <Modal size="lg" centered show={showEdit} onHide={() => setShowEdit(false)}>
                <Modal.Header closeButton className="editAccountModal" style={{ borderBottom: "5px solid var(--cyan)" }}>
                    <Modal.Title >Your Account Info</Modal.Title>
                </Modal.Header>
                <Modal.Body className="editAccountModal py-0">
                    <Container>
                        <Row>
                            <Col xs={12} as="form" className=" editAccountForm" onSubmit={(e) => e.preventDefault()}>
                                <h4 className="pt-2">Edit Account Details:</h4>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <label htmlFor="username" >Update Username:</label>
                                        <input type="username" id="username" className="text-center" minLength={4}
                                            maxLength={40} placeholder={username} valid
                                            onChange={(e) => setUsername(e.target.value)}>
                                        </input>
                                    </div>
                                </Row>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <label htmlFor="phoneNumber" >Update Phone #:</label>
                                        <input type="tel" id="phoneNumber" className="text-center" value={phoneNumber} placeholder={phoneNumber ? phoneNumber : "888-888-8888"}
                                            minLength={12} maxLength={12} onChange={(e) => setPhoneNumber(createPhoneNumber(e.target.value, phoneNumber))}></input>
                                    </div>
                                </Row>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <label htmlFor="email" >Update Email:</label>
                                        <input type="email" id="email" className="text-center" minLength={10} maxLength={40}
                                            placeholder={email} onChange={(e) => setEmail(e.target.value)}></input>
                                    </div>
                                </Row>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <label htmlFor="password" >Update Password:</label>
                                        <input type="password" id="password" className="text-center" minLength={6} maxLength={25}
                                            placeholder="Password" onChange={(e) => setPassword(e.target.value)}></input>
                                    </div>
                                </Row>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <label htmlFor="passwordConfirm" >Confirm Password:</label>
                                        <input type="password" id="passwordConfirm" className="text-center" minLength={6} maxLength={25}
                                            placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)}></input>
                                    </div>
                                </Row>
                                <Row className="d-flex justify-content-center align-items-center my-3 pb-1">
                                    <button type="submit" className="button" style={{maxWidth: "75%"}}>Apply Changes</button>
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Navigator;