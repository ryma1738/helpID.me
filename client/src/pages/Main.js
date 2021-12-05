import React, { useState, useEffect, } from 'react';
import { Col, Container, Row, Spinner } from "react-bootstrap";
import Maps from '../components/Maps';
import { getAllPosts } from '../utils/api';

function loading(width, height) {
    return (
        <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" style={{ width: width + "px", height: height + "px", marginTop: "10vh" }}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    )
}

const Main = (props) => {
    const [sort, setSort] = useState("");
    const [markers, setMarkers] = useState(null);
    const [posts, setPosts] = useState(loading(100, 100));
    const [limit, setLimit] = useState(20);
    const [center, setCenter] = useState([]); 
    const [mainMap, setMainMap] = useState(loading(75,75));
    const [selectorMap, setSelectorMap] = useState(loading(75, 75));

    

    function search() {

    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const response = await getAllPosts(pos.coords.longitude, pos.coords.latitude);
            if (!response.ok) {
                alert("Error loading posts, please try again.")
            } else {
                const postData = await response.json();
                setPosts(postData.posts.map(post => {
                    return (
                        <Col md={4} className="p-2">
                            <div className="postCards">
                                <Row className="d-flex justify-content-center">
                                {post.data.images.imageBase64 ? (
                                    <img
                                        src={"data:" + post.data.images.contentType + ";base64, " + post.data.images.imageBase64}
                                        className=""
                                    />
                                    ) : (
                                        <iframe src={post.data.video} 
                                            title="YouTube video player" 
                                            frameborder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                                        </iframe>
                                    )}

                                    
                                </Row>
                                <Row>
                                    <p className="text-center fs-5 px-1">{post.data.title}</p>
                                </Row>
                            </div>
                            
                            
                        </Col>
                    )
                }));
                setCenter([pos.coords.longitude, pos.coords.latitude]);
                setMarkers(postData.markers);
            }
        })
    }, [])
    useEffect(() => {
        if(markers) {
            setMainMap((
                <Maps markers={markers}
                    containerClassName="mainMap"
                    centerLat={center[1]} centerLon={center[0]}
                />
            ))
        }
        
    }, [markers])
    // useEffect(() => {
    //     if (center) {
    //         const lat = center[1];
    //         const lon = center[0];
    //         setSelectorMap((
    //             <Maps
    //                 marker={{
    //                     lat: lat,
    //                     lon: lon,
    //                     title: "Current Location"
    //                 }}
    //                 containerClassName="selectorMap"
    //                 centerLat={lat} 
    //                 centerLon={lon}
    //                 onChange={(latLon) => setCenter([latLon.lon, latLon.lat])}
    //             />
    //         ))
    //     }

    // }, [center])
    return (
        <Container fluid className="" style={{minHeight: "80vh"}}>
            <Row>
                <Col xxl={2} xs={12}>
                {/* Ad Space */}
                </Col>
                <Col xxl={8} xs={12}>
                    <Row className="d-flex justify-content-center align-items-center mt-3 mapRow" style={{height: "30vh"}}>
                        {mainMap}
                    </Row>
                    <Row className="mt-3 sortRow">
                        <Col xs={6} className='d-flex justify-content-start pb-2'>
                            <p className="my-auto pe-2">Items per Page:</p>
                            <select className="p-1" defaultValue={20}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </Col>
                       <Col xs={6} className='d-flex justify-content-end pb-2'>
                           <p className="my-auto pe-2">Sort by:</p>
                            <select className="p-1" onChange={(e) => setSort(e)} defaultValue="">
                                <option value="">Nearest To Location</option>
                                <option value="Most Recent">Most Recent</option>
                                <option value="Most Recent Inv">Most Recent (oldest to newest)</option>
                                <option value="Popular">Popular</option>
                                <option value="Popular Inv">Popular (least to greatest)</option>
                                <option value="Date of Incident">Date of Incident</option>
                                <option value="Date of Incident Inv">Date of Incident (oldest to newest)</option>
                            </select>
                       </Col>
                    </Row>
                    <Row>
                        <Col lg={3} md={4} xs={12} style={{borderRight: "5px solid var(--cyan)"}}>
                            {/* Search Criteria */}
                            {selectorMap}
                        </Col>
                        <Col lg={9} md={8} xs={12}>
                            <Row>
                                {posts}
                            </Row>
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