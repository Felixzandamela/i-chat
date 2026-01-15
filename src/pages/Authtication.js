import React, {useState,useEffect} from "react";
import {useNavigate,useLocation} from "react-router-dom";
import {signIn, useAuth, signUp,dbUsers,dbImages,dbChats} from '../auth/FirebaseConfig';
import {texts} from "../texts/Texts";
import {Alert, Toast,getColor,getCurrentTime} from "./Utils";


const Authtication = ({language}) =>{
  const location=useLocation();
  const navigate=useNavigate();
  const [states, setStates] = useState({loading: false});
  const searchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(searchParams.entries());
  const [error,setError]=useState({email:null,password:null, error:{text:null, stack:null}});
  const {id} = params;
  const e = {
    email: `${id}@gmail.com`,
    password:id
  }
  
  async function handleSignIn(){
    try{
      const res = await signIn(e.email,e.password);
      const response = await res;
      const lastNavigation = localStorage.getItem("lastNavigation");
      if(response){setStates(prevState=>({...prevState,loading:false}));
      navigate(lastNavigation? lastNavigation : "/support",{replace:true});}
    }catch(error){
      console.error(error);
      if(error.code === "auth/user-not-found"){
        handleSignUp();
      }else{
      for(let i = 0; i < authErros.length; i++){
        if(error.code === authErros[i].name){
          let errorMessage = texts[authErros[i].target][language]; // exemplo: texts.invalidPassword.ptPT retona "Senha inválido!"
          let stack = authErros[i].stack;
          setError(prevError=>({...prevError,error:{text:errorMessage,stack:stack}}));
          setStates(prevState=>({...prevState,loading:false}));
        }
      }
      navigate(-3,{replace:true});
      }
    }
  }
  async function handleSignUp(){
    try{
      const res = await signUp(e.email,e.password);
      const response = await res;
      const user = {
        id:response.uid,
        name: `User`,
        email: e.email,
        isAdmin:false,
        isBanned :false,
        online:getCurrentTime().fullDate,
        avatar:"",
        date: getCurrentTime().fullDate
      }
      dbUsers.child(response.uid).set(user).then(()=>{
          dbImages.child(response.uid).set({id:response.uid,src:""}).catch((error)=>{
            setError(prevError=>({...prevError,error:{text:error.message,stack:"error"}}));
          });
          dbChats.child(response.uid).set({
            id:response.uid,
            owner:response.uid,
            individuals:true,
            participants:{
              [response.uid]:{
                typing:false,
                blocked:false,
                datas:"",
              }
            },
            chatColor:getColor(),
            data:""
          }).then(()=>{
            navigate("/support");
          }).catch((error)=>{
            setError(prevError=>({...prevError,error:{text:error.message,stack:"error"}}));
          });
       
      }).catch((error)=>{
        setError(prevError=>({...prevError,error:{text:error.message,stack:"error"}}));
      });
    }catch(error){
      for(let i = 0; i < authErros.length; i++){
        if(error.code === authErros[i].name){
          let errorMessage = texts[authErros[i].target][language]; // exemplo: texts.invalidPassword.ptPT retona "Senha inválido!"
          let stack = authErros[i].stack;
          setError(prevError=>({...prevError,error:{text:errorMessage,stack:stack}}));
          setStates(prevState=>({...prevState,loading:false}));
        }
      }
      navigate("/");
    }
  }
  useEffect(()=>{
    setStates(prevState=>({...prevState,loading:false}));
    if(id){
      handleSignIn();
    }else{
      const errorMessage = texts.occuredError[language];
      setError(prevError=>({...prevError,error:{text:errorMessage,stack:"error"}}));
    }
  },[id]);
  return (
    <div>
      {states.isLoading && <Loader language={language}/> ||
      <div className="flex_c_c empty_card">
      <i style={{color:"red"}} className="bi bi-exclamation"></i>
      <p>{error.error.text}</p>
    </div>
        
      }
    </div>
  );
}
export default Authtication;