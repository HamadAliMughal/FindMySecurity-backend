import { config } from 'dotenv'
import { server } from './bootstrap'
import './routes'
config()

const { PORT } = process.env || 3004
 
server.listen(PORT, async () => {
  console.log(`Server raised in port: ${PORT}`)
})
export default server
