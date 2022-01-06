import React, { useState, useEffect, } from 'react';
import { Col, Container, Row, Spinner } from "react-bootstrap";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { useParams } from 'react-router-dom';
import { getOnePost, getUserInfo } from '../utils/api';
import { LazyLoadImage } from "react-lazy-load-image-component";

function IndividualPost(props) {
    const params = useParams();
    const [postInfo, setPostInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [view, setView] = useState(params.view || null);

    useEffect(async () => {
        if (params.view === "view") {
            const response = await getOnePost(params.postId);
            if (response.ok && response.status === 200) {
                const postData = await response.json();
                setPostInfo(postData.data);
            } else if (response.status === 400) {

            }
            const responseUser = await getUserInfo()
            if (responseUser.ok) {
                const userData = await responseUser.json();
                setUserInfo(userData); // This will be used to add an edit button to the users post if they are just viewing it.
            }
        } else if (params.view === "edit") { 

        } else {
            window.location.replace("/listing/view/" + params.postId);
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
                        src={"http://LazyLoadImage.youtube.com/vi/" + postInfo.video.split("embed/")[1] + "/0.jpg"}
                        className="carouselThumbs"
                    />
                </div>
            )))
        }
        const images = postInfo.images.map((image, index) => thumbs.push(
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
            divToScrollTo.scrollIntoView();
        }
    }

    return (
        <Container fluid>
            <Row>
                {postInfo ? postInfo.video ? 
                    <Carousel autoPlay={false} showArrows={true} infiniteLoop={true} 
                    className="imageCarousel p-0" renderThumbs={renderThumbNails}
                    onChange={(index, item) => thumbScrollChange(index, item)}>
                    <div>
                        <iframe src={postInfo.video}
                            title="YouTube video player"
                            id="YouTube"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            className="carouselImages">
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

            </Row>
            <Row>

            </Row>
        </Container>
    );
}

export default IndividualPost;