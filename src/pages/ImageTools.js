import React, {useState,useEffect, useRef} from "react";
import Cropper from 'cropperjs';

import {texts} from "../texts/Texts";
import {MinLoder,Toast,useFileName} from "./Utils";

export const ImageCropper =({language, mode, loading, handleSaveAvatar,setFileName, clearFileName, fileName})=>{
  const image=useRef(null);
  const [cropper,setCropper]=useState(null);
  const [error,setError]=useState({avatar:null,error:{text:null,stack:null}});
  const fileInput=useRef(null);
  const handleFileChange=(event)=>{
    const file=event.target.files[0];
    const reader=new FileReader();
    if(fileName){clearFileName();}
    if(!/^image\/(jpeg|png|gif|bmp)$/.test(file.type)) {
      setError(prevError=>({...prevError,error:{text:texts.imageNotsupported[language],stack:"error"}}));
      return;
    }
    reader.onload=()=>{setFileName(reader.result);};
    reader.readAsDataURL(file);
 };
  
  useEffect(()=>{return()=>{clearFileName();}},[]);

  useEffect(() => {
    const initCropper = () => {
      if (image.current !== null) {
        const newCropper = new Cropper(image.current, {
          zoomable: true,
          dragMode: 'move',
          aspectRatio: mode === "chat" ? NaN : 1,
          autoCropArea: 1,
          scalable: true,
          cropBoxResizable: mode === "chat"? true : false,
          movable: true,
          checkCrossOrigin: true,
        });
        setCropper(newCropper);
      }
    };
    if (fileName && image.current) {
      image.current.onload = initCropper;
      image.current.setAttribute('src', fileName);
    }
    return () => {if(cropper){cropper.destroy();}};
  }, [fileName]);
  
  const handlePreviewClick = () => {
    if (cropper && cropper.getCroppedCanvas()) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if(croppedCanvas && croppedCanvas.toDataURL() !== null){
        const imgSrc = croppedCanvas.toDataURL();
        handleSaveAvatar(imgSrc);
      } else {
        console.error(texts.errorGettingCroppedImg[language]);
        setError(prevError=>({...prevError,error:{text:texts.errorGettingCroppedImg[language],stack:"error"}}));
      }// Tratamento de erro caso toDataURL retorne nulo
    } else {
      console.error(texts.cropperIsNotResponding[language]);
      setError(prevError=>({...prevError,error:{text:texts.cropperIsNotResponding[language],stack:"error"}}));
    }// Tratamento de erro caso o cropper não esteja definido
  };
  const handleBack = ()=>{setFileName('');}
  return(
    <div>
      <Toast props={error.error} onClear={()=>setError(prevError=>({...prevError,error:{text:null,stack:null}}))}/>
      <label htmlFor="input_imge">
        {mode === "chat" && <div className="take_picture"> <i className="bi bi-camera"></i> </div>
         ||
        <div className="label_input_file flex_c_c">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-camera-fill" viewBox="0 0 16 16">
            <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
            <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
          </svg>
        </div>
        }
        <input className="input_imge" type="file" id="input_imge" ref={fileInput} onChange={handleFileChange} accept="image/*"/>
      </label>
    {fileName && <div className="popUp flex_c_c">
     <div className="card_popup a_container">
        <div className="modal_header flex_b_c">
          <h4>{texts.image[language]}</h4>
          <div className="flex_b_c"><svg onClick={handleBack} className="a_close_popup" fill="currentColor" opacity="1.0" baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg></div>
        </div>
        <div className="modal_body">
           <div className="a_cropper_container flex_c_c">
            <div>
            <img className="cropper-img"  ref={image}/>
          </div>
          </div>  
            <div className="label_error"> </div>
          <div className="input_card">
          <button type="button" onClick={handlePreviewClick} disabled={loading} className="primary-btn br6-a">{loading && <MinLoder/> || texts._continue[language]}</button>
          </div>
        </div>
      </div>
    </div>}
    </div>
  );
}


export const ImageViewer = ({language,datas,onClose}) =>{
  useEffect(()=>{
    return()=>{onClose();}
  },[]);
  if(!datas) return null;
  return(
    <div className="images_swipper_container flex_c_c">
      <div className="images_swipper_wrap a_container">
        <div className="min_header flex_b_c">
          <h3>{texts.imagens[language]}</h3>
          <div onClick={onClose} className="btn_circle flex_c_c">
            <svg className="" fill="currentColor" opacity="1.0" baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </div>
        </div>
        <div className="images_swipper">
          {datas && datas.map((image,k)=>(
          <div key={k} className="image_swipper">
            <div className="image_swipper_center flex_c_c">
              <img src={image} alt={`image${k}`} download/>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}