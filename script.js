/*

    HEROKU DEPLOYED
    https://codeforces-api-jsons.herokuapp.com/

*/

/*

Codeforces_API-JSONS
READ THE COMMENTS CAREFULLY AS THE CODE IS LITTLE COMPLEX AND LENGTHY PROCEDURALLY.
NOTE - If in comments I am mentioning for example, blogEntry as a method, that doesnt mean blogEntry is itself a method in CF API.
It simply means that, I am talking about the methods related to blogEntry which are, blogEntry.comments and blogEntry.views.
Same for every other mentioned "methods"(like problemset method means I am talking about problemset.problems and problemset.recentStatus methods in CF API)
For more details on this visit - https://codeforces.com/apiHelp


contest.status scrapped out for now

*/


/* All the required npm modules */
const express = require('express')
const path = require('path')
const app = express() // Calling express and assigning to app
const axios = require('axios')
const session = require('express-session');


/* Setting views folder as default for looking in ejs files and adding it to path */
app.set('views',path.join(__dirname,'views'))


/* View engine -> ejs */
app.set('view engine','ejs')


/* For static files like css and html */
app.use(express.static(__dirname + '/public'));


/* For parsing resolved promise data in JSON format */
app.use(express.json())
app.use(express.urlencoded({extended:true}))


