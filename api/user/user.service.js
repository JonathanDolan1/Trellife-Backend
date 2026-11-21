import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'
import { utilService } from '../../services/util.service.js'

export const userService = {
	query,
	getById,
	getByUsername,
	remove,
	update,
	add,
	removeBoardFromFavorites
}

async function query(filterBy = {}) {
	const criteria = _buildCriteria(filterBy)
	try {
		const collection = await dbService.getCollection('user')
		var users = await collection.find(criteria).sort({ nickname: -1 }).toArray()
		users = users.map(user => {
			delete user.password
			return user
		})
		return users
	} catch (err) {
		logger.error('cannot find users', err)
		throw err
	}
}

async function getById(userId) {
	try {
		const collection = await dbService.getCollection('user')
		const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
		delete user.password
		return user
	} catch (err) {
		logger.error(`while finding user ${userId}`, err)
		throw err
	}
}
async function getByUsername(username) {
	try {
		const collection = await dbService.getCollection('user')
		const user = await collection.findOne({ username })
		return user
	} catch (err) {
		logger.error(`while finding user ${username}`, err)
		throw err
	}
}

async function remove(userId) {
	try {
		const collection = await dbService.getCollection('user')
		await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
	} catch (err) {
		logger.error(`cannot remove user ${userId}`, err)
		throw err
	}
}

async function update(userId, user) {
	try {
		// Only these fields can be changed. username, password and isAdmin
		// are never taken from the request.
		const userToSave = {}
		if (typeof user.fullname === 'string') userToSave.fullname = user.fullname
		if (typeof user.imgUrl === 'string') userToSave.imgUrl = user.imgUrl
		if (Array.isArray(user.favorites)) {
			userToSave.favorites = user.favorites.filter(id => typeof id === 'string')
		}
		const collection = await dbService.getCollection('user')
		await collection.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: userToSave })
		return getById(userId)
	} catch (err) {
		logger.error(`cannot update user ${userId}`, err)
		throw err
	}
}

async function add(user) {
	try {
		// Validate that there is no such user:
		const existUser = await getByUsername(user.username)
		if (existUser) throw new Error('Username taken')


		const userToAdd = {
			username: user.username,
			password: user.password,
			fullname: user.fullname,
			imgUrl: user.imgUrl,
			favorites: []
		}
		const collection = await dbService.getCollection('user')
		await collection.insertOne(userToAdd)
		return userToAdd
	} catch (err) {
		logger.error('cannot insert user', err)
		throw err
	}
}

async function removeBoardFromFavorites(boardId) {
	try {
		const collection = await dbService.getCollection('user')
		const result = await collection.updateMany(
			{ favorites: boardId },
			{ $pull: { favorites: boardId } }
		);

		return {
			message: 'Board removed from favorites successfully',
			modifiedCount: result.modifiedCount
		};
	} catch (error) {
		console.error('Error removing board from favorites:', error);
		throw error
	}
}



function _buildCriteria(filterBy) {
	const criteria = {}
	if (filterBy.txt) {
		const txtCriteria = { $regex: utilService.escapeRegex(String(filterBy.txt)), $options: 'i' }
		criteria.$or = [
			{
				username: txtCriteria,
			},
			{
				fullname: txtCriteria,
			},
		]
	}
	return criteria
}
