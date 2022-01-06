import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Offcanvas, Modal, Alert } from "react-bootstrap";
import { checkNotifications, logout, getUserInfo, updateAccount, markAsRead, deleteNotification } from '../../utils/api';
import { createPhoneNumber } from '../../utils/helpers';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 

const Navigator = (props) => {

    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [showAccount, setShowAccount] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showNotifications, setShowNotifications] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleAccountClose = () => {
        setShowAccount(false);
        let unread = unreadNotifications;
        for (let i = 0; i < notifications.length; i++) {
            if (notifications[i].onReadDelete !== true && notifications[i].read === false) {
                markAsRead(notifications[i]._id);
                notifications[i].read = true;
                unread --;
            }
        }
        setUnreadNotifications(unread);
    };
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
                <a href="/" key="Listings">
                    View Listings
                </a>
            )
        },
        {
            html: props.loggedIn ? (
                <button type="button" className="noButton" key="Account" onClick={handleShowAccount}>
                    Account {unreadNotifications === 0 ? null : <span className="unreadNotifications px-1 fs-6">{unreadNotifications}</span>}
                </button>
            ) : (
                <a href="/login" key="login">
                        Login / Signup
                </a>
            )
        }
    ]

    async function checkNotify() {
        const response = await checkNotifications();
        if (response.status === 200) {
            const notificationData = await response.json();
            setNotifications(notificationData);
            let array = [];
            let unread = 0;
            for (let i = 0; i < notificationData.length; i++) {
                array.push(true);
                if (!notificationData[i].read) {
                    unread++;
                }
            }
            setUnreadNotifications(unread);
            setShowNotifications(array);
        } else {
            setNotifications([]);
        }
    }

    useEffect(async () => {
        if (props.loggedIn) {
            const response = await getUserInfo();
            if (response.ok) {
                const userData = await response.json();
                setUserInfo(userData);
                setEmail(userData.email);
                setUsername(userData.username);
                if (userData.phoneNumber) {
                    setPhoneNumber(userData.phoneNumber);
                }
                await checkNotify();
            }  
        }

        const interval = setInterval(async () => {
           await checkNotify();
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

    async function applyChanges(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not Match!");
            return;
        }
        const response = await updateAccount(username, email, password, phoneNumber);
        if (response.ok) {
            const userData = await response.json();
            if (userData.email === userInfo.email && userData.username === userInfo.username && userData.phoneNumber === userInfo.phoneNumber) {
                return;
            } else {
                setUserInfo(userData);
                alert("Account updated successfully!");
                setShowEdit(false);
            }
        } else {
            if (response.status === 400) {
                const userData = await response.json();
                alert(userData.errorMessage);
            } else if (response.status === 500) {
                alert("An Unknown error occurred, please try again.")
            } else {
                return;
            }
        }
    }

    async function removeNotification(id, index) {
        const response = await deleteNotification(id);
        if (response.ok) {
            let array = showNotifications;
            array[index] = false;
            setShowNotifications(array);
            await checkNotify();
        } else if (response.status === 400) {
            const notify = await response.json();
            console.log(notify.errorMessage)
        }
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
                                return (
                                    <>
                                        {index === 0 ? "" : "|"}
                                        <li className="navListItems" key={index}>
                                            {item.html}
                                        </li>
                                    </>
                                );
                            })}
                        </ul>
                    </div>
                </Col>
            </Row>
        </Container>
            <Offcanvas show={showAccount} onHide={handleAccountClose} backdrop={true} enforceFocus={false} 
            scroll={true} placement="end" className="accountOffCanvas">
                <Offcanvas.Header closeButton style={{borderBottom: "5px solid var(--cyan)"}}>
                    <Offcanvas.Title >{userInfo ? userInfo.username + "'s" : ""} Account</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <div className="accountSelection py-2 ps-3">
                        <a href="/" className="fs-5">Create a Listing</a>
                    </div>
                    <div className="accountSelection py-2 ps-3">
                        <a href="/" className="fs-5">View Your Listings</a>
                    </div>
                    <div className="accountSelection py-2 ps-3" onClick={() => {setShowEdit(true); setShowAccount(false);}}>
                        <button className="noButton fs-5">Edit Account</button>
                    </div>
                    <div className="accountSelection py-2 ps-3" onClick={() => signOff()}>
                        <button className="noButton fs-5">Sign Out</button>
                    </div>
                    <div className="py-2 ps-3">
                        <p className="fs-5">Notifications:</p>
                        {notifications.length === 0 ? 
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                                </svg>
                                <p className="fs-5 pt-2">You have no notifications.</p>
                            </div> : 
                        notifications.map((notification, index) => {
                            if (notification.postId) {
                                return (
                                    <div key={index + "notify"}>
                                        <Alert variant={notification.read ? "secondary" : "info"} className="pb-0" show={showNotifications[index]} onClose={() => removeNotification(notification._id, index)} dismissible>
                                            <p className="text-dark" onClick={() => {
                                                window.location.replace(`/listing/view/${notification.postId}`);
                                            }}>{notification.message}</p>
                                        </Alert>
                                    </div>
                                )
                            } else {
                                return (
                                    <div>
                                        <Alert variant={notification.read ? "secondary" : "info"} className="pb-0" show={showNotifications[index]} onClose={() => {removeNotification(notification._id, index)}} dismissible>
                                            <p className="text-dark">{notification.message}</p>
                                        </Alert>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
            <Modal size="lg" centered show={showEdit} onHide={() => {
                setShowEdit(false);
                setEmail(userInfo ? userInfo.email : "");
                setUsername(userInfo ? userInfo.username : "");
                setPhoneNumber(userInfo ? userInfo.phoneNumber ? userInfo.phoneNumber : "" : "");
                setPassword("");
                setConfirmPassword("");
            }}>
                <Modal.Header closeButton className="editAccountModal" style={{ borderBottom: "5px solid var(--cyan)" }}>
                    <Modal.Title >Your Account Info</Modal.Title>
                </Modal.Header>
                <Modal.Body className="editAccountModal py-0">
                    <Container fluid>
                        <Row>
                            <Col xs={12} as="form" className="editAccountForm" onSubmit={(e) => applyChanges(e)}>
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