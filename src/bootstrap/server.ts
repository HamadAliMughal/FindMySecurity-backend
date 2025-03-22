//  Importacion de paquetes nodejs utilizando ES6
import express from 'express'
import cors from 'cors'

const server = express()
setInterval(() => {
  console.log(`Memory usage: ${JSON.stringify(process.memoryUsage())}`);
}, 5000);

server.use(cors())
server.use(express.json())
server.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello Memvy' })
})

//  Exportar de forma predeterminada la variable, funcion, objeto o clase
export default server
