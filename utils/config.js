require('dotenv').config()

const MONGODB_URI = 'mongodb+srv://idcso:audible12@cluster0.vopilbn.mongodb.net/bloglistApp?retryWrites=true&w=majority'
const PORT = 3003

module.exports = {
	MONGODB_URI, PORT
}