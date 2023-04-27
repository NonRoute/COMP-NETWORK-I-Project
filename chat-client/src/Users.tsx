// Users.tsx
import React, { useEffect, useState } from 'react'

function Users({ socket, onClickUser }: { socket: any; onClickUser: (groupName: string) => void }) {
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

	return (
		<div className="max-w-xl w-full">
			<h3 className="font-bold mb-2">Other Users:</h3>
			{users.map((user) => {
				return (
					<button
						className="mb-1 text-left w-full text-blue-600 hover:text-blue-800"
						onClick={() => onClickUser(user)}
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
