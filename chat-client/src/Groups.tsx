import React, { useEffect, useState } from 'react'
import { Group } from './types'

function Groups({ socket, onClickGroup }: { socket: any; onClickGroup: (groupName: string) => void }) {
	const [groups, setGroups] = useState<Group[]>([])
	const [groupName, setGroupName] = useState('')

	useEffect(() => {
		socket.on('newGroup', (group: Group) => {
			setGroups((prevGroups) => {
				if (!group.name.includes('-')) {
					if (prevGroups) {
						const newGroups = [...prevGroups, group]
						return newGroups
					} else {
						const newGroups = [group]
						return newGroups
					}
				}
			})
		})

		socket.emit('getAllGroups')

		return () => {
			socket.off('newGroup')
		}
	}, [socket])

	function handleAddGroup(e) {
		e.preventDefault()
		socket.emit('createGroup', groupName)
		setGroupName('')
	}

	return (
		<div className="max-w-xl w-full">
			<h3 className="font-bold mb-2">Groups:</h3>
			<div className="flex gap-2 flex-wrap">
				{groups &&
					groups.map((group) => {
						return (
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => onClickGroup(group.name)}
								key={group.name}
							>
								{group.name}
							</button>
						)
					})}
			</div>
			<form className="max-w-xl w-full mx-auto mt-2" onSubmit={handleAddGroup}>
				<input
					className="w-full px-2 py-1 border-2 border-gray-500 rounded-md"
					autoFocus
					value={groupName}
					placeholder="add group"
					onChange={(e) => {
						setGroupName(e.currentTarget.value)
					}}
				/>
			</form>
		</div>
	)
}

export default Groups