/* Session use */
app.use(session({
    name: 'session',
    secret: process.env.SECRET || 'thisisasecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))




/* 
    Functional code starts here 
*/



/* The main object storing all the data to be passed, in key value pair */
let linkData = {}


let check = 0
let filler = null // Store type of attribute to be passed in link, rendering form
let id = null
let countFillercheck = false


/* To replace characters like <,> into their unicode forms imlplying by codefoces API*/
const escapeJson = function (json) {
    if (typeof json !== 'string') {
	return json;
    }
    return json.replace(/</g, '\\u003c')
	       .replace(/>/g, '\\u003e')
	       .replace(/&/g, '\\u0026');
};


/* Home page */
app.get('/', (req,res) => {
    res.render('index')
})


/* To show page containing all methods */
app.get('/methods', (req,res) => {
    res.render('methods/home')
})


/* GET function for a particular method's provider */
app.get('/methods/:methodName', async(req,res) => {
    const methodName = req.params.methodName
    if (methodName === 'blogEntry' || methodName === 'recentActions') {
        res.render(`methods/method_form`, {methodName}) // Different page rendered according to methods demanded
    }
    else if (methodName === 'contest') {
        let linkcontest_listT = null;
        let linkcontest_listF = null;
        try {
            linkcontest_listT = await axios.get(`https://codeforces.com/api/contest.list?gym=true`)
            /* Variable reassigned to its data key's value after stringifying the JSON */
            /* The parsed data is actually a bigger object but we extract the data key to get the data */
            linkcontest_listT = JSON.stringify(linkcontest_listT.data)
        }
        catch(err) {
            linkcontest_listT = (err.response.data)
            linkcontest_listT = JSON.stringify(linkcontest_listT)
        }
        try {
            linkcontest_listF = await axios.get(`https://codeforces.com/api/contest.list?gym=false`)
            linkcontest_listF = JSON.stringify(linkcontest_listF.data)
        } 
        catch (err) {
            linkcontest_listF = (err.response.data)
            linkcontest_listF = JSON.stringify(linkcontest_listF)
        }
        finally {    
            /* Running escape JSON for unicode characters need */
            linkcontest_listT = escapeJson(linkcontest_listT) 
            linkcontest_listF = escapeJson(linkcontest_listF)
            linkData.linkcontest_listT = linkcontest_listT
            linkData.linkcontest_listF = linkcontest_listF
            res.render('methods/method_home', {linkData,methodName,check})
        }
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

        /* ^ Time taking awaits above, thats why scrapped out for now ^ */

        res.render('methods/method_home',{methodName,check,linkData})
    }
})


/* Method to render a form requiring attribute to be specified and then give JSON for that attribute related data */
app.get('/methods/:methodName/forms/:idFiller', (req,res) => {
    const methodName = req.params.methodName
    filler = req.params.idFiller // globalised to pass in render and to use in later requests

    /* Treated seperately as both methods in problemset's methods requires different attribute */
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



/* GET method for rendering after been specified the attribute */
app.get('/methods/:methodName/:id', async(req,res) => {
    const methodName = req.params.methodName
    if (methodName === 'blogEntry' || methodName === 'contest') {
        id = req.params.id.substring(3) // extracting the attribute been specified
        id = Number(id)
    }
    else if (methodName === 'problemset') {
        if (filler === 'countFiller') {
            id = req.params.id.substring(6) // extracting the attribute been specified
            id = Number(id)
        }
        else {
            id = req.params.id.substring(5) // extracting the attribute been specified
        }
        //console.log(id)
        //console.log(filler)
    }
    if (methodName === 'blogEntry') {
        let linkblogEntry_comments = null
        let linkblogEntry_view = null
        try {
            linkblogEntry_view = await axios.get(`https://codeforces.com/api/blogEntry.view?blogEntryId=${id}`)
            linkblogEntry_view = JSON.stringify(linkblogEntry_view.data)
        }
        catch(err) {
            linkblogEntry_view = (err.response.data) // The generated error response has data stored in data key
            linkblogEntry_view = JSON.stringify(linkblogEntry_view) 
            /* Stringified catch code too because, user may want wrong attribute JSON too */
            /* For example, blog id = -1 will be an error but will have a JSON too */
        }
        try {
            linkblogEntry_comments = await axios.get(`https://codeforces.com/api/blogEntry.comments?blogEntryId=${id}`)
            linkblogEntry_comments = JSON.stringify(linkblogEntry_comments.data)
        } 
        catch (err) {
            linkblogEntry_comments = (err.response.data)
            linkblogEntry_comments = JSON.stringify(linkblogEntry_comments)
        }

        /* This code should run no matter if its an error or not because JSON is generated for both the cases */
        finally {
            linkblogEntry_comments = escapeJson(linkblogEntry_comments)
            linkData.linkblogEntry_comments = linkblogEntry_comments
            linkblogEntry_view = escapeJson(linkblogEntry_view)
            linkData.linkblogEntry_view = linkblogEntry_view
            res.render('methods/method_home', {linkData,id,methodName})
        }
       
    }


    /************* Issue code starts(time to load around 15 seconds) **************/
    else if (methodName === 'contest') {
        let linkcontest_hacks = null;
        let linkcontest_ratingChanges = null;
        let linkcontest_standings = null;
        //let linkcontest_status = null;
        try {
            linkcontest_hacks = await axios.get(`https://codeforces.com/api/contest.hacks?contestId=${id}`)
            linkcontest_hacks = JSON.stringify(linkcontest_hacks.data)
        }
        catch(err) {
            linkcontest_hacks = (err.response.data)
            linkcontest_hacks = JSON.stringify(linkcontest_hacks)
        } 
        try {
            linkcontest_ratingChanges = await axios.get(`https://codeforces.com/api/contest.ratingChanges?contestId=${id}`)
            linkcontest_ratingChanges = JSON.stringify(linkcontest_ratingChanges.data)
        } 
        catch (err) {
            linkcontest_ratingChanges = (err.response.data)
            linkcontest_ratingChanges = JSON.stringify(linkcontest_ratingChanges)
        }
        try {
            linkcontest_standings = await axios.get(`https://codeforces.com/api/contest.standings?contestId=${id}`)
            linkcontest_standings = JSON.stringify(linkcontest_standings.data)
        } 
        catch (err) {
            linkcontest_standings = (err.response.data)
            linkcontest_standings = JSON.stringify(linkcontest_standings)
        }
        finally {
            linkcontest_hacks = escapeJson(linkcontest_hacks)
            linkData.linkcontest_hacks = linkcontest_hacks
            linkcontest_ratingChanges = escapeJson(linkcontest_ratingChanges)
            linkData.linkcontest_ratingChanges = linkcontest_ratingChanges
            linkcontest_standings = escapeJson(linkcontest_standings)
            linkData.linkcontest_standings = linkcontest_standings
            // linkcontest_status = JSON.stringify(linkcontest_status.data)
            // linkcontest_status = escapeJson(linkcontest_status)
            // linkData.linkcontest_status = linkcontest_status
            //console.log(linkData.linkcontest_ratingChanges.data)
            check = 1
            res.render('methods/method_home', {linkData,methodName,check,id})
            check = 0
        }
    }
    /************* Issue code ends ****************/


    else if (methodName === 'problemset') {
        let linkproblemset_recentStatus = null
        let linkproblemset_problems = null
        let errorcheck = false // Basically tests if the user has entered a valid problem tag. If not tells them but still give JSON
        let validitycheck = true 
        /* Basically works when response is ok but the number of problems with this tag is 0
        and so user might have done a spelling mistake or a similar fault. Just to add extra feature*/

        /* This filler is filled from the previous GET request(line number 117) and thus globally declared */
        if (filler === 'countFiller') {
            try {
                linkproblemset_recentStatus = await axios.get(`https://codeforces.com/api/problemset.recentStatus?count=${id}`)
                linkproblemset_recentStatus = JSON.stringify(linkproblemset_recentStatus.data)
            }
            catch(err) {
                linkproblemset_recentStatus = (err.response.data)
                linkproblemset_recentStatus = JSON.stringify(linkproblemset_recentStatus)
            }
            finally {
                linkproblemset_recentStatus = escapeJson(linkproblemset_recentStatus)
                linkData.linkproblemset_recentStatus = linkproblemset_recentStatus
                countFillercheck = true // The count part is been filled so show only that and hide the other
            }
        }
        else {
            try {
                linkproblemset_problems = await axios.get(`https://codeforces.com/api/problemset.problems?tags=${id}`)
                if(JSON.stringify(linkproblemset_problems.data.result.problems) === '[]') {
                    validitycheck = false // No problems by this tag found(suspicious tag) (status:OK)
                }
                linkproblemset_problems = JSON.stringify(linkproblemset_problems.data)
            }
            catch(err) {
                //console.log('ll')
                linkproblemset_problems = (err.response.data)
                linkproblemset_problems = JSON.stringify(linkproblemset_problems)
                errorcheck = true // status:FAILED by CF API, tags
            }

            /* Works in every condition */
            finally {
                linkproblemset_problems = escapeJson(linkproblemset_problems)
                linkData.linkproblemset_problems = linkproblemset_problems
            }
        }
        check = 1 /*The data is requested and to show it on HTML this checker is used */
        res.render('methods/method_home', {linkData,methodName,check,countFillercheck,id,errorcheck,validitycheck})
        check = 0
        countFillercheck = false
    }  

    /* Probably the simplest method */
    else if (methodName === 'recentActions') {
        let linkrecentActions = null
        id = req.params.id.substring(9) // extracting the attribute been specified
        id = Number(id) // Converted to integer
        try {
            linkrecentActions = await axios.get(`https://codeforces.com/api/recentActions?maxCount=${id}`)
            linkrecentActions = JSON.stringify(linkrecentActions.data)
        }
        catch(err) {
            linkrecentActions = (err.response.data)
            linkrecentActions = JSON.stringify(linkrecentActions)
        }
        finally {
            linkrecentActions = escapeJson(linkrecentActions) // See line 52 for this method
            linkData.linkrecentActions = linkrecentActions
        }
        res.render('methods/method_home', {linkData,methodName,id})
    }
    else {
        let linkuser_blogEntries = null
        let linkuser_info = null
        let linkuser_rating = null
        let linkuser_status = null
        let errorcheck = false
        id = req.params.id.substring(11) // extracting the attribute been specified
        try {
            linkuser_blogEntries  = await axios.get(`https://codeforces.com/api/user.blogEntries?handle=${id}`)
            linkuser_blogEntries = JSON.stringify(linkuser_blogEntries.data)
        }
        catch(err) {
            linkuser_blogEntries = (err.response.data)
            linkuser_blogEntries = JSON.stringify(linkuser_blogEntries)
            errorcheck = true // User handle specified is status:FAILED
        }
        try {
            linkuser_info = await axios.get(`https://codeforces.com/api/user.info?handles=${id}`)
            linkuser_info = JSON.stringify(linkuser_info.data)
        } 
        catch (err) {
            linkuser_info = (err.response.data)
            linkuser_info = JSON.stringify(linkuser_info)
        }
        try {
            linkuser_rating = await axios.get(`https://codeforces.com/api/user.rating?handle=${id}`)
            linkuser_rating = JSON.stringify(linkuser_rating.data)
        } 
        catch (err) {
            linkuser_rating = (err.response.data)
            linkuser_rating = JSON.stringify(linkuser_rating)
        }
        try {
            linkuser_status = await axios.get(`https://codeforces.com/api/user.status?handle=${id}`)
            linkuser_status = JSON.stringify(linkuser_status.data)
        } 
        catch (err) {
            linkuser_status = (err.response.data)
            linkuser_status = JSON.stringify(linkuser_status)
        }
        finally {
            linkuser_blogEntries = escapeJson(linkuser_blogEntries)
            linkData.linkuser_blogEntries = linkuser_blogEntries
            
            linkuser_info = escapeJson(linkuser_info)
            linkData.linkuser_info = linkuser_info
            
            linkuser_rating = escapeJson(linkuser_rating)
            linkData.linkuser_rating = linkuser_rating
            
            linkuser_status = escapeJson(linkuser_status)
            linkData.linkuser_status = linkuser_status 
            /* Adding everything in linkData as key value pair */
        }
        check = 1
        res.render('methods/method_home', {linkData,methodName,check,id,errorcheck})
        check = 0
    }
})



/* POST request for the form filled by user to give the attribute */
app.post('/methods/:methodName',  (req,res) => {
    const methodName = req.params.methodName
    id = req.body.id

    /* Every method has different attribute and some are integers and some are string */
    if (methodName === 'blogEntry' || methodName === 'contest') {
        id = Number(id)
        res.redirect(`/methods/${req.params.methodName}/id=${id}`) /* Redirecting after been given the attribute */
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



/* Listening on PORT */
const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}`)
})