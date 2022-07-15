import React,{useEffect, useReducer,useState,useRef} from 'react'
import './App.css'
import Todoitem from './todos/todo.js'

function todoReducer(state,action)
{
    switch(action.type)
    {
        case "addtodo":
        {   
            let q=state.find(item=>item.name.toLowerCase()===action.payload.name.toLowerCase())
            if(q==null)
            {
            if(action.payload.first===true)
            {
            fetch('http://localhost:3000/addtodo',{
              method:"POST",
              headers:
              {
                "Content-Type":"application/json"
              },
              body:JSON.stringify({
                Name:action.payload.name,
                Completed:action.payload.complete
              })
            })
            }
            return [...state,action.payload];
          }
          else 
          {
            return state;
          }
        }
        case "toggletodo":
        { 
            let s1=state;
            let arr=s1.map(item=>{
              if(item.name!==action.payload.name)
                return item;
              else
                {
                return {name:item.name,complete:!item.complete};
                }
            })

            fetch('http://localhost:3000/toggletodo',{
              method:"PUT",
              headers:
              {
                "Content-Type":"application/json"
              },
              body:JSON.stringify({
                Name:action.payload.name,
                Completed:action.payload.complete
              })
            }
            )
            return arr;
        }
        case "deletetodo":
        { 
          let s2=state;
          let arr1=s2.filter(item=>{
            return item.name!==action.payload.name;
          })
          fetch('http://localhost:3000/deletetodo',{
              method:"DELETE",
              headers:
              {
                "Content-Type":"application/json"
              },
              body:JSON.stringify({
                Name:action.payload.name,
                Completed:action.payload.complete
              })
            }
            )
          return arr1;
        }
        case "updatetodo":
        {
          let s3=state;
          let u2=state.find(item=>item.name===action.new);
          if(u2==null)
          {
          let arr2=s3.map(item=>{
            if(item.name===action.payload.name)
            {
                return {...item,name:action.new};
            }
            else
            {
              return item;
            }
          })
          fetch('http://localhost:3000/updatetodo',{
            method:"PUT",
            headers:
            {
              "Content-Type":"application/json"
            },
            body:JSON.stringify({
              Name:action.payload.name,
              newName:action.new
            })
          })
          return arr2;
        }
        else
        {
          return state;
        }
        }
        case "deletetoggledtodos":
        {
        	let completedTodos=state.filter(item=>item.complete===false);
        	fetch('http://localhost:3000/removetoggle',
        	{
        		method:"DELETE"
        	})
        	return completedTodos;
        }
        default:
          return state
    }
}

export default function App() 
{

  const [state,dispatch]=useReducer(todoReducer,[]);
  const [val,setVal]=useState('');
  const l=useRef('');
  useEffect
  (()=>
  {
    fetch('http://localhost:3000/gettodos',{
      method:"GET",
      headers:
      {
        "Content-Type":"application/json"
      },
      }).then(res=>res.json()).then((res)=>
      { 
        l.current=res.username;
        res.data.forEach((item)=>
        {
          dispatch({type:"addtodo",payload:{name:item.name,complete:item.completed,first:false}});
        })
      })
  },[])

  return (
    <div className="App">
      <div id="outerbox">
      <div id="todotitle">To-Do List</div>
      <div id="usernamevalue">Username : {l.current}</div>
      <div class="logoutcontainer">
      <button id="deletetoggle" onClick={()=>{
      	dispatch({type:"deletetoggledtodos"});
      }}>Delete all toggled todos</button>
      <button onClick={async ()=>{
            await fetch('http://localhost:3000/tokendelete',
            {
                method:"DELETE"
            })
            window.location.replace("http://localhost:3000/start");
        }
      } id="logout">Logout</button>
      </div>
      <form onSubmit={(e)=>{
        e.preventDefault();
        dispatch({type:"addtodo",payload:{name:val,complete:false,first:true}});
        setVal('');
        }}>
      <div id="containerfortodo">
      <input id="main" type="text" onChange={(e)=>{setVal(e.target.value)}} value={val}/>
      <button type="submit" id="sb">Add</button>
      </div>
      </form>
      <Todoitem collection={state} fn={dispatch} />
      </div>
    </div>
  );
}

