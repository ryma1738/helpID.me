import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Navbar, Nav } from "react-bootstrap";
import logo from "../../assets/images/NavbarLogo.png";

const Navigator = (props) => {

    const navItems = [
        {
            title: "About Us",
            link: "/about"
        },
        {
            title: "View Posts",
            link: "/posts"
        },
        {
            title: props.loggedIn ? "Account" : "Login / Signup",
            link: props.loggedIn ? "/account" : "/login"
        }
    ]
    
    return (
        <Container fluid className="navMain">
            <Row>
                <Col lg={5} md={6} sm={8} xs={10}>
                    <div className="d-flex justify-content-start align-items-center">
                        <img className="navbarLogo" alt="helpID.me Logo"/>
                    </div>
                </Col>
                <Col as="nav" lg={7} md={6} sm={4} xs={2} className="mt-auto">
                    {/* <div className="navList d-flex justify-content-end align-items-center">
                        <Navbar expand="md">
                            <Container>
                                <Navbar.Toggle aria-controls="nav" />
                                <Navbar.Collapse id="nav">
                                    <Nav className="me-auto">
                                        <Nav.Link href="/about">About Us</Nav.Link>
                                        <Nav.Link href="/post">View Posts</Nav.Link>
                                        
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    </div> */}
                    <div className="">
                        <ul className="navList d-flex justify-content-end align-items-center" >
                            {navItems.map(item => {
                                return (
                                    <>
                                    {item.title === "About Us" ? "" : "|"}
                                    <li className="navListItems">
                                        <a href={item.link}>
                                            {item.title}
                                        </a>
                                    </li>
                                    </>
                                );
                            })}
                        </ul>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Navigator;