"use strict";(self.webpackChunkOpenSign_Docs=self.webpackChunkOpenSign_Docs||[]).push([[4651],{97717:(e,a,s)=>{s.r(a),s.d(a,{assets:()=>f,contentTitle:()=>u,default:()=>b,frontMatter:()=>j,metadata:()=>x,toc:()=>g});var l=s(85893),t=s(11151),n=s(58219),i=(s(62316),s(51039)),r=s.n(i),c=(s(82723),s(9487)),o=s(41429),m=s(5397),d=s(4667),p=s(9472),h=s(85162);const j={id:"getcontact",title:"Get Contact",description:"The Get Contact API allows you to retrieve details about a specific contact.",sidebar_label:"Get Contact",hide_title:!0,hide_table_of_contents:!0,api:"eJy9Vm1r4zgQ/iu6+bQFJ3HS7B5njmPLsvTKLtfl2uPg2lBkexKrlSWtNM4Lwf/9kOwkzkvL9VgKIYmleUbzPJ4XrYH4zEFyB5+0Ip6Rg0kEObrMCkNCK0jgtkB2icRaC3bx7YpxKfXCsZWuGGlmkazAObIciQvpGE91RYwzZzATU5GxrMH2IQJt0HLv+iqHBGZI7R5EYLjlJRJaH9EaFC8REmj3H0QOEQgfkeFUwGGYOn3EjK5ypqds59Li90pYzCEhW2EEjlbSO3WiNBIhAlwaqXOEZMql8wZZgSWHZA20MsGSrFAziGCqbcmpu4JLHrwkYH4fpkU2KkwKdT3xxzqjlUPnHY3i2P/sh+uqLEPnppVkW0UgCmRRkbfnxkiRhY3Bo/Og9XF0DWuvnfVuSDRHbsR4NY9imBbL0aOBOmr1f52DR40sRfRwLLmQ/wOfIn5sF/qZLr0rU2j16lDGw/PhKHy8i8wiJ8wv6JSbHWgUj857w7gX/3w7/JCMf0nef+jHcfwPRLAsA5s2K3NOgSUJkt3nyuRvcE59aNZmfFuAXcCmFurao8ancvFGl0iFUDO2QEVsYbWaRcxI5A4Z2RXjMy4Uk5zQ/vTjkhSt1fZlmV4XWd2hLZQUCh82hfgwjuOH4VaE8bEIm/amNLGprlT+tkxPHP8ynfHDaEvn/TGdKzXnUuShW9/qJ1RvS6d7PDXHHyetaIzCPuyR7a43JB1mlRW0CpNh2eNG9Jr95G7iO67PE91OlDBKqIAEBm32D9a7KVKD92bnmzFTWQkJFETGJYMBN6avDSonZkry1PkWNOBGDOa+jRxaO+IzoWa9F1GTXfQ3XuFGxD0OWym5EV9wBZvmu2fVTr8CeY42yCnUVAdwK9y1QXUjZirIPh8ezcjbQjgmXNjOdVaVqCikAJtqyw7QLOUOc6YVowLDpl8/7w+3Yz1A++xe3StfqKxy6OeZFOrJJfeqx+6up1ORCS7Z35g6QTh5t1FusVgcKXYWMJeCiiplFo3emc/CYpC1i9o+nEEEhLZ019MbtHORYfuWnjlqEIwHbU34/ujzuplYm6WPhyCfo1JkqBx2svji8ttXNmfn/RiiTnr8h6AHX68+ff7j5rP369OxeUnDftyPw9TTjkquOkd1rmGH73a9K+4ffWNrU5NwSQMjuQi1Goiu2zq7g92NK+nc1yYRFNqRN1ivfTr9ZWVd++XvFVpfy5MI5twKnvr8vVtDLpz/n2/vY8+SfPdne7U7Y6evfifD3pSZ8jU257LyTxDBE672r5r1pI42peYDawwusgwNdaBHbXSvF11+voUIeOU16pb4Uyjx9o/3fjKs/dpvAvDfvg2dBPzqX/QXXP22NW92ngW0/DbWXqJJXdf/AlpoGwc=",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},u=void 0,x={id:"API-docs/getcontact",title:"Get Contact",description:"The Get Contact API allows you to retrieve details about a specific contact.",source:"@site/docs/API-docs/getcontact.api.mdx",sourceDirName:"API-docs",slug:"/API-docs/getcontact",permalink:"/docs/API-docs/getcontact",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"getcontact",title:"Get Contact",description:"The Get Contact API allows you to retrieve details about a specific contact.",sidebar_label:"Get Contact",hide_title:!0,hide_table_of_contents:!0,api:"eJy9Vm1r4zgQ/iu6+bQFJ3HS7B5njmPLsvTKLtfl2uPg2lBkexKrlSWtNM4Lwf/9kOwkzkvL9VgKIYmleUbzPJ4XrYH4zEFyB5+0Ip6Rg0kEObrMCkNCK0jgtkB2icRaC3bx7YpxKfXCsZWuGGlmkazAObIciQvpGE91RYwzZzATU5GxrMH2IQJt0HLv+iqHBGZI7R5EYLjlJRJaH9EaFC8REmj3H0QOEQgfkeFUwGGYOn3EjK5ypqds59Li90pYzCEhW2EEjlbSO3WiNBIhAlwaqXOEZMql8wZZgSWHZA20MsGSrFAziGCqbcmpu4JLHrwkYH4fpkU2KkwKdT3xxzqjlUPnHY3i2P/sh+uqLEPnppVkW0UgCmRRkbfnxkiRhY3Bo/Og9XF0DWuvnfVuSDRHbsR4NY9imBbL0aOBOmr1f52DR40sRfRwLLmQ/wOfIn5sF/qZLr0rU2j16lDGw/PhKHy8i8wiJ8wv6JSbHWgUj857w7gX/3w7/JCMf0nef+jHcfwPRLAsA5s2K3NOgSUJkt3nyuRvcE59aNZmfFuAXcCmFurao8ancvFGl0iFUDO2QEVsYbWaRcxI5A4Z2RXjMy4Uk5zQ/vTjkhSt1fZlmV4XWd2hLZQUCh82hfgwjuOH4VaE8bEIm/amNLGprlT+tkxPHP8ynfHDaEvn/TGdKzXnUuShW9/qJ1RvS6d7PDXHHyetaIzCPuyR7a43JB1mlRW0CpNh2eNG9Jr95G7iO67PE91OlDBKqIAEBm32D9a7KVKD92bnmzFTWQkJFETGJYMBN6avDSonZkry1PkWNOBGDOa+jRxaO+IzoWa9F1GTXfQ3XuFGxD0OWym5EV9wBZvmu2fVTr8CeY42yCnUVAdwK9y1QXUjZirIPh8ezcjbQjgmXNjOdVaVqCikAJtqyw7QLOUOc6YVowLDpl8/7w+3Yz1A++xe3StfqKxy6OeZFOrJJfeqx+6up1ORCS7Z35g6QTh5t1FusVgcKXYWMJeCiiplFo3emc/CYpC1i9o+nEEEhLZ019MbtHORYfuWnjlqEIwHbU34/ujzuplYm6WPhyCfo1JkqBx2svji8ttXNmfn/RiiTnr8h6AHX68+ff7j5rP369OxeUnDftyPw9TTjkquOkd1rmGH73a9K+4ffWNrU5NwSQMjuQi1Goiu2zq7g92NK+nc1yYRFNqRN1ivfTr9ZWVd++XvFVpfy5MI5twKnvr8vVtDLpz/n2/vY8+SfPdne7U7Y6evfifD3pSZ8jU257LyTxDBE672r5r1pI42peYDawwusgwNdaBHbXSvF11+voUIeOU16pb4Uyjx9o/3fjKs/dpvAvDfvg2dBPzqX/QXXP22NW92ngW0/DbWXqJJXdf/AlpoGwc=",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},sidebar:"apiSidebar",previous:{title:"Create Contact",permalink:"/docs/API-docs/createcontact"},next:{title:"Delete Contact",permalink:"/docs/API-docs/deletecontact"}},f={},g=[{value:"Request",id:"request",level:2}];function v(e){const a={h2:"h2",p:"p",...(0,t.a)(),...e.components},{Details:s}=a;return s||function(e,a){throw new Error("Expected "+(a?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("h1",{className:"openapi__heading",children:(0,l.jsx)(a.p,{children:"Get Contact"})}),"\n",(0,l.jsx)(r(),{method:"get",path:"/contact/{contact_id}"}),"\n",(0,l.jsx)(a.p,{children:"The Get Contact API allows you to retrieve details about a specific contact."}),"\n",(0,l.jsx)(a.h2,{id:"request",children:"Request"}),"\n",(0,l.jsxs)(s,{style:{marginBottom:"1rem"},className:"openapi-markdown__details","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},children:(0,l.jsx)("h3",{className:"openapi-markdown__details-summary-header-params",children:(0,l.jsx)(a.p,{children:"Path Parameters"})})}),(0,l.jsx)("div",{children:(0,l.jsx)("ul",{children:(0,l.jsx)(o.Z,{className:"paramsItem",param:{name:"contact_id",in:"path",description:"objectId of contact",required:!0,style:"simple",explode:!1,schema:{type:"string",format:"string",example:"pH1bhc2hpb"}}})})})]}),"\n",(0,l.jsx)("div",{children:(0,l.jsx)("div",{children:(0,l.jsxs)(n.Z,{children:[(0,l.jsxs)(h.default,{label:"200",value:"200",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"successful operation"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(h.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(p.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(h.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsxs)("ul",{style:{marginLeft:"1rem"},children:[(0,l.jsx)(d.Z,{collapsible:!1,name:"objectId",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"ph1bhx2jp"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"name",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joe bee"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"email",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joebee@example.com"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"phone",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"4131231231"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"createdAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"updatedAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}})]})]})}),(0,l.jsx)(h.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(m.Z,{responseExample:'{\n  "objectId": "ph1bhx2jp",\n  "name": "joe bee",\n  "email": "joebee@example.com",\n  "phone": "4131231231",\n  "createdAt": "2023-10-07T16:49:56.000Z",\n  "updatedAt": "2023-10-07T16:49:56.000Z"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(h.default,{label:"400",value:"400",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Something went wrong, please try again later!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(h.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(p.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(h.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Something went wrong, please try again later!"}})})]})}),(0,l.jsx)(h.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(m.Z,{responseExample:'{\n  "error": "Something went wrong, please try again later!"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(h.default,{label:"404",value:"404",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Contact not found!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(h.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(p.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(h.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Contact not found!"}})})]})}),(0,l.jsx)(h.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(m.Z,{responseExample:'{\n  "error": "Contact not found!"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(h.default,{label:"405",value:"405",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Invalid API Token!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(h.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(p.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(h.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Invalid API token!"}})})]})}),(0,l.jsx)(h.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(m.Z,{responseExample:'{\n  "error": "Invalid API token!"\n}',language:"json"})})]})})})})]})]})})})]})}function b(e={}){const{wrapper:a}={...(0,t.a)(),...e.components};return a?(0,l.jsx)(a,{...e,children:(0,l.jsx)(v,{...e})}):v(e)}}}]);