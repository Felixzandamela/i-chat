import React,{useState, useEffect,useRef} from "react";
import {Link,useNavigate, Outlet, NavLink,useParams,useLocation} from "react-router-dom";
import {texts} from "../texts/Texts";
import {Avatar,MinLoder,Loader, EmptyCard, formatDate,idGenerator} from "./Utils";
import {currentUser,useAuth, dbChats, dbUsers} from '../auth/FirebaseConfig';

const SupportChat =({language})=>{
  const user = currentUser();
  const location = useLocation();
  const current = useAuth();
  const isMounted = useRef(true);
  const navigate = useNavigate();

  const [items, setItems] = useState(null);
  const [datas, setDatas] = useState(null);
  const [states,setStates] = useState({loading:false, noChatStarted:false,search:"",loading:false})
  
  
  useEffect(() => {
    const handleChats = snapChat => {
      const fetchedDatas = [];
      const lengthDatas = [];
      if(snapChat.exists()){
        snapChat.forEach((snapChatData)=>{
          const newChat = snapChatData.val();
          dbUsers.child(newChat.owner).on('value', (snapUser)=>{
            newChat.owner = snapUser.val();
            lengthDatas.push(1);
            if(newChat.data){
              fetchedDatas.push(newChat);
            }
            if(snapChat.numChildren() === lengthDatas.length){
              setItems(fetchedDatas);
            }
          });
        });
      }else{setItems([]);}
    };
    const handleChatsChanged = snapChat => {
      setItems(null);
      dbChats.once("value", handleChats);
    }
    dbChats.once("value", handleChats);
    dbChats.on("child_changed", handleChatsChanged);
    return () => {
      dbChats.off("value", handleChats);
      dbChats.off("child_changed", handleChatsChanged);
      isMounted.current = false;
    };
  }, []);
  
  useEffect(()=>{
    if(items){
      const filteredDatas = items.filter((item)=>{
        if(states.search !== "" && item.owner.name.toLowerCase().indexOf(states.search.toLowerCase()) >=0 || states.search === ""){return true;}
        return false;
      });
      setDatas(filteredDatas);
    }
    return ()=>{setDatas({});}
  },[items,states.search]);
  
  useEffect(()=>{
    const noChatStarted = (/^\/support$/i.test(location.pathname));
    setStates(preState=>({...preState,noChatStarted:noChatStarted}));
    return ()=>{setStates({});}
  },[location.pathname]);
  
  const handleChange = (event)=>{
    const {name,value} = event.target;
    setStates(preState=>({...preState,[name]:value}));
  }
  return(
    <section className="a_sec">
      <div className="sec_chat flex_b">
        <div className="a_chats_list a_width_40">
          <div className="a_box_o">
            <div className="a_chat_list_header a_cntainer flex_b_c">
              <div onClick={()=>navigate(-1,{replace:true})} className="flex_c_c br60 btn_circle"> 
                <svg fill="currentColor" opacity="1.0" baseProfile="full" width="26" height="26" viewBox="0 0 24.00 24.00">
                  <path d="M20 11v2H7.99l5.505 5.505-1.414 1.414L4.16 12l7.92-7.92 1.414 1.415L7.99 11H20z"/>
                </svg>
              </div>
              <div className="flex_e_c a_search_card_b a_container">
                <input value={states.search} name="search" onChange={handleChange} placeholder={texts.searchChat[language]} type="text"/>
                {!states.search && <i className="bi bi-search"> </i> || 
                  <svg onClick={()=>setStates(preState=>({...preState,search:""}))}  className="" fill="currentColor" opacity="1.0" baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
                }
              </div>
            </div>
            {!datas && <Loader language={language}/> ||
              <div className="a_chats_li_box">
                {datas && datas.length === 0 && <EmptyCard language={language}/> ||
                  <div style={{width:"100%"}}>
                    {datas && datas.map((item, index)=>{
                    const cur = current && current.uid;
                    const lastDataItem = item.data &&  item.data[item.data.length - 1];
                    const not_seen = lastDataItem  && !lastDataItem.seen && lastDataItem.autor !== cur;
                    let datasNotSeen = [];
                    const me = lastDataItem.autor !== cur;
                    const showText = lastDataItem.msg.text === "" && lastDataItem.msg.images !== "" ? me ? texts.heSentYouAPhoto[language] : texts.YouSentAPhoto[language] : lastDataItem.msg.text;
                    for(let y in item.data){
                      if(!item.data[y].seen && item.data[y].autor !== cur){
                        datasNotSeen.push(item.data[y]);
                      }
                    }
                    return(
                    <NavLink to={`/admin/support/chat/${item.id}?mode=admin`} key={index}  className={({isActive})=> isActive ? "a a_chat_li currentChat flex_s" : "a a_chat_li flex_s"}>
                      <div className="a_chat_avatar">
                        <Avatar avatar={item.owner} color={item.chatColor}/>
                      </div>
                      <div className={`a_chat_li_body flex_b ${not_seen && "a_chat_not_seen"}`}>
                        <div className="left">
                          <h2 className="ellipsis">{item.owner.name}</h2> 
                          <p className="ellipsis">{!me && `${texts.me[language]}:`} {showText}</p>
                        </div>
                        <div className=" a_wrap_notify">
                          <p className="last_chat_time">{lastDataItem && formatDate(lastDataItem.time, language).timeAgo}</p>
                          {datasNotSeen.length > 0 && <div className="a_notify flex_c_c">{datasNotSeen.length}</div>}
                        </div>
                      </div>
                    </NavLink>
                  )}
                )}
              </div>
              }
            </div>
            }
          </div>
        </div>
        <div className="a_width_60">
          {states.noChatStarted && <div className="flex_c_c noChatStarted">
            {texts.startAConversation[language]}
          </div>}
           <Outlet/>
        </div>
      </div>
    </section>
  );
}

export default SupportChat;