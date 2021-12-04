import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from "react-bootstrap";
import Maps from '../components/Maps';


const Main = () => {
    const [sort, setSort] = useState("Most Recent");
    const [markers, setMarkers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [limit, setLimit] = useState(20);

    function changeSort() {

    }

    useEffect(() => {

    }, [])

    return (
        <Container fluid className="" style={{minHeight: "80vh"}}>
            <Row>
                <Col xxl={2} xs={12}>
                {/* Ad Space */}
                </Col>
                <Col xxl={8} xs={12}>
                    <Row className="d-flex justify-content-center align-items-center mt-3 mapRow" style={{height: "30vh"}}>
                        <Maps markers={[
                            {
                                "lat": 40.7843,
                                "lon": -110.854,
                                "_id": "61a42724733c5c1c5f7d13c1",
                                "title": "Internal Metrics Specialist"
                            },
                            {
                                "lat": 39.7997,
                                "lon": -110.8823,
                                "_id": "61a42720733c5c1c5f7ca2f6",
                                "title": "Dynamic Functionality Coordinator"
                            },
                            {
                                "lat": 41.3017,
                                "lon": -111.6194,
                                "_id": "61a42724733c5c1c5f7d0e94",
                                "title": "Future Identity Specialist"
                            },
                            {
                                "lat": 39.2897,
                                "lon": -111.7657,
                                "_id": "61a42723733c5c1c5f7cf242",
                                "title": "Dynamic Division Liaison"
                            },
                            {
                                "lat": 39.2688,
                                "lon": -111.8651,
                                "_id": "61a42723733c5c1c5f7cf535",
                                "title": "Direct Response Agent"
                            },
                            {
                                "lat": 39.4904,
                                "lon": -111.1216,
                                "_id": "61a42723733c5c1c5f7cefbd",
                                "title": "Chief Accountability Assistant"
                            },
                            {
                                "lat": 39.4924,
                                "lon": -112.9486,
                                "_id": "61a42722733c5c1c5f7ce0f9",
                                "title": "Dynamic Division Technician"
                            },
                            {
                                "lat": 41.3338,
                                "lon": -112.5934,
                                "_id": "61a42722733c5c1c5f7ce8a6",
                                "title": "International Functionality Planner"
                            },
                            {
                                "lat": 41.2954,
                                "lon": -111.3524,
                                "_id": "61a42721733c5c1c5f7cb499",
                                "title": "Human Infrastructure Officer"
                            },
                            {
                                "lat": 41.3373,
                                "lon": -111.4642,
                                "_id": "61a4271f733c5c1c5f7c83fc",
                                "title": "Customer Usability Analyst"
                            },
                            {
                                "lat": 39.2403,
                                "lon": -112.317,
                                "_id": "61a42722733c5c1c5f7ce32e",
                                "title": "Human Division Specialist"
                            },
                            {
                                "lat": 39.2348,
                                "lon": -111.7474,
                                "_id": "61a42722733c5c1c5f7cda23",
                                "title": "National Division Developer"
                            },
                            {
                                "lat": 39.7753,
                                "lon": -110.7592,
                                "_id": "61a42724733c5c1c5f7d10f1",
                                "title": "Dynamic Directives Assistant"
                            },
                            {
                                "lat": 39.6006,
                                "lon": -113.1766,
                                "_id": "61a42720733c5c1c5f7caa5d",
                                "title": "Global Accounts Director"
                            },
                            {
                                "lat": 41.0682,
                                "lon": -110.8931,
                                "_id": "61a4271f733c5c1c5f7c90e0",
                                "title": "Customer Research Facilitator"
                            },
                            {
                                "lat": 39.4551,
                                "lon": -113.0376,
                                "_id": "61a42723733c5c1c5f7cf1c0",
                                "title": "Internal Creative Associate"
                            },
                            {
                                "lat": 41.1545,
                                "lon": -110.9262,
                                "_id": "61a42720733c5c1c5f7ca152",
                                "title": "District Infrastructure Engineer"
                            },
                            {
                                "lat": 41.5396,
                                "lon": -111.7144,
                                "_id": "61a42724733c5c1c5f7d0d13",
                                "title": "Human Group Representative"
                            },
                            {
                                "lat": 41.1154,
                                "lon": -110.7683,
                                "_id": "61a42720733c5c1c5f7c9fe0",
                                "title": "Lead Configuration Coordinator"
                            },
                            {
                                "lat": 41.616,
                                "lon": -112.0799,
                                "_id": "61a42723733c5c1c5f7cfa21",
                                "title": "Corporate Interactions Architect"
                            }
                        ]} containerStyles={{height: `100%`, width: "90%" }}
                            centerLat={40.321024}
                            centerLon={-112.027238}/>
                    </Row>
                    <Row className="my-3 sortRow">
                        <Col xs={6} className='d-flex justify-content-start pb-2'>
                            <select className="p-1">
                                <option value="10">10</option>
                                <option selected value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </Col>
                       <Col xs={6} className='d-flex justify-content-end pb-2'>
                            <select className="p-1" onChange={changeSort}>
                                <option defaultChecked value="Most Recent">Most Recent</option>
                                <option value="Most Recent Inv">Most Recent (oldest to newest)</option>
                                <option value="Popular">Popular</option>
                                <option value="Popular Inv">Popular (least to greatest)</option>
                                <option value="Date of Incident">Date of Incident</option>
                                <option value="Date of Incident Inv">Date of Incident (oldest to newest)</option>
                            </select>
                       </Col>
                    </Row>
                    <Row>
                        <Col xxl={4} md={2} xs={12}>
                            {/* Search Criteria */}
                        </Col>
                        <Col xxl={4} md={2} xs={12}>
                            {/* Posts */}
                        </Col>
                    </Row>
                    <Row>
                        {/* page selector */}
                    </Row>
                {/* main */}
                </Col>
                <Col xxl={2} xs={12}>
                    {/* Ad Space */}
                </Col>
            </Row>
        </Container>
    );
}

export default Main;