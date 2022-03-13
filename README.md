# Socket.io Events - Messages

In thi branch, we define socket events for handling messages 

## For example usage

### Server
```javascript
... // import models
const socketIo = (io) => {
  io.on('connection', (socket) => {
    // define listener on event “load admin contact”
    socket.on("load messages", async (payload) => {
      try {
        const token = socket.handshake.auth.token

        const tokenKey = process.env.TOKEN_KEY
        const verified = jwt.verify(token, tokenKey)

        const idRecipient = payload // catch recipient id sent from client
        const idSender = verified.id //id user

        const data = await chat.findAll({
          where: {
            idSender: {
              [Op.or]: [idRecipient, idSender]
            },
            idRecipient: {
              [Op.or]: [idRecipient, idSender]
            }
          },
          include: [
            {
              model: user,
              as: "recipient",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
            {
              model: user,
              as: "sender",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
          ],
          order: [['createdAt', 'ASC']],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
          }
        })

        socket.emit("messages", data)
      } catch (error) {
        console.log(error)
      }
    })
  })
}

module.exports = socketIo
```

### Client
```javascript
...
// connect to server in useEffect function
useEffect(() =>{
  socket = io('http://localhost:5000', {
      auth: {
          token: localStorage.getItem("token")
      },
      query: {
          id: state.user.id
      }
  })

  // define corresponding socket listener 
  socket.on("new message", () => {
    console.log("contact", contact)
    console.log("triggered", contact?.id)
    socket.emit("load messages", contact?.id)
  })
  
  // listen error sent from server
  socket.on("connect_error", (err) => {
    console.error(err.message); // not authorized
  });

  loadContact()
  loadMessages()

  return () => {
      socket.disconnect()
  }
}, [messages])

const loadMessages = () => {
  // listen event to get admin contact
  socket.on("messages", (data) => {
      // do whatever to the data sent from server
  })
}
...

```