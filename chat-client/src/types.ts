export type Group = {
	name: string
	messages: Message[]
	usersId: string[]
}

export type Message = {
	id: string
	userId: string
	value: string
	time: number
}
