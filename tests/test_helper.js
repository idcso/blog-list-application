const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
	{
		title: "Hello title",
		author: "idcso",
		url: "random url",
		likes: 888888
	},
	{
		title: "Refactor step2",
		author: "idcso",
		url: "random url",
		likes: 55555,
	}
]

const initialUser = {
	username: "testUser",
	password: "randomPassword",
	name: "testName"
}

let token
let userId

const blogsInDb = async () => {
	let blogs = await Blog.find({})
	return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
	let users = await User.find({})
	return users.map(user => user.toJSON())
}

module.exports = {
	initialBlogs,
	initialUser,
	token,
	userId,
	blogsInDb,
	usersInDb
}