// Minimal in-memory stand-in for a MongoDB collection, plus a fake res.
// Only the calls the services actually use are implemented.

function idText(value) {
    if (value === null || value === undefined) return value
    return value.toString()
}

function matches(doc, filter) {
    for (const key of Object.keys(filter)) {
        const wanted = filter[key]
        const actual = doc[key]
        if (key === '_id') {
            if (idText(actual) !== idText(wanted)) return false
            continue
        }
        if (Array.isArray(actual)) {
            if (!actual.includes(wanted)) return false
            continue
        }
        if (actual !== wanted) return false
    }
    return true
}

export function makeCollection(docs) {
    const store = docs.map(doc => ({ ...doc }))
    return {
        store,
        async findOne(filter) {
            const found = store.find(doc => matches(doc, filter))
            if (!found) return null
            return { ...found }
        },
        async updateOne(filter, update) {
            const found = store.find(doc => matches(doc, filter))
            if (!found) return { matchedCount: 0, modifiedCount: 0 }
            Object.assign(found, update.$set)
            return { matchedCount: 1, modifiedCount: 1 }
        },
        async updateMany(filter, update) {
            let modifiedCount = 0
            for (const doc of store) {
                if (!matches(doc, filter)) continue
                const pull = update.$pull
                for (const field of Object.keys(pull)) {
                    doc[field] = doc[field].filter(item => item !== pull[field])
                }
                modifiedCount++
            }
            return { modifiedCount }
        },
        async insertOne(doc) {
            store.push(doc)
            return { insertedId: doc._id }
        },
    }
}

export function makeRes() {
    const res = {
        statusCode: 200,
        body: undefined,
        cookies: [],
        status(code) {
            res.statusCode = code
            return res
        },
        send(body) {
            res.body = body
            return res
        },
        json(body) {
            res.body = body
            return res
        },
        end(body) {
            res.body = body
            return res
        },
        cookie(name, value, options) {
            res.cookies.push({ name, value, options })
            return res
        },
        clearCookie() {
            return res
        },
    }
    return res
}
