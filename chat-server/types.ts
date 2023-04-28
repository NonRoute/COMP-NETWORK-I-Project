export type Group = {
	messages: Message[]
	usersId: string[]
}

export type Message = {
	id: string
	userId: string
	value: string
	time: number
}
