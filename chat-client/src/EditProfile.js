import React, { useEffect } from 'react'
import { useOktaAuth } from '@okta/okta-react'
import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'

function EditProfile() {
	const { oktaAuth, authState } = useOktaAuth()
	const navigate = useNavigate()

	const [state, setState] = useState({
		firstName: '',
		lastName: '',
		email: '',
	})
	const [error, setError] = useState(null)

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
				},
			}

			// Update current User's Profile
			const user = await axios.post(`${process.env.REACT_APP_OKTA_ORG_URL}/api/v1/users/me`, newUser, {
				headers: {
					Authorization: `SSWS ${process.env.REACT_APP_TOKEN}`,
				},
			})
			// console.log('Updated user', user)
			alert('Update successful. Changes will appear soon.')
			navigate('/')
		} catch (error) {
			console.error(error)
			setError(error.response.data.errorCauses[0].errorSummary)
		}
	}

	const fetchData = async () => {
		try {
			const user = await oktaAuth.getUser()
			console.log('Current User', user)
			setState({
				firstName: user.given_name,
				lastName: user.family_name,
				email: user.email,
			})
		} catch (error) {
			console.error(error)
			navigate('/')
		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	return (
		<div className="bg-gradient-to-r from-gray-800 to-gray-700 min-h-screen flex flex-col items-center justify-center">
			<h2 className="text-5xl font-bold text-white text-center mb-6">Edit Profile</h2>
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
					<label className="block font-medium text-white mb-2" htmlFor="firstName">
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
					<label className="block font-medium text-white mb-2" htmlFor="lastName">
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
					<label className="block font-medium text-white mb-2" htmlFor="email">
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
				<div className="flex justify-center gap-4">
					<Link to={'/'} className="w-full">
						<button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md w-full">
							Cancel
						</button>
					</Link>
					<button
						className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md w-full"
						type="submit"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	)
}

export default EditProfile
