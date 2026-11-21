import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'
import '../../config.js';

// Login tokens (and their cookie) are valid for 7 days.
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken,
    TOKEN_MAX_AGE_MS
}

const cryptr = new Cryptr(process.env.SECRET1)

async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getByUsername(username)
    if (!user) throw new Error('Invalid username or password')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid Username or password')

    delete user.password
    return user
}

async function signup(username, password, fullname, imgUrl) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) throw new Error('Missing details')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username, password: hash, fullname, imgUrl })
}

function getLoginToken(user) {
    const userInfo = { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl, issuedAt: Date.now() }
    return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        // Tokens from before this change have no issuedAt. They are treated
        // as expired, so those users simply log in again.
        if (typeof loggedinUser.issuedAt !== 'number') return null
        const age = Date.now() - loggedinUser.issuedAt
        if (age > TOKEN_MAX_AGE_MS) return null
        return loggedinUser
    } catch (err) {
        console.log('Invalid login token')
    }
    return null
}