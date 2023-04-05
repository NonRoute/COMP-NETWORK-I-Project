import React from 'react'
import { useOktaAuth } from '@okta/okta-react'
import { useState } from 'react'
import axios from 'axios'

function Register() {
	const [state, setState] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
	})

	const { oktaAuth } = useOktaAuth()

	const inputValue = (name) => (event) => {
		setState({ ...state, [name]: event.target.value })
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		try {
			const newUser = {
				profile: {
					firstName: state.firstName,
					lastName: state.lastName,
					email: state.email,
					login: state.email,
				},
				credentials: {
					password: {
						value: state.password,
					},
				},
			}
			const user = await axios.post(`${process.env.REACT_APP_OKTA_ORG_URL}/api/v1/users?activate=true`, newUser, {
				headers: {
					Authorization: `SSWS ${process.env.REACT_APP_TOKEN}`,
				},
			})
			console.log('Created user', user)
			// Redirect to the login page after successful registration
			await oktaAuth.signInWithRedirect('/')
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<div>
			<h2>Register</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>
						First Name:
						<input type="text" value={state.firstName} onChange={inputValue('firstName')} />
					</label>
				</div>
				<div>
					<label>
						Last Name:
						<input type="text" value={state.lastName} onChange={inputValue('lastName')} />
					</label>
				</div>
				<div>
					<label>
						Email:
						<input type="email" value={state.email} onChange={inputValue('email')} />
					</label>
				</div>
				<div>
					<label>
						Password:
						<input type="password" value={state.password} onChange={inputValue('password')} />
					</label>
				</div>
				<button type="submit">Register</button>
			</form>
		</div>
	)
}

export default Register
