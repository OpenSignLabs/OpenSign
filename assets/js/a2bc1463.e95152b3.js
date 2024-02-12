"use strict";(self.webpackChunkOpenSign_Docs=self.webpackChunkOpenSign_Docs||[]).push([[2245],{87435:(e,a,s)=>{s.r(a),s.d(a,{assets:()=>y,contentTitle:()=>u,default:()=>v,frontMatter:()=>x,metadata:()=>j,toc:()=>g});var t=s(85893),l=s(11151),i=s(58219),n=(s(62316),s(51039)),r=s.n(n),o=(s(82723),s(9487)),c=s(41429),m=s(5397),d=s(4667),p=s(9472),h=s(85162);const x={id:"contactlist",title:"Get Contact list",description:"The Contact List API empowers you to retrieve a list of contacts, providing a comprehensive view of all available contacts in your contactbook.",sidebar_label:"Get Contact list",hide_title:!0,hide_table_of_contents:!0,api:"eJzNVm1r4zgQ/is6fboFJ3H6sseZ49iylFK2XBfaY2HbUGR7Ek8jS1pJdhKC//syspM4Tdu7HstyUNp65pm3RzMjrbkXM8eTO/5RKy8y7/gk4jm4zKLxqBVP+G0BrNOyK3SenX2+ZFAavQDr2EpXzGtmwVuEGphgkjB6yrLOY8SM1TXmqGZMsEyXxkIBymENrEZYEFZIyUQtUIpUwtaSoSL/diNItZ4PecS1ASsou8ucJ7xTUlgecSOsKMGDparWXIkSeMIllkhapIK+VWBXPOIWvlVoIefJVEgHEXd+JQk91bbkEYelkToHnnhbkTYroBQ8WfNSLLGsSp6cxnHE/cqQkarKFCxvyE6UhhyN4ybapuDmaH5YBi/HjJsJ+XVGKweOsEdxTH/2D9VVWQbOTSvJtmzyKHAJyhNeGCMxC4rRoyOj9WECOn2ELNBuyY3HNqQFV0nfwwlrBRWMHkr3z/atmE53i3TeoprxKFAjfF+yrZ2bYpwWy6NHQ5S0vL/NwaMGlgIERkuB8j/YpwAfOsEw0yW5MoVWb07lZHw8Pgo/5CKzIDzkZ/45Nzujo/joeDCOB/Fvt+P3ycnvyen7YRzHX3nEl2WopuvGXPhQpUcv+9+VyX9CnOYprJvhHLxA6foGnYY3TU+ISqKCh02bP1CLNwFx8lyz3+gSfEH7ZwHKs4XVahYxI0E4YN6umJgJVEwKD/aXHzcFYK22r/P4tsxeo+Akjh/GWxJOD0m4VLWQmIftfavnoH5upf3wvg1/2AbYgoKe7xXbl7dFOsgqi34V1vxyIAwOWn1yN6EdSMRquh9m0N4LvuAJH+3fFg5svbkqKit5wgvvjUtGI2HMUBu6pmZKitTRLI+EwVFN8/gU7byYoZoNXrWa7JK+IWJb7vZS3y1Mg5+ANmbHTB/VXSIFiJyWf0PfUx2MO76uDagbnKnAdj3mh1c6OoYuqHOdVSUoH06eTbVlT6xZKhzkTCvmCwhKkh8Px8wZyHDaNc2Q3at7RQ3NKgd0sUhUc5fcqwG7u55OMUMh2RdIHXqY/LphbrFYHDD2LthcoC+qlFkwegefBWGgtW+1/XjHI+7Blu56egO2xgy6U3oh1CiAR90o0KKhdm5X/0b04akRtabEDJSDXvOeXXy+YjU7HsY86rXHv0h6dHX58fyvm3PyS+3YHtJ4GA/jcH1o50uheqEuwG+fZF0n7x3wejfY/8PnW9fiHpZ+ZKTAMOqBsHU3pnd7j7pJxAvtPInXa2rGv61sGhK37yga3hwdxd69pOaw6r37aiErihlG9wVs90DbQSf0YZGwYalEm5GjgK3NWZaB6Qc42KJ7q+ji/JZHXFRUY3/U52HUu3/I+0alVj3f+zugTYB+U03PGvxBR/0JVn9u4a3mRYOuvg2aTmbSNM13cAohxA==",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},u=void 0,j={id:"API-docs/contactlist",title:"Get Contact list",description:"The Contact List API empowers you to retrieve a list of contacts, providing a comprehensive view of all available contacts in your contactbook.",source:"@site/docs/API-docs/contactlist.api.mdx",sourceDirName:"API-docs",slug:"/API-docs/contactlist",permalink:"/docs/API-docs/contactlist",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"contactlist",title:"Get Contact list",description:"The Contact List API empowers you to retrieve a list of contacts, providing a comprehensive view of all available contacts in your contactbook.",sidebar_label:"Get Contact list",hide_title:!0,hide_table_of_contents:!0,api:"eJzNVm1r4zgQ/is6fboFJ3H6sseZ49iylFK2XBfaY2HbUGR7Ek8jS1pJdhKC//syspM4Tdu7HstyUNp65pm3RzMjrbkXM8eTO/5RKy8y7/gk4jm4zKLxqBVP+G0BrNOyK3SenX2+ZFAavQDr2EpXzGtmwVuEGphgkjB6yrLOY8SM1TXmqGZMsEyXxkIBymENrEZYEFZIyUQtUIpUwtaSoSL/diNItZ4PecS1ASsou8ucJ7xTUlgecSOsKMGDparWXIkSeMIllkhapIK+VWBXPOIWvlVoIefJVEgHEXd+JQk91bbkEYelkToHnnhbkTYroBQ8WfNSLLGsSp6cxnHE/cqQkarKFCxvyE6UhhyN4ybapuDmaH5YBi/HjJsJ+XVGKweOsEdxTH/2D9VVWQbOTSvJtmzyKHAJyhNeGCMxC4rRoyOj9WECOn2ELNBuyY3HNqQFV0nfwwlrBRWMHkr3z/atmE53i3TeoprxKFAjfF+yrZ2bYpwWy6NHQ5S0vL/NwaMGlgIERkuB8j/YpwAfOsEw0yW5MoVWb07lZHw8Pgo/5CKzIDzkZ/45Nzujo/joeDCOB/Fvt+P3ycnvyen7YRzHX3nEl2WopuvGXPhQpUcv+9+VyX9CnOYprJvhHLxA6foGnYY3TU+ISqKCh02bP1CLNwFx8lyz3+gSfEH7ZwHKs4XVahYxI0E4YN6umJgJVEwKD/aXHzcFYK22r/P4tsxeo+Akjh/GWxJOD0m4VLWQmIftfavnoH5upf3wvg1/2AbYgoKe7xXbl7dFOsgqi34V1vxyIAwOWn1yN6EdSMRquh9m0N4LvuAJH+3fFg5svbkqKit5wgvvjUtGI2HMUBu6pmZKitTRLI+EwVFN8/gU7byYoZoNXrWa7JK+IWJb7vZS3y1Mg5+ANmbHTB/VXSIFiJyWf0PfUx2MO76uDagbnKnAdj3mh1c6OoYuqHOdVSUoH06eTbVlT6xZKhzkTCvmCwhKkh8Px8wZyHDaNc2Q3at7RQ3NKgd0sUhUc5fcqwG7u55OMUMh2RdIHXqY/LphbrFYHDD2LthcoC+qlFkwegefBWGgtW+1/XjHI+7Blu56egO2xgy6U3oh1CiAR90o0KKhdm5X/0b04akRtabEDJSDXvOeXXy+YjU7HsY86rXHv0h6dHX58fyvm3PyS+3YHtJ4GA/jcH1o50uheqEuwG+fZF0n7x3wejfY/8PnW9fiHpZ+ZKTAMOqBsHU3pnd7j7pJxAvtPInXa2rGv61sGhK37yga3hwdxd69pOaw6r37aiErihlG9wVs90DbQSf0YZGwYalEm5GjgK3NWZaB6Qc42KJ7q+ji/JZHXFRUY3/U52HUu3/I+0alVj3f+zugTYB+U03PGvxBR/0JVn9u4a3mRYOuvg2aTmbSNM13cAohxA==",sidebar_class_name:"get api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},sidebar:"apiSidebar",previous:{title:"Delete Contact",permalink:"/docs/API-docs/deletecontact"},next:{title:"Draft Document",permalink:"/docs/API-docs/draftedocument"}},y={},g=[{value:"Request",id:"request",level:2}];function f(e){const a={h2:"h2",p:"p",...(0,l.a)(),...e.components},{Details:s}=a;return s||function(e,a){throw new Error("Expected "+(a?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h1",{className:"openapi__heading",children:(0,t.jsx)(a.p,{children:"Get Contact list"})}),"\n",(0,t.jsx)(r(),{method:"get",path:"/contactlist"}),"\n",(0,t.jsx)(a.p,{children:"The Contact List API empowers you to retrieve a list of contacts, providing a comprehensive view of all available contacts in your contactbook."}),"\n",(0,t.jsx)(a.h2,{id:"request",children:"Request"}),"\n",(0,t.jsxs)(s,{style:{marginBottom:"1rem"},className:"openapi-markdown__details","data-collapsed":!1,open:!0,children:[(0,t.jsx)("summary",{style:{},children:(0,t.jsx)("h3",{className:"openapi-markdown__details-summary-header-params",children:(0,t.jsx)(a.p,{children:"Query Parameters"})})}),(0,t.jsx)("div",{children:(0,t.jsxs)("ul",{children:[(0,t.jsx)(c.Z,{className:"paramsItem",param:{name:"limit",in:"query",required:!1,style:"form",explode:!0,schema:{maximum:500,type:"number"},example:10}}),(0,t.jsx)(c.Z,{className:"paramsItem",param:{name:"skip",in:"query",required:!1,style:"form",explode:!0,schema:{type:"number"},example:0}})]})})]}),"\n",(0,t.jsx)("div",{children:(0,t.jsx)("div",{children:(0,t.jsxs)(i.Z,{children:[(0,t.jsxs)(h.default,{label:"200",value:"200",children:[(0,t.jsx)("div",{children:(0,t.jsx)(a.p,{children:"successful operation"})}),(0,t.jsx)("div",{children:(0,t.jsx)(o.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,t.jsx)(h.default,{label:"application/json",value:"application/json",children:(0,t.jsxs)(p.default,{className:"openapi-tabs__schema",children:[(0,t.jsx)(h.default,{label:"Schema",value:"Schema",children:(0,t.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,t.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,t.jsx)("strong",{children:(0,t.jsx)(a.p,{children:"Schema"})})}),(0,t.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,t.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,t.jsx)(d.Z,{collapsible:!0,className:"schemaItem",children:(0,t.jsxs)(s,{style:{},className:"openapi-markdown__details",children:[(0,t.jsx)("summary",{style:{},children:(0,t.jsxs)("span",{className:"openapi-schema__container",children:[(0,t.jsx)("strong",{className:"openapi-schema__property",children:(0,t.jsx)(a.p,{children:"result"})}),(0,t.jsx)("span",{className:"openapi-schema__name",children:(0,t.jsx)(a.p,{children:"contactdetails[]"})})]})}),(0,t.jsxs)("div",{style:{marginLeft:"1rem"},children:[(0,t.jsx)("li",{children:(0,t.jsx)("div",{style:{fontSize:"var(--ifm-code-font-size)",opacity:"0.6",marginLeft:"-.5rem",paddingBottom:".5rem"},children:(0,t.jsx)(a.p,{children:"Array ["})})}),(0,t.jsx)(d.Z,{collapsible:!1,name:"objectId",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"ph1bhx2jp"}}),(0,t.jsx)(d.Z,{collapsible:!1,name:"name",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joe bee"}}),(0,t.jsx)(d.Z,{collapsible:!1,name:"email",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joebee@example.com"}}),(0,t.jsx)(d.Z,{collapsible:!1,name:"phone",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"4131231231"}}),(0,t.jsx)(d.Z,{collapsible:!1,name:"createdAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}}),(0,t.jsx)(d.Z,{collapsible:!1,name:"updatedAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}}),(0,t.jsx)("li",{children:(0,t.jsx)("div",{style:{fontSize:"var(--ifm-code-font-size)",opacity:"0.6",marginLeft:"-.5rem"},children:(0,t.jsx)(a.p,{children:"]"})})})]})]})})})]})}),(0,t.jsx)(h.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,t.jsx)(m.Z,{responseExample:'{\n  "result": [\n    {\n      "objectId": "ph1bhx2jp",\n      "name": "joe bee",\n      "email": "joebee@example.com",\n      "phone": "4131231231",\n      "createdAt": "2023-10-07T16:49:56.000Z",\n      "updatedAt": "2023-10-07T16:49:56.000Z"\n    }\n  ]\n}',language:"json"})})]})})})})]}),(0,t.jsxs)(h.default,{label:"400",value:"400",children:[(0,t.jsx)("div",{children:(0,t.jsx)(a.p,{children:"Something went wrong, please try again later!"})}),(0,t.jsx)("div",{children:(0,t.jsx)(o.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,t.jsx)(h.default,{label:"application/json",value:"application/json",children:(0,t.jsxs)(p.default,{className:"openapi-tabs__schema",children:[(0,t.jsx)(h.default,{label:"Schema",value:"Schema",children:(0,t.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,t.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,t.jsx)("strong",{children:(0,t.jsx)(a.p,{children:"Schema"})})}),(0,t.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,t.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,t.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Something went wrong, please try again later!"}})})]})}),(0,t.jsx)(h.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,t.jsx)(m.Z,{responseExample:'{\n  "error": "Something went wrong, please try again later!"\n}',language:"json"})})]})})})})]}),(0,t.jsxs)(h.default,{label:"405",value:"405",children:[(0,t.jsx)("div",{children:(0,t.jsx)(a.p,{children:"Invalid API Token!"})}),(0,t.jsx)("div",{children:(0,t.jsx)(o.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,t.jsx)(h.default,{label:"application/json",value:"application/json",children:(0,t.jsxs)(p.default,{className:"openapi-tabs__schema",children:[(0,t.jsx)(h.default,{label:"Schema",value:"Schema",children:(0,t.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,t.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,t.jsx)("strong",{children:(0,t.jsx)(a.p,{children:"Schema"})})}),(0,t.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,t.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,t.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Invalid API token!"}})})]})}),(0,t.jsx)(h.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,t.jsx)(m.Z,{responseExample:'{\n  "error": "Invalid API token!"\n}',language:"json"})})]})})})})]})]})})})]})}function v(e={}){const{wrapper:a}={...(0,l.a)(),...e.components};return a?(0,t.jsx)(a,{...e,children:(0,t.jsx)(f,{...e})}):f(e)}}}]);