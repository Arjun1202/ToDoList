const express=require('express');
const app=express();
const path=require('path');
const {Client}=require('pg');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
require('dotenv').config();

const data=new Client({
    host:process.env.host,
    user:process.env.user,
    port:process.env.port,
    password:process.env.password,
    database:process.env.database
})

data.connect();
app.use(express.static(path.join(__dirname,"build")));
app.listen(3000);
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/todolist',isloggedout,(req,res) =>
{
    res.sendFile(path.join(__dirname,"build","index.html"))
})

app.get('/register',isloggedin,(req,res)=>
{
    res.sendFile(path.join(__dirname,"build","register.html"))
})

app.get('/login',isloggedin,(req,res)=>
{
    res.sendFile(path.join(__dirname,"build","login.html"))
})

app.get('/start',isloggedin,async (req,res)=>
{   
    res.sendFile(path.join(__dirname,"build","start.html"))
})

app.get('/',(req,res)=>
{
    res.redirect('/start');
})

app.get('/gettodos',async (req,res)=>
{   
    const name=await data.query('select username from tokendetails');
    const tname=name.rows[0].username;
    data.query(`select * from ${tname} order by id`,(err,response)=>
    {
        if(!err)
        {   
            res.status(200).json({data:response.rows,username:tname});
        }
        else
        {
            res.sendStatus(403);
        }
    })
})

app.post('/addtodo',async (req,res)=>
{
    const {Name,Completed}=req.body;
    const name=await data.query('select username from tokendetails');
    const tname=name.rows[0].username;
    data.query(`insert into ${tname} values('${Name}',${Completed})`,(err,response)=>
    {
        if(!err)
        {
            res.sendStatus(200);
        }
    })
})

app.put('/toggletodo',async (req,res)=>
{
    const {Name,Completed}=req.body;
    const nt=!Completed;
    const name=await data.query('select username from tokendetails');
    const tname=name.rows[0].username;
    data.query(`update ${tname} set completed=${nt} where name='${Name}'`,(err,response)=>{
        if(!err)
        {
            res.sendStatus(200);
        }
    })
})

app.delete('/deletetodo',async (req,res)=>
{
    const {Name}=req.body;
    const name=await data.query('select username from tokendetails');
    const tname=name.rows[0].username;
    data.query(`delete from ${tname} where name='${Name}'`,(err,response)=>
    {
        if(!err)
        {
            res.sendStatus(200);
        }
    })
})

app.put('/updatetodo',async (req,res)=>
{
    const {Name,newName}=req.body;
    const name=await data.query('select username from tokendetails');
    const tname=name.rows[0].username;
    data.query(`update ${tname} set name='${newName}',completed=false where name='${Name}'`,(err,response)=>{
        if(!err)
        {
            res.sendStatus(200);
        }
    })
})


app.post('/register',async (req,res)=>
{   
    const {userName,password,secondpassword}=req.body;
    let arr=await data.query(`select * from logindetails where username='${userName}'`);
    if(userName=="")
    {
        return res.json({test:true,message:"Enter a username"}); 
    }
    if(arr.rows.length==0)
    {
        if(password.length<=5)
        {
            res.json({test:true,message:"Password is short"});
        }
        else if(password!=secondpassword)
        {
        	res.json({test:true,message:"Passwords dont match"});
        }
        else
        {   
            let hashedPassword=await bcrypt.hash(password,10);
            data.query(`insert into logindetails (username,password) values('${userName}','${hashedPassword}')`);
            res.json({test:false});
        }
    }
    else
    {
        res.json({test:true,message:"Username already exists"}); 
    }
})

app.post('/login',async (req,res)=>
{   
    const {userName,password}=req.body;
    let arr=await data.query(`select * from logindetails where username='${userName}'`);
    let arr1=await data.query(`create table if not exists ${userName} (name text,completed boolean,id serial)`);
    if(arr.rows.length==0)
    {
        res.json({test:true,message:"Username does not exist"});
    }
    else
    {
        if(await bcrypt.compare(password,arr.rows[0].password))
        {   
            const acessToken=jwt.sign({username:arr.rows[0].username,password:arr.rows[0].password},process.env.ACESS_TOKEN_SECRET);
            await data.query(`insert into tokendetails (username,password,acesstoken) values('${userName}','${password}','${acessToken}')`);
            res.json({test:false});
        }
        else
        {
            res.json({test:true,message:"Password entered is not correct"});
        }
    }
})

app.delete('/removetoggle',async (req,res)=>
{
	const name=await data.query('select username from tokendetails');
    	const tname=name.rows[0].username;
    	await data.query(`delete from ${tname} where completed=true`);
})

app.delete('/tokendelete',async (req,res)=>
{   
    let tokenlist=await data.query('select * from tokendetails');
    if(tokenlist.rows.length!=0)
        {
        await data.query('delete from tokendetails');
        }
    res.send({u:tokenlist.rows});
})


app.get('*',isloggedin,(req,res)=>
{
    res.redirect('/start');
})

async function isloggedin(req,res,next)
{    
    await data.query('create table if not exists logindetails(id serial primary key,username text,password text)');
    await data.query('create table if not exists tokendetails(id serial primary key,username text,password text,acesstoken text)');	 	
    let u=await data.query('select * from tokendetails');
    if(u.rows.length!=0)
    {
        return res.redirect('/todolist');
    }
    else
    {
        return next();
    }
}

async function isloggedout(req,res,next)
{
    await data.query('create table if not exists logindetails(id serial primary key,username text,password text)');
    await data.query('create table if not exists tokendetails(id serial primary key,username text,password text,acesstoken text)');	 
    let u=await data.query('select * from tokendetails');
    if(u.rows.length==0)
    {
        return res.redirect('/start');
    }
    else
    {
        return next();
    }
}

