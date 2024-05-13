"use strict";(self.webpackChunkOpenSign_Docs=self.webpackChunkOpenSign_Docs||[]).push([[7964],{31898:(e,a,s)=>{s.r(a),s.d(a,{assets:()=>j,contentTitle:()=>u,default:()=>b,frontMatter:()=>h,metadata:()=>x,toc:()=>f});var l=s(85893),r=s(11151),i=s(58219),d=(s(62316),s(51039)),n=s.n(d),t=(s(82723),s(9487)),o=(s(41429),s(5397)),c=s(4667),m=s(9472),p=s(85162);const h={id:"createfolder",title:"Create Folder",description:"The Create Folder API allows you to create folder.",sidebar_label:"Create Folder",hide_title:!0,hide_table_of_contents:!0,api:"eJzFVm1v2zYQ/ivcfVoB2ZadpMOEYVhWZF3WojGWDAPmGAEtnWUmFMmSlB3D0H8fjpRj2U6DZRi6L4Z87/fcGzfgeekgm8AvWhZoYZpAgS63wnihFWRws0D2ziL3yKIIOx9fMi6lXjm21jXzmuWRPw/8PiSgDVpOBi4LyCCyIxcSsPi5Rud/1sUass2Bu7HVS1Egm6HUK2a45RV6tEdeIIFcK4/Kkw1ujBR58Di4d2RoAy5fYMXpixwKiwWlGbUVrxASMNyi8jGty4Jy92uDkIGe3WPuScJSKl6gI0Md5WyzlXXeClVCAnNtK+67FHzklZEkpHC1Dbw58vtKW7/ej2YLMRr7GpomAS98IEfzdzOCtSHGLm1vawwEZ7RyMZdRmh6jH220SBfM1XmOzs1rKdffvAbxl2GM5NcnbhbD2eJxdG8Iwxjqp/+5Fr+NFHdnD2KMZKvF7dw/Z2anNEpHJ71h2ku/uxm+zU6/z87e9tM0/QsSeKwk6cYWg4L7YHdb4u3/2hRfwU9zKBZBK9BzIR0ctR51XZPA6XONda0r9AuhSrZC5dnKalUmzEjkDpm3a8ZLLhST3KP9DzsNrdX2ZZBeF1l34ISSQuHddqruTtP0bvgEwtkxCJdqyaUowgK90Q+ovm6mXfc+uj+usYhCgQ97yXbpMUmHeW2FX0M22cBjjxvRi/xsMm2mCRCwmg6A0S5EzP0CMhgc3AOHdonWBSu1lZDBwnvjssGAG9PXBpUTpZJ85vq5rgbciMFyCE1yKO08L4Uqey9qTXdhXxO0Eb294J8w5EZ8wDUkW2y6UgkIKukCeez8BKhiv+9O28UW9/2z0d0+x8tnb7eTi7kO8bRFuDKorkWpQgmXQzi+1cIx4QK70HldofKhndhcW3agzWbcYcG0Yn6BgUn0k/6QOYO5mLed2Ge36lbRlLDa4byWTAr14LJb1WOTq/lc5IJL9ifOnPA4/XZbjNVqdVSEN0HnvfCLesYsGr0TLwMxVKqr9fTnDSTg0Vbuan6NdilybAv/BVeDIDxo54vnYb6w4oIapiX9dKhEkEuRo3LYmYjz9+OPbMlO+ikknY77B0EPPl6+u/h0fUF2qcNjkYb9tJ+Gy6Odr7jquNp7Zx1Wd7NbFf/uUdZ2tcdHPzCSizDfIaFNO5qT/afaNIEFTW42gc2GuuUPK5uGyJ9rtDT20wSW3Ao+o/acTJtkOxA0yw+4ppxi0L0b8k7iso6zdbDraJ6jxnmeo/EvynaXy/jq+gYSmLXPyUoXpGP5ip6afAUZ3MIthEcpWQjzHugbkFyVNS9JPtqlOeY1QdFdAg9hCbQflNmWpdadKPe3Q0yFfimxZxV+oJp9wPWPT+KR80WFFtutNBVw2jTN39a4AsY=",sidebar_class_name:"post api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},u=void 0,x={id:"API-docs/createfolder",title:"Create Folder",description:"The Create Folder API allows you to create folder.",source:"@site/docs/API-docs/createfolder.api.mdx",sourceDirName:"API-docs",slug:"/API-docs/createfolder",permalink:"/docs/API-docs/createfolder",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"createfolder",title:"Create Folder",description:"The Create Folder API allows you to create folder.",sidebar_label:"Create Folder",hide_title:!0,hide_table_of_contents:!0,api:"eJzFVm1v2zYQ/ivcfVoB2ZadpMOEYVhWZF3WojGWDAPmGAEtnWUmFMmSlB3D0H8fjpRj2U6DZRi6L4Z87/fcGzfgeekgm8AvWhZoYZpAgS63wnihFWRws0D2ziL3yKIIOx9fMi6lXjm21jXzmuWRPw/8PiSgDVpOBi4LyCCyIxcSsPi5Rud/1sUass2Bu7HVS1Egm6HUK2a45RV6tEdeIIFcK4/Kkw1ujBR58Di4d2RoAy5fYMXpixwKiwWlGbUVrxASMNyi8jGty4Jy92uDkIGe3WPuScJSKl6gI0Md5WyzlXXeClVCAnNtK+67FHzklZEkpHC1Dbw58vtKW7/ej2YLMRr7GpomAS98IEfzdzOCtSHGLm1vawwEZ7RyMZdRmh6jH220SBfM1XmOzs1rKdffvAbxl2GM5NcnbhbD2eJxdG8Iwxjqp/+5Fr+NFHdnD2KMZKvF7dw/Z2anNEpHJ71h2ku/uxm+zU6/z87e9tM0/QsSeKwk6cYWg4L7YHdb4u3/2hRfwU9zKBZBK9BzIR0ctR51XZPA6XONda0r9AuhSrZC5dnKalUmzEjkDpm3a8ZLLhST3KP9DzsNrdX2ZZBeF1l34ISSQuHddqruTtP0bvgEwtkxCJdqyaUowgK90Q+ovm6mXfc+uj+usYhCgQ97yXbpMUmHeW2FX0M22cBjjxvRi/xsMm2mCRCwmg6A0S5EzP0CMhgc3AOHdonWBSu1lZDBwnvjssGAG9PXBpUTpZJ85vq5rgbciMFyCE1yKO08L4Uqey9qTXdhXxO0Eb294J8w5EZ8wDUkW2y6UgkIKukCeez8BKhiv+9O28UW9/2z0d0+x8tnb7eTi7kO8bRFuDKorkWpQgmXQzi+1cIx4QK70HldofKhndhcW3agzWbcYcG0Yn6BgUn0k/6QOYO5mLed2Ge36lbRlLDa4byWTAr14LJb1WOTq/lc5IJL9ifOnPA4/XZbjNVqdVSEN0HnvfCLesYsGr0TLwMxVKqr9fTnDSTg0Vbuan6NdilybAv/BVeDIDxo54vnYb6w4oIapiX9dKhEkEuRo3LYmYjz9+OPbMlO+ikknY77B0EPPl6+u/h0fUF2qcNjkYb9tJ+Gy6Odr7jquNp7Zx1Wd7NbFf/uUdZ2tcdHPzCSizDfIaFNO5qT/afaNIEFTW42gc2GuuUPK5uGyJ9rtDT20wSW3Ao+o/acTJtkOxA0yw+4ppxi0L0b8k7iso6zdbDraJ6jxnmeo/EvynaXy/jq+gYSmLXPyUoXpGP5ip6afAUZ3MIthEcpWQjzHugbkFyVNS9JPtqlOeY1QdFdAg9hCbQflNmWpdadKPe3Q0yFfimxZxV+oJp9wPWPT+KR80WFFtutNBVw2jTN39a4AsY=",sidebar_class_name:"post api-method",info_path:"docs/API-docs/opensign-api-v-1",custom_edit_url:null},sidebar:"apiSidebar",previous:{title:"Delete Webhook",permalink:"/docs/API-docs/delete-webhook"},next:{title:"Get Folder",permalink:"/docs/API-docs/getfolder"}},j={},f=[{value:"Request",id:"request",level:2}];function g(e){const a={h2:"h2",p:"p",...(0,r.a)(),...e.components},{Details:s}=a;return s||function(e,a){throw new Error("Expected "+(a?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("h1",{className:"openapi__heading",children:(0,l.jsx)(a.p,{children:"Create Folder"})}),"\n",(0,l.jsx)(n(),{method:"post",path:"/createfolder"}),"\n",(0,l.jsx)(a.p,{children:"The Create Folder API allows you to create folder."}),"\n",(0,l.jsx)(a.h2,{id:"request",children:"Request"}),"\n",(0,l.jsx)(t.Z,{className:"openapi-tabs__mime",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json-schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details mime","data-collapsed":!1,open:!0,children:[(0,l.jsxs)("summary",{style:{},className:"openapi-markdown__details-summary-mime",children:[(0,l.jsx)("h3",{className:"openapi-markdown__details-summary-header-body",children:(0,l.jsx)(a.p,{children:"Body"})}),(0,l.jsx)("strong",{className:"openapi-schema__required",children:(0,l.jsx)(a.p,{children:"required"})})]}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"},children:(0,l.jsx)("div",{style:{marginTop:"1rem",marginBottom:"1rem"},children:(0,l.jsx)(a.p,{children:"Provide below parameter to create folder"})})}),(0,l.jsxs)("ul",{style:{marginLeft:"1rem"},children:[(0,l.jsx)(c.Z,{collapsible:!1,name:"foldername",required:!0,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"new folder"}}),(0,l.jsx)(c.Z,{collapsible:!1,name:"parentFolderId",required:!0,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"Hj2bhi2Ptu"}})]})]})})}),"\n",(0,l.jsx)("div",{children:(0,l.jsx)("div",{children:(0,l.jsxs)(i.Z,{children:[(0,l.jsxs)(p.default,{label:"200",value:"200",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"folder created successfully!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(t.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(m.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsxs)("ul",{style:{marginLeft:"1rem"},children:[(0,l.jsx)(c.Z,{collapsible:!1,name:"objectId",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"ph1bhx2jp"}}),(0,l.jsx)(c.Z,{collapsible:!1,name:"folderName",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"new folder"}}),(0,l.jsx)(c.Z,{collapsible:!1,name:"parentFolderId",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",format:"string",example:"J2nas5kiPe"}}),(0,l.jsx)(c.Z,{collapsible:!1,name:"createdAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}}),(0,l.jsx)(c.Z,{collapsible:!1,name:"updatedAt",required:!1,schemaName:"date",qualifierMessage:void 0,schema:{type:"string",example:"2023-10-07T16:49:56.000Z",xml:{name:"date"},title:"date"}})]})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(o.Z,{responseExample:'{\n  "objectId": "ph1bhx2jp",\n  "folderName": "new folder",\n  "parentFolderId": "J2nas5kiPe",\n  "createdAt": "2023-10-07T16:49:56.000Z",\n  "updatedAt": "2023-10-07T16:49:56.000Z"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(p.default,{label:"400",value:"400",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Something went wrong, please try again later!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(t.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(m.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Something went wrong, please try again later!"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(o.Z,{responseExample:'{\n  "error": "Something went wrong, please try again later!"\n}',language:"json"})})]})})})})]}),(0,l.jsxs)(p.default,{label:"405",value:"405",children:[(0,l.jsx)("div",{children:(0,l.jsx)(a.p,{children:"Invalid API Token!"})}),(0,l.jsx)("div",{children:(0,l.jsx)(t.Z,{className:"openapi-tabs__mime",schemaType:"response",children:(0,l.jsx)(p.default,{label:"application/json",value:"application/json",children:(0,l.jsxs)(m.default,{className:"openapi-tabs__schema",children:[(0,l.jsx)(p.default,{label:"Schema",value:"Schema",children:(0,l.jsxs)(s,{style:{},className:"openapi-markdown__details response","data-collapsed":!1,open:!0,children:[(0,l.jsx)("summary",{style:{},className:"openapi-markdown__details-summary-response",children:(0,l.jsx)("strong",{children:(0,l.jsx)(a.p,{children:"Schema"})})}),(0,l.jsx)("div",{style:{textAlign:"left",marginLeft:"1rem"}}),(0,l.jsx)("ul",{style:{marginLeft:"1rem"},children:(0,l.jsx)(c.Z,{collapsible:!1,name:"error",required:!1,schemaName:"string",qualifierMessage:void 0,schema:{type:"string",example:"Invalid API token!"}})})]})}),(0,l.jsx)(p.default,{label:"Example (from schema)",value:"Example (from schema)",children:(0,l.jsx)(o.Z,{responseExample:'{\n  "error": "Invalid API token!"\n}',language:"json"})})]})})})})]})]})})})]})}function b(e={}){const{wrapper:a}={...(0,r.a)(),...e.components};return a?(0,l.jsx)(a,{...e,children:(0,l.jsx)(g,{...e})}):g(e)}}}]);