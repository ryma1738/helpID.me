import React, { useState, useEffect, } from 'react';
import { Col, Container, Row, Spinner, Pagination} from "react-bootstrap";
import Maps from '../components/Maps';
import { getAllPosts, getCategories, getZipCoords } from '../utils/api';
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

function getSubCategories(categoryName) {
    switch (categoryName) {
        case "Assault/Threats":
            return (<>
                <option value="Assault/Threats" >Assault/Threats</option>
                <option value="Aggravated Assault" >Aggravated Assault</option>
            </>);
        case "Arson":
            return (<>
                <option value="Business" >Business</option>
                <option value="Private Property" >Private Property</option>
                <option value="Public Property" >Public Property</option>
            </>);

        case "Burglary":
            return (<>
                <option value="Business" >Business</option>
                <option value="Private Property" >Private Property</option>
            </>);

        case "Damaged Property":
            return (<>
                <option value="Private Vehicle" >Private Vehicle</option>
                <option value="Graffiti" >Graffiti</option>
                <option value="Business" >Business</option>
                <option value="Private Property" >Private Property</option>
                <option value="Public Property" >Public Property</option>
            </>);

        case "Kidnapping":
            return (<>
                <option value="Minor" >Minor</option>
                <option value="Adult" >Adult</option>
                <option value="Custody Dispute" >Custody Dispute</option>
                <option value="Custodial Interference" >Custodial Interference</option>
            </>);

        case "Larceny/Theft":
            return (<>
                <option value="Failure to Pay" >Failure to Pay</option>
                <option value="Pickpocket" >Pickpocket</option>
                <option value="Porch Theft" >Porch Theft</option>
                <option value="Purse Snatch" >Purse Snatch</option>
                <option value="Shoplift / Retail Theft" >Shoplift / Retail Theft</option>
                <option value="Striping a Vehicle for Parts" >Striping a Vehicle for Parts</option>
                <option value="Theft from Private Yards" >Theft from Private Yards</option>
            </>);

        case "Morals":
            return (<>
                <option value="Obscene Conduct/Lewdness" >Obscene Conduct/Lewdness</option>
            </>);

        case "Public Order":
            return (<>
                <option value="Riot" >Riot</option>
                <option value="Unlawful Assembly" >Unlawful Assembly</option>
            </>);

        case "Robbery":
            return (<>
                <option value="Bank/Financial Institution" >Bank/Financial Institution</option>
                <option value="Business" >Business</option>
                <option value="Street" >Street</option>
                <option value="Residential" >Residential</option>
            </>);

        case "Sexual Offenses/Rape":
            return (<>
                <option value="Adult" >Adult</option>
                <option value="Juvenile" >Juvenile</option>
            </>);

        case "Suspicious Activity":
            return (<>
                <option value="Suspicious Packages" >Suspicious Packages</option>
            </>);

        case "Traffic Offenses":
            return (<>
                <option value="Hit and Run" >Hit and Run</option>
                <option value="Fleeing" >Fleeing</option>
                <option value="Possible DUI/DWI" >Possible DUI/DWI</option>
            </>);

        case "Weapons Offenses":
            return (<>
                <option value="Brandishing Weapon" >Brandishing Weapon</option>
                <option value="Drive-by Shooting" >Drive-by Shooting</option>
                <option value="Unlawful Discharge of Firearm" >Unlawful Discharge of Firearm"</option>
            </>);

        default:
            return undefined;
    }

}


