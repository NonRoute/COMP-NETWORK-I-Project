import React, { useEffect, useState } from 'react'
import { Group } from './types'
import { Socket } from 'socket.io-client'
import Messages from './Messages'
import MessageInput from './MessageInput'

function Groups({ socket }) {
	const [groups, setGroups] = useState<Group[]>([])
	const [groupName, setGroupName] = useState('')
	const [selectGroup, setSelectGroup] = useState<Group>(null)

	useEffect(() => {
		socket.on('newGroup', (group) => {
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

	function handleAddGroup(e) {
		e.preventDefault()
		socket.emit('joinGroup', groupName)
		setGroupName('')
	}

	function handleSelectGroup(name: string) {
		setSelectGroup(groups.find((group) => group.name === name))
	}

	return (
		<div className="max-w-xl w-full">
			{groups.map((group) => {
				return (
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						onClick={() => handleSelectGroup(group.name)}
						key={group.name}
					>
						{group.name}
					</button>
				)
			})}
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
			{selectGroup ? (
				<>
					<Messages socket={socket} groupName={selectGroup.name}></Messages>
					<MessageInput socket={socket} groupName={selectGroup.name} key={selectGroup.name}></MessageInput>
				</>
			) : (
				<div>no group selected</div>
			)}
		</div>
	)
}

export default Groups
