// Users.tsx
import React, { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'

function Users({ socket }: { socket: Socket }) {
	const [users, setUsers] = useState<string[]>([])

	useEffect(() => {
		socket.on('otherUser', (user) => {
			setUsers((prevUsers) => [...prevUsers, user])
		})

		socket.emit('getAllUser')

		return () => {
			socket.off('otherUser')
		}
	}, [socket])

	function handleUserClick(user: string) {
		// socket.emit('joinGroup')
	}

	return (
		<div className="max-w-xl w-full">
			<h3 className="font-bold mb-2">Other Users:</h3>
			{users.map((user) => {
				return (
					<button
						className="mb-1 text-left w-full text-blue-600 hover:text-blue-800"
						onClick={() => handleUserClick(user)}
						key={user}
					>
						{user}
					</button>
				)
			})}
		</div>
	)
}

export default Users
