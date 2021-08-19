"use strict";(self.webpackChunk_backyard_tools_docs_web=self.webpackChunk_backyard_tools_docs_web||[]).push([[465],{9426:function(e,t,a){var n=a(2735);t.Z=function(e){var t=e.children,a=e.hidden,r=e.className;return n.createElement("div",{role:"tabpanel",hidden:a,className:r},t)}},6178:function(e,t,a){a.d(t,{Z:function(){return d}});var n=a(2735),r=a(2977);var o=function(){var e=(0,n.useContext)(r.Z);if(null==e)throw new Error('"useUserPreferencesContext" is used outside of "Layout" component.');return e},i=a(45),c="tabItem_2e7G",s="tabItemActive_3jjc";var l=37,u=39;var d=function(e){var t=e.lazy,a=e.block,r=e.defaultValue,d=e.values,p=e.groupId,m=e.className,k=o(),h=k.tabGroupChoices,b=k.setTabGroupChoices,f=(0,n.useState)(r),v=f[0],y=f[1],g=n.Children.toArray(e.children),w=[];if(null!=p){var N=h[p];null!=N&&N!==v&&d.some((function(e){return e.value===N}))&&y(N)}var _=function(e){var t=e.currentTarget,a=w.indexOf(t),n=d[a].value;y(n),null!=p&&(b(p,n),setTimeout((function(){var e,a,n,r,o,i,c,l;(e=t.getBoundingClientRect(),a=e.top,n=e.left,r=e.bottom,o=e.right,i=window,c=i.innerHeight,l=i.innerWidth,a>=0&&o<=l&&r<=c&&n>=0)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(s),setTimeout((function(){return t.classList.remove(s)}),2e3))}),150))},I=function(e){var t,a;switch(e.keyCode){case u:var n=w.indexOf(e.target)+1;a=w[n]||w[0];break;case l:var r=w.indexOf(e.target)-1;a=w[r]||w[w.length-1]}null==(t=a)||t.focus()};return n.createElement("div",{className:"tabs-container"},n.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":a},m)},d.map((function(e){var t=e.value,a=e.label;return n.createElement("li",{role:"tab",tabIndex:v===t?0:-1,"aria-selected":v===t,className:(0,i.Z)("tabs__item",c,{"tabs__item--active":v===t}),key:t,ref:function(e){return w.push(e)},onKeyDown:I,onFocus:_,onClick:_},a)}))),t?(0,n.cloneElement)(g.filter((function(e){return e.props.value===v}))[0],{className:"margin-vert--md"}):n.createElement("div",{className:"margin-vert--md"},g.map((function(e,t){return(0,n.cloneElement)(e,{key:t,hidden:e.props.value!==v})}))))}},1508:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return c},contentTitle:function(){return s},metadata:function(){return l},toc:function(){return u},default:function(){return p}});var n=a(11),r=a(6017),o=(a(2735),a(9530)),i=(a(6178),a(9426),a(3255),["components"]),c={id:"intro",slug:"/"},s="Introduction",l={unversionedId:"intro",id:"intro",isDocsHomePage:!1,title:"Introduction",description:"Backyard eases the development and deployment of microservices by providing an opinionated platform for business tool API & UI.",source:"@site/../../../docs/intro.mdx",sourceDirName:".",slug:"/",permalink:"/docs/",editUrl:"https://github.com/elwood-technology/backyard/edit/master/docs/../../../docs/intro.mdx",version:"current",frontMatter:{id:"intro",slug:"/"},sidebar:"tutorialSidebar",next:{title:"Quick Start",permalink:"/docs/start/quick"}},u=[{value:"Status",id:"status",children:[]},{value:"Understand Backyard",id:"understand-backyard",children:[]},{value:"Get Started",id:"get-started",children:[]}],d={toc:u};function p(e){var t=e.components,a=(0,r.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"introduction"},"Introduction"),(0,o.kt)("p",null,"Backyard eases the development and deployment of microservices by providing an opinionated platform for business tool API & UI."),(0,o.kt)("h2",{id:"status"},"Status"),(0,o.kt)("p",null,"\u26a0\ufe0f Not Stable \u26a0\ufe0f"),(0,o.kt)("p",null,"Backyard is still under heavy development. The documentation is mostly not available but constantly being written. You're welcome to try it, but expect some breaking changes. Please ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/elwood-technology/backyard/issues/new/choose"},"report any bugs")," and ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/elwood-technology/backyard/discussions"},"ask many questions"),". ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/elwood-technology/backyard#contributing"},"Contributions")," much appreciated!"),(0,o.kt)("h2",{id:"understand-backyard"},"Understand Backyard"),(0,o.kt)("p",null,"Read more about how Backyard works in the ",(0,o.kt)("a",{parentName:"p",href:"/docs/architecture"},"Architecture")," section"),(0,o.kt)("h2",{id:"get-started"},"Get Started"),(0,o.kt)("p",null,"For a step-by-step guid, checkout ",(0,o.kt)("a",{parentName:"p",href:"/docs/start/quick"},"Quick Start")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript",metastring:"title=TypeScript",title:"TypeScript"},"yarn create backyard ./workspace core-aws-typescript\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript",metastring:"title=JavaScript",title:"JavaScript"},"yarn create backyard ./workspace core-aws\n")))}p.isMDXComponent=!0}}]);