const Main = (props) => {
    const [categories, setCategories] = useState(() => null);
    const [subCategories, setSubCategories] = useState(() => undefined);
    const [sort, setSort] = useState(() => "");
    const [markers, setMarkers] = useState(() => null);
    const [posts, setPosts] = useState(() => loading(100, 100));
    const [limit, setLimit] = useState(() => 20);
    const [center, setCenter] = useState(() => [undefined, undefined]);
    const [maxDistance, setMaxDistance] = useState(() => 50);
    const [categoryId, setCategoryId] = useState(() => undefined);
    const [subCategory, setSubCategory] = useState(() => undefined);
    const [mainMap, setMainMap] = useState(() => loading(75,75));
    const [pageInfo, setPageInfo] =useState(() => null);
    const [zipError, setZipError] = useState(() => "");

    function initialLoad(latitude, longitude, totalItems) {
        setLimit(totalItems);
        setCenter([longitude, latitude]);
        load(true, latitude, longitude, totalItems);
    }
    
    function singlePost(id) {
        window.location.replace(`/listing/view/${id}`);
    }

    function loadSubCategories(categoryName) {
        let element = getSubCategories(categoryName);
        setSubCategory("");
        if (!element) {
            setSubCategories(undefined);
        } else {
            setSubCategories(element);
        }
    }
    
    function loadZipCoords(zip) {
        if (zip) {
            getZipCoords(zip).then(response => response.json()).then(zipCoords => {
                if (center[0] === zipCoords.coords.lon) {
                    setZipError("");
                    return;
                } else {
                    setZipError("");
                    setCenter([zipCoords.coords.lon, zipCoords.coords.lat]);
                    load(false, zipCoords.coords.lat, zipCoords.coords.lon);
                }
            }).catch(err => {
                console.log(err)
                setZipError("Zip code invalid");
            });
        } else {
            navigator.geolocation.getCurrentPosition((pos) => {
                console.log(center[0] === pos.coords.longitude)
                if (center[0] === pos.coords.longitude) {
                    return;
                } else {
                    setCenter([pos.coords.longitude, pos.coords.latitude]);
                    load(false, pos.coords.latitude, pos.coords.longitude);
                }
            }, (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    if (center[0] === undefined) {
                        return;
                    } else {
                        setCenter([undefined, undefined]);
                        if (sort === "") {
                            setSort("Most Recent");
                            load(false, "", "", undefined, "Most Recent");
                        } else {
                            load(false, "", "");
                        }  
                    }
                }
            })
            setZipError("");
        } 
    }

    async function load(initial, latitude, longitude, totalItems, sortBy, maxDistanceNum, pageNum, categoryIdNum, subCategoryName) {
        setPosts(loading(100, 100));
        const response = initial ? 
                        await getAllPosts(longitude, latitude, maxDistance, undefined, totalItems) : 
                        await getAllPosts(
                            longitude || longitude === "" ? longitude : center[0], 
                            latitude || latitude === "" ? latitude : center[1], 
                            maxDistanceNum ? maxDistanceNum : maxDistance, 
                            pageNum ? pageNum : pageInfo ? pageInfo.page : 1,
                            totalItems ? totalItems : limit,
                            sortBy ? sortBy : sort,
                            categoryIdNum || categoryIdNum === "" ? categoryIdNum : categoryId,
                            subCategoryName || subCategoryName === "" ? subCategoryName : subCategory);
        if (!response.ok) {
            alert("Error loading posts, please try again.")
            response.json().then(data => console.log(data));
        } else {
            if (response.status === 204) {
                setPosts((
                <div className="d-flex justify-content-center align-items-center" key="None Found" style={{minHeight: "60vh"}}>
                    <Container fluid>
                        <Row>
                            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                            </svg>
                        </Row>
                        <Row>
                            <p className="text-center fs-1 mt-4">No Listings Found!</p>
                        </Row>
                    </Container>
                    
                </div>))
                setPageInfo(null)
                setMarkers([])
                return;
            }
            const postData = await response.json();
            setPosts(postData.posts.map(post => {
                console.log(post.data.images)
                return (
                    <Col xl={4} lg={6} className="p-2" key={post.data._id}>
                        <div className="postCards" onClick={() => singlePost(post.data._id)}>
                            <Row className="d-flex justify-content-center postCardsImageDiv">
                                {post.data.images ? (
                                    <LazyLoadImage
                                        alt={"https://" + window.location.hostname + post.data.images}
                                        src={post.data.images}
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
                                    <p className="text-start ps-2 "> Posted by: {post.data.userId.username}</p>
                                </Col>
                                <Col xs={5}>
                                    <p className="text-end"> Views: {post.data.views}</p>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                )
            }));
            setPageInfo(postData.pageData);
            setMarkers(postData.markers);
        }
    }

    function paginate() {
        if (pageInfo) {
            let pageItems = []
            if (pageInfo.totalPages <= 3) {
                for (let i = 0; i < pageInfo.totalPages; i++) {
                    pageItems.push(<Pagination.Item active={pageInfo.page === (i + 1)}
                        onClick={() => pageInfo.page === (i + 1) ? null : load(false, undefined, undefined, undefined, undefined, undefined, i + 1)}>{i + 1}</Pagination.Item>)
                }
                return (<>
                    <Pagination.Prev onClick={() => load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page - 1)}
                    disabled={pageInfo ? pageInfo.hasPrevPage ? false : true : true} />
                        {pageItems}
                    <Pagination.Next onClick={() => load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page + 1)} 
                    disabled={pageInfo ? pageInfo.hasNextPage ? false : true : true} />
                </>)
            } else {
                return (<>
                    <Pagination.First onClick={() => load(false, undefined, undefined, undefined, undefined, undefined, 1)}
                        disabled={pageInfo ? pageInfo.hasPrevPage ? false : true : true}/>
                    <Pagination.Prev onClick={() => load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page - 1)}
                        disabled={pageInfo ? pageInfo.hasPrevPage ? false : true : true} />
                        <Pagination.Item active={pageInfo.page === 1}
                            onClick={() => pageInfo.page === 1 ? null : pageInfo.page === pageInfo.totalPages ? 
                                load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page - 2) :
                                load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page - 1)}>
                                {pageInfo.page === 1 ? 1 : pageInfo.page === pageInfo.totalPages ? pageInfo.totalPages -2 : pageInfo.page - 1}
                        </Pagination.Item>
                        <Pagination.Item active={pageInfo.page != pageInfo.totalPages && pageInfo.page !== 1}
                            onClick={() => pageInfo.page === 1 ? load(false, undefined, undefined, undefined, undefined, undefined, 2) :
                                pageInfo.page === pageInfo.totalPages ? load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.totalPages - 1) : null}>
                                {pageInfo.page === 1 ? 2 : pageInfo.page === pageInfo.totalPages ? pageInfo.totalPages -1 : pageInfo.page}
                        </Pagination.Item>
                        <Pagination.Item active={pageInfo.page === pageInfo.totalPages}
                        onClick={() => pageInfo.page === pageInfo.totalPages ? null : pageInfo.page === 1 ?
                            load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page + 2) :
                            load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page + 1) }>
                            {pageInfo.page === 1 ? 3 : pageInfo.page === pageInfo.totalPages ? pageInfo.totalPages : pageInfo.page + 1}
                        </Pagination.Item>
                    <Pagination.Next onClick={() => load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.page + 1)} 
                        disabled={pageInfo ? pageInfo.hasNextPage ? false : true : true} />
                    <Pagination.Last disabled={pageInfo ? pageInfo.hasNextPage ? false : true : true}
                        onClick={() => load(false, undefined, undefined, undefined, undefined, undefined, pageInfo.totalPages)}/>
                </>)
            }
        }
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            getCategories().then(categories => setCategories(categories));
            initialLoad(pos.coords.latitude, pos.coords.longitude, 20);
        }, (err) => {
            if (err.code === err.PERMISSION_DENIED) {
                getCategories().then(categories => setCategories(categories));
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
    useEffect(() => {

    }, [subCategories])

    return (
        <Container fluid className="" style={{minHeight: "80vh"}}>
            <Row>
                <Col xxl={1} xs={12}>
                    {/* Ad Space */}
                </Col>
                <Col>
                    <Row className="d-flex justify-content-center align-items-center mt-3 mapRow" style={{height: "30vh"}}>
                        {mainMap}
                    </Row>
                    <Row className="mt-3 sortRow">
                        <Col md={6} xs={12} className='d-flex justify-content-start pb-2'>
                            <p className="my-auto pe-2">Items per Page:</p>
                            <select className="p-1" value={limit} onChange={(e) => {
                                setLimit(e.target.value);
                                load(false, undefined, undefined, e.target.value);
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
                                load(false, undefined, undefined, undefined, e.target.value);
                            }} value={sort}>
                                {center[0] && center[1] ? <option value="" >Nearest To Location</option> : <></>}
                                <option value="Most Recent">Most Recent</option>
                                <option value="Most Recent Inv">Most Recent (oldest to newest)</option>
                                <option value="Popular">Popular</option>
                                <option value="Popular Inv">Popular (least to greatest)</option>
                                <option value="Date of Incident">Date of Incident</option>
                                <option value="Date of Incident Inv">Date of Incident (oldest to newest)</option>
                            </select>
                       </Col>
                    </Row>
                    <Row style={{ borderBottom: "5px solid var(--cyan)" }}>
                        <Col lg={3} md={4} xs={12} className="searchCriteriaDiv">
                            {/* Search Criteria */}
                            <Row className="my-1">
                                <Col md={12} xs={6} className="mt-1">
                                    <p className="mb-1"> Search by Category:</p>
                                    <select value={categoryId} className="p-1" onChange={(e) => {
                                        setCategoryId(e.target.value);
                                        setSubCategories(undefined);
                                        loadSubCategories(e.target[e.target.selectedIndex].innerText);
                                        load(false, undefined, undefined, undefined, undefined, undefined, undefined, e.target.value, undefined);
                                    }} style={{ maxWidth: "100%" }} >
                                        {categories}
                                    </select>
                                </Col>

                                {subCategories ? (<Col md={12} xs={6} className="mt-1">
                                    <p className="mb-1">Sub-categories: </p>
                                    <select value={subCategory} className="p-1" onChange={(e) => {
                                        setSubCategory(e.target.value);
                                        load(false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, e.target.value);
                                    }} >
                                        <option value="" >All</option>
                                        {subCategories}
                                    </select>
                                </Col>) : (<></>)}
                            </Row>
                            <Row className="mb-1">
                                <Col md={12} xs={6} className="mt-1">
                                    <p className="mb-1 p-0"> Search by Zip Code:</p>
                                    <input type="search" style={{ width: "100%" }} maxLength="5" onBlur={(e) => loadZipCoords(e.target.value)}></input>
                                    <p className="mb-1 p-0 text-danger">{zipError}</p>
                                </Col>
                                <Col md={12} xs={6} className="mt-1">
                                    <p className="mb-1 p-0">Search Radius</p>
                                    <select value={maxDistance} className="p-1" onChange={(e) => {
                                        setMaxDistance(e.target.value);
                                        load(false, undefined, undefined, undefined, undefined, e.target.value);
                                    }}>
                                    <option value={5} >5 Miles</option>
                                    <option value={10}>10 Miles</option>
                                    <option value={25}>25 Miles</option>
                                    <option value={50}>50 Miles</option>
                                    <option value={100}>100 Miles</option>
                                    </select>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    {pageInfo ? (
                                        <p>Total Listings: {pageInfo.totalDocs}</p>
                                    ) : null}
                                </Col>
                            </Row>
                            <Row>
                                {/* Ad Space */}
                            </Row>
                            
                        </Col>
                        <Col lg={9} md={8} xs={12}>
                            <Row style={{ minHeight: "60vh" }}>
                                {posts}
                            </Row>
                            <Row className="py-2" style={{borderTop: "5px solid var(--cyan)"}}>
                                <Pagination className="d-flex justify-content-center m-0 p-0">
                                    {paginate()}  
                                </Pagination>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        {/* page selector */}
                    </Row>
                {/* main */}
                </Col>
                <Col xxl={1} xs={12}>
                    {/* Ad Space */}
                </Col>
            </Row>
        </Container>
    );
}

export default Main;