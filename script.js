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

const escapeJson = function (json) {
    if (typeof json !== 'string') {
	return json;
    }
    return json.replace(/</g, '\\u003c')
	       .replace(/>/g, '\\u003e')
	       .replace(/&/g, '\\u0026');
};



app.get('/', (req,res) => {
    res.render('index')
})


app.get('/methods', (req,res) => {
    res.render('methods/home')
})

app.get('/methods/:methodName', async(req,res) => {
    const methodName = req.params.methodName
    if (methodName === 'blogEntry' || methodName === 'recentActions') {
        res.render(`methods/method_form`, {methodName})
    }
    else if (methodName === 'contest') {
        let [linkcontest_listT,linkcontest_listF] = await Promise.all([axios.get(`https://codeforces.com/api/contest.list?gym=true`),axios.get(`https://codeforces.com/api/contest.list?gym=false`)])
        linkcontest_listT = JSON.stringify(linkcontest_listT.data)
        linkcontest_listT = escapeJson(linkcontest_listT)
        linkcontest_listF = JSON.stringify(linkcontest_listF.data)
        linkcontest_listF = escapeJson(linkcontest_listF)
        linkData.linkcontest_listT = linkcontest_listT
        linkData.linkcontest_listF = linkcontest_listF
        res.render('methods/method_home', {linkData,methodName,check})
    }
    else if (methodName === 'problemset') {
        res.render('methods/method_home', {methodName,check,countFillercheck})
    }
    else {
        // let [linkuser_ratedListAOT,linkuser_ratedListAOF] = await Promise.all([axios.get('https://codeforces.com/api/user.ratedList?activeOnly=true'),axios.get('https://codeforces.com/api/user.ratedList?activeOnly=false')])
        // linkuser_ratedListAOT = JSON.stringify(linkuser_ratedListAOT.data)
        // linkuser_ratedListAOT = escapeJson(linkuser_ratedListAOT)
        // linkData.linkuser_ratedListAOT = linkuser_ratedListAOT
        // linkuser_ratedListAOF = JSON.stringify(linkuser_ratedListAOF.data)
        // linkuser_ratedListAOF = escapeJson(linkuser_ratedListAOF)
        // linkData.linkuser_ratedListAOF = linkuser_ratedListAOF
        res.render('methods/method_home',{methodName,check,linkData})
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
        //console.log(id)
        //console.log(filler)
    }
    if (methodName === 'blogEntry') {
        let [linkblogEntry_comments,linkblogEntry_view] = await Promise.all([axios.get(`https://codeforces.com/api/blogEntry.comments?blogEntryId=${id}`),axios.get(`https://codeforces.com/api/blogEntry.view?blogEntryId=${id}`)])
        linkblogEntry_comments = JSON.stringify(linkblogEntry_comments.data)
        linkblogEntry_comments = escapeJson(linkblogEntry_comments)
        linkData.linkblogEntry_comments = linkblogEntry_comments
        linkblogEntry_view = JSON.stringify(linkblogEntry_view.data)
        linkblogEntry_view = escapeJson(linkblogEntry_view)
        linkData.linkblogEntry_view = linkblogEntry_view
        res.render('methods/method_home', {linkData,id,methodName})
    }
    else if (methodName === 'contest') {
        let [linkcontest_hacks,linkcontest_ratingChanges,linkcontest_standings,linkcontest_status] = await Promise.all([axios.get(`https://codeforces.com/api/contest.hacks?contestId=${id}`),axios.get(`https://codeforces.com/api/contest.ratingChanges?contestId=${id}`),axios.get(`https://codeforces.com/api/contest.standings?contestId=${id}`),axios.get(`https://codeforces.com/api/contest.status?contestId=${id}`)])
        linkcontest_hacks = JSON.stringify(linkcontest_hacks.data)
        linkcontest_hacks = escapeJson(linkcontest_hacks)
        linkData.linkcontest_hacks = linkcontest_hacks
        linkcontest_ratingChanges = JSON.stringify(linkcontest_ratingChanges.data)
        linkcontest_ratingChanges = escapeJson(linkcontest_ratingChanges)
        linkData.linkcontest_ratingChanges = linkcontest_ratingChanges
        linkcontest_standings = JSON.stringify(linkcontest_standings.data)
        linkcontest_standings = escapeJson(linkcontest_standings)
        linkData.linkcontest_standings = linkcontest_standings
        linkcontest_status = JSON.stringify(linkcontest_status.data)
        linkcontest_status = escapeJson(linkcontest_status)
        linkData.linkcontest_status = linkcontest_status
        //console.log(linkData.linkcontest_ratingChanges.data)
        check = 1
        res.render('methods/method_home', {linkData,methodName,check,id})
        check = 0
    }
    else if (methodName === 'problemset') {
        if (filler === 'countFiller') {
            //console.log('llll')
            let linkproblemset_recentStatus = await axios.get(`https://codeforces.com/api/problemset.recentStatus?count=${id}`)
            linkproblemset_recentStatus = JSON.stringify(linkproblemset_recentStatus.data)
            linkproblemset_recentStatus = escapeJson(linkproblemset_recentStatus)
            linkData.linkproblemset_recentStatus = linkproblemset_recentStatus
            countFillercheck = true
        }
        else {
            //console.log('kkk')
            let linkproblemset_problems = await axios.get(`https://codeforces.com/api/problemset.problems?tags=${id}`)
            linkproblemset_problems = JSON.stringify(linkproblemset_problems.data)
            linkproblemset_problems = escapeJson(linkproblemset_problems)
            linkData.linkproblemset_problems = linkproblemset_problems
        }
        check = 1
        res.render('methods/method_home', {linkData,methodName,check,countFillercheck,id})
        check = 0
        countFillercheck = false
    }
    else if (methodName === 'recentActions') {
        id = req.params.id.substring(9)
        id = Number(id)
        let linkrecentActions = await axios.get(`https://codeforces.com/api/recentActions?maxCount=${id}`)
        linkrecentActions = JSON.stringify(linkrecentActions.data)
        linkrecentActions = escapeJson(linkrecentActions)
        linkData.linkrecentActions = linkrecentActions
        res.render('methods/method_home', {linkData,methodName,id})
    }
    else {
        id = req.params.id.substring(11)
        //console.log(id)
        let [linkuser_blogEntries,linkuser_info,linkuser_rating,linkuser_status] = await Promise.all([axios.get(`https://codeforces.com/api/user.blogEntries?handle=${id}`),axios.get(`https://codeforces.com/api/user.info?handles=${id}`),axios.get(`https://codeforces.com/api/user.rating?handle=${id}`),axios.get(`https://codeforces.com/api/user.status?handle=${id}`)])
        linkuser_blogEntries = JSON.stringify(linkuser_blogEntries.data)
        linkuser_blogEntries = escapeJson(linkuser_blogEntries)
        linkData.linkuser_blogEntries = linkuser_blogEntries
        linkuser_info = JSON.stringify(linkuser_info.data)
        linkuser_info = escapeJson(linkuser_info)
        linkData.linkuser_info = linkuser_info
        linkuser_rating = JSON.stringify(linkuser_rating.data)
        linkuser_rating = escapeJson(linkuser_rating)
        linkData.linkuser_rating = linkuser_rating
        linkuser_status = JSON.stringify(linkuser_status.data)
        linkuser_status = escapeJson(linkuser_status)
        linkData.linkuser_status = linkuser_status
        check = 1
        res.render('methods/method_home', {linkData,methodName,check,id})
        check = 0
    }
})


app.post('/methods/:methodName',  (req,res) => {
    const methodName = req.params.methodName
    id = req.body.id
    if (methodName === 'blogEntry' || methodName === 'contest') {
        id = Number(id)
        res.redirect(`/methods/${req.params.methodName}/id=${id}`)
    }
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
    else if (methodName === 'recentActions') {
        res.redirect(`/methods/${req.params.methodName}/maxCount=${id}`)
    }
    else if (methodName === 'user') {
        res.redirect(`/methods/${req.params.methodName}/userHandle=${id}`)
    }
})



app.listen(8080, () => {
    console.log('LISTENING ON PORT 8080')
})