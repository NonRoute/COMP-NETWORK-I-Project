export type Group = {
	name: string
	messages: Message[]
	users: string[]
}

export type Message = {
	id: string
	user: string
	value: string
	time: number
}
