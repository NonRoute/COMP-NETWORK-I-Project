import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import Messages from './Messages'
import MessageInput from './MessageInput'
import Groups from './Groups'
import Users from './Users'
import { useOktaAuth } from '@okta/okta-react'
import { useAuth } from './auth'
import { Link } from 'react-router-dom'

function App() {
	const { oktaAuth, authState } = useOktaAuth()

	const login = async () => oktaAuth.signInWithRedirect('/')
	const logout = async () => oktaAuth.signOut('/')

	const [user, token] = useAuth()
	const [socket, setSocket] = useState(null)
	const [selectGroup, setSelectGroup] = useState(null)

	function handleSelectGroup(groupName) {
		setSelectGroup(groupName)
	}

	function handleSelectUser(username) {
		socket.emit('getDMGroupName', username)
	}

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
		const newSocket = io.connect(
			process.env.REACT_APP_SERVER_URL || `http://${window.location.hostname}:3000`,
			getSocketOptions(),
		)
		setSocket(newSocket)
		return () => newSocket.disconnect()
	}, [setSocket, token])

	useEffect(() => {
		if (socket) {
			socket.on('DMGroupName', (groupName) => {
				setSelectGroup(groupName)
			})

			return () => {
				socket.off('DMGroupName')
			}
		}
	}, [socket])

	return (
		<div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b-1 min-h-screen">
			<header className="py-2 px-4 text-white">
				{!authState ? (
					<div>Loading...</div>
				) : user ? (
					<div className="flex justify-between items-center">
						<div>Signed in as {user.name}</div>
						<div className="flex gap-2">
							<Link to={'/edit'}>
								<button className="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500">
									Edit profile
								</button>
							</Link>
							<button className="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500" onClick={logout}>
								Sign out
							</button>
						</div>
					</div>
				) : (
					<div className="flex justify-between items-center">
						<div>Not signed in</div>
						<div className="flex gap-2">
							<button className="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500" onClick={login}>
								Sign in
							</button>
							<Link to={'/register'}>
								<button className="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-500">
									Create account
								</button>
							</Link>
						</div>
					</div>
				)}
			</header>
			{socket ? (
				<div className="bg-gray-50 p-2 mx-auto mt-2 rounded-md max-w-xl flex flex-col items-center justify-center">
					<Users socket={socket} onClickUser={handleSelectUser} />
					<Groups socket={socket} onClickGroup={handleSelectGroup} />
					{selectGroup ? <div>current group: {selectGroup}</div> : <div>no group selected</div>}
					{selectGroup ? (
						<>
							<Messages socket={socket} groupName={selectGroup} />
							<MessageInput socket={socket} groupName={selectGroup} />
						</>
					) : (
						<></>
					)}
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center">Not Connected</div>
			)}
		</div>
	)
}

export default App
