import React, { useState } from 'react'
import { Socket } from 'socket.io-client'

const NewMessage = ({ socket, groupName }: { socket: Socket; groupName: string }) => {
	const [value, setValue] = useState('')
	const submitForm = (e) => {
		e.preventDefault()
		socket.emit('groupMessage', { groupName, value })
		setValue('')
	}

	return (
		<form className="max-w-xl w-full mx-auto mt-2" onSubmit={submitForm}>
			<input
				className="w-full px-2 py-1 border-2 border-gray-500 rounded-md"
				autoFocus
				value={value}
				placeholder="Type your message"
				onChange={(e) => {
					setValue(e.currentTarget.value)
				}}
			/>
		</form>
	)
}

export default NewMessage
