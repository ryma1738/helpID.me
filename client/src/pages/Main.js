import React, { useState, useEffect, } from 'react';
import { Col, Container, Row, Spinner } from "react-bootstrap";
import Maps from '../components/Maps';
import { getAllPosts, getCategories } from '../utils/api';
import {LazyLoadImage} from "react-lazy-load-image-component";

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
    const [categories, setCategories] = useState(() => null)
    const [sort, setSort] = useState(() => "");
    const [markers, setMarkers] = useState(() => null);
    const [posts, setPosts] = useState(() => loading(100, 100));
    const [limit, setLimit] = useState(() => 20);
    const [center, setCenter] = useState(() => [undefined, undefined]);
    const [maxDistance, setMaxDistance] = useState(() => 200);
    const [categoryId, setCategoryId] = useState(() => undefined);
    const [subCategory, setSubCategory] = useState(() => undefined);
    const [mainMap, setMainMap] = useState(() => loading(75,75));
    const [currentPage, setCurrentPage] = useState(() => 1);

    function initialLoad(latitude, longitude, totalItems) {
        setLimit(totalItems);
        setCenter([longitude, latitude]);
        load(true, latitude, longitude, totalItems);
    }
    
    function singlePost(id) {
        console.log(id)
    }

    async function load(initial, latitude, longitude, totalItems, sortBy, itemLimit) {
        setPosts(loading(100, 100));
        const response = initial ? 
                        await getAllPosts(longitude, latitude, maxDistance, undefined, totalItems) : 
                        await getAllPosts(center[0], center[1], maxDistance, currentPage,
                             itemLimit ? itemLimit : limit, sortBy ? sortBy : sort, categoryId, subCategory);;
        if (!response.ok) {
            alert("Error loading posts, please try again.")
            response.json().then(data => console.log(data))
        } else {
            const postData = await response.json();
            setPosts(postData.posts.map(post => {
                return (
                    <Col lg={6} md={12} className="p-2" key={post.data._id}>
                        <div className="postCards" onClick={() => singlePost(post.data._id)}>
                            <Row className="d-flex justify-content-center postCardsImageDiv">
                                {post.data.images.imageBase64 ? (
                                    <LazyLoadImage
                                        alt={post.data.title}
                                        src={"data:" + post.data.images.contentType + ";base64, " + post.data.images.imageBase64}
                                        className="postCardsImage"
                                    />
                                ) : (
                                    <iframe src={post.data.video}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                        className="postCardsImage">
                                    </iframe>
                                )}
                            </Row>
                            <Row className="d-flex justify-content-bottom text-center mx-2 pt-2" style={{ backgroundColor: "var(--main-color)" }}>
                                <div><p className="text-center fs-5 px-2">{post.data.title}</p></div>
                                <div><p> Date of Incident: {post.data.date}</p></div>
                                <div><p> Category: {post.data.categoryId.category} </p></div>
                                {post.data.subCategory ? (<p> Type: {post.data.subCategory} </p>) : null}
                            </Row>
                            <Row className="" style={{ position: "absolute", bottom: '0px', center: "0px", width: "100%" }}>
                                <Col xs={7}>
                                    <p className="text-start ps-2"> Posted by: {post.data.userId.username}</p>
                                </Col>
                                <Col xs={5}>
                                    <p className="text-end"> Views: {post.data.views}</p>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                )
            }));
            setMarkers(postData.markers);
        }
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const categories = await getCategories();
            setCategories(categories);
            initialLoad(pos.coords.latitude, pos.coords.longitude, 20);
        }, async (err) => {
            if (err.code === err.PERMISSION_DENIED) {
                const categories = await getCategories();
                setCategories(categories);
                initialLoad(undefined, undefined, 50);
                setSort(() => "Most Recent")
                setLimit(() => 50);
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
        
    }, [markers]);

    useEffect(() => {

    }, [posts])

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
                        <Col md={6} xs={12} className='d-flex justify-content-start pb-2'>
                            <p className="my-auto pe-2">Items per Page:</p>
                            <select className="p-1" value={limit} onChange={(e) => {
                                setLimit(e.target.value);
                                load(false, undefined, undefined, undefined, undefined, e.target.value);
                            }}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={75}>75</option>
                                <option value={100}>100</option>
                            </select>
                        </Col>
                       <Col md={6} xs={12} className='d-flex justify-content-end pb-2'>
                           <p className="my-auto pe-2">Sort by:</p>
                            <select className="p-1" onChange={(e) => {
                                setSort(e.target.value);
                                load(false, undefined, undefined, undefined, e.target.value, undefined);
                            }} value={sort}>
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
                        <Col lg={3} md={4} xs={12} className="searchCriteriaDiv">
                            {/* Search Criteria */}
                            <p> Search by Category:</p>
                            <select value={categoryId} className="p-1" onChange={(e) => setCategoryId(e.value)}  >
                                {categories}
                            </select>
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