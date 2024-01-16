const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
	const token = request.get('authorization')

  if (token && token.startsWith('Bearer ')) {
		request.token = token.replace('Bearer ', '')
  } else {
		request.token = null
	}
	
	next()
}

const userExtractor = async (request, response, next) => {
	const decodedToken = jwt.verify(request.token, process.env.SECRET)

	if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token provided' })
  }

	request.user = await User.findById(decodedToken.id)
	
	next()
}

const errorHandler = (error, request, response, next) => {
	logger.error(error.message)

	if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	} else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  }

	next(error)
}

module.exports = {
	errorHandler,
	tokenExtractor,
	userExtractor
}