"use strict";(self.webpackChunkOpenSign_Docs=self.webpackChunkOpenSign_Docs||[]).push([[5597],{27312:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>c,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>n,toc:()=>l});const n=JSON.parse('{"id":"self-host/guides/env-variables","title":"ENV variables which are used to setup OpenSign\u2122 with Docker on Localhost","description":"Information About ENV variables which are used to setup OpenSign\u2122 with Docker on Localhost","source":"@site/docs/self-host/guides/env-variables.md","sourceDirName":"self-host/guides","slug":"/self-host/guides/env-variables","permalink":"/docs/self-host/guides/env-variables","draft":false,"unlisted":false,"editUrl":"https://github.com/opensignlabs/opensign/tree/feat-docs/docs/docs/self-host/guides/env-variables.md","tags":[],"version":"current","frontMatter":{"title":"ENV variables which are used to setup OpenSign\u2122 with Docker on Localhost"},"sidebar":"selfhostSidebar","previous":{"title":"Guides","permalink":"/docs/category/guides"},"next":{"title":"How to generate self-signed document signing certificate?","permalink":"/docs/self-host/guides/how-to-generate-self-signed-document-signing-certificate"}}');var i=t(74848),d=t(28453);const r={title:"ENV variables which are used to setup OpenSign\u2122 with Docker on Localhost"},o=void 0,c={},l=[{value:"Information About ENV variables which are used to setup OpenSign\u2122 with Docker on Localhost",id:"information-about-env-variables-which-are-used-to-setup-opensign-with-docker-on-localhost",level:2}];function a(e){const s={a:"a",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.h2,{id:"information-about-env-variables-which-are-used-to-setup-opensign-with-docker-on-localhost",children:"Information About ENV variables which are used to setup OpenSign\u2122 with Docker on Localhost"}),"\n",(0,i.jsx)(s.p,{children:"To set up OpenSign\u2122 locally using Docker, the following prerequisites are required:"}),"\n",(0,i.jsx)(s.p,{children:"Environment Varaibles:"}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Environment Varibale"}),(0,i.jsx)(s.th,{children:"Value"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"PUBLIC_URL"}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.a,{href:"https://localhost:3001",children:"https://localhost:3001"})}),(0,i.jsx)(s.td,{children:"Set it to the URL form where the app home page will be accessed"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"MASTER_KEY"}),(0,i.jsx)(s.td,{children:"XnAadwKxxByMr"}),(0,i.jsx)(s.td,{children:"A 12 character long random secret key that allows access to all the data. It is used in Parse dashboard config to view all the data in the database."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"MONGODB_URI"}),(0,i.jsx)(s.td,{children:"mongodb://mongo-container:27017/OpenSignDB"}),(0,i.jsx)(s.td,{children:"Mongodb URI to connect to"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"PARSE_MOUNT"}),(0,i.jsx)(s.td,{children:"/app"}),(0,i.jsx)(s.td,{children:"Path on which APIs should be mounted. Do not change this. This variable shall be removed & value hardcoded in the source code in coming versions."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"SERVER_URL"}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.a,{href:"http://localhost:8080/app",children:"http://localhost:8080/app"})}),(0,i.jsx)(s.td,{children:"Set it to the URL from where APIs will be accessible to the NodeJS functions, for local development it should be localhost:8080/app"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"DO_SPACE"}),(0,i.jsx)(s.td,{children:"DOSPACENAME"}),(0,i.jsx)(s.td,{children:"Digital ocean space name or AWS S3 bucket name for uploading documents"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"DO_ENDPOINT"}),(0,i.jsx)(s.td,{children:"ams3.digitaloceanspaces.com"}),(0,i.jsx)(s.td,{children:"Digital ocean spaces endpoint or AWS S3 endpoint for uploading documents"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"DO_BASEURL"}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.a,{href:"https://dospace.ams3.digitaloceanspaces.com",children:"https://dospace.ams3.digitaloceanspaces.com"})}),(0,i.jsx)(s.td,{children:"Digital ocean baseurl or AWS S3 base URL"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"DO_ACCESS_KEY_ID"}),(0,i.jsx)(s.td,{children:"YOUR_S3_ACCESS_ID"}),(0,i.jsx)(s.td,{children:"Digital ocean spaces access key ID or AWS s3 Access key ID for uploading the docs"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"DO_SECRET_ACCESS_KEY"}),(0,i.jsx)(s.td,{children:"YOUR_S3_ACCESS_KEY"}),(0,i.jsx)(s.td,{children:"Digital ocean spaces secret access key or AWS s3 secret access key for uploading the docs"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"DO_REGION"}),(0,i.jsx)(s.td,{children:"YOUR_S3_REGION"}),(0,i.jsx)(s.td,{children:"Digital ocean spaces region or AWS s3 region"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"USE_LOCAL"}),(0,i.jsx)(s.td,{children:"true"}),(0,i.jsx)(s.td,{children:"If this is set to true, local file storage will be used to save files, and DO credentials will be ignored."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"MAILGUN_API_KEY"}),(0,i.jsx)(s.td,{children:"YOUR_MAILGUNAPI_KEY"}),(0,i.jsx)(s.td,{children:"Mailgun API Key"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"MAILGUN_DOMAIN"}),(0,i.jsx)(s.td,{children:"YOUR_MAILGUNAPI_DOMAIN"}),(0,i.jsx)(s.td,{children:"Mailgun API Domain"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"MAILGUN_SENDER"}),(0,i.jsx)(s.td,{children:"-"}),(0,i.jsx)(s.td,{children:"Mailgun Sender Mail ID"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"SMTP_ENABLE"}),(0,i.jsx)(s.td,{children:"false"}),(0,i.jsx)(s.td,{children:"If this is set to true, emails will be sent through SMTP, and Mailgun credentials will be ignored."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"SMTP_HOST"}),(0,i.jsx)(s.td,{children:"smtp.yourhost.com"}),(0,i.jsx)(s.td,{children:"Provide smtp host"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"SMTP_PORT"}),(0,i.jsx)(s.td,{children:"443"}),(0,i.jsx)(s.td,{children:"Provide smtp port number"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"SMTP_USERNAME"}),(0,i.jsx)(s.td,{children:"-"}),(0,i.jsx)(s.td,{children:"Provide username of smtp"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"SMTP_USER_EMAIL"}),(0,i.jsx)(s.td,{children:(0,i.jsx)(s.a,{href:"mailto:mailer@yourdomain.com",children:"mailer@yourdomain.com"})}),(0,i.jsx)(s.td,{children:"Provide user email of smtp"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"SMTP_PASS"}),(0,i.jsx)(s.td,{children:"password"}),(0,i.jsx)(s.td,{children:"Provide smtp password"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"PFX_BASE64"}),(0,i.jsx)(s.td,{children:"-"}),(0,i.jsx)(s.td,{children:"Base64 encoded PFX or p12 document signing certificate file. You can generate base64 encoded self sign certificate using the passphrase."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"PASS_PHRASE"}),(0,i.jsx)(s.td,{children:"opensign"}),(0,i.jsx)(s.td,{children:"Pass phrase of PFX or p12 document signing certificate file."})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:"APP_ID"}),(0,i.jsx)(s.td,{children:"opensign"}),(0,i.jsx)(s.td,{children:"(DEPRECATED) This should not be changed if provided; it should be 'opensign'."})]})]})]}),"\n",(0,i.jsx)(s.h1,{id:"steps-to-generate-self-signed-document-singing-certificate",children:"Steps to generate self-signed document singing certificate"}),"\n",(0,i.jsx)(s.pre,{children:(0,i.jsx)(s.code,{children:"# execute below command and use passphrase 'opensign'\nopenssl genrsa -des3 -out ./local_dev.key 2048\nopenssl req -key ./local_dev.key -new -x509 -days 365 -out ./local_dev.crt\nopenssl pkcs12 -inkey ./local_dev.key -in ./local_dev.crt -export -out ./local_dev.pfx\nopenssl base64 -in ./local_dev.pfx -out ./base64_pfx\n"})})]})}function h(e={}){const{wrapper:s}={...(0,d.R)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},28453:(e,s,t)=>{t.d(s,{R:()=>r,x:()=>o});var n=t(96540);const i={},d=n.createContext(i);function r(e){const s=n.useContext(d);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function o(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),n.createElement(d.Provider,{value:s},e.children)}}}]);