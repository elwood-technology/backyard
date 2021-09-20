"use strict";(self.webpackChunk_backyard_tools_docs_web=self.webpackChunk_backyard_tools_docs_web||[]).push([[596],{9426:function(e,t,a){var n=a(2735);t.Z=function(e){var t=e.children,a=e.hidden,r=e.className;return n.createElement("div",{role:"tabpanel",hidden:a,className:r},t)}},6178:function(e,t,a){a.d(t,{Z:function(){return c}});var n=a(2735),r=a(2977);var o=function(){var e=(0,n.useContext)(r.Z);if(null==e)throw new Error('"useUserPreferencesContext" is used outside of "Layout" component.');return e},s=a(45),i="tabItem_2e7G",l="tabItemActive_3jjc";var c=function(e){var t,a=e.lazy,r=e.block,c=e.defaultValue,u=e.values,d=e.groupId,m=e.className,f=n.Children.toArray(e.children),p=null!=u?u:f.map((function(e){return{value:e.props.value,label:e.props.label}})),v=null!=c?c:null==(t=f.find((function(e){return e.props.default})))?void 0:t.props.value,b=o(),k=b.tabGroupChoices,h=b.setTabGroupChoices,y=(0,n.useState)(v),g=y[0],w=y[1],x=[];if(null!=d){var C=k[d];null!=C&&C!==g&&p.some((function(e){return e.value===C}))&&w(C)}var T=function(e){var t=e.currentTarget,a=x.indexOf(t),n=p[a].value;w(n),null!=d&&(h(d,n),setTimeout((function(){var e,a,n,r,o,s,i,c;(e=t.getBoundingClientRect(),a=e.top,n=e.left,r=e.bottom,o=e.right,s=window,i=s.innerHeight,c=s.innerWidth,a>=0&&o<=c&&r<=i&&n>=0)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(l),setTimeout((function(){return t.classList.remove(l)}),2e3))}),150))},Z=function(e){var t,a=null;switch(e.key){case"ArrowRight":var n=x.indexOf(e.target)+1;a=x[n]||x[0];break;case"ArrowLeft":var r=x.indexOf(e.target)-1;a=x[r]||x[x.length-1]}null==(t=a)||t.focus()};return n.createElement("div",{className:"tabs-container"},n.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.Z)("tabs",{"tabs--block":r},m)},p.map((function(e){var t=e.value,a=e.label;return n.createElement("li",{role:"tab",tabIndex:g===t?0:-1,"aria-selected":g===t,className:(0,s.Z)("tabs__item",i,{"tabs__item--active":g===t}),key:t,ref:function(e){return x.push(e)},onKeyDown:Z,onFocus:T,onClick:T},null!=a?a:t)}))),a?(0,n.cloneElement)(f.filter((function(e){return e.props.value===g}))[0],{className:"margin-vert--md"}):n.createElement("div",{className:"margin-vert--md"},f.map((function(e,t){return(0,n.cloneElement)(e,{key:t,hidden:e.props.value!==g})}))))}},3312:function(e,t,a){var n=a(2735).createContext(void 0);t.Z=n},2977:function(e,t,a){var n=(0,a(2735).createContext)(void 0);t.Z=n},4450:function(e,t,a){var n=a(2735),r=a(3312);t.Z=function(){var e=(0,n.useContext)(r.Z);if(null==e)throw new Error('"useThemeContext" is used outside of "Layout" component. Please see https://docusaurus.io/docs/api/themes/configuration#usethemecontext.');return e}},8837:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return u},contentTitle:function(){return d},metadata:function(){return m},toc:function(){return f},default:function(){return v}});var n=a(11),r=a(6017),o=(a(2735),a(9530)),s=a(6178),i=a(9426),l=a(810),c=["components"],u={},d="Install",m={unversionedId:"start/install",id:"start/install",isDocsHomePage:!1,title:"Install",description:"Using create-backyard",source:"@site/../../../docs/start/install.mdx",sourceDirName:"start",slug:"/start/install",permalink:"/docs/start/install",editUrl:"https://github.com/elwood-technology/backyard/edit/master/docs/../../../docs/start/install.mdx",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Quick Start",permalink:"/docs/start/quick"},next:{title:"Configuration",permalink:"/docs/start/configuration"}},f=[{value:"Using create-backyard",id:"using-create-backyard",children:[]}],p={toc:f};function v(e){var t=e.components,a=(0,r.Z)(e,c);return(0,o.kt)("wrapper",(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"install"},"Install"),(0,o.kt)("h2",{id:"using-create-backyard"},"Using create-backyard"),(0,o.kt)(s.Z,{defaultValue:"ts",values:[{label:"TypeScript",value:"ts"},{label:"JavaScript",value:"js"}],mdxType:"Tabs"},(0,o.kt)(i.Z,{value:"ts",mdxType:"TabItem"},(0,o.kt)(l.Z,{mdxType:"CodeBlock"},"yarn create backyard ./workspace core-aws-typescript")),(0,o.kt)(i.Z,{value:"js",mdxType:"TabItem"},(0,o.kt)(l.Z,{mdxType:"CodeBlock"},"yarn create backyard ./workspace core-aws"))))}v.isMDXComponent=!0}}]);