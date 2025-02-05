"use strict";(self.webpackChunkOpenSign_Docs=self.webpackChunkOpenSign_Docs||[]).push([[9588],{44545:(e,s,a)=>{a.r(s),a.d(s,{assets:()=>x,contentTitle:()=>u,default:()=>k,frontMatter:()=>m,metadata:()=>j,toc:()=>b});var l=a(85893),o=a(11151),n=a(58219),i=(a(62316),a(51039)),t=a.n(i),r=(a(82723),a(9487)),d=(a(41429),a(5397)),c=a(4667),h=a(9472),p=a(85162);const m={id:"get-webhook",title:"Get Webhook",description:"The Get Webhook API allow you to get webhook url",sidebar_label:"Get Webhook",hide_title:!0,hide_table_of_contents:!0,api:"eJy9VttuGzcQ/ZUJX9oAq4vTBAWEoojRBq6RNDZgB36QBWN2d7TLiEuyJHclQdi3fkk/rV9SDHdXluTEaIuiL7ZEzpmZM5dD7UTAwovZXNxRWhqzEotE5OQzJ22QRouZuC0JLihAbwDn15eASpk1bE0NwUBBAdb9Ze2USISx5JDhl7mYiYLC4DwRjrw12pMXs514NZ3yv+N4N3WWkffLWsHej0hEZnQgHdgerVUyixeTz55BO+GzkirkT2FrScyEST9TFkQirGM3QXYh+0QPDH1wUhciEbTByio+KkOwfjaZbE3tRj1iVDv1tjcZZ6YSbZuIIEMESK2kpoeB3MOr6fThe9G2bPN6+vopyU+eHGgTYGlqnb/47/iRc8Y9z+409nNEOPmBxpunNC51g0rmcSZuzYr0/8vkMHzownOqm0oxTmPVUYpG8V4cUT0870h6ymonw1bM5juxGaGVo+5+Nl+0i0RUFErTzzQnjKEUMzFZ78fbk2vI+Yg/Ges1FgW5X+o0pnteBwO/mmzVceK9eZy7RrrQeRr7DlbWKQ/d5NrhslbqIzYrdBNjSU/OxtPxVLTJ7sSJR52nZjNmIy8LrTD10QdaOWnOvoBAa/+BtQ9YSF2MnkUtHmt6w33vWntU2X2D0cr3tBXJ0LhDq0RILmJJmJOLTZZ6aSK4b+eVJX0jCx2r25yJUxm7I5WZiliwQkkwmP/5+x8RkZusrkiHOKsv4Kp2YM2aHMsQ6hyWijYyVfQof37QP09YKfJebUHqQIXDQJDLQgZUwFWRuoAMLaZSSZ5uNjOMdnCwIH4MdyWFkhxffeMIEHJqSPFSgDKGR4XjYR1MFWP0OcPauNWSU0oAIa291OQ9eKIBQrpEnREMvUjAOEANpAM566QnQFmx8dI4oOVSZpId8yo7zAJUqLEgDpYA581VsM40MicPzqS1D+CNqiMRjlgRhY6iJsr9GH6WDXXE+TCngFJRDkXNLhLITE7QbzbT0Dmk5ANYDi8zik59QBdAUUMuzl7sJO8DWMOSI1GBWR71lh0Fh9ovjau6hIbW7MtnneEXJ8bIcTuGe32vb3hYak88AErqlZ/d6xHM92N2R6mXgRbfDvuwXq+f7MHLY8yFDGWdgiNrHnFFPIxbcwjff3kpEhHIVf5qeUOukdnwQn0l5iQaT3ohxiwKMVUoVbdjb08BLIpKZqQ9Hcjm+cX1B2jgu/H0SJ7+RsKTD5c/vft48479shh2+zfIlLDGhwr1QaiDXxena7t7fE3+zQ+RXlkCbcLEKpTxAYhkdr14z/e/CBaJKI0PfLTbpejpk1Nty8e/1eT4SVgkokEnMWXBmS/aZNAjVvsVbblqWUaWn4YGVd2J2skLePSMXLy7FYnAmjM51MFV1MH+A3sfrvT2wPexQHYJ8F/W6i8CfuCSvaftj3vz7uargJ7fYM31W7Rt+xfdp5OA",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},u=void 0,j={id:"API-docs/get-webhook",title:"Get Webhook",description:"The Get Webhook API allow you to get webhook url",source:"@site/docs/API-docs/get-webhook.api.mdx",sourceDirName:"API-docs",slug:"/API-docs/get-webhook",permalink:"/docs/API-docs/get-webhook",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"get-webhook",title:"Get Webhook",description:"The Get Webhook API allow you to get webhook url",sidebar_label:"Get Webhook",hide_title:!0,hide_table_of_contents:!0,api:"eJy9VttuGzcQ/ZUJX9oAq4vTBAWEoojRBq6RNDZgB36QBWN2d7TLiEuyJHclQdi3fkk/rV9SDHdXluTEaIuiL7ZEzpmZM5dD7UTAwovZXNxRWhqzEotE5OQzJ22QRouZuC0JLihAbwDn15eASpk1bE0NwUBBAdb9Ze2USISx5JDhl7mYiYLC4DwRjrw12pMXs514NZ3yv+N4N3WWkffLWsHej0hEZnQgHdgerVUyixeTz55BO+GzkirkT2FrScyEST9TFkQirGM3QXYh+0QPDH1wUhciEbTByio+KkOwfjaZbE3tRj1iVDv1tjcZZ6YSbZuIIEMESK2kpoeB3MOr6fThe9G2bPN6+vopyU+eHGgTYGlqnb/47/iRc8Y9z+409nNEOPmBxpunNC51g0rmcSZuzYr0/8vkMHzownOqm0oxTmPVUYpG8V4cUT0870h6ymonw1bM5juxGaGVo+5+Nl+0i0RUFErTzzQnjKEUMzFZ78fbk2vI+Yg/Ges1FgW5X+o0pnteBwO/mmzVceK9eZy7RrrQeRr7DlbWKQ/d5NrhslbqIzYrdBNjSU/OxtPxVLTJ7sSJR52nZjNmIy8LrTD10QdaOWnOvoBAa/+BtQ9YSF2MnkUtHmt6w33vWntU2X2D0cr3tBXJ0LhDq0RILmJJmJOLTZZ6aSK4b+eVJX0jCx2r25yJUxm7I5WZiliwQkkwmP/5+x8RkZusrkiHOKsv4Kp2YM2aHMsQ6hyWijYyVfQof37QP09YKfJebUHqQIXDQJDLQgZUwFWRuoAMLaZSSZ5uNjOMdnCwIH4MdyWFkhxffeMIEHJqSPFSgDKGR4XjYR1MFWP0OcPauNWSU0oAIa291OQ9eKIBQrpEnREMvUjAOEANpAM566QnQFmx8dI4oOVSZpId8yo7zAJUqLEgDpYA581VsM40MicPzqS1D+CNqiMRjlgRhY6iJsr9GH6WDXXE+TCngFJRDkXNLhLITE7QbzbT0Dmk5ANYDi8zik59QBdAUUMuzl7sJO8DWMOSI1GBWR71lh0Fh9ovjau6hIbW7MtnneEXJ8bIcTuGe32vb3hYak88AErqlZ/d6xHM92N2R6mXgRbfDvuwXq+f7MHLY8yFDGWdgiNrHnFFPIxbcwjff3kpEhHIVf5qeUOukdnwQn0l5iQaT3ohxiwKMVUoVbdjb08BLIpKZqQ9Hcjm+cX1B2jgu/H0SJ7+RsKTD5c/vft48479shh2+zfIlLDGhwr1QaiDXxena7t7fE3+zQ+RXlkCbcLEKpTxAYhkdr14z/e/CBaJKI0PfLTbpejpk1Nty8e/1eT4SVgkokEnMWXBmS/aZNAjVvsVbblqWUaWn4YGVd2J2skLePSMXLy7FYnAmjM51MFV1MH+A3sfrvT2wPexQHYJ8F/W6i8CfuCSvaftj3vz7uargJ7fYM31W7Rt+xfdp5OA",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},sidebar:"apiSidebar",previous:{title:"Get Template list",permalink:"/docs/API-docs/gettemplatelist"},next:{title:"Save or Update Webhook",permalink:"/docs/API-docs/save-update-webhook"}},x={},b=[{value:"Request",id:"request",level:2}];function f(e){const s={h2:"h2",p:"p",...(0,o.a)(),...e.components},{Details:a}=s;return a||function(e,s){throw new Error("Expected "+(s?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("h1",{className:"openapi__heading",children:(0,l.jsx)(s.p,{children:"Get Webhook"})}),"\n",(0,l.jsx)(t(),{method:"get",path:"/webhook"}),"\n",(0,l.jsx)(s.p,{children:"The Get Webhook API allow you to get webhook url"}),"\n",(0,l.jsx)(s.h2,{id:"request",children:"Request"}),"\n",(0,l.jsx)("div",{children:(0,l.jsx)("div",{children:(0,l.jsxs)(n.Z,{children:[(0,l.jsxs)(p.default,{label:"200",value:"200",children:[(0,l.jsx)("div",{children:(0,l.jsx)(s.p,{children:"Successful operation"})}),(0,l.jsx)("div",{children:(0,l.jsx)(r.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(h.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(a,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(s.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"webhook",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"https://your-webhook-url@example.com"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(d.Z,{responseExample:'{\n  "webhook": "https://your-webhook-url@example.com"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(p.default,{label:"404",value:"404",children:[(0,l.jsx)("div",{children:(0,l.jsx)(s.p,{children:"User not found!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(r.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(h.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(a,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(s.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"User not found!"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(d.Z,{responseExample:'{\n  "error": "User not found!"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(p.default,{label:"405",value:"405",children:[(0,l.jsx)("div",{children:(0,l.jsx)(s.p,{children:"Invalid API Token!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(r.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(h.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(a,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(s.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Invalid API token!"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(d.Z,{responseExample:'{\n  "error": "Invalid API token!"\n}',language:"json"})})]})})})})]})]})})})]})}function k(e={}){const{wrapper:s}={...(0,o.a)(),...e.components};return s?(0,l.jsx)(s,{...e,children:(0,l.jsx)(f,{...e})}):f(e)}}}]);