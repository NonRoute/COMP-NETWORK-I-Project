import React, { useEffect, useState } from 'react'
import { Group } from './types'
import { Socket } from 'socket.io-client'

function Groups({ socket }: { socket: Socket }) {
	const [groups, setGroups] = useState<Group[]>([])

	useEffect(() => {
		socket.on('newGroup', (group: Group) => {
			setGroups((prevGroups) => {
				const newGroups = [...prevGroups, group]
				return newGroups
			})
		})

		socket.emit('getAllGroups')

		return () => {
			socket.off('newGroup')
		}
	}, [socket])


	return (
		<div className="max-w-xl w-full">
			{groups.map((group) => (
				<button
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					onClick={() => console.log('Button clicked!')}
				>
					{group.name}
				</button>
			))}
		</div>
	)
}

export default Groups
