import { config } from 'dotenv'
import { server } from './bootstrap'
import './routes'
config()
 
const port = Number(process.env.PORT) || 8001; // Convert to number

server.listen(port, () => {
    console.log(`Server raised in port: ${port}`);
});


export default server
