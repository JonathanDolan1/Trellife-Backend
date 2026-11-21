import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

// httpOnly: page scripts cannot read the cookie. sameSite lax: other sites
// cannot send it along with their own POST requests. secure: HTTPS only.
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: authService.TOKEN_MAX_AGE_MS,
}

export async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)

        logger.info('User login: ', user)
        res.cookie('loginToken', loginToken, COOKIE_OPTIONS)

        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const { username, password, fullname, imgUrl } = req.body

        // IMPORTANT!!! 
        // Never write passwords to log file!!!
        // logger.debug(fullname + ', ' + username + ', ' + password)

        const account = await authService.signup(username, password, fullname, imgUrl)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))

        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken, COOKIE_OPTIONS)
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken', { httpOnly: true, sameSite: 'lax', secure: COOKIE_OPTIONS.secure })
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

// user.controller.js
export function getCurrentUser(req, res) {
    const user = req.user; // Assuming `req.user` contains the authenticated user info
    console.log(user)
    if (user) {
        res.json(user)
    } else {
        res.status(401).json({ message: 'No user logged in' });
    }
};
