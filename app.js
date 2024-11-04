const express = require('express')
const app = express()
const path = require('path')
const body_parser = require('body-parser')
const database = require('./database')
const session = require('express-session')
const nocache = require('nocache')
const { render } = require('ejs')
const PORT = 8081

app.use(nocache())
app.use(session ({
    secret:'hello there',
    saveUninitialized:true,
    resave:false
}))

app.use(body_parser.urlencoded({extended:true}))
app.set('view engine','ejs')
app.set('views',path.join(__dirname,"views"))

app.use(express.static('public'))


app.get('/',(req,res) => {
    if(req.session.user){
        res.render('home')
    }else {
        res.render('index',{msg:""})
    }
})

app.post('/verify',(req,res) => {
    
    const loginInput = req.body
        if(loginInput){
            
            for(let i = 0;i < database.length;i++){
                
                if(loginInput.text.toLowerCase() === database[i].text  && loginInput.pswd === database[i].pswd){
                    req.session.user = loginInput.text.toLowerCase()

                    if(loginInput.text.toLowerCase() === "admin"  && loginInput.pswd === "@admin"){
                        req.session.destroy()
                        res.render('adminPanel',{userData:database,userAdd:''})
                        
                        return
                    }

                    res.render('home')
                    return
                }   
            }
        }
        res.render('index',{msg:'Invalid Credentials'})
})


app.post('/createSign',(req,res) => {
    
    const addSign = req.body
    
    if(!addSign){
        res.render('index')
    }else{
        database.push(addSign)
    }
    
    if(addSign){
        for(let i = 0;i < database.length;i++){
            if(addSign.text.toLowerCase() === database[i].text  && addSign.pswd === database[i].pswd){
                database[i].id = i + 1
                req.session.user = addSign.text.toLowerCase()
                res.render('home')
                return
             }   
        }
    }else res.render('index')
    
})

app.get('/logOut', (req,res) => {
    req.session.destroy()
    res.render('index',{msg:'Logged Out'})
})

app.get('/admin-panel/:id/delete', (req,res) => {
     const id = + req.params.id 

    for(i = 0;i < database.length; i++){
        if(database[i].id == id){
            database.splice(i,1)
            res.render('adminPanel',{userData:database,userAdd:''})
            return
        }
    }
})

app.get('/admin/adduser',(req,res) => {
    
    res.render('adminPanel',{userData:database,userAdd:true})
    return

})

app.post('/admin/create/user',(req,res) => {
    const newUser = req.body
    if(!newUser){
        res.render('adminPanel',{userData:database,userAdd:''})

    }else{
        database.push(newUser)

        for(let i = 0;i < database.length;i++){
            if(newUser.text.toLowerCase() === database[i].text  && newUser.pswd === database[i].pswd){
                database[i].id = i + 1
                req.session.user = newUser.text.toLowerCase()

                res.render('adminPanel',{userData:database,userAdd:true})
                return
             }   
        }
            
    }
    
})


app.listen(PORT,() => console.log(`i'm running`))