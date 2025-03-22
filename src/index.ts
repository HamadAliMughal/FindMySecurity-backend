import { config } from 'dotenv'
import { server } from './bootstrap'
import './routes'
config()

const port = process.env.PORT || 4001;
server.listen(PORT, async () => {
  console.log(`Server raised in port: ${PORT}`)
})
export default server
