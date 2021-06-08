const express = require('express')
const path = require('path')
const app = express() 
const axios = require('axios')

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


let linkData = {}

app.get('/', (req,res) => {
    res.render('index')
})


app.get('/methods', (req,res) => {
    res.render('methods/home')
})


app.get('/methods/:methodName', async(req,res) => {
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
    if (methodName === 'blogEntry')
        res.render(`methods/method_form`, {methodName,name})
    else {
        let [linkcontest_listT,linkcontest_listF] = await Promise.all([axios.get(`https://codeforces.com/api/blogEntry.comments?blogEntryId=79`),axios.get(`https://codeforces.com/api/blogEntry.view?blogEntryId=79`)])
        linkData.linkcontest_listT = linkcontest_listT
        linkData.linkcontest_listF = linkcontest_listF
        //console.log(linkData.linkcontest_listF.status)
        res.render('methods/method_home', {linkData,methodName})
    }
})

app.get('/methods/:methodName/:id', async(req,res) => {
    let id = req.params.id.substring(3)
    id = Number(id)
    const methodName = req.params.methodName
    if (methodName === 'blogEntry') {
        let [linkblogEntry_comments,linkblogEntry_view] = await Promise.all([axios.get(`https://codeforces.com/api/blogEntry.comments?blogEntryId=${id}`),axios.get(`https://codeforces.com/api/blogEntry.view?blogEntryId=${id}`)])
        linkData.linkblogEntry_comments = linkblogEntry_comments
        linkData.linkblogEntry_view = linkblogEntry_view
        res.render('methods/method_home', {linkData,id,methodName})
    }
    else if (methodName === 'contest') {
        
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