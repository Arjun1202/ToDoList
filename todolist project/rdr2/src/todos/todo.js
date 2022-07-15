
import React from 'react'
import Todo from './item.js'

export default function Todoitem({collection,fn})
{   
    const arr=collection.map((item,i)=>
    {
      return <Todo key={i} fn={fn} item={item}/>
    }
    )
    return arr;
}
