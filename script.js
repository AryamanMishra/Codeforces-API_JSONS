const express = require('express')
const path = require('path')
const app = express() 
const axios = require('axios')

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


let check = 0
let userData = {}
let username = ''
let userinfo = {}
let userstatus = {}
let userrating = {}

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
            console.log('error in info')
            res.render('profile_not_found', {username})
            check++
        }
    }
    
    const fetchStatus = async() => {
        try {
            let link = 'https://codeforces.com/api/user.status?handle='
            link += username 
            userstatus = await axios.get(link)
            return userstatus.data
        } 
        catch(error) {
            console.error('error in status')
        }
    }  
    const fetchRating = async() => {
        try {
            let link = 'https://codeforces.com/api/user.rating?handle='
            link += username 
            userrating = await axios.get(link)
            return userrating.data
        }
        catch(error) {
            console.log('error in rating')
        }
    } 
    const fetchBlogEntries = async() => {
        try {
            let link = 'https://codeforces.com/api/user.blogEntries?handle='
            link += username
            userblogEntries = await axios.get(link)
            return userblogEntries.data
        }
        catch(error) {
            console.log('error in blog entries')
        }
    }
    userData['userinfo'] = await fetchInfo()
    userData['userstatus'] = await fetchStatus()
    userData['userrating'] = await fetchRating()
    userData['userblogEntries'] = await fetchBlogEntries()
    if (check === 0)
        res.redirect(`/search?user=${username}`)
    //console.log(userData) 
})


app.get('/search', (req,res) => {
    res.render('userProfile', {userData})
})


app.listen(8080, () => {
    console.log('LISTENING ON PORT 8080')
})