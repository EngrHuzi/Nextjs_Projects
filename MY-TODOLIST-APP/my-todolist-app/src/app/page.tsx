"use client"
import { Card } from '@/components/ui/card';
import React,{FormEvent, useState} from 'react';
import { Input } from "@/components/ui/input";
import { MdDeleteOutline } from "react-icons/md";
import { TbDeviceComputerCameraOff } from "react-icons/tb";
import { LiaUndoAltSolid } from "react-icons/lia";


type inputProps={
  text:string;
  completed: boolean
  value:string;
  todo:string;

 

}


const Homepage = () => {
 const [input,setinput]=useState<string>();
 const [todos,settodos]=useState<inputProps[]>([]);



 const addTodo = (e:FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (input && input.trim()) {
    settodos([...todos, {
      text: input, completed: false,
      value: '',
      todo: ''
    }]);
    setinput('');
  }
};

const toggleTodo = (index:number) => {
  const newTodos = [...todos];
  newTodos[index].completed = !newTodos[index].completed;
  settodos(newTodos);
};

const deleteTodo = (index:number) => {
  settodos(todos.filter((_, i) => i !== index));
};



  return (
  
    <section className=" custum-image ">
    <div  className="flex  justify-center items-start space-x-10 mt-20">

   
      
       <Card className='w-[600px] h-[500px] shadow-2xl bg-pink-100 '>
       
       <h1 className='flex justify-center font-semibold font-serif underline text-xl  animate-bounce pt-3 text-pink-500 '>MY TODO LIST</h1>
       <form onSubmit={addTodo}>
       <Input type="text" placeholder="Add a task"  className='shadow-lg'
       onChange={(e) => setinput(e.target.value)} value={input}
      
       
       />
      <div className='flex justify-end'>
        <button className="group relative inline-flex items-center px-2.5 py-1.5 rounded shadow-lg outline-none bg-pink-500 text-sm text-white font-medium transition-all duration-200 ease-out hover:text-pink-500 hover:bg-transparent hover:shadow-none active:top-0.5 focus:outline-none mt-2 "
      type='submit'
        >


<span className="absolute h-0 w-0.5 right-0 top-0 bg-pink-500 transition-all duration-500 ease-out group-hover:h-full" aria-hidden="true"/>
<span className="absolute left-0 bottom-0 bg-pink-500 transition-all duration-500 ease-out w-0.5 h-0 group-hover:h-full" aria-hidden="true"/>
+Add
<span className="absolute left-0 bottom-0 bg-pink-500 transition-all duration-500 ease-out w-0 h-0.5 group-hover:w-full" aria-hidden="true"/>
<span className="absolute w-0 h-0.5 right-0 top-0 bg-pink-500 transition-all duration-500 ease-out group-hover:w-full" aria-hidden="true"/>

</button>
</div>
</form>
<br />
<hr className='border-1  border-pink-400' />
<br />

<div>
 <ul>
 {todos.map((todo, index) => (
          <li key={index} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          <div className='flex justify-end gap-3 text-lg'> <button onClick={() => toggleTodo(index)}>
              {todo.completed ? <LiaUndoAltSolid />
: <TbDeviceComputerCameraOff />}
            </button>
            
            <button onClick={() => deleteTodo(index)}><MdDeleteOutline />
</button>
            </div> 
          </li>
        ))}

    
  </ul>
  </div>

<div>

      
      
      </div>


      
       </Card>


    </div>
    </section>
    
   
  )
}

export default Homepage