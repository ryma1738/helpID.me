import React, { useState, useEffect, } from 'react';
import { Col, Container, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import { signup } from '../utils/api';


function Signup(props) {

    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pastNumber, setPastNumber] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function attemptSignup(e) {
        setErrorMessage("");
        e.preventDefault();
        if (password !== confirmPassword) {
            return setErrorMessage("Passwords do not match");
        }
        const response = await signup(username, phoneNumber, email, password);
        if (response.ok) {
            window.location = "/";
        } else if (response.status === 400) {
            const err = await response.json();
            setErrorMessage(err.errorMessage);
        } else if (response.status === 500) {
            alert("An Unknown Error has occurred, please try again.")
        }
    }

    function createPhoneNumber(value) {
        if (value.length === 3) {
            if (phoneNumber.charAt(phoneNumber.length - 1) !== "-") {
                return setPhoneNumber(value + "-");
            }
        } else if (value.length === 7) {
            if (phoneNumber.charAt(phoneNumber.length -1) !== "-") {
                return setPhoneNumber(value + "-");
            }
        }
        setPhoneNumber(value);
        
    }

    useEffect(() => {
        if (props.loggedIn) {
            window.location = "/"
        }
    }, []);
    return (
        <Container fluid="xxl">
            <Row className="d-flex justify-content-center align-items-center mt-5">
                <Col xl={4} md={6} sm={10} xs={11} className="loginDiv">
                    <h2 className="text-center mt-2">Sign Up</h2>
                    <form onSubmit={(e) => attemptSignup(e)}>
                        <div className="my-3">
                            <label htmlFor="username" >Username:</label> 
                            <input type="username" id="username" className="text-center" minLength={4} 
                            maxLength={40} placeholder="Username" required valid
                            onChange={(e) => setUsername(e.target.value)}></input>
                        </div>
                        <div className="my-3">
                            <label htmlFor="phoneNumber" >Phone Number:</label> <OverlayTrigger
                                key="depart"
                                placement="bottom"
                                overlay={
                                    <Tooltip id={`tooltip-depart`}>
                                        Your phone number will not be shared with anyone unless you chose to share it. 
                                    </Tooltip>
                                }
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                                </svg>
                            </OverlayTrigger>
                            <input type="tel" id="phoneNumber" className="text-center" value={phoneNumber} placeholder="888-888-8888"
                                minLength={12} maxLength={12} onChange={(e) => createPhoneNumber(e.target.value)}></input>
                        </div>
                        <div className="my-3">
                            <label htmlFor="email" >Email:</label>
                            <input type="email" id="email" className="text-center" minLength={10} maxLength={40} 
                            required placeholder="yourEmail@email.com" onChange={(e) => setEmail(e.target.value)}></input>
                        </div>
                        <div className="my-3">
                            <label htmlFor="password" >Password:</label>
                            <input type="password" id="password" className="text-center" minLength={6} maxLength={25} 
                            required placeholder="Password" onChange={(e) => setPassword(e.target.value)}></input>
                        </div>
                        <div className="my-3">
                            <label htmlFor="passwordConfirm" >Confirm Password:</label>
                            <input type="password" id="passwordConfirm" className="text-center" minLength={6} maxLength={25} 
                            required placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)}></input>
                        </div>
                        <p className="text-center text-danger">{errorMessage}</p>
                        <div className="d-flex justify-content-center align-items-center my-3">
                            <button type="submit" className="button">Sign Up</button>
                        </div>
                    </form>
                </Col>
            </Row>
            <Row className="mt-5 d-flex justify-content-center align-items-center" style={{ borderBottom: "5px solid var(--cyan)" }}>
                <p className="text-center">Have an account? <a href="/login" className="text-link">Login</a></p>
            </Row>
        </Container>
    );
}

export default Signup;