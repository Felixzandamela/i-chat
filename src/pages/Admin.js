import React,{useState, useEffect,useRef} from "react";
import {Link,useNavigate, useLocation, Outlet, NavLink,useParams} from "react-router-dom";
import {texts} from "../texts/Texts";
import {Avatar,Alert,ShareLink,MinLoder,formatDate,getCurrentTime,idGenerator, getColor,EmptyCard,Loader, chackeVal, Toast,useFileName} from "./Utils";
import {currentUser, useAuth, dbUsers, dbImages} from '../auth/FirebaseConfig';
import {ImageViewer,ImageCropper} from "./ImageTools";

export const Admin = ({language}) =>{
  const datas = currentUser(true);
  const location=useLocation();
  const navigate=useNavigate();
  useEffect(()=>{
    const isIndex = /^(\/admin)$/i.test(location.pathname);
    if(isIndex && datas && !datas.isAdmin){navigate("/support", {replace: true});}
  },[location.pathname],datas);
  return(<Outlet/>);
}

export const Settings = ({language}) =>{
  const user = currentUser(true);
  const navigate = useNavigate();
  const [loading,setLoading]= useState(false);
  const [datas,setDatas]=useState({name:""});
  const [error,setError]=useState({name:null,error:{text:null,stack:null}});
  const [states, setStates]=useState({
    openAside:false,openProfile:false, searchs:null,loading:false,
  });
  const [fileName, setFileName,clearFileName] = useFileName(null);
  
  const handleSaveAvatar = (img)=>{
    setStates(prevState=>({...prevState,loading:true}));
    dbImages.child(user.id).update({src: img}).then(()=>{
      setStates(prevState=>({...prevState,loading:false}));
      clearFileName();
    }).catch((error)=>{
      console.log(error);
    });
  }
  
  
  const handleChange =(event)=>{
    const fields = event.target.name;
    const val = event.target.value;
    setDatas(prevData=>({...prevData,[fields]:val}));
  } // em cada input em digitação atualiza o valor no state
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = new Array();
      if(!datas.name || datas.name.length <= 2 ){
        setError(prevError=>({...prevError,name:texts.invalidFullName[language]}));errors.push(1);}
      if(errors.length <= 0){setLoading(true);handleSave();}
    }
   // verificação de formulário
  
  const handleSave =  ()=>{
    dbUsers.child(user.id).update(datas).then(()=>{
      setLoading(false);
    }).catch((error)=>{
      console.log(error);
      setError(prevError=>({...prevError,error:{text:error,stack:"error"}}));
    });
  }
  
  const handleClearError = (event)=>{
    const fields = event.target.name;
    setError(prevError=>({...prevError,[fields]: null}));
  } // limpar os erros renderizados pelos inputs vazios ou inválidos
  
  useEffect(()=>{
    if(user){setDatas(prevData=>({...prevData,name:user.name}));}
    return ()=>setDatas({});
  },[user]);
  if(!datas) return null;
  return(
    <div className="layout">
      <div className="">
        <div className="a_avatar_card flex_c_c">
                <div className="avatar_box">
                  {user && <Avatar avatar={user}/>}
                  <ImageCropper language={language} handleSaveAvatar={handleSaveAvatar} fileName={fileName} setFileName={setFileName} clearFileName={clearFileName}/>
                </div>
              </div>
        <form className="a_container padd10-a br6-a" onSubmit={handleSubmit}>
          <div className="input_card">
            <div className="input_wrap br6-a flex_b_c">
              <input onChange={handleChange} onFocus={handleClearError} value={datas.name} className={chackeVal(datas.name, "input")} id="name" name="name" type="text" readOnly={loading}/>
               <label htmlFor="name">{texts.name[language]}</label>
               </div>
            <div className="label_error"> {error && error.name}</div>
          </div>
          <div className="input_card">
            <button disabled={loading} className="primary-btn br6-a">{loading && <MinLoder/> || texts.save[language]}</button>
          </div>
        </form>
      </div>
    </div>
  );
}