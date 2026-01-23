SystemJS.config({
  baseURL:'./node_modules/',
  defaultExtension:false,
  packages:{
    ".":{
      main:'./index.js',
    }
  },
  meta:{
    '*.js':{
      'babelOptions':{
        react:true
      }
    },
    '*.css':{ loader:'css' },
    '*.json':{loader:'json'},
   '*.jpg':{loader:'url'}
    
  },
  map:{
    'plugin-babel':'systemjs-plugin-babel/plugin-babel.js',
    'systemjs-babel-build':'systemjs-plugin-babel/systemjs-babel-browser.js',
    'react':'react/umd/react.development.js',
    'react-dom':'react-dom/umd/react-dom.development.js',
    '@remix-run/router': '@remix-run/router/dist/router.js',
    'react-router':'react-router/dist/umd/react-router.development.js',
    'react-router-dom':'react-router-dom/dist/umd/react-router-dom.production.min.js',
    'css':'systemjs-plugin-css/css.js',
    'highcharts':'highcharts/highcharts.js',
    'cropperjs':'cropperjs/dist/cropper.js',
    'cropper.css':'cropperjs/dist/cropper.min.css'
  },
  transpiler:'plugin-babel'
});

SystemJS.import('./src/index').then(()=>{
  console.log("Modulo carregado con sucesso");
}).catch((error)=>{
  //window.location.reload();
  document.getElementById('abc').textContent= error;
 
  console.log(error);
  console.error.bind(console);
});