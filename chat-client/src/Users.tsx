// Users.tsx
import React, { useEffect, useState } from 'react'

function Users({ socket, onClickUser }: { socket: any; onClickUser: (groupName: string) => void }) {
	const [users, setUsers] = useState<Array<[string, string]>>([])

	useEffect(() => {
		socket.on('otherUser', (user: [string, string]) => {
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
			{users.map(([userId, nickname]) => {
				return (
					<button
						className="mb-1 text-left w-full text-blue-600 hover:text-blue-800"
						onClick={() => onClickUser(userId)}
						key={userId}
					>
						{nickname}
					</button>
				)
			})}
		</div>
	)
}

export default Users
