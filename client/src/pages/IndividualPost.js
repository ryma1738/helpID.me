import React, { useState, useEffect, } from 'react';
import { Col, Container, Row, Spinner, Modal } from "react-bootstrap";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { useParams } from 'react-router-dom';
import { getOnePost, getUserInfo, logout, createTip } from '../utils/api';
import { LazyLoadImage } from "react-lazy-load-image-component";


function IndividualPost(props) {
    const params = useParams();
    const [postInfo, setPostInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [showTipCreation, setShowTipCreation] = useState(false);
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [image, setImage] = useState(false);

    useEffect(async () => {
        if (!params.postId) {
            console.log(params.postId)
            alert("Unable to get Listing information. Returning to Listings.");
            window.location.replace("/");
            return;
        }
        if (props.loggedIn) {
            const response = await getUserInfo();
            if (response.ok) {
                const userData = await response.json();
                setUserInfo(userData);
            } else if (response.status === 401) {
                await logout();
                window.location.replace('/login');
                return;
            } else {
                setUserInfo(false);
            }
        }
        const response = await getOnePost(params.postId);
        if (response.ok && response.status === 200) {
            const postData = await response.json();
            setPostInfo(postData.data);
        } else if (response.status === 400) {
            const data = await response.json();
            alert(data.errorMessage);
            window.location.replace("/");
            return;
        } else if (response.status === 404) {
            alert("That Listing was not found. Returning to Listings.");
            window.location.replace('/');
            return;
        } else {
            alert("An Unknown Error has occurred. Returning to Listings.");
            window.location.replace("/");
            return;
        }
        const responseUser = await getUserInfo()
        if (responseUser.ok) {
            const userData = await responseUser.json();
            setUserInfo(userData); // This will be used to add an edit button to the users post if they are just viewing it.
        }
    }, [])


    function renderThumbNails() {
        let thumbs = [];
        if (postInfo.video) {
            thumbs.push(((
                <div id={0}>
                    <img
                        alt={postInfo.video}
                        key={postInfo.video}
                        src={"https://i.ytimg.com/vi/" + postInfo.video.split("embed/")[1] + "/maxresdefault.jpg"}
                        className="carouselThumbs"
                    />
                </div>
            )))
        }
        postInfo.images.map((image, index) => thumbs.push(
            <div>
                <LazyLoadImage
                    id={postInfo.video ? index + 1 : index}
                    key={postInfo.video ? index + 1 : index}
                    alt={"https://" + window.location.hostname + image}
                    src={image}
                    className="carouselThumbs"
                />
            </div>
        ));
        return thumbs;
    }

    function thumbScrollChange(index, item) {
        // credit: https://stackoverflow.com/questions/51403628/react-scroll-component-to-view-inside-overflow-hidden-element
        const divToScrollTo = document.getElementById(index);
        if (divToScrollTo) {
            divToScrollTo.scrollIntoView({ block: "end", inline: "center" });
        }
    }

    async function sendTip(e) {
        e.preventDefault();
        let formData = new FormData();
        formData.append("title", title);
        formData.append("subject", subject);
        formData.append("anonymous", anonymous);
        formData.append("id", postInfo._id);
        if (image) {
            const fileInput = document.querySelector("#image");
            formData.append("image", fileInput.files[0]); 
        }
        
        const response = await createTip(formData);
        console.log(response);
        if (response.ok) {
            setShowTipCreation(false);
            const tipData = await response.json();
            alert(tipData);
        } else {
            const tipData = await response.json();
            console.log(tipData, "error");
        }
    }

    return (
        <Container fluid="xxl" className="p-0">
            <Container fluid className="individualContainer">
                <Row>
                    {postInfo ? postInfo.video ?
                        <Carousel autoPlay={false} showArrows={true} infiniteLoop={true}
                            className="imageCarousel p-0" renderThumbs={renderThumbNails}
                            onChange={(index, item) => thumbScrollChange(index, item)}>
                            <div className="carouselVideoDiv">
                                <iframe src={postInfo.video}
                                    title="YouTube video player"
                                    id="YouTube"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                    className="carouselVideo">
                                </iframe>
                                {/*  */}
                            </div>
                            {postInfo.images.map(image => (
                                <div>
                                    <LazyLoadImage
                                        alt={"https://" + window.location.hostname + image}
                                        src={image}
                                        className="carouselImages"
                                    />
                                </div>
                            ))}

                        </Carousel> :
                        <Carousel autoPlay={false} showArrows={true} infiniteLoop={true}
                            className="imageCarousel p-0" renderThumbs={renderThumbNails}
                            onChange={(index, item) => thumbScrollChange(index, item)}>
                            {postInfo.images.map(image => (
                                <div>
                                    <LazyLoadImage
                                        alt={image}
                                        src={image}
                                        className="carouselImages"
                                    />
                                </div>
                            ))}
                        </Carousel> :
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" role="status" style={{ width: "75px", height: "75px", marginTop: "10vh" }}>
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>}
                </Row>
                <Row>
                    <div className="d-flex justify-content-center">
                        <h1 className="fs-1 pt-3 px-3 text-center individualTitle">{postInfo ? postInfo.title : null}</h1>
                    </div>
                    <div className="borderB_grey px-4">
                        <div className="pt-3 d-flex justify-content-between">
                            <p className="ps-lg-4 pe-2">{postInfo ? postInfo.subCategory ? postInfo.categoryId.category + " - " + postInfo.subCategory : `${postInfo.categoryId.category}` : null}</p>
                            <p className="pe-lg-4 text-end individualInfoDivs">{postInfo ? "Created by: " + postInfo.userId.username : null}</p>
                        </div>
                        <div className="pt-3 d-flex justify-content-between">
                            <p className="ps-lg-4 pe-2">{postInfo ? "Date of Incident: " + postInfo.date : null}</p>
                            <p className="pe-lg-4 text-end individualInfoDivs">{postInfo ? "Total Views: " + postInfo.views : null}</p>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center borderB_grey">
                        <p className="fs-5 pt-3 px-3">{postInfo ? postInfo.summary : null}</p>
                    </div>
                </Row>
                <Row className="pb-2" style={{ borderBottom: '4px solid var(--cyan)' }}>
                    <Col xs={2} >
                        <h2 className="pt-2 ps-md-4 ps-2">Tips</h2>
                    </Col>
                    <Col xs={10} className='d-flex justify-content-end align-items-center'>
                        {props.loggedIn && userInfo && userInfo.username !== postInfo.userId.username ? <><p className="pt-3 pe-2"> Know something?</p>
                            <button className="button mt-2" type="button" onClick={() => setShowTipCreation(true)}>Send a Tip</button></> : null}
                    </Col>
                </Row>
                <Row>
                    <div className="px-md-5 px-xs-3">
                        {postInfo ? postInfo.tips.length > 0 ? postInfo.tips.map(tip =>
                            <div className="showTips my-2 " key={tip._id} id={tip._id}>
                                <div className="d-flex justify-content-between">
                                    <p className="fs-4 px-3 borderB_grey">{tip.title}</p>
                                    <p className="px-3 pt-1 borderB_grey">{tip.createdAt}</p>
                                </div>
                                <p className=" ps-3">{tip.subject}</p>
                                <div className="d-flex justify-content-end">
                                    <p className="text-end px-3 mb-0 pb-1 tipUsername">By: {tip.userId.username}</p>
                                </div>
                            </div>)
                            : <div className="d-flex justify-content-center align-items-center" key="None Found" style={{ minHeight: "30vh" }}>
                                <Container fluid>
                                    <Row>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                                        </svg>
                                    </Row>
                                    <Row>
                                        <p className="text-center fs-1 mt-4">No Tips Found, be the first!</p>
                                    </Row>
                                </Container>
                            </div>
                            : null}
                    </div>
                </Row>
            </Container>
            <Modal size="lg" centered show={showTipCreation} onHide={() => {
                setShowTipCreation(false);
            }}>
                <Modal.Header closeButton className="modalForm" style={{ borderBottom: "5px solid var(--cyan)" }}>
                    <Modal.Title >Send A Tip</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalForm py-0">
                    <Container fluid>
                        <Row>
                            <p className="text-center my-2 borderB_cyan">This is not a comment section, please only send a tip if you think you have information that could help Identify the individual(s) involved.</p>
                        </Row>
                        <Row>
                            <Col xs={12} as="form" className="editAccountForm" onSubmit={(e) => sendTip(e)}>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <label htmlFor="title" >Title:</label>
                                        <input type="text" id="Title" className="text-center modalFormInput" minLength={4}
                                            maxLength={50} placeholder="Title" valid required
                                            onChange={(e) => setTitle(e.target.value)}>
                                        </input>
                                    </div>
                                </Row>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <textarea id="subject" value={subject} placeholder="Subject" style={{ width: "100%" }} className="px-2"
                                            minLength={12} maxLength={1000} rows="8" onChange={(e) => setSubject(e.target.value)} required></textarea>
                                    </div>
                                </Row>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex">
                                        <label htmlFor="image" >Image Upload:</label>
                                        <input type="file" id="image" accept=".jpg, .png, .jpeg" className="modalFormInput"
                                            onChange={(e) => setImage(!image)}></input>
                                    </div>
                                </Row>
                                <Row className="my-3 d-flex">
                                    <div className="d-flex align-items-center">
                                        <label htmlFor="anonymous" className="" >Would you like to remain Anonymous?:</label>
                                        <div className="form-check form-switch ms-auto" style={{border: "none"}}>
                                            <input type="checkbox" id="anonymous" value={anonymous} className="form-check-input px-3 fs-4"
                                                onChange={(e) => setAnonymous(e.target.value)}></input>
                                        </div>
                                    </div>
                                </Row>
                                <Row className="d-flex justify-content-center align-items-center my-3 pb-1">
                                    <button type="submit" className="button" style={{ maxWidth: "75%" }}>Apply Changes</button>
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default IndividualPost;