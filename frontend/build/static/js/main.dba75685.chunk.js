(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{218:function(e,t,n){"use strict";n.r(t);var a=n(9);Object(a.b)("\n@import url(https://fonts.googleapis.com/css?family=Source+Code+Pro:400,700|Google+Sans:400,700);\n/* Reset */\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  border: 0;\n  /* Consider adding flex-shrink: 0; */\n  font-size: 100%;\n  margin: 0;\n  padding: 0;\n  vertical-align: baseline;\n}\n\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n  display: block;\n}\n\nol, ul {\n  list-style: none;\n}\n\nblockquote, q {\n  quotes: none;\n}\n\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: '';\n  content: none;\n}\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n");var o=n(0),r=n(16),i=n(88),l=n.n(i),s=n(90),c=n(89),d=n(17),p=n(36),u=n(37),m=n(45),g=n(38),f=n(46),b=n(20),h=n.n(b),k=n(39),x=n.n(k),v=n(42),y=n.n(v),w=n(41),C=n.n(w),E=n(40),O=n.n(E),S=n(55),j=n.n(S),I=n(86),P=n.n(I),D=n(34),N="#fff",_="#e0e0e0",z="#fbe9e7",R="#d50000",B="#80868b",H="rgba(0, 0, 0, .88)",F="#202124",M="#1a73e8",T="#f9f9e1",q="#ee8100",A=14,G=18,L=24,W=function(e){return L+4*e},$='"Google Sans", "Helvetica Neue", sans-serif',J={primary:{dark:"#0b59dc",main:M},secondary:{main:"rgba(0, 0, 0, .38)"}},V=n.n(D)()({overrides:{MuiButton:{flat:{fontSize:A,fontWeight:"bold",minHeight:24,textTransform:"none"},flatPrimary:{border:"1px solid #ddd",cursor:"pointer",fontSize:A,marginRight:10,textTransform:"none"},flatSecondary:{color:M},root:{"&$disabled":{backgroundColor:"initial"},color:M,marginRight:10,padding:"0 8px"}},MuiDialogActions:{root:{margin:15}},MuiDialogTitle:{root:{fontSize:G}},MuiFormControlLabel:{root:{marginLeft:0}},MuiFormLabel:{filled:{marginLeft:0,marginTop:0},root:{"&$focused":{marginLeft:0,marginTop:0},fontSize:A,marginLeft:5,marginTop:-8}},MuiIconButton:{root:{padding:9}},MuiInput:{input:{padding:0},root:{padding:0}},MuiInputAdornment:{positionEnd:{paddingRight:0},root:{padding:0}},MuiTooltip:{tooltip:{backgroundColor:"#666",color:"#f1f1f1",fontSize:12}}},palette:J,typography:{fontFamily:$,fontSize:A+" !important",useNextVariants:!0}}),X=Object(a.e)({absoluteCenter:{left:"calc(50% - 15px)",position:"absolute",top:"calc(50% - 15px)"},busyOverlay:{backgroundColor:"#ffffffaa",bottom:0,left:0,position:"absolute",right:0,top:0,zIndex:2},buttonAction:{$nest:{"&:disabled":{backgroundColor:N},"&:hover":{backgroundColor:V.palette.primary.dark}},backgroundColor:J.primary.main,color:"white"},ellipsis:{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},flex:{alignItems:"center !important",display:"flex !important",flexShrink:0},flexColumn:{display:"flex !important",flexDirection:"column"},flexGrow:{display:"flex !important",flexGrow:1},header:{fontSize:G,fontWeight:"bold",paddingBottom:16,paddingTop:20},infoIcon:{color:B,height:16,width:16},link:{$nest:{"&:hover":{color:M,textDecoration:"underline"}},color:F,cursor:"pointer",textDecoration:"none"},noShrink:{flexShrink:0},page:{display:"flex",flexFlow:"column",flexGrow:1,overflow:"auto"},pageOverflowHidden:{display:"flex",flexFlow:"column",flexGrow:1,overflowX:"auto",overflowY:"hidden"},prewrap:{whiteSpace:"pre-wrap"},scrollContainer:{background:"linear-gradient(white 30%, rgba(255,255,255,0)),\n       linear-gradient(rgba(255,255,255,0), white 70%) 0 100%,\n       radial-gradient(farthest-corner at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),\n       radial-gradient(farthest-corner at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%",backgroundAttachment:"local, local, scroll, scroll",backgroundColor:"white",backgroundRepeat:"no-repeat",backgroundSize:"100% 40px, 100% 40px, 100% 2px, 100% 2px",overflow:"auto",position:"relative"},textField:{display:"flex",height:40,marginBottom:20,marginTop:15},unstyled:{color:"inherit",outline:"none",textDecoration:"none"}});var Y,K,Q=Object(a.e)({banner:{border:"1px solid ".concat(_),boxSizing:"border-box",justifyContent:"space-between",margin:W(-1),minHeight:"50px",padding:W(-4)},button:{color:H,maxHeight:"32px",minWidth:"75px"},icon:{height:"18px",padding:W(-4),width:"18px"},message:{alignItems:"center",display:"flex"},refreshButton:{backgroundColor:N}}),U=function(e){function t(e){var n;return Object(p.a)(this,t),(n=Object(m.a)(this,Object(g.a)(t).call(this,e))).state={dialogOpen:!1},n}return Object(f.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){var e=Object(a.e)({mode:{backgroundColor:z,color:R}}),t=o.createElement(j.a,{className:Q.icon}),n="An error occurred";switch(this.props.mode){case"error":e=Object(a.e)({mode:{backgroundColor:z,color:R}}),t=o.createElement(j.a,{className:Q.icon}),n="An error occurred";break;case"warning":e=Object(a.e)({mode:{backgroundColor:T,color:q}}),t=o.createElement(P.a,{className:Q.icon}),n="Warning"}return o.createElement("div",{className:Object(a.a)(X.flex,Q.banner,e.mode)},o.createElement("div",{className:Q.message},t,this.props.message),o.createElement("div",{className:X.flex},this.props.additionalInfo&&o.createElement(h.a,{className:Q.button,onClick:this._showAdditionalInfo.bind(this)},"Details"),this.props.refresh&&o.createElement(h.a,{className:Object(a.a)(Q.button,Q.refreshButton),onClick:this._refresh.bind(this)},"Refresh")),this.props.additionalInfo&&o.createElement(x.a,{open:this.state.dialogOpen,onClose:this._dialogClosed.bind(this)},o.createElement(O.a,null,n),o.createElement(C.a,{className:X.prewrap},this.props.additionalInfo),o.createElement(y.a,null,o.createElement(h.a,{id:"dismissDialogBtn",onClick:this._dialogClosed.bind(this)},"Dismiss"))))}},{key:"_dialogClosed",value:function(){this.setState({dialogOpen:!1})}},{key:"_showAdditionalInfo",value:function(){this.setState({dialogOpen:!0})}},{key:"_refresh",value:function(){this.props.refresh()}}]),t}(o.Component),Z=function(e){return o.createElement("div",{style:{margin:"100px auto",textAlign:"center"}},o.createElement("div",{style:{color:"#aaa",fontSize:50,fontWeight:"bold"}},"404"),o.createElement("div",{style:{fontSize:16}},"Page Not Found: ",e.location.pathname))},ee=n(87),te=n.n(ee),ne=n(221),ae=n(224),oe=n(223),re=n(222),ie=Object(a.e)({dialog:{minWidth:250}});!function(e){e.cloneFromRun="cloneFromRun",e.experimentId="experimentId",e.isRecurring="recurring",e.firstRunInExperiment="firstRunInExperiment",e.pipelineId="pipelineId",e.fromRunId="fromRun",e.runlist="runlist",e.view="view"}(Y||(Y={})),function(e){e.experimentId="eid",e.pipelineId="pid",e.runId="rid"}(K||(K={}));"/experiments/details/:".concat(K.experimentId);var le="/pipelines",se=("/pipelines/details/:".concat(K.pipelineId,"?"),"/recurringrun/details/:".concat(K.runId),"/runs/details/:".concat(K.runId),function(e){function t(e){var n;return Object(p.a)(this,t),(n=Object(m.a)(this,Object(g.a)(t).call(this,e))).state={bannerProps:{},dialogProps:{open:!1},snackbarProps:{autoHideDuration:5e3,open:!1}},n}return Object(f.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){var e=this,t={updateBanner:this._updateBanner.bind(this),updateDialog:this._updateDialog.bind(this),updateSnackbar:this._updateSnackbar.bind(this)};return o.createElement(ne.a,null,o.createElement("div",{className:X.page},o.createElement("div",{className:X.flexGrow},o.createElement("div",{className:Object(a.a)(X.page)},this.state.bannerProps.message&&o.createElement(U,{message:this.state.bannerProps.message,mode:this.state.bannerProps.mode,additionalInfo:this.state.bannerProps.additionalInfo,refresh:this.state.bannerProps.refresh}),o.createElement(ae.a,null,o.createElement(oe.a,{exact:!0,path:"/",render:function(e){var t=Object(d.a)({},e);return o.createElement(re.a,Object.assign({to:le},t))}}),[].map(function(e,n){var a=Object(s.a)({},e),r=a.path,i=a.Component,l=Object(c.a)(a,["path","Component"]);return o.createElement(oe.a,{key:n,exact:!0,path:r,render:function(e){var n=Object(d.a)({},e);return o.createElement(i,Object.assign({},n,t,l))}})}),o.createElement(oe.a,{render:function(e){var n=Object(d.a)({},e);return o.createElement(Z,Object.assign({},n,t))}})),o.createElement(te.a,{autoHideDuration:this.state.snackbarProps.autoHideDuration,message:this.state.snackbarProps.message,open:this.state.snackbarProps.open,onClose:this._handleSnackbarClose.bind(this)}))),o.createElement(x.a,{open:!1!==this.state.dialogProps.open,classes:{paper:ie.dialog},className:"dialog",onClose:function(){return e._handleDialogClosed()}},this.state.dialogProps.title&&o.createElement(O.a,null," ",this.state.dialogProps.title),this.state.dialogProps.content&&o.createElement(C.a,{className:X.prewrap},this.state.dialogProps.content),this.state.dialogProps.buttons&&o.createElement(y.a,null,this.state.dialogProps.buttons.map(function(t,n){return o.createElement(h.a,{key:n,onClick:function(){return e._handleDialogClosed(t.onClick)},className:"dialogButton",color:"secondary"},t.text)})))))}},{key:"_updateDialog",value:function(e){void 0===e.open&&(e.open=!0),this.setState({dialogProps:e})}},{key:"_handleDialogClosed",value:function(e){this.setState({dialogProps:{open:!1}}),e&&e(),this.state.dialogProps.onClose&&this.state.dialogProps.onClose()}},{key:"_updateBanner",value:function(e){this.setState({bannerProps:e})}},{key:"_updateSnackbar",value:function(e){e.autoHideDuration=e.autoHideDuration||this.state.snackbarProps.autoHideDuration,this.setState({snackbarProps:e})}},{key:"_handleSnackbarClose",value:function(){this.setState({snackbarProps:{open:!1,message:""}})}}]),t}(o.Component));Object(a.c)("html, body, #root",{background:"white",color:"rgba(0, 0, 0, .66)",display:"flex",fontFamily:$,fontSize:13,height:"100%",width:"100%"}),r.render(o.createElement(l.a,{theme:V},o.createElement(se,null)),document.getElementById("root"))},91:function(e,t,n){e.exports=n(218)}},[[91,1,2]]]);
//# sourceMappingURL=main.dba75685.chunk.js.map