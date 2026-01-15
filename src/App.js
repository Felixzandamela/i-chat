import React, {useState,useEffect,useRef} from "react";
import {BrowserRouter,Routes,Route,useNavigate,useLocation,Outlet,Redirect,Link, NavLink} from "react-router-dom";
import {currentUser,signIn, signOut, useAuth, signUp,dbUsers,dbImages,dbChats} from './auth/FirebaseConfig';
import {texts} from "./texts/Texts";
import {getLanguage,Alert, Toast, Avatar,getColor,getCurrentTime} from "./pages/Utils";

import NotFoundPage from "./pages/404-page";
import Authtication from "./pages/Authtication";
import {Admin,Settings} from './pages/Admin';
import SupportChat from "./pages/Support";
import Chat from "./pages/Chat";

import "./style.css";
import "cropper.css";
const App = ()=>{
  const [states, setStates] = useState({
    language: getLanguage(),
    theme:localStorage.getItem('theme')
  });
  localStorage.setItem('avatarColor', JSON.stringify(getColor()));
  const onChanges = (item,value)=>{
    setStates(prevState=>({...prevState,[item]:value}));
    localStorage.setItem(item,value);
  }
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main props={states} onChanges={onChanges}/>}>
          <Route path="/auth" element={<Authtication language={states.language}/>}/>
          <Route path="support" element={<CheckAuth><Chat  language={states.language}/></CheckAuth>}/>
          <Route path="admin" element={<CheckAuth><Admin language ={states.language}/></CheckAuth>}>
            <Route path="settings" element={<Settings language={states.language}/>}/>
            <Route path="support" element={<SupportChat language={states.language}/>}>
              <Route path="chat/:id" element={<Chat language={states.language}/>}/>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage language={states.language}/>}/>
      </Routes>    
    </BrowserRouter>
  );
}
export default App;

