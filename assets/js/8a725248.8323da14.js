"use strict";(self.webpackChunkOpenSign_Docs=self.webpackChunkOpenSign_Docs||[]).push([[7971],{80288:(e,a,s)=>{s.r(a),s.d(a,{assets:()=>j,contentTitle:()=>u,default:()=>y,frontMatter:()=>h,metadata:()=>x,toc:()=>f});var l=s(85893),t=s(11151),i=s(58219),n=(s(62316),s(51039)),r=s.n(n),c=(s(82723),s(9487)),o=(s(41429),s(5397)),d=s(4667),m=s(9472),p=s(85162);const h={id:"createcontact",title:"Create Contact",description:"The Create Contact API allows you to effortlessly create new contacts that can act as signers for your important documents.",sidebar_label:"Create Contact",hide_title:!0,hide_table_of_contents:!0,api:"eJzVV21rIzcQ/ivqfOrB2t61c1e6lHJpOI5wRxMuKYU6Jsi7Y68SraSTtHaM2f9eRrtrr50XGigphRDs0bw/M4/kLXi+dJBO4UwrzzPvYBZBji6zwnihFaRwXSA7s8g9slaJnV6eMy6lXju20RXzmuFioa2X6JzcsKzRVrhmWeuW+YJ7lnHFyJ475sRSoXVsoS35sEyURlvPlWe5zqoSlXdDiEAbtJwyOc8hhcZz6xQisPi9Qud/0/kG0u1R4pdWr0SObI5Sr5nhlpfo0VK6bYZ7R/QJlScn3BgpshBzdOfI0xZcVmDJ6RNFFBZz6hmWXEiIQPESIQJTaIXUP78xCCno+R0G58ZSFV6gIw9BO912Ws5boZYQwULbkvu+BB94aSQp3WkqA6GO2qCvt58jfmwFw0yX5KpJ+JWukvFknEySyTiBuo7ACx/EB8jczgmQms73/fK2wiBwRivX9GIcx49x66ascZkzV2UZOreopNz88BqsXsahEdNYva4BpkjmxcP4zlAL/+dgniSTZBz+yEXb8FP/lJu90TgeTwZJPIh/uk4+pCc/p+8/DOM4/gsieCjlfsQh5z5U2c1I970y+RvEqY/V2uHM0XMhXd+g44E6jOzJU0N5pUv0hVBLtkbl2dpqtYyYkcgdMm83jC+5UExyj/ZfHFK0VtuX2/S6zPo7K5QUCm+7jbw9iePbZNeE5PnN5NIizzcMH4Tz7m3LfS6HlwtLeoW9f1zYuVpxKfJwsV3re1RvW1M/vG/CPx5f0SiFczgoti9vinSYVVb4DaTTLTwMuBGD5jydzupZBDQxmi5Uo13ImPsCUhgd368O7QqtC24qKyGFwnvj0tGIGzPUBhXd45LPHdHQiBsxWhGVHGs7z5dCLQcvWs32eV9Rb5v2HWS/ayI34gtuurs3PdCKQBCmBfIcbWgkQfZt/1T41DV+19uOkneM/BTJ7jj24A6kaAsdUmsBuTCorsRSBThXCTx+UAnHhAvH3VsnjFZ4DB1Zszl3mDOtmC8wHJJ8MkyYM5iJRTuVQ3ajbhRRAascLirJpFD3Lr1RAza9WCxEJrhkf+LcCY+zHztc1uv1IzzeBZvPwhfVnFk0eq++DMIAWt9q9+UdRODRlu5icYV2JTJsZ+CZUKOgPGp3jUaO9qVFoBV9PDailkuRoXJ9BE8/X35lKzYZxhD1hu8fJD36en726ferT+SXhr0BKRnGwzjcq9r5kqteqMPH8DG82z1v/MdP53ZVPD74kZFcBNYIrdm2Cz89elDPIiiIENIpbLc0eH9YWdck/l6hJTaZRbDiVvA5Tfp0VkfdmhFD3OOmJWhUfnBN4UldVs3GHlEosURjcZplaPyLun3Oury4uoYI5u2jv9Q52Vi+ph8EfA0p3MANhN8O5CGwSJBvQXK1rPgyrHzwS+zAK+pFn1ruA7W0H6iy7khtelkeck5TCv2nwp40+IXA/4KbX3fqzcmzBm1vO21CcFbX9d98NqzB",sidebar_class_name:"post api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},u=void 0,x={id:"API-docs/createcontact",title:"Create Contact",description:"The Create Contact API allows you to effortlessly create new contacts that can act as signers for your important documents.",source:"@site/docs/API-docs/createcontact.api.mdx",sourceDirName:"API-docs",slug:"/API-docs/createcontact",permalink:"/docs/API-docs/createcontact",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"createcontact",title:"Create Contact",description:"The Create Contact API allows you to effortlessly create new contacts that can act as signers for your important documents.",sidebar_label:"Create Contact",hide_title:!0,hide_table_of_contents:!0,api:"eJzVV21rIzcQ/ivqfOrB2t61c1e6lHJpOI5wRxMuKYU6Jsi7Y68SraSTtHaM2f9eRrtrr50XGigphRDs0bw/M4/kLXi+dJBO4UwrzzPvYBZBji6zwnihFaRwXSA7s8g9slaJnV6eMy6lXju20RXzmuFioa2X6JzcsKzRVrhmWeuW+YJ7lnHFyJ475sRSoXVsoS35sEyURlvPlWe5zqoSlXdDiEAbtJwyOc8hhcZz6xQisPi9Qud/0/kG0u1R4pdWr0SObI5Sr5nhlpfo0VK6bYZ7R/QJlScn3BgpshBzdOfI0xZcVmDJ6RNFFBZz6hmWXEiIQPESIQJTaIXUP78xCCno+R0G58ZSFV6gIw9BO912Ws5boZYQwULbkvu+BB94aSQp3WkqA6GO2qCvt58jfmwFw0yX5KpJ+JWukvFknEySyTiBuo7ACx/EB8jczgmQms73/fK2wiBwRivX9GIcx49x66ascZkzV2UZOreopNz88BqsXsahEdNYva4BpkjmxcP4zlAL/+dgniSTZBz+yEXb8FP/lJu90TgeTwZJPIh/uk4+pCc/p+8/DOM4/gsieCjlfsQh5z5U2c1I970y+RvEqY/V2uHM0XMhXd+g44E6jOzJU0N5pUv0hVBLtkbl2dpqtYyYkcgdMm83jC+5UExyj/ZfHFK0VtuX2/S6zPo7K5QUCm+7jbw9iePbZNeE5PnN5NIizzcMH4Tz7m3LfS6HlwtLeoW9f1zYuVpxKfJwsV3re1RvW1M/vG/CPx5f0SiFczgoti9vinSYVVb4DaTTLTwMuBGD5jydzupZBDQxmi5Uo13ImPsCUhgd368O7QqtC24qKyGFwnvj0tGIGzPUBhXd45LPHdHQiBsxWhGVHGs7z5dCLQcvWs32eV9Rb5v2HWS/ayI34gtuurs3PdCKQBCmBfIcbWgkQfZt/1T41DV+19uOkneM/BTJ7jj24A6kaAsdUmsBuTCorsRSBThXCTx+UAnHhAvH3VsnjFZ4DB1Zszl3mDOtmC8wHJJ8MkyYM5iJRTuVQ3ajbhRRAascLirJpFD3Lr1RAza9WCxEJrhkf+LcCY+zHztc1uv1IzzeBZvPwhfVnFk0eq++DMIAWt9q9+UdRODRlu5icYV2JTJsZ+CZUKOgPGp3jUaO9qVFoBV9PDailkuRoXJ9BE8/X35lKzYZxhD1hu8fJD36en726ferT+SXhr0BKRnGwzjcq9r5kqteqMPH8DG82z1v/MdP53ZVPD74kZFcBNYIrdm2Cz89elDPIiiIENIpbLc0eH9YWdck/l6hJTaZRbDiVvA5Tfp0VkfdmhFD3OOmJWhUfnBN4UldVs3GHlEosURjcZplaPyLun3Oury4uoYI5u2jv9Q52Vi+ph8EfA0p3MANhN8O5CGwSJBvQXK1rPgyrHzwS+zAK+pFn1ruA7W0H6iy7khtelkeck5TCv2nwp40+IXA/4KbX3fqzcmzBm1vO21CcFbX9d98NqzB",sidebar_class_name:"post api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},sidebar:"apiSidebar",previous:{title:"Get your account details",permalink:"/docs/API-docs/get-user"},next:{title:"Get Contact",permalink:"/docs/API-docs/getcontact"}},j={},f=[{value:"Request",id:"request",level:2}];function g(e){const a={h2:"h2",p:"p",...(0,t.a)(),...e.components},{Details:s}=a;return s||function(e,a){throw new Error("Expected "+(a?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("h1",{className:"openapi__heading",children:(0,l.jsx)(a.p,{children:"Create Contact"})}),"\n",(0,l.jsx)(r(),{method:"post",path:"/createcontact"}),"\n",(0,l.jsx)(a.p,{children:"The Create Contact API allows you to effortlessly create new contacts that can act as signers for your important documents."}),"\n",(0,l.jsx)(a.h2,{id:"request",children:"Request"}),"\n",(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json-schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details mime","data-collapsed":!1,open:!0,children:[(0,l.jsxs)("summary",{style:{},className:"openapi-markdown__details-summary-mime",children:[(0,l.jsx)("h3",{className:"openapi-markdown__details-summary-header-body",children:(0,l.jsx)(a.p,{children:"Body"})}),(0,l.jsx)("strong",{className:"openapi-schema__required",children:(0,l.jsx)(a.p,{children:"required"})})]}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"},children:(0,l.jsx)("div",{style:{marginTop:"1rem",marginBottom:"1rem"},children:(0,l.jsx)(a.p,{children:"Provide below parameter to create contact"})})}),(0,l.jsxs)("ul",{style:{marginLeft:"1rem"},children:[(0,l.jsx)(d.Z,{collapsible:!1,name:"name",required:!0,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joe bee"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"email",required:!0,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joebee@example.com"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"phone",required:!0,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"1232131321"}})]})]})})}),"\n",(0,l.jsx)("div",{children:(0,l.jsx)("div",{children:(0,l.jsxs)(i.Z,{children:[(0,l.jsxs)(p.default,{label:"200",value:"200",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Contact created successfully!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(m.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsxs)("ul",{style:{marginLeft:"1rem"},children:[(0,l.jsx)(d.Z,{collapsible:!1,name:"objectId",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"ph1bhx2jp"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"name",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joe bee"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"email",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"joebee@example.com"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"phone",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"4131231231"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"createdAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}}),(0,l.jsx)(d.Z,{collapsible:!1,name:"updatedAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}})]})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(o.Z,{responseExample:'{\n  "objectId": "ph1bhx2jp",\n  "name": "joe bee",\n  "email": "joebee@example.com",\n  "phone": "4131231231",\n  "createdAt": "2023-10-07T16:49:56.000Z",\n  "updatedAt": "2023-10-07T16:49:56.000Z"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(p.default,{label:"400",value:"400",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Something went wrong, please try again later!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(m.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Something went wrong, please try again later!"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(o.Z,{responseExample:'{\n  "error": "Something went wrong, please try again later!"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(p.default,{label:"401",value:"401",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Contact already exists!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(m.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Contact already exists!"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(o.Z,{responseExample:'{\n  "error": "Contact already exists!"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(p.default,{label:"405",value:"405",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Invalid API Token!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(c.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(m.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(d.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Invalid API token!"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(o.Z,{responseExample:'{\n  "error": "Invalid API token!"\n}',language:"json"})})]})})})})]})]})})})]})}function y(e={}){const{wrapper:a}={...(0,t.a)(),...e.components};return a?(0,l.jsx)(a,{...e,children:(0,l.jsx)(g,{...e})}):g(e)}}}]);