const express = require('express')
const path = require('path')
const app = express() 
const axios = require('axios')

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({extended:true}))



let linkComments = {}
let linkView = {}

app.get('/', (req,res) => {
    res.render('index')
})


app.get('/methods', (req,res) => {
    res.render('methods/home')
})


app.get('/methods/:methodName', (req,res) => {
    const methodName = req.params.methodName
    let x = -1
    let name = null
    for (let i=0;i<methodName.length;i++) {
        if (methodName[i] === methodName[i].toUpperCase()) {
            x = i
            break;
        }
    }
    if (x === -1) {
        name = methodName
    } 
    else {
        name = methodName.substring(0,x)
    }
    res.render(`methods/method_form`, {methodName,name})
})


app.get('/methods/:methodName/:id', async(req,res) => {
    let id = req.params.id.substring(3)
    id = Number(id)
    const methodName = req.params.methodName
    if (methodName == 'blogEntry') {
        linkComments = await axios.get(`https://codeforces.com/api/blogEntry.comments?blogEntryId=${id}`)
        linkView = await axios.get(`https://codeforces.com/api/blogEntry.view?blogEntryId=${id}`)
        console.log(linkView.data)
        res.render('methods/method_home', {linkComments,linkView,methodName,id})
    }
})

app.post('/methods/:methodName',  (req,res) => {
    let id = req.body.id
    id = Number(id)
    res.redirect(`/methods/${req.params.methodName}/id=${id}`)
})



app.listen(8080, () => {
    console.log('LISTENING ON PORT 8080')
})