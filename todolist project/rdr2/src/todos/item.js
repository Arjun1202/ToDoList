import React,{useState} from 'react';
export default function Todo({item,fn})
{   
    const [upd,setUpd]=useState('');
    const [A,setA]=useState(0);
    let l1=<div className="todo">
    <input className="item updatebox" type="text"  value={upd} onChange={(e)=>
            {
                setUpd(e.target.value);
            }} onKeyPress={(e)=>{
                if(e.key=="Enter")
                {
                    setA(0);
                    fn({type:"updatetodo",payload:item,new:upd});
                    setUpd('');
                }
    }}/>
    <button className="upd1" onClick={()=>{
                setA(0);
                fn({type:"updatetodo",payload:item,new:upd});
                setUpd('');
            }}>Update</button>
    </div>

    return(
    !A?<div className="todo">
            <div className="item" style={{color:item.complete?"green":"black",textDecoration:item.complete?"line-through":"none"}}>{item.name}</div>
            <button id="tl" onClick={()=>{
                fn({type:"toggletodo",payload:item});
            }}>Toggle</button>
            <button id="dl" onClick={()=>{
                fn({type:"deletetodo",payload:item});
            }}>Delete</button>
            <button className="upd" onClick={()=>{
                setA(1);
            }}>Update</button>
    </div>:l1
    );
}