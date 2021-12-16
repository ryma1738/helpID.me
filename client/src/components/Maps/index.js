import { useEffect, useState } from "react";
import {
    LoadScript,
    GoogleMap,
    Marker,
    InfoWindow
} from "@react-google-maps/api";
import markerImage from "../../assets/images/MapPin.png";
import { Spinner, } from "react-bootstrap";

function openPost(id) {
    // redirect to post
}

const Map = (props) => {

    const [lat, setLat] = useState(props.centerLat || 37.0902)
    const [lon, setLon] = useState(props.centerLon || -95.7129)
    const [isOpen, setIsOpen] = useState(false);
    const [postId, setPostId] = useState(null)
    const [initial, setInitial] = useState(true);

    function toggleInfoBox(latitude, longitude, id, open) {
        setIsOpen(open);
        setPostId(id);
        setInitial(false);
        if (latitude && longitude) {
            setLat(latitude);
            setLon(longitude);
        }
    }

    useEffect(() => setInitial(true), [props.centerLat, props.centerLon])
                //removed the y in key to stop using google maps api (paid for version)
        return (
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY} loadingElement={(
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" role="status" style={{ width: "75px", height: "75px", marginTop: "10vh" }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}>
                <GoogleMap
                    zoom={props.centerLat === 37.0902 && props.centerLon === -95.7129 ? 4 : props.centerLat? 9 : 4}
                    center={initial ? { lat: props.centerLat ? props.centerLat : lat, lng: props.centerLon ? props.centerLon : lon}
                                    : { lat: lat, lng: lon}}
                    mapContainerClassName={props.containerClassName}
                >    
                    {props.markers ?
                        props.markers.map(mark => (
                            <Marker
                                title={mark.title}
                                key={mark._id}
                                icon={{
                                    url: markerImage,
                                    scaledSize: { width: 30, height: 50 }
                                }}
                                position={{ lat: mark.lat, lng: mark.lon }}
                                onClick={() => toggleInfoBox(mark.lat, mark.lon, mark._id, true)}>
                                
                                {isOpen && postId === mark._id ? (
                                    <InfoWindow position={{ lat: mark.lat, lng: mark.lon }}
                                        onCloseClick={() => toggleInfoBox(null, null, null, false)}>
                                        <div>
                                            <h4>{mark.title}</h4>
                                            <p>{mark.summary}</p>
                                            <button type="button" className="button m-1"
                                             onClick={() => openPost(postId)} style={{backgroundColor: "white"}}>
                                                Go to Post
                                            </button>
                                        </div>
                                    </InfoWindow>
                                ) : null}
                            </Marker>
                        )) : props.marker ? (
                            <Marker
                                title={props.marker.title}
                                position={{ lat: props.marker.lat, lng: props.marker.lon }}
                                draggable={true}
                                onDragEnd={(e) => props.onChange(e.latLng)}> 
                            </Marker>
                        ) : null}
                    
                </GoogleMap>
            </LoadScript>
        );
}

export default Map;
// export default () => (
//     <Map
//         googleMapURL={"https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_GOOGLE_API_KEY}
//         loadingElement={<div style={{ height: `100%` }} />}
//         containerElement={<div style={{ height: `100%`, width: "90%" }} />}
//         mapElement={<div style={{ height: `100%`}} />}
//     />
// );
