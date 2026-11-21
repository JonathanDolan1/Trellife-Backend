import { ObjectId } from 'mongodb'
import { userService } from './user.service.js'
import { boardService } from '../board/board.service.js'
import { logger } from '../../services/logger.service.js'

export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(500).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(500).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(500).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const userId = req.params.id
        if (userId !== req.loggedinUser._id) {
            return res.status(403).send({ err: 'You can only update your own profile' })
        }
        const savedUser = await userService.update(userId, req.body)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

export async function updateUserFavorites(req, res) {
    try {
        const { boardId } = req.body
        if (typeof boardId !== 'string' || !ObjectId.isValid(boardId)) {
            return res.status(400).send({ err: 'Invalid board id' })
        }
        // This cleans up every user's favorites after a board is deleted,
        // so it is only allowed once the board no longer exists.
        const board = await boardService.getById(boardId)
        if (board) {
            return res.status(409).send({ err: 'Board still exists' })
        }
        const result = await userService.removeBoardFromFavorites(boardId)
        res.send(result)
    } catch (err) {
        console.error('Error removing board from favorites:', err);
        res.status(500).json({ message: 'Error removing board from favorites' });
    }
}