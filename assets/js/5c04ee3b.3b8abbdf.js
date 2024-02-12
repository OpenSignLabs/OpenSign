"use strict";(self.webpackChunkOpenSign_Docs=self.webpackChunkOpenSign_Docs||[]).push([[9588],{44545:(e,s,a)=>{a.r(s),a.d(s,{assets:()=>x,contentTitle:()=>u,default:()=>f,frontMatter:()=>p,metadata:()=>b,toc:()=>j});var l=a(85893),i=a(11151),t=a(58219),n=(a(62316),a(51039)),o=a.n(n),r=(a(82723),a(9487)),d=(a(41429),a(5397)),c=a(4667),h=a(9472),m=a(85162);const p={id:"get-webhook",title:"Get Webhook",description:"The Get Webhook API allow you to get webhook url",sidebar_label:"Get Webhook",hide_title:!0,hide_table_of_contents:!0,api:"eJy9VW2L2zgQ/iu6+XQFJc72hYI5SsuxLEtLt5At9yFrFkWZ2GpkSSfJyYbg/15GtrNOtl2OUu6L7czMo3nR80wOEEUZIF/AP7isrN1AwWGFQXrlorIGcritkF1hZH0A+/Dlmgmt7Y7tbcOiZSVGtuudjdfAwTr0guDXK8ihxDgczsFjcNYEDJAf4OVsRq/TfPNGSgxh3Wh2PAc4SGsimkjxwjmtZHJk3wKBDhBkhbWgr7h3CDnY5TeUETg4T8dE1aXsCx0FhuiVKYEDPojaaTJVMbqQZ9neNn7SIyaN1+/7kKm0NbQth6hiAiijlcH7obn7l7PZ/VtoW4p5PXv9tMmvAT0zNrK1bczqj9/XH3pv/fPdned+rhEqfmjjzdM2rs1WaLVKnLi1GzT/byfj9LFLT6U+1JpwRtRdSyko+eGk1bG9azKgbLyKe8gXB3iYCKcmnT9fFG3BocZY2Z7TVLCIFeSQ7Y70Dui36EPCkxYeuSScm1qHJqjSaLEMxKFMOJVtL6Dl59EhilKZcvIsqngseE5D7eZ2UvZxesKpj7gHPkxlHMVB0WVWKFbo0wSVWdsE7md149DMVWnSpLcX8HRHqMBUSO6VlU2NJqZbZ2vr2RmaLUXAFbOGxQqTk+yvphcsOJRq3RNmyu7MnZnbGlkTkNaBVmYT8jszYYub9VpJJTRtpaAiFn8Ok9vtdk8m9iJhrlSsmiXz6OxjeJmMaaxj1PHHC+AQ0dfhZj1Hv1Vy2A8/SZWl4KyXgZBJBlgLRbfbm96fg4iWWkk0AUfE/XD15RPbslfTGfARPf5D0dmn678vP88v6VyiY3dJF9PZdEYmZ0OshRmlGu3387s9POr5V/4KevpFfIiZ00IlCaZmDr18FsedXHCobIhkOhyIJF+9blsy/9ugJ1EWHLbCK7EkVi6Klg+kJb1tcE9TkxIdiXMrdNMx/2wHnQj56vIWOIiGKhmLZZPE0n/Q6YPL7Ednn6qoK4CeJOgfAv6ikX3E/btjeOf5KaDvb4im+RVt234HViilYg==",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},u=void 0,b={id:"API-docs/get-webhook",title:"Get Webhook",description:"The Get Webhook API allow you to get webhook url",source:"@site/docs/API-docs/get-webhook.api.mdx",sourceDirName:"API-docs",slug:"/API-docs/get-webhook",permalink:"/docs/API-docs/get-webhook",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"get-webhook",title:"Get Webhook",description:"The Get Webhook API allow you to get webhook url",sidebar_label:"Get Webhook",hide_title:!0,hide_table_of_contents:!0,api:"eJy9VW2L2zgQ/iu6+XQFJc72hYI5SsuxLEtLt5At9yFrFkWZ2GpkSSfJyYbg/15GtrNOtl2OUu6L7czMo3nR80wOEEUZIF/AP7isrN1AwWGFQXrlorIGcritkF1hZH0A+/Dlmgmt7Y7tbcOiZSVGtuudjdfAwTr0guDXK8ihxDgczsFjcNYEDJAf4OVsRq/TfPNGSgxh3Wh2PAc4SGsimkjxwjmtZHJk3wKBDhBkhbWgr7h3CDnY5TeUETg4T8dE1aXsCx0FhuiVKYEDPojaaTJVMbqQZ9neNn7SIyaN1+/7kKm0NbQth6hiAiijlcH7obn7l7PZ/VtoW4p5PXv9tMmvAT0zNrK1bczqj9/XH3pv/fPdned+rhEqfmjjzdM2rs1WaLVKnLi1GzT/byfj9LFLT6U+1JpwRtRdSyko+eGk1bG9azKgbLyKe8gXB3iYCKcmnT9fFG3BocZY2Z7TVLCIFeSQ7Y70Dui36EPCkxYeuSScm1qHJqjSaLEMxKFMOJVtL6Dl59EhilKZcvIsqngseE5D7eZ2UvZxesKpj7gHPkxlHMVB0WVWKFbo0wSVWdsE7md149DMVWnSpLcX8HRHqMBUSO6VlU2NJqZbZ2vr2RmaLUXAFbOGxQqTk+yvphcsOJRq3RNmyu7MnZnbGlkTkNaBVmYT8jszYYub9VpJJTRtpaAiFn8Ok9vtdk8m9iJhrlSsmiXz6OxjeJmMaaxj1PHHC+AQ0dfhZj1Hv1Vy2A8/SZWl4KyXgZBJBlgLRbfbm96fg4iWWkk0AUfE/XD15RPbslfTGfARPf5D0dmn678vP88v6VyiY3dJF9PZdEYmZ0OshRmlGu3387s9POr5V/4KevpFfIiZ00IlCaZmDr18FsedXHCobIhkOhyIJF+9blsy/9ugJ1EWHLbCK7EkVi6Klg+kJb1tcE9TkxIdiXMrdNMx/2wHnQj56vIWOIiGKhmLZZPE0n/Q6YPL7Ednn6qoK4CeJOgfAv6ikX3E/btjeOf5KaDvb4im+RVt234HViilYg==",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},sidebar:"apiSidebar",previous:{title:"Get Template list",permalink:"/docs/API-docs/gettemplatelist"},next:{title:"Save or Update Webhook",permalink:"/docs/API-docs/save-update-webhook"}},x={},j=[{value:"Request",id:"request",level:2}];function k(e){const s={h2:"h2",p:"p",...(0,i.a)(),...e.components},{Details:a}=s;return a||function(e,s){throw new Error("Expected "+(s?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("h1",{className:"openapi__heading",children:(0,l.jsx)(s.p,{children:"Get Webhook"})}),"\n",(0,l.jsx)(o(),{method:"get",path:"/webhook"}),"\n",(0,l.jsx)(s.p,{children:"The Get Webhook API allow you to get webhook url"}),"\n",(0,l.jsx)(s.h2,{id:"request",children:"Request"}),"\n",(0,l.jsx)("div",{children:(0,l.jsx)("div",{children:(0,l.jsxs)(t.Z,{children:[(0,l.jsxs)(m.default,{label:"200",value:"200",children:[(0,l.jsx)("div",{children:(0,l.jsx)(s.p,{children:"Successful operation"})}),(0,l.jsx)("div",{children:(0,l.jsx)(r.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(m.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(h.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(m.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(a,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(s.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"webhook",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"https://your-webhook-url@example.com"}})})]})}),(0,l.jsx)(m.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(d.Z,{responseExample:'{\n  "webhook": "https://your-webhook-url@example.com"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(m.default,{label:"404",value:"404",children:[(0,l.jsx)("div",{children:(0,l.jsx)(s.p,{children:"User not found!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(r.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(m.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(h.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(m.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(a,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(s.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"User not found!"}})})]})}),(0,l.jsx)(m.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(d.Z,{responseExample:'{\n  "error": "User not found!"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(m.default,{label:"405",value:"405",children:[(0,l.jsx)("div",{children:(0,l.jsx)(s.p,{children:"Invalid API Token!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(r.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(m.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(h.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(m.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(a,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(s.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Invalid API token!"}})})]})}),(0,l.jsx)(m.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(d.Z,{responseExample:'{\n  "error": "Invalid API token!"\n}',language:"json"})})]})})})})]})]})})})]})}function f(e={}){const{wrapper:s}={...(0,i.a)(),...e.components};return s?(0,l.jsx)(s,{...e,children:(0,l.jsx)(k,{...e})}):k(e)}}}]);