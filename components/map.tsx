import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { HeatmapLayer, CircleLayer, Layer, Popup, Source, MarkerDragEvent, Marker, NavigationControl } from 'react-map-gl';
import axios from 'axios';
import { Component, useEffect, useMemo, useState } from 'react';
import Pin from '../components/pin';
import React from 'react'

interface ITweetPoint {
	longitude: any;
	latitude: any;
	score: number;
	id: string;
}

const heatmapLayerStyle: HeatmapLayer = {
	id: 'heatmap-heat',
	type: 'heatmap',
	maxzoom: 9,
	paint: {
		'heatmap-weight': ['interpolate', ['linear'], ['get', 'score'], 0, 0, 6, 1],
		'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 10, 3],
		'heatmap-color': [
			'interpolate',
			['linear'],
			['heatmap-density'],
			0,
			'rgba(33,102,172,0)',
			0.2,
			'rgb(103,169,207)',
			0.4,
			'rgb(209,229,240)',
			0.6,
			'rgb(253,219,199)',
			0.8,
			'rgb(239,138,98)',
			1,
			'rgb(255,201,101)'
		],
		'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 10, 20],
		'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
	}
};

const pointLayerStyle: CircleLayer = {
	id: 'tweet-point',
	type: 'circle',
	source: 'tweets',
	minzoom: 7,
	paint: {
		'circle-radius': {
			property: 'score',
			type: 'exponential',
			stops: [
			  [{ zoom: 15, value: 1 }, 5],
			  [{ zoom: 15, value: 62 }, 10],
			  [{ zoom: 22, value: 1 }, 20],
			  [{ zoom: 22, value: 62 }, 50]
			]
		  },
		'circle-color': ['interpolate',
			['linear'],
			['get', 'score'],
			10, 'rgba(33,102,172,0)',
			20, 'rgb(103,169,207)',
			30, 'rgb(209,229,240)',
			40, 'rgb(253,219,199)',
			50, 'rgb(239,138,98)',
			500, 'rgb(178,24,43)',
			1000, 'rgb(255,201,101)'
		],
		'circle-stroke-color': 'white',
		'circle-stroke-width': 1,
		'circle-opacity': ['interpolate',
			['linear'],
			['zoom'],
			7,
			0,
			8,
			1
		]
	}
};

export class QueryMap extends Component<{ location: any, style: any, onMove: (loc: any) => void }, {popupInfo: boolean, viewport: any, myMap: any}> {
	
	constructor(props: any) {
		super(props);
		this.state = {
			popupInfo: true,
			viewport: {},
			myMap : React.createRef(),
		}
	}

	
	render() {
		return (
			<Map reuseMaps
				initialViewState={{
					longitude: -79.347,
					latitude: 43.651,
					zoom: 5
				}}
				ref = {this.state.myMap}
				mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
				style={this.props.style}
				mapStyle="mapbox://styles/mapbox/dark-v10">
				<Marker
					longitude={this.props.location.longitude}
					latitude={this.props.location.latitude}
					anchor="bottom"
					draggable
					onDrag={(event: MarkerDragEvent) => {
						this.props.onMove({
							longitude: event.lngLat.lng,
							latitude: event.lngLat.lat
						});
						this.setState((state) => {return {popupInfo: true}})
					}}
				>
					<Pin size={20} />

				</Marker>
				<NavigationControl />

				{this.state.popupInfo && 
				<Popup
				latitude = {this.props.location.latitude}
				longitude = {this.props.location.longitude}
				offset = {25}
				onClose = {() => this.setState((state) => {return {popupInfo: false}})}
				>
					<div>
						<h3> Selected Location Coordinates: </h3>
						<p> Latitude : {this.props.location.latitude} </p>
						<p> Longitude : {this.props.location.longitude} </p>
					</div>
				</Popup>}

			</Map>
		);
	}
}

export function QueryHeatmap(props: { id: string}) {

	const [popupInfo, setPopupInfo] = useState<ITweetPoint | undefined>(undefined);
	const [geojson, setGeoJson] = useState(null);

	useEffect(() => {
		
		axios(`${process.env.NEXT_PUBLIC_API_URL}/query/${props.id}/geojson`).then(res => {
			if (res.data.status === 200) {
				setGeoJson(res?.data['geojson']);
			}
			else setGeoJson(null);
		}).catch(err => {
			console.log(err);
		});

		if (geojson === null) {
			axios(`${process.env.NEXT_PUBLIC_API_URL}/query/archive/${props.id}/geojson`).then(res => {
				if (res.data.status == 200) {
					setGeoJson(res?.data['geojson']);
				}
				else setGeoJson(null);
			}).catch(err => {
				console.log(err);
			});
		}	

	}, [props.id]);

	const data = useMemo(() => {
		return geojson;
	}, [geojson]);

	return (
		<Map reuseMaps
			initialViewState={{
				longitude: -79.347,
				latitude: 43.651,
				zoom: 5
			}}
			interactiveLayerIds={['tweet-point']}
			mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
			style={{ width: '100%', height: '90vh' }}
			mapStyle="mapbox://styles/mapbox/dark-v10"
			onClick={(event) => {
				const { features } = event;
				if (features !== undefined && features.length > 0) {
					if (features[0].geometry.type === 'Point' && features[0].properties !== null) {
						const tweet: ITweetPoint = {
							longitude: features[0].geometry.coordinates[0],
							latitude: features[0].geometry.coordinates[1],
							score: features[0].properties.score,
							id: features[0].properties.id
						};

						setPopupInfo(tweet);
					}
					else setPopupInfo(undefined);
				}
				else setPopupInfo(undefined);
			}}>
			{data && (
				<Source id="heatmap" type="geojson" data={data}>
					<Layer {...heatmapLayerStyle} />
					<Layer {...pointLayerStyle} />
				</Source>
			)}
			{popupInfo && (
				<Popup
					longitude={Number(popupInfo.longitude)}
					latitude={Number(popupInfo.latitude)}
					anchor="bottom"
					closeOnClick={true}
					onClose={() => setPopupInfo(undefined)}>
					The algo score is: {popupInfo.score.toFixed(2)}<br />
					<a target='_blank' href={`https://twitter.com/anyuser/status/${popupInfo.id}`} rel='noopener noreferrer' className='text-blue-400 hover:text-blue-300'>Click here</a> to see the tweet.
				</Popup>
			)}
		</Map>
	);
}

