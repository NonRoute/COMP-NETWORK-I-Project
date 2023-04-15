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
	const [error, setError] = useState(null)

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
			setError(error.response.data.errorCauses[0].errorSummary)
		}
	}

	return (
		<div className="bg-gradient-to-r from-gray-800 to-gray-700 min-h-screen flex flex-col items-center justify-center">
			<h2 className="text-5xl font-bold text-white text-center mb-6">Register</h2>
			<form
				className="border border-gray-500 p-6 rounded-lg min-w-[300px] w-2/3 max-w-xl bg-gray-900 bg-opacity-70 mx-5"
				onSubmit={handleSubmit}
			>
				{error && ( // render the error message if error state is not null
					<div className="bg-gradient-to-r from-red-800 to-red-700 text-white text-center mb-6 py-2 px-4 rounded-md">
						{error}
					</div>
				)}
				<div className="mb-6">
					<label className="block font-medium text-white mb-2" for="firstName">
						First Name
					</label>
					<input
						className="form-input w-full py-2 px-4 text-gray-900 bg-white rounded-md shadow-sm"
						type="text"
						id="firstName"
						value={state.firstName}
						onChange={inputValue('firstName')}
					/>
				</div>
				<div className="mb-6">
					<label className="block font-medium text-white mb-2" for="lastName">
						Last Name
					</label>
					<input
						className="form-input w-full py-2 px-4 text-gray-900 bg-white rounded-md shadow-sm"
						type="text"
						id="lastName"
						value={state.lastName}
						onChange={inputValue('lastName')}
					/>
				</div>
				<div className="mb-6">
					<label className="block font-medium text-white mb-2" for="email">
						Email
					</label>
					<input
						className="form-input w-full py-2 px-4 text-gray-900 bg-white rounded-md shadow-sm"
						type="email"
						id="email"
						value={state.email}
						onChange={inputValue('email')}
					/>
				</div>
				<div className="mb-6">
					<label className="block font-medium text-white mb-2" for="password">
						Password
					</label>
					<input
						className="form-input w-full py-2 px-4 text-gray-900 bg-white rounded-md shadow-sm"
						type="password"
						id="password"
						value={state.password}
						onChange={inputValue('password')}
					/>
				</div>
				<div className="flex justify-center">
					<button
						className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md w-full"
						type="submit"
					>
						Register
					</button>
				</div>
			</form>
		</div>
	)
}

export default Register
