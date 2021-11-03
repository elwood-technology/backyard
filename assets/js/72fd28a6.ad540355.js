"use strict";(self.webpackChunk_backyard_tools_docs_web=self.webpackChunk_backyard_tools_docs_web||[]).push([[385],{9530:function(e,a,t){t.d(a,{Zo:function(){return s},kt:function(){return m}});var r=t(2735);function n(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function l(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a&&(r=r.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?l(Object(t),!0).forEach((function(a){n(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function o(e,a){if(null==e)return{};var t,r,n=function(e,a){if(null==e)return{};var t,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)t=l[r],a.indexOf(t)>=0||(n[t]=e[t]);return n}(e,a);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)t=l[r],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var c=r.createContext({}),p=function(e){var a=r.useContext(c),t=a;return e&&(t="function"==typeof e?e(a):i(i({},a),e)),t},s=function(e){var a=p(e.components);return r.createElement(c.Provider,{value:a},e.children)},d={inlineCode:"code",wrapper:function(e){var a=e.children;return r.createElement(r.Fragment,{},a)}},k=r.forwardRef((function(e,a){var t=e.components,n=e.mdxType,l=e.originalType,c=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),k=p(t),m=n,u=k["".concat(c,".").concat(m)]||k[m]||d[m]||l;return t?r.createElement(u,i(i({ref:a},s),{},{components:t})):r.createElement(u,i({ref:a},s))}));function m(e,a){var t=arguments,n=a&&a.mdxType;if("string"==typeof e||n){var l=t.length,i=new Array(l);i[0]=k;var o={};for(var c in a)hasOwnProperty.call(a,c)&&(o[c]=a[c]);o.originalType=e,o.mdxType="string"==typeof e?e:n,i[1]=o;for(var p=2;p<l;p++)i[p]=t[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}k.displayName="MDXCreateElement"},9595:function(e,a,t){t.r(a),t.d(a,{frontMatter:function(){return o},contentTitle:function(){return c},metadata:function(){return p},toc:function(){return s},default:function(){return k}});var r=t(11),n=t(6017),l=(t(2735),t(9530)),i=["components"],o={id:"arch",slug:"/architecture"},c="Architecture",p={unversionedId:"arch",id:"arch",isDocsHomePage:!1,title:"Architecture",description:"- Architecture",source:"@site/../../../docs/architecture.mdx",sourceDirName:".",slug:"/architecture",permalink:"/docs/architecture",editUrl:"https://github.com/elwood-technology/backyard/edit/master/docs/../../../docs/architecture.mdx",tags:[],version:"current",frontMatter:{id:"arch",slug:"/architecture"},sidebar:"tutorialSidebar",previous:{title:"Introduction",permalink:"/docs/"},next:{title:"Quick Start",permalink:"/docs/start/quick"}},s=[{value:"Glossary",id:"glossary",children:[],level:2},{value:"Folder Structure",id:"folder-structure",children:[{value:"Files",id:"files",children:[{value:"Package Example",id:"package-example",children:[],level:4},{value:"Typescript Configuration Example",id:"typescript-configuration-example",children:[],level:4},{value:"ReadMe Example",id:"readme-example",children:[],level:4}],level:3}],level:2},{value:"Packages",id:"packages",children:[{value:"<code>cli</code> (@backyard/cli)",id:"cli-backyardcli",children:[],level:3},{value:"<code>common</code> (@backyard/common)",id:"common-backyardcommon",children:[],level:3},{value:"<code>context</code> (@backyard/context)",id:"context-backyardcontext",children:[],level:3},{value:"Platforms (<code>platforms/</code>)",id:"platforms-platforms",children:[{value:"<code>docker</code> (@backyard/platform-docker)",id:"docker-backyardplatform-docker",children:[],level:4},{value:"<code>node</code> (@backyard/platform-node)",id:"node-backyardplatform-node",children:[],level:4},{value:"<code>aws</code> (@backyard/platform-aws)",id:"aws-backyardplatform-aws",children:[],level:4}],level:3},{value:"Plugins (<code>plugins/</code>)",id:"plugins-plugins",children:[{value:"<code>terraform</code> (@backyard/plugin-terraform)",id:"terraform-backyardplugin-terraform",children:[],level:4}],level:3},{value:"Services (<code>service/</code>)",id:"services-service",children:[{value:"<code>gotrue</code> (@backyard/service-gotrue)",id:"gotrue-backyardservice-gotrue",children:[],level:4},{value:"<code>kong</code> (@backyard/service-kong)",id:"kong-backyardservice-kong",children:[],level:4},{value:"<code>postgresql</code> (@backyrad/service-postgresql)",id:"postgresql-backyradservice-postgresql",children:[],level:4},{value:"<code>postgresql-migrate</code> (@backyrad/service-postgresql-migrate)",id:"postgresql-migrate-backyradservice-postgresql-migrate",children:[],level:4},{value:"<code>postgrest</code> (@backyrad/service-postgrest)",id:"postgrest-backyradservice-postgrest",children:[],level:4}],level:3},{value:"Tools (<code>tools/</code>)",id:"tools-tools",children:[{value:"<code>create</code> (create-backyard)",id:"create-create-backyard",children:[],level:4},{value:"<code>docs-web</code> (@backyard/tool-docs-web)",id:"docs-web-backyardtool-docs-web",children:[],level:4},{value:"<code>test</code> (@backyard/tool-test)",id:"test-backyardtool-test",children:[],level:4},{value:"<code>typescript</code> (@backyard/tool-typescript)",id:"typescript-backyardtool-typescript",children:[],level:4}],level:3},{value:"<code>types</code> (@backyard/types)",id:"types-backyardtypes",children:[],level:3}],level:2}],d={toc:s};function k(e){var a=e.components,t=(0,n.Z)(e,i);return(0,l.kt)("wrapper",(0,r.Z)({},d,t,{components:a,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"architecture"},"Architecture"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#architecture"},"Architecture"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#glossary"},"Glossary")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#folder-structure"},"Folder Structure"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#files"},"Files"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#package-example"},"Package Example")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#typescript-configuration-example"},"Typescript Configuration Example")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#readme-example"},"ReadMe Example")))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#packages"},"Packages"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#cli-backyardcli"},(0,l.kt)("inlineCode",{parentName:"a"},"cli")," (@backyard/cli)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#common-backyardcommon"},(0,l.kt)("inlineCode",{parentName:"a"},"common")," (@backyard/common)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#context-backyardcontext"},(0,l.kt)("inlineCode",{parentName:"a"},"context")," (@backyard/context)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#platforms-platforms"},"Platforms (",(0,l.kt)("inlineCode",{parentName:"a"},"platforms/"),")"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#docker-backyardplatform-docker"},(0,l.kt)("inlineCode",{parentName:"a"},"docker")," (@backyard/platform-docker)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#node-backyardplatform-node"},(0,l.kt)("inlineCode",{parentName:"a"},"node")," (@backyard/platform-node)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#aws-backyardplatform-aws"},(0,l.kt)("inlineCode",{parentName:"a"},"aws")," (@backyard/platform-aws)")))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#plugins-plugins"},"Plugins (",(0,l.kt)("inlineCode",{parentName:"a"},"plugins/"),")"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#terraform-backyardplugin-terraform"},(0,l.kt)("inlineCode",{parentName:"a"},"terraform")," (@backyard/plugin-terraform)")))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#services-service"},"Services (",(0,l.kt)("inlineCode",{parentName:"a"},"service/"),")"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#gotrue-backyardservice-gotrue"},(0,l.kt)("inlineCode",{parentName:"a"},"gotrue")," (@backyard/service-gotrue)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#kong-backyardservice-kong"},(0,l.kt)("inlineCode",{parentName:"a"},"kong")," (@backyard/service-kong)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#postgresql-backyradservice-postgresql"},(0,l.kt)("inlineCode",{parentName:"a"},"postgresql")," (@backyrad/service-postgresql)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#postgresql-migrate-backyradservice-postgresql-migrate"},(0,l.kt)("inlineCode",{parentName:"a"},"postgresql-migrate")," (@backyrad/service-postgresql-migrate)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#postgrest-backyradservice-postgrest"},(0,l.kt)("inlineCode",{parentName:"a"},"postgrest")," (@backyrad/service-postgrest)")))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#tools-tools"},"Tools (",(0,l.kt)("inlineCode",{parentName:"a"},"tools/"),")"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#create-create-backyard"},(0,l.kt)("inlineCode",{parentName:"a"},"create")," (create-backyard)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#docs-web-backyardtool-docs-web"},(0,l.kt)("inlineCode",{parentName:"a"},"docs-web")," (@backyard/tool-docs-web)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#test-backyardtool-test"},(0,l.kt)("inlineCode",{parentName:"a"},"test")," (@backyard/tool-test)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#typescript-backyardtool-typescript"},(0,l.kt)("inlineCode",{parentName:"a"},"typescript")," (@backyard/tool-typescript)")))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"#types-backyardtypes"},(0,l.kt)("inlineCode",{parentName:"a"},"types")," (@backyard/types)"))))))),(0,l.kt)("h2",{id:"glossary"},"Glossary"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"Workspace")," A collection of services & platforms."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"Service")," A container that performs a function"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"Platform")," A service that configures a workspace to run in a given environment",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"Local Platform")," A platform that runs on the local environment"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"Remote Platform")," A platform that runs in a remote environment"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"Plugin")," A module that provides extended functionality to a service or platform")),(0,l.kt)("hr",null),(0,l.kt)("h2",{id:"folder-structure"},"Folder Structure"),(0,l.kt)("p",null,"All folders should follow the following structure"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre"}," ./package\n  ./config          files used to configure dev tools\n  ./bin             executable scripts included in the packaged\n  ./scripts         executable script used in development or build.\n  ./src             source files\n  package.json\n  tsconfig.json\n  readme.md\n")),(0,l.kt)("h3",{id:"files"},"Files"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"package.json")," - required (example below). make sure to follow the standard package naming convention"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"tsconfig.json")," - (example below). should always extend the base typescript config at ",(0,l.kt)("inlineCode",{parentName:"li"},"<root>/config/tsconfig.base.json")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"readme.md")," - required (example below)")),(0,l.kt)("h4",{id:"package-example"},"Package Example"),(0,l.kt)("h4",{id:"typescript-configuration-example"},"Typescript Configuration Example"),(0,l.kt)("h4",{id:"readme-example"},"ReadMe Example"),(0,l.kt)("hr",null),(0,l.kt)("h2",{id:"packages"},"Packages"),(0,l.kt)("h3",{id:"cli-backyardcli"},(0,l.kt)("inlineCode",{parentName:"h3"},"cli")," (@backyard/cli)"),(0,l.kt)("p",null,"Command line interface. Installs to ",(0,l.kt)("inlineCode",{parentName:"p"},"backyard")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"by")),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/cli"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/cli",alt:"npm (scoped)"}))),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"common-backyardcommon"},(0,l.kt)("inlineCode",{parentName:"h3"},"common")," (@backyard/common)"),(0,l.kt)("p",null,"Shared utility code. Also exports standard packages like ",(0,l.kt)("inlineCode",{parentName:"p"},"ts-invariant"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"uuid")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"debug")," that are used by multiple child packages"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/common"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/common",alt:"npm (scoped)"}))),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"context-backyardcontext"},(0,l.kt)("inlineCode",{parentName:"h3"},"context")," (@backyard/context)"),(0,l.kt)("p",null,"Context represents a Backyard workspace. It handles reading configuration, building & managing the ",(0,l.kt)("inlineCode",{parentName:"p"},".backyard/")," folder, and initializing services & maintaining state of services."),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/context"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/context",alt:"npm (scoped)"}))),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"platforms-platforms"},"Platforms (",(0,l.kt)("inlineCode",{parentName:"h3"},"platforms/"),")"),(0,l.kt)("p",null,"Platforms define infrastructure and runtime environments for ",(0,l.kt)("inlineCode",{parentName:"p"},"local")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"remote")," development. Platforms do not provide services or plugins."),(0,l.kt)("h4",{id:"docker-backyardplatform-docker"},(0,l.kt)("inlineCode",{parentName:"h4"},"docker")," (@backyard/platform-docker)"),(0,l.kt)("p",null,"Used as the default platform for ",(0,l.kt)("inlineCode",{parentName:"p"},"local")," development"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/platform-docker"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/platform-docker",alt:"npm (scoped)"}))),(0,l.kt)("h4",{id:"node-backyardplatform-node"},(0,l.kt)("inlineCode",{parentName:"h4"},"node")," (@backyard/platform-node)"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/platform-node"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/platform-node",alt:"npm (scoped)"}))),(0,l.kt)("h4",{id:"aws-backyardplatform-aws"},(0,l.kt)("inlineCode",{parentName:"h4"},"aws")," (@backyard/platform-aws)"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/platform-aws"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/platform-aws",alt:"npm (scoped)"}))),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"plugins-plugins"},"Plugins (",(0,l.kt)("inlineCode",{parentName:"h3"},"plugins/"),")"),(0,l.kt)("h4",{id:"terraform-backyardplugin-terraform"},(0,l.kt)("inlineCode",{parentName:"h4"},"terraform")," (@backyard/plugin-terraform)"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/plugin-terraform"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/plugin-terraform",alt:"npm (scoped)"}))),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"services-service"},"Services (",(0,l.kt)("inlineCode",{parentName:"h3"},"service/"),")"),(0,l.kt)("p",null,"Core maintained services"),(0,l.kt)("h4",{id:"gotrue-backyardservice-gotrue"},(0,l.kt)("inlineCode",{parentName:"h4"},"gotrue")," (@backyard/service-gotrue)"),(0,l.kt)("p",null,"Default ",(0,l.kt)("inlineCode",{parentName:"p"},"auth")," services"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/service-gotrue"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/service-gotrue",alt:"npm (scoped)"}))),(0,l.kt)("h4",{id:"kong-backyardservice-kong"},(0,l.kt)("inlineCode",{parentName:"h4"},"kong")," (@backyard/service-kong)"),(0,l.kt)("p",null,"Default ",(0,l.kt)("inlineCode",{parentName:"p"},"gateway")," service"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/service-kong"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/service-kong",alt:"npm (scoped)"}))),(0,l.kt)("h4",{id:"postgresql-backyradservice-postgresql"},(0,l.kt)("inlineCode",{parentName:"h4"},"postgresql")," (@backyrad/service-postgresql)"),(0,l.kt)("p",null,"Default ",(0,l.kt)("inlineCode",{parentName:"p"},"db")," service"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/service-postgresql"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/service-postgresql",alt:"npm (scoped)"}))),(0,l.kt)("h4",{id:"postgresql-migrate-backyradservice-postgresql-migrate"},(0,l.kt)("inlineCode",{parentName:"h4"},"postgresql-migrate")," (@backyrad/service-postgresql-migrate)"),(0,l.kt)("p",null,"Used to initialize ",(0,l.kt)("inlineCode",{parentName:"p"},"local")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"remote")," databases"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/service-postgresql-migrate"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/service-postgresql-migrate",alt:"npm (scoped)"}))),(0,l.kt)("h4",{id:"postgrest-backyradservice-postgrest"},(0,l.kt)("inlineCode",{parentName:"h4"},"postgrest")," (@backyrad/service-postgrest)"),(0,l.kt)("p",null,"Default ",(0,l.kt)("inlineCode",{parentName:"p"},"store")," service"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/service-postgrest"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/service-postgrest",alt:"npm (scoped)"}))),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"tools-tools"},"Tools (",(0,l.kt)("inlineCode",{parentName:"h3"},"tools/"),")"),(0,l.kt)("p",null,"Tools provide utilities and packages for building Backyard"),(0,l.kt)("h4",{id:"create-create-backyard"},(0,l.kt)("inlineCode",{parentName:"h4"},"create")," (create-backyard)"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"create-backyard")," package that powers ",(0,l.kt)("inlineCode",{parentName:"p"},"npx create-backyard")," & ",(0,l.kt)("inlineCode",{parentName:"p"},"yarn create backyard")),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/create-backyard"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/create-backyard",alt:"npm (scoped)"}))),(0,l.kt)("h4",{id:"docs-web-backyardtool-docs-web"},(0,l.kt)("inlineCode",{parentName:"h4"},"docs-web")," (@backyard/tool-docs-web)"),(0,l.kt)("p",null,"Docusaurus configuration and source for build ",(0,l.kt)("inlineCode",{parentName:"p"},"<root>/docs")," folder. Lives at ",(0,l.kt)("a",{parentName:"p",href:"https://backyard.io/docs%60"},"https://backyard.io/docs`")),(0,l.kt)("h4",{id:"test-backyardtool-test"},(0,l.kt)("inlineCode",{parentName:"h4"},"test")," (@backyard/tool-test)"),(0,l.kt)("p",null,"Meta package for ",(0,l.kt)("inlineCode",{parentName:"p"},"jest"),". Jest base config is in ",(0,l.kt)("inlineCode",{parentName:"p"},"<root>/config/jest.base.js")," Provides shortcuts for:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"backyard-tools-jest")," -> ",(0,l.kt)("inlineCode",{parentName:"li"},"jest")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"backyard-tools-ts-jest")," -> ",(0,l.kt)("inlineCode",{parentName:"li"},"ts-jest"))),(0,l.kt)("h4",{id:"typescript-backyardtool-typescript"},(0,l.kt)("inlineCode",{parentName:"h4"},"typescript")," (@backyard/tool-typescript)"),(0,l.kt)("p",null,"Meta package for ",(0,l.kt)("inlineCode",{parentName:"p"},"typescript")," & ",(0,l.kt)("inlineCode",{parentName:"p"},"ts-node"),". Provides shortcuts for:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"backyard-tools-tsc")," -> ",(0,l.kt)("inlineCode",{parentName:"li"},"tsc")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"backyard-tools-ts-node")," -> ",(0,l.kt)("inlineCode",{parentName:"li"},"ts-node -r tsconfig-paths/register"),","),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"backyard-tools-ts-node-dev")," -> ",(0,l.kt)("inlineCode",{parentName:"li"},"ts-node-dev"))),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"types-backyardtypes"},(0,l.kt)("inlineCode",{parentName:"h3"},"types")," (@backyard/types)"),(0,l.kt)("p",null,"Provides global types for Backyard."),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@backyard/types"},(0,l.kt)("img",{parentName:"a",src:"https://img.shields.io/npm/v/@backyard/types",alt:"npm (scoped)"}))))}k.isMDXComponent=!0}}]);