// For public page usage, subject to change api routing
export function PublicMap() {

	const [popupInfo, setPopupInfo] = useState<ITweetPoint | undefined>(undefined);
	const [geojson, setGeoJson] = useState(null);

	useEffect(() => {
		axios(`${process.env.NEXT_PUBLIC_API_URL}/queries/archive/public/list/geojson`).then(res => {
			if (res.data.status === 200) {
				setGeoJson(res?.data['geojson']);
			}
			else setGeoJson(null);
		}).catch(err => {
			console.log(err);
		});
	}, []);

	const data = useMemo(() => {
		return geojson;
	}, [geojson]);

	return (
		<Map reuseMaps
			initialViewState={{
				longitude: -79.347,
				latitude: 43.651,
				zoom: 5
			}}
			interactiveLayerIds={['tweet-point']}
			mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
			style={{ width: '100%', height: '90vh' }}
			mapStyle="mapbox://styles/mapbox/dark-v10"
			onClick={(event) => {
				const { features } = event;
				if (features !== undefined && features.length > 0) {
					if (features[0].geometry.type === 'Point' && features[0].properties !== null) {
						const tweet: ITweetPoint = {
							longitude: features[0].geometry.coordinates[0],
							latitude: features[0].geometry.coordinates[1],
							score: features[0].properties.score,
							id: features[0].properties.id
						};

						setPopupInfo(tweet);
					}
					else setPopupInfo(undefined);
				}
				else setPopupInfo(undefined);
			}}>
			{data && (
				<Source id="heatmap" type="geojson" data={data}>
					<Layer {...heatmapLayerStyle} />
					<Layer {...pointLayerStyle} />
				</Source>
			)}
			{popupInfo && (
				<Popup
					longitude={Number(popupInfo.longitude)}
					latitude={Number(popupInfo.latitude)}
					anchor="bottom"
					closeOnClick={true}
					onClose={() => setPopupInfo(undefined)}>
					The algo score is: {popupInfo.score.toFixed(2)}<br />
					<a target='_blank' href={`https://twitter.com/anyuser/status/${popupInfo.id}`} rel='noopener noreferrer' className='text-blue-400 hover:text-blue-300'>Click here</a> to see the tweet.
				</Popup>
			)}
		</Map>
	);
}

function DashboardMap() {

	const [popupInfo, setPopupInfo] = useState<ITweetPoint | undefined>(undefined);
	const [geojson, setGeoJson] = useState(null);

	useEffect(() => {
		axios(`${process.env.NEXT_PUBLIC_API_URL}/queries/active/list/geojson`).then(res => {
			if (res.data.status === 200) {
				setGeoJson(res?.data['geojson']);
			}
			else setGeoJson(null);
		}).catch(err => {
			console.log(err);
		});
	}, []);

	const data = useMemo(() => {
		return geojson;
	}, [geojson]);

	return (
		<Map reuseMaps
			initialViewState={{
				longitude: -79.347,
				latitude: 43.651,
				zoom: 5
			}}
			interactiveLayerIds={['tweet-point']}
			mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
			style={{ width: '100%', height: '90vh' }}
			mapStyle="mapbox://styles/mapbox/dark-v10"
			onClick={(event) => {
				const { features } = event;
				if (features !== undefined && features.length > 0) {
					if (features[0].geometry.type === 'Point' && features[0].properties !== null) {
						const tweet: ITweetPoint = {
							longitude: features[0].geometry.coordinates[0],
							latitude: features[0].geometry.coordinates[1],
							score: features[0].properties.score,
							id: features[0].properties.id
						};

						setPopupInfo(tweet);
					}
					else setPopupInfo(undefined);
				}
				else setPopupInfo(undefined);
			}}>
			{data && (
				<Source id="heatmap" type="geojson" data={data}>
					<Layer {...heatmapLayerStyle} />
					<Layer {...pointLayerStyle} />
				</Source>
			)}
			{popupInfo && (
				<Popup
					longitude={Number(popupInfo.longitude)}
					latitude={Number(popupInfo.latitude)}
					anchor="bottom"
					closeOnClick={true}
					onClose={() => setPopupInfo(undefined)}>
					The algo score is: {popupInfo.score.toFixed(2)}<br />
					<a target='_blank' href={`https://twitter.com/anyuser/status/${popupInfo.id}`} rel='noopener noreferrer' className='text-blue-400 hover:text-blue-300'>Click here</a> to see the tweet.
				</Popup>
			)}
		</Map>
	);
}

export default DashboardMap;