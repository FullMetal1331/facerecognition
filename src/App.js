import React, { Component } from 'react';
import Navigation from'./components/Navigation/Navigation';
import FaceRecognition from'./components/FaceRecognition/FaceRecognition';
import Logo from'./components/Logo/Logo';
import ImageLinkForm from'./components/ImageLinkForm/ImageLinkForm';
import Signin from'./components/Signin/Signin';
import Register from'./components/Register/Register';
import Rank from'./components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';

const app = new Clarifai.App({
 apiKey: '58cc8aa4be1748fa97368298e21d1c1b'
});

const particlesOptions = {
    polygon: {
        particles: {
            number: {
            	value: 50,
            	density: {
            		enable: true,
            		value_area: 600
            	}
            }
        }
    }
}

const initialState = {
	input: '',
	imageUrl: '',
	box: {},
	route: 'signin',
	isSignedIn: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: 0,
		joined: ''
	}
};

class App extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			input: '',
			imageUrl: '',
			box: {},
			route: 'signin',
			isSignedIn: false,
			user: {
				id: '',
				name: '',
				email: '',
				entries: 0,
				joined: ''
			}
		}
	}
	
	loadUser = (data) => {
		//console.log('123', this.state.user);
		this.setState({user:{
					id: data.id,
					name: data.name,
					email: data.email,
					entries: data.entries,
					joined: data.joined
				}});
	}
	
	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputimage');
		const width = Number(image.width);
		const height = Number(image.height);
		//console.log(width, height);
		
		return{
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width-(clarifaiFace.right_col * width),
			bottomRow:height-(clarifaiFace.bottom_row * height)
		}
	}
	
	displayFaceBox = (box) => {
		this.setState({box: box});
		//console.log(box);
	}
	
	onInputChange = (event) => {
		this.setState({input: event.target.value});
	}
	
	onButtonSubmit = () => {
		this.setState({imageUrl: this.state.input});
		app.models.predict(Clarifai.FACE_DETECT_MODEL,
		this.state.input)
		.then( response => {
			if(response) {
				fetch('http://localhost:3000/image', {
					method: 'PUT',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						id: this.state.user.id
					})
				})
				.then(res => res.json())
				.then(count => {
					this.setState(Object.assign(this.state.user, {entries: count}))
				})
			}
			this.displayFaceBox(this.calculateFaceLocation(response))
		})
		.catch(err => console.log(err));
	}
	
	onRouteChange = (route) => {
		if(route === 'home')
			this.setState(initialState);
		else if(route === 'signin')
			this.setState({isSignedIn: false});
			
		
		this.setState({route: route});
	}
	
	render() {
		
		const {isSignedIn, route, box, imageUrl} = this.state;
		
  		return (
    		<div className="App">
	    		<Particles className='particles' params={particlesOptions} />
			    <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
			    {
				    (route==='signin')?
				    	 <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
				    :
				    	(route==='register')?
				    		<Register loadUser={ this.loadUser } onRouteChange={ this.onRouteChange } />
				    	:
					    	<div>
							    <Logo />
							    <Rank name={this.state.user.name} entries={this.state.user.entries}/>
							    <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
							    <FaceRecognition box={box} imageUrl={imageUrl} />
							</div>
					}
			</div>
		);
  	}
}

export default App;
