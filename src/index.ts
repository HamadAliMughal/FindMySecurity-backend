import { config } from 'dotenv'
import { server } from './bootstrap'
import './routes'
config()
 
const port = Number(process.env.PORT) || 3001; // Convert to number

server.listen(port, '0.0.0.0', () => {
    console.log(`Server raised in port: ${port}`);
});


export default server
