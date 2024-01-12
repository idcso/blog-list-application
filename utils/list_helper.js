const _ = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	return blogs.reduce((sum, blog) => sum+= blog.likes, 0)
}

const favoriteBlog = (blogs) => {
	let favoriteBlog = {}
	let mostLikes = 0

	blogs.forEach(blog => {
		if (blog.likes > mostLikes) {
			mostLikes = blog.likes

			favoriteBlog = {
				title: blog.title,
				author: blog.author,
				likes: blog.likes
			}
		}
	})

	return favoriteBlog
}

const mostBlogs = (blogsArr) => {
	let author = ''
	let blogs = 0

	const groupedObj = _.groupBy(blogsArr, 'author')

	for (let key in groupedObj) {
		if (groupedObj[key].length > blogs) {
			blogs = groupedObj[key].length
			author = key
		}
	}
	
	return({ author, blogs })
}

const mostLikes = (blogsArr) => {
	let author = ''
	let likes = 0

	const groupedObj = _.groupBy(blogsArr, 'author')

	for (let key in groupedObj) {
		let totalLikes = groupedObj[key].reduce((sum, blog) => (
			sum += blog.likes
		), 0)

		if (totalLikes > likes) {
			likes = totalLikes
			author = key
		}
	}
	
	return({ author, likes })
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}