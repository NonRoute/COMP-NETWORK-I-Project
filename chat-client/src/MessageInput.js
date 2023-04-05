import React, { useState } from 'react'

const NewMessage = ({ socket }) => {
	const [value, setValue] = useState('')
	const submitForm = (e) => {
		e.preventDefault()
		socket.emit('message', value)
		setValue('')
	}

	return (
		<form class="max-w-md w-full mx-auto mt-2" onSubmit={submitForm}>
			<input
				class="w-full px-2 py-1 border-2 border-gray-500 rounded-md"
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
