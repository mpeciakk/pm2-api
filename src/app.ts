import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import pm2 from 'pm2'
import { promisify } from 'util'
import { freemem, totalmem, cpus } from 'os'
import dotenv from 'dotenv'
import { cpu, drive } from 'node-os-utils'

const PORT = 3030

const app = new Koa()
const router = new Router()

dotenv.config()

pm2.connect((err) => {
    if (err) {
        console.error(err)
        process.exit(2)
    }
})

app.use(async (ctx, next) => {
    if (!ctx.header.authorization || ctx.header.authorization.split(' ')[1] != process.env.TOKEN) {
        ctx.body = {
            status: 401,
            message: 'Unauthorized',
        }
    } else {
        await next()
    }
})

router.get('/', async (ctx) => {
    const data = await (await promisify(pm2.list.bind(pm2))()).map(({ pm2_env, ...data }) => data)

    ctx.body = data
})

router.get('/stats', async (ctx) => {   
    ctx.body = {
        memory: totalmem() - freemem(),
        maxMemory: totalmem(),
        cpu: await cpu.usage(),
        disk: (await drive.used('/')).usedPercentage,
    }
})

app.use(bodyParser()).use(router.routes()).use(router.allowedMethods())

app.listen(PORT, () => {
    console.log(`Api listening on port ${PORT}`)
})
