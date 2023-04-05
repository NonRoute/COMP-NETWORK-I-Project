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

	useEffect(() => {
		const newSocket = io(`http://${window.location.hostname}:3000`, token && { query: { token } })
		setSocket(newSocket)
		return () => newSocket.close()
	}, [setSocket, token])

	return (
		<div class="flex flex-col h-screen">
			<header class="app-header bg-gray-800 text-white py-4">
				{!authState ? (
					<div>Loading...</div>
				) : user ? (
					<div class="flex flex-row items-center justify-between">
						<div>Signed in as {user.name}</div>
						<button class="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-700" onClick={logout}>
							Sign out
						</button>
					</div>
				) : (
					<div class="flex flex-row items-center justify-between">
						<div>Not signed in</div>
						<div class="flex flex-row">
							<button class="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-700 mr-2" onClick={login}>
								Sign in
							</button>
							<Link to={'/register'}>
								<button class="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-700">
									Create account
								</button>
							</Link>
						</div>
					</div>
				)}
			</header>
			{socket ? (
				<div class="chat-container flex-1 flex flex-col items-center justify-center">
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
