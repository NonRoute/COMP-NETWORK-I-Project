import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import Messages from './Messages'
import MessageInput from './MessageInput'
import { useOktaAuth } from '@okta/okta-react'
import { useAuth } from './auth'
import { Link } from 'react-router-dom'

function App() {
	const { oktaAuth, authState } = useOktaAuth()

	const login = async () => oktaAuth.signInWithRedirect('/')
	const logout = async () => oktaAuth.signOut('/')

	const [user, token] = useAuth()
	const [socket, setSocket] = useState(null)

	function getSocketOptions() {
		let option = {
			transportOptions: {
				polling: {
					extraHeaders: {
						'ngrok-skip-browser-warning': 'any',
					},
				},
			},
		}
		if (token) {
			return {
				query: { token },
				...option,
			}
		}
		return option
	}

	useEffect(() => {
		const newSocket = io(
			process.env.REACT_APP_SERVER_URL || `http://${window.location.hostname}:3000`,
			getSocketOptions(),
		)
		setSocket(newSocket)
		return () => newSocket.close()
	}, [setSocket, token])

	return (
		<div class="bg-gradient-to-r from-gray-800 to-gray-700 border-b-1 min-h-screen">
			<header class="py-2 px-4 text-white">
				{!authState ? (
					<div>Loading...</div>
				) : user ? (
					<div class="flex justify-between items-center">
						<div>Signed in as {user.name}</div>
						<div class="flex gap-2">
							<Link to={'/edit'}>
								<button class="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500">Edit profile</button>
							</Link>
							<button class="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500" onClick={logout}>
								Sign out
							</button>
						</div>
					</div>
				) : (
					<div class="flex justify-between items-center">
						<div>Not signed in</div>
						<div class="flex gap-2">
							<button class="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500" onClick={login}>
								Sign in
							</button>
							<Link to={'/register'}>
								<button class="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500">
									Create account
								</button>
							</Link>
						</div>
					</div>
				)}
			</header>
			{socket ? (
				<div class="bg-gray-50 p-2 mx-auto mt-2 rounded-md max-w-xl flex flex-col items-center justify-center">
					<Messages socket={socket} />
					<MessageInput socket={socket} />
				</div>
			) : (
				<div class="flex-1 flex items-center justify-center">Not Connected</div>
			)}
		</div>
	)
}

export default App
