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
let check = 0
let filler = null
let id = null
let countFillercheck = false


app.get('/', (req,res) => {
    res.render('index')
})


app.get('/methods', (req,res) => {
    res.render('methods/home')
})

app.get('/methods/:methodName', async(req,res) => {
    const methodName = req.params.methodName
    if (methodName === 'blogEntry')
        res.render(`methods/method_form`, {methodName})
    else if (methodName === 'contest') {
        let [linkcontest_listT,linkcontest_listF] = await Promise.all([axios.get(`https://codeforces.com/api/contest.list?gym=true`),axios.get(`https://codeforces.com/api/contest.list?gym=false`)])
        linkData.linkcontest_listT = linkcontest_listT
        linkData.linkcontest_listF = linkcontest_listF
        //console.log(linkData.linkcontest_listF.data)
        res.render('methods/method_home', {linkData,methodName,check})
    }
    else if (methodName === 'problemset') {
        res.render('methods/method_home', {methodName,check,countFillercheck})
    }
})
app.get('/methods/:methodName/forms/:idFiller', (req,res) => {
    const methodName = req.params.methodName
    filler = req.params.idFiller
    if (methodName === 'problemset') {
        if (filler === 'tagFiller')
            res.render(`methods/method_form`, {methodName ,filler})
        else
            res.render('methods/method_form_1', {methodName,filler})
    }
    else {
        res.render('methods/method_form', {methodName})
    }
})


app.get('/methods/:methodName/:id', async(req,res) => {
    const methodName = req.params.methodName
    if (methodName === 'blogEntry' || methodName === 'contest') {
        id = req.params.id.substring(3)
        id = Number(id)
    }
    else if (methodName === 'problemset') {
        if (filler === 'countFiller') {
            id = req.params.id.substring(6)
            id = Number(id)
        }
        else {
            id = req.params.id.substring(5)
        }
        console.log(id)
        //console.log(filler)
    }
    if (methodName === 'blogEntry') {
        let [linkblogEntry_comments,linkblogEntry_view] = await Promise.all([axios.get(`https://codeforces.com/api/blogEntry.comments?blogEntryId=${id}`),axios.get(`https://codeforces.com/api/blogEntry.view?blogEntryId=${id}`)])
        linkData.linkblogEntry_comments = linkblogEntry_comments
        linkData.linkblogEntry_view = linkblogEntry_view
        res.render('methods/method_home', {linkData,id,methodName})
    }
    else if (methodName === 'contest') {
        let [linkcontest_hacks,linkcontest_ratingChanges,linkcontest_standings,linkcontest_status] = await Promise.all([axios.get(`https://codeforces.com/api/contest.hacks?contestId=${id}`),axios.get(`https://codeforces.com/api/contest.ratingChanges?contestId=${id}`),axios.get(`https://codeforces.com/api/contest.standings?contestId=${id}`),axios.get(`https://codeforces.com/api/contest.status?contestId=${id}`)])
        linkData.linkcontest_hacks = linkcontest_hacks
        linkData.linkcontest_ratingChanges = linkcontest_ratingChanges
        linkData.linkcontest_standings = linkcontest_standings
        linkData.linkcontest_status = linkcontest_status
        //console.log(linkData.linkcontest_ratingChanges.data)
        check = 1
        res.render('methods/method_home', {linkData,methodName,check,id})
        check = 0
    }
    else if (methodName === 'problemset') {
        if (filler === 'countFiller') {
            console.log('llll')
            let linkproblemset_recentStatus = await axios.get(`https://codeforces.com/api/problemset.recentStatus?count=${id}`)
            linkData.linkproblemset_recentStatus = linkproblemset_recentStatus
            countFillercheck = true
        }
        else {
            console.log('kkk')
            let linkproblemset_problems = await axios.get(`https://codeforces.com/api/problemset.problems?tags=${id}`)
            linkData.linkproblemset_problems = linkproblemset_problems
        }
        check = 1
        res.render('methods/method_home', {linkData,methodName,check,countFillercheck,id})
        check = 0
        countFillercheck = false
    }
})


app.post('/methods/:methodName',  (req,res) => {
    const methodName = req.params.methodName
    id = req.body.id
    if (methodName === 'blogEntry' || methodName === 'contest')
        id = Number(id)
    if (methodName === 'problemset') {
        if (filler === 'countFiller') {
            id = Number(id)
            res.redirect(`/methods/${req.params.methodName}/count=${id}`)
        }
        else {
            res.redirect(`/methods/${req.params.methodName}/attr=${id}`)
        }
    }
    //console.log(req.params.methodName)
    else {
        res.redirect(`/methods/${req.params.methodName}/id=${id}`)
    }
})



app.listen(8080, () => {
    console.log('LISTENING ON PORT 8080')
})