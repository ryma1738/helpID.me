import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from "react-bootstrap";

const Main = () => {

    return (
        <Container fluid className="" style={{minHeight: "80vh"}}>
            <Row>
                <Col lg={4}>
                {/* Ad Space */}
                </Col>
                <Col lg={8}>
                {/* main */}
                </Col>
                <Col lg={4}>
                </Col>
            </Row>
        </Container>
    );
}

export default Main;