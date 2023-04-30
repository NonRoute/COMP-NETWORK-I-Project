import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import Messages from './Messages'
import MessageInput from './MessageInput'
import Groups from './Groups'
import Users from './Users'
import { useOktaAuth } from '@okta/okta-react'
import { useAuth } from './auth'
import { Link } from 'react-router-dom'
import ReactPlayer from 'react-player'

function App() {
	const { oktaAuth, authState } = useOktaAuth()

	const login = async () => oktaAuth.signInWithRedirect('/')
	const logout = async () => oktaAuth.signOut('/')

	const [user, token] = useAuth()
	const [socket, setSocket] = useState(null)
	const [selectGroup, setSelectGroup] = useState(null)
	const [users, setUsers] = useState([])
	const [myUserId, setMyUserId] = useState(null)
	const [myNickname, setMyNickname] = useState(null)
	const [newNickname, setNewNickname] = useState('')
	const [isMusicPlaying, setIsMusicPlaying] = useState(false)
	const [musicNumber, setMusicNumber] = useState(0)
	const [volume, setVolume] = useState(0.5)

	function handleSelectGroup(groupName) {
		setSelectGroup(groupName)
	}

	function handleSelectUser(userId) {
		socket.emit('getDMGroupName', userId)
	}

	function handleSetNickname() {
		setMyNickname(newNickname)
		if (socket && newNickname.trim() !== '') {
			socket.emit('setNickname', newNickname)
			setNewNickname('')
		}
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

	function getOtherUsers() {
		return users.filter(([userId, nickname]) => userId !== myUserId)
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

			socket.on('getMyUser', ([userId, myNickname]) => {
				setMyUserId(userId)
				setMyNickname(myNickname)
			})

			socket.emit('getMyUser')
			socket.emit('getAllUser')

			socket.on('otherUser', ([userId, nickname]) => {
				console.log(nickname)
				setUsers((prevUsers) => [...prevUsers, [userId, nickname]])
			})

			return () => {
				socket.off('DMGroupName')
				socket.off('getMyUser')
				socket.off('otherUser')
			}
		}
	}, [socket])

	const MusicList = [
		{ url: 'https://www.youtube.com/watch?v=9E6b3swbnWg', title: 'Chopin - Nocturne op.9 No.2' },
		{
			url: 'https://www.youtube.com/watch?v=df-eLzao63I',
			title: "Piano Concerto No. 21 - Andante 'Elvira Madigan'",
		},
		{ url: 'https://youtu.be/RoQDRZP1yvQ', title: 'Arrival by Andersson/Ulvaeus' },
		{ url: 'https://youtu.be/82l3q15YfYQ', title: 'Tchaikovsky - Piano Concerto No. 1' },
		{ url: 'https://youtu.be/YyknBTm_YyM', title: 'Camille Saint-Saëns - Danse Macabre' },
		{
			url: 'https://youtu.be/XX6GHiFKovw',
			title: 'Prokofiev: Romeo and Juliet, Op. 64 / Act 1 - Dance Of The Knights',
		},
	]

	const MusicPlayer = () => {
		return (
			<div className="flex flex-col bg-gray-600 rounded-md p-2 text-white w-full">
				<div className="flex flex-row justify-center items-center gap-3">
					<button
						onClick={() => {
							setMusicNumber((prev) => {
								if (prev == MusicList.length - 1) {
									return 0
								} else {
									return prev + 1
								}
							})
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
							<path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
						</svg>
					</button>
					<button
						onClick={() => {
							setIsMusicPlaying((prev) => !prev)
						}}
					>
						{isMusicPlaying ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="w-6 h-6"
							>
								<path
									fill-rule="evenodd"
									d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
									clip-rule="evenodd"
								/>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="w-6 h-6"
							>
								<path
									fill-rule="evenodd"
									d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
									clip-rule="evenodd"
								/>
							</svg>
						)}
					</button>
					<div class="">
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							class="range-slider h-2 appearance-none rounded-md bg-gray-200 outline-none"
							value={volume}
							onChange={(e) => {
								setVolume(e.target.value)
							}}
						/>
					</div>
				</div>
				<div>
					<p className="font-bold text-center">Music : {MusicList[musicNumber].title}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b-1 min-h-screen">
			<ReactPlayer
				className="hidden"
				url={MusicList[musicNumber].url}
				playing={isMusicPlaying}
				volume={volume}
				onEnded={() => {
					setMusicNumber((prev) => {
						if (prev == MusicList.length - 1) {
							return 0
						} else {
							return prev + 1
						}
					})
				}}
			/>
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
					<MusicPlayer />
					<div className="px-2 py-1 mb-2 bg-gray-600 rounded-md text-white mt-2 w-full text-center font-bold">
						Your Nickname: {myNickname}
					</div>
					{user && (
						<div className="mb-2">
							<label htmlFor="nickname" className="mr-2">
								Set Nickname:
							</label>
							<input
								type="text"
								id="nickname"
								className="px-2 py-0.5 border-2 border-gray-500 rounded-md"
								value={newNickname}
								onChange={(e) => setNewNickname(e.target.value)}
							/>
							<button
								className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
								onClick={() => handleSetNickname()}
							>
								Update
							</button>
						</div>
					)}
					<Users onClickUser={handleSelectUser} otherUsers={getOtherUsers()} />
					<Groups socket={socket} onClickGroup={handleSelectGroup} />
					{selectGroup ? (
						<div className="px-2 py-1 bg-gray-600 rounded-md text-white mt-2 w-full text-center font-bold">
							Current Group: {selectGroup}
						</div>
					) : (
						<div className="px-2 py-1 bg-gray-600 rounded-md text-white mt-2 w-full text-center font-bold">
							No group selected
						</div>
					)}
					{selectGroup ? (
						<>
							<Messages socket={socket} groupName={selectGroup} users={users} />
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
