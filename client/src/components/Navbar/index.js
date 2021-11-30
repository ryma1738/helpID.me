import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from "react-bootstrap";
import { checkNotifications } from '../../utils/api';

const Navigator = (props) => {

    const navItems = [
        {
            html: (
                <a href="/about">
                    About Us
                </a>
            )
        },
        {
            html: (
                <a href="/posts">
                    View Posts
                </a>
            )
        },
        {
            skip: props.loggedIn ? false : true,
            html: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"  viewBox="0 0 16 16">
                    <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1H5.5z" />
                    <path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
            ) // make this a drop down or modal
        },
        {
            html: props.loggedIn ? (
                <a href="/account">
                    Account
                </a>
            ) : (
                <a href="/login">
                        Login / Signup
                </a>
            )
        }
    ]
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        if (props.loggedIn) {
            
            checkNotifications().then(response => {
                if (response.ok) {
                    setNotifications(true);
                } else {
                    setNotifications(false);
                }
                console.log(response.status)
            }).catch(err => console.log(err));
            const interval = setInterval(async () => {
                const response = await checkNotifications();
                if (response.ok) {
                    console.log("worked")
                    setNotifications(true);
                } else {
                    setNotifications(false);
                }
                console.log(response.status)
            }, 300000);

            return () => clearInterval(interval);
        }
    }, [])
    
    return (
        <Container fluid className="navMain">
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
        </Container>
    );
}

export default Navigator;