const express = require('express')
const path = require('path')
const app = express() 
const axios = require('axios')

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let userData = {}
let username = ''
let userinfo = {}
let userstatus = {}

app.get('/', (req,res) => {
    res.render('index')
})


app.post('/search', async(req,res) => {
    const fetchInfo = async () => {
        username = req.body.user
        username = username.trim()
        userData['username'] = username
        try {
            let link = 'https://codeforces.com/api/user.info?handles='
            link += username 
            userinfo = await axios.get(link)
            return userinfo.data
        }
        catch {
            console.log('error')
            res.render('profile_not_found', {userName})
        }
    }
    
    const fetchStatus = async () => {
        try {
            let link = 'https://codeforces.com/api/user.status?handle='
            link += username 
            userstatus = await axios.get(link)
            return userstatus.data
        } 
        catch(error) {
            console.error(error)
        }
    }   
    userData['userinfo'] = await fetchInfo()
    userData['userstatus']= await fetchStatus()
    res.redirect(`/search/user?=${username}`)
    //console.log(userData) 
})


app.get(`/search/user`, (req,res) => {
    res.render('userProfile', {userData})
})


app.listen(8080, () => {
    console.log('LISTENING ON PORT 8080')
})