import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import pm2 from 'pm2'
import { promisify } from 'util'
import { freemem, totalmem } from 'os'

const PORT = 3030

const app = new Koa()
const router = new Router()

pm2.connect((err) => {
    if (err) {
        console.error(err)
        process.exit(2)
    }
})

router.get('/', async (ctx) => {
    const data = await promisify(pm2.list.bind(pm2))()

    ctx.body = data
})

router.get('/stats', async (ctx) => {
    ctx.body = {
        memory: freemem(),
        maxMemory: totalmem(),
        cpu: process.cpuUsage().system,
        disk: 0,
    }
})

app.use(bodyParser()).use(router.routes()).use(router.allowedMethods())

app.listen(PORT, () => {
    console.log(`Api listening on port ${PORT}`)
})
