const express = require('express')
const app = express()
const port = 3000
const print = console.log
app.use(express.json());
let ConnectMessageJson = {
  ["User"] : {},
  ["Room"] : {}
}

function FindUserFromLicenseKey(username) {
  for (let key in ConnectMessageJson.User) {
    let value = ConnectMessageJson.User[key];
    if (value["Username"] == username){
      return key
    }
  }
  return false
}

function NumberIndex(Json) {
  let count = 0

  for (let key in Json) {
    count += 1
  }
  return count
}

app.post('/sms', (req, res) => {
  const body = req.body
  if (body.LicenseKey && body.Username && body.Userid && body.Message && body.Time && body.Invitecode && body.Message) {
    if (ConnectMessageJson.Room[body.Invitecode]) {
      if ( FindUserFromLicenseKey(body.Username) == body.LicenseKey ){
        let count = ConnectMessageJson.Room[body.Invitecode].Index+1
        ConnectMessageJson.Room[body.Invitecode].Index = count
        ConnectMessageJson.Room[body.Invitecode].Chat[count] = {
          ["Userid"] : body.Userid,
          ["Time"] : body.Time,
          ["Message"] : body.Message,
        }
        res.send("Ok")
        
      } else {
        res.send("LicenseKey is not correct")
      }
    } else {
      res.send("dont have room")
    }
  } else {
    res.send("fail data")
  }
})

app.get('/chat/:myparams', (req, res) => {
  const invitecode = req.params.myparams
  if (ConnectMessageJson.Room[invitecode]) {
    res.send(ConnectMessageJson.Room[invitecode].Chat)
  } else {
    res.send([])
  }
})

app.get('/member/:myparams', (req, res) => {
  const invitecode = req.params.myparams
  if (ConnectMessageJson.Room[invitecode]) {
    res.send(ConnectMessageJson.Room[invitecode].Member)
  } else {
    res.send([])
  }
})

app.get('/user/:myparams', (req, res) => {
  const LicenseKey = req.params.myparams
  if (ConnectMessageJson.User[LicenseKey]) {
    res.send(ConnectMessageJson.User[LicenseKey] )
  } else {
    res.send([])
  }
})

app.get('/chat/:myparams', (req, res) => {
  const invitecode = req.params.myparams

  const rooms = {}

  if (ConnectMessageJson.Room[invitecode]) {
    res.send(ConnectMessageJson.Room[invitecode].Chat)
  } else {
    res.send({})
  }
  
})

app.get('/room/:myparams', (req, res) => {
  const LicenseKey = req.params.myparams

  const rooms = {}

  if (ConnectMessageJson.User[LicenseKey]) {

    for (let key in ConnectMessageJson.User[LicenseKey].Room) {
      const invitecode = ConnectMessageJson.User[LicenseKey].Room[key]
      if (ConnectMessageJson.Room[invitecode]) {
        rooms[invitecode] = ConnectMessageJson.Room[invitecode]
      }
    }
    res.send(rooms)
  } else {
    res.send({})
  }
  
})

app.post('/joinroom', (req, res) => {
  const body = req.body
  if (body.LicenseKey && body.Invitecode && body.Username && body.Userid) {
    if (FindUserFromLicenseKey(body.Username) == body.LicenseKey) {
      if (ConnectMessageJson.Room[body.Invitecode]){
        ConnectMessageJson.User[body.LicenseKey]["Room"][NumberIndex(ConnectMessageJson.User[body.LicenseKey]["Room"])] = body.Invitecode
        ConnectMessageJson.Room[body.Invitecode].Member[NumberIndex(ConnectMessageJson.Room[body.Invitecode].Member)+1] = body.Username
        res.send('ok')
      } else {
        res.send('invite code is not correct')
      }
    } else {
      res.send("fail licensekey or username")
    }
  } else {
    res.send("data is not correct")
  }
})

app.post('/createroom', (req, res) => {
  const body = req.body
  if (body.LicenseKey && body.Invitecode && body.Username && body.Userid) {
    if (FindUserFromLicenseKey(body.Username) == body.LicenseKey) {
      if (!ConnectMessageJson.Room[body.Invitecode]){
        ConnectMessageJson.Room[body.Invitecode] = {
          ["Owner"]:{
            ["Userid"] : body.Userid,
            ["Username"] : body.Username,
            ["LicenseKey"] : body.LicenseKey,
          },
          ["Name"]:body.Username,
          ["Index"]:0,
          ["Profile"]:body.Profile,
          ["Chat"]:{},
          ["Member"]:{
            [1] : body.Username
          },
        }
        ConnectMessageJson.User[body.LicenseKey]["Room"][NumberIndex(ConnectMessageJson.User[body.LicenseKey]["Room"])] = body.Invitecode
        res.send('ok')
      }
    } else {
      res.send("fail licensekey or username")
    }
  } else {
    res.send("data is not correct")
  }
})

app.post('/registeruser', (req, res) => {
  const body = req.body
  if (body.LicenseKey && body.Username && body.Userid) {
    if (!ConnectMessageJson.User[body.LicenseKey] && !FindUserFromLicenseKey(body.Username)) {
      ConnectMessageJson.User[body.LicenseKey] = {
        ["Username"] : body.Username,
        ["Userid"] : body.Userid,
        ["Room"] : {}
      }
      res.send("ok")
    } else {
      res.send("already register")
    }
  } else {
    res.send("licenseKey or username or userid is not correct")
  }
})

app.post('/updateroom', (req, res) => {
  const body = req.body
  if (body.LicenseKey && body.Invitecode && body.Name && body.Profile ) {
    if (ConnectMessageJson.Room[body.Invitecode]) {
      if (ConnectMessageJson.Room[body.Invitecode].Owner.LicenseKey == body.LicenseKey) {

        ConnectMessageJson.Room[body.Invitecode].Name = body.Name
        ConnectMessageJson.Room[body.Invitecode].Profile = body.Profile
        res.send("ok")
      } else {
        res.send("your not owner room")
      }
    } else {
      res.send("don't have room")
    }
  } else {
    res.send("licenseKey or username or userid is not correct")
  }
})

app.listen(port, () => {
  console.log(`Server is online😉😉`)
})