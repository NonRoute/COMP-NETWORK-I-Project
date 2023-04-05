import React, { useState } from 'react'

const NewMessage = ({ socket }) => {
	const [value, setValue] = useState('')
	const submitForm = (e) => {
		e.preventDefault()
		socket.emit('message', value)
		setValue('')
	}

	return (
		<form class="max-w-md w-full mx-auto">
			<input
				autoFocus
				class="w-full px-2 py-1"
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