const Main = ({props, onChanges}) =>{
  const isAuth = useAuth();
  const datas = currentUser(true);
  const location=useLocation();
  const navigate=useNavigate();
  const [scrollToTop, setScrollToTop]= useState(false);
  const [alertDatas, setAlertDatas] = useState(null);
  const [error,setError]=useState({ error:{text:null,stack:null,fixed:false}});
  useEffect(()=>{
    const isIndex = /^(\/)$/i.test(location.pathname);
    if(isIndex){navigate(`/support${location.search}`, {replace: true});}
  },[location.pathname]);
  useEffect(() => {
    const handleScroll = () => {if(window.pageYOffset > window.outerHeight) {setScrollToTop(true);} else {setScrollToTop(false);}};
    const checkConnection = function() {
      const online = window.navigator.onLine;
      let result = null;
      if (!online) {
        result = texts.networkRequestFailed[props.language];
      } else {
        const connection = window.navigator.connection;
        if (connection && connection.downlink !== undefined) {
          if (connection.downlink < 1 ) {
            result = texts.badNetwor[props.language];
          }
        }
      }
      setError(prevError=>({...prevError,error:{text:result,stack:"networkfailed",fixed: result!== null}}));
    }
    window.addEventListener("offline", checkConnection);
    window.addEventListener("online", checkConnection);
    if (window.navigator.connection) {
      window.navigator.connection.addEventListener("change", checkConnection);
    }
    checkConnection();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener("offline", checkConnection);
      window.removeEventListener("online", checkConnection);
      if (window.navigator.connection) {
        window.navigator.connection.removeEventListener("change", checkConnection);
      }
    };
  }, []);
  
  const handleScrollTo =()=>{window.scrollTo(0,0)}
  
  async function getUser(_id) {
    let url = `http://localhost:8089/me?_id=${_id}`;
    try {
      let response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }
      const userDatas = await response.json();
      return userDatas;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  useEffect(async() => {
    if (datas) {
      const [_id] = datas.email.split("@");
      const userDatasToUpdate = await getUser(_id);
      if(userDatasToUpdate){
        dbUsers.child(datas.id).update({
          name:userDatasToUpdate.name,
          online: "online"
        }).then(()=>{
          if(userDatasToUpdate.src){
            dbImages.child(datas.id).update({src: userDatasToUpdate.src}).catch((error)=>{
              console.error("error ao atualiza a img:",error);
            });
          }
        }).catch((error)=>{
          console.error("error ao atualizar dados:",error);
        });
      }else{
        dbUsers.child(datas.id).child("online").set("online").catch((error) => { console.log(error) });
      }
    }// Atualiza o status para 'online' quando o usuário está autenticado e atualizar nome e imagem
    return () => {
      const updateOffline = async () => {
        try {
          const lastSeen = getCurrentTime().fullDate;
          await dbUsers.child(datas.id).child("online").set(lastSeen);
        } catch (error) {console.error(error);}
      };
      if(datas && datas.id !== null){updateOffline();}
    }
  }, [datas]); 
  
 async function handleAction(){
    const lastSeen = getCurrentTime().fullDate;
    if(isAuth){
      try{
       const i = await dbUsers.child(isAuth.uid).child("online").set(lastSeen);
        handleSignOut();
      }catch(error){console.error(error);};
    }else{handleSignOut();}
  }
  
  const handleSignOut = async function(){
    try{
      await signOut();
      localStorage.setItem("isAuthenticated", "");
      navigate("/", {replace:true});
    }catch(error){console.log(error);}
  }
  
  const handleLogOut =(e,n)=>{
    const alertData = {
      title:texts.logout[props.language],
      text:texts.confirmLogOut[props.language],
      actions:{
        onOk:{
          title:texts.logout[props.language],
          type:"danger"
        }
      }
    }
    setAlertDatas(alertData);
  }
  
  return(
    <main className={`a_main ${props.theme}`}>
      <Toast props={error.error} onClear={()=>setError(prevError=>({...prevError,error:{text:null,stack:null,fixed:false}}))}/>
      <nav className="m_nav nav a_container flex_b_c">
        <div className="left_items padd10-lr">
          <div className="logo m5-lr">
            I-Chat
          </div>
        </div>
        <div className="right_items padd10-lr flex_c_c">
          <div className="m5-lr">
            <div className="btn_circle flex_c_c br60">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31"/></svg>
                <div className="a_c_menu a_container_br br4-a">
                  {texts.menuList.languages.map(l=>(<div onClick={()=>onChanges("language", l.value)} key={l.value} className={` ${l.value === props.language && "active"} padd6-10 flex_s_c`}>{l.label[props.language]}</div>))}
                </div>
            </div>
          </div>
         
          <div className="m5-lr">
            <div className="btn_circle flex_c_c br60">
              {props.theme === "dark" && 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-sun" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/></svg> ||
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-moon" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/></svg>
              }
              <div className="a_c_menu a_container_br br4-a">
                {texts.menuList.themes.map((l, index)=>(<div key={index} onClick={()=>onChanges("theme", l.value)} className={`${l.value === props.theme && "active"} padd6-10`}>{l.label[props.language]}</div>))}
              </div>
            </div>
          </div>
           
          {datas && <div className="m5-lr">
            <div className="btn_circle flex_c_c br60">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
</svg>
              <div className="a_c_menu a_container_br br4-a">
                {datas && datas.isAdmin && texts.menuList.menu.map((l, index)=>(<div key={index} onClick={()=>navigate(l.link)} className={`padd6-10`}>{l.label[props.language]}</div>))}
                <div onClick={handleLogOut} className="padd6-10">{texts.logout[props.language]}</div>
              </div>
            </div>
          </div>
           }
        </div>
      </nav>
       <Alert language={props.language} alertDatas={alertDatas} onOk={(e)=>handleAction(e)} onCancel={()=>setAlertDatas(null)}/>
      <Outlet/>
      <div onClick={handleScrollTo} className={scrollToTop && "active scrollToTop flex_c_c" || "inActive scrollToTop flex_c_c"}><i className="bi bi-arrow-up"></i></div>
    </main>
  );
}
const CheckAuth = ({children})=>{
  const location=useLocation();
  const navigate=useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const searchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(searchParams.entries());
  const [error,setError]=useState({email:null,password:null, error:{text:null, stack:null}});
  const {id} = params;
  useEffect(()=>{
    if(!isAuthenticated || id && id !== isAuthenticated){
      navigate(`/auth/${location.search}`, {replace:true});
    }
  },[location.pathname,isAuthenticated]);
  return <div>{children}</div>;
}