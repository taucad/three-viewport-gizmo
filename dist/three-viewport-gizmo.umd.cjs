(function(L,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],s):(L=typeof globalThis<"u"?globalThis:L||self,s(L.ThreeViewportGizmo={},L.THREE))})(this,function(L,s){"use strict";var fe=Object.defineProperty;var pe=(L,s,V)=>s in L?fe(L,s,{enumerable:!0,configurable:!0,writable:!0,value:V}):L[s]=V;var v=(L,s,V)=>pe(L,typeof s!="symbol"?s+"":s,V);const V=(o,e)=>{const[t,n]=e.split("-");return Object.assign(o.style,{left:n==="left"?"0":n==="center"?"50%":"",right:n==="right"?"0":"",top:t==="top"?"0":t==="bottom"?"":"50%",bottom:t==="bottom"?"0":"",transform:`${n==="center"?"translateX(-50%)":""} ${t==="center"?"translateY(-50%)":""}`}),e},Gt=({placement:o,size:e,offset:t,id:n,className:i})=>{const r=document.createElement("div"),{top:l,left:c,right:u,bottom:f}=t;return Object.assign(r.style,{id:n,position:"absolute",zIndex:"1000",height:`${e}px`,width:`${e}px`,margin:`${l}px ${u}px ${f}px ${c}px`,borderRadius:"100%"}),V(r,o),n&&(r.id=n),i&&(r.className=i),r},Ft=o=>{const e=typeof o=="string"?document.querySelector(o):o;if(!e)throw Error("Invalid DOM element");return e};function lt(o,e,t){return Math.max(e,Math.min(t,o))}const jt=[["x",0,3],["y",1,4],["z",2,5]],yt=new s.Vector3;function _t({isSphere:o},e,t){o&&(yt.set(0,0,1).applyQuaternion(t.quaternion),jt.forEach(([n,i,r])=>{const l=yt[n];let c=e[i],u=c.userData.opacity;c.material.opacity=lt(l>=0?u:u/2,0,1),c=e[r],u=c.userData.opacity,c.material.opacity=lt(l>=0?u/2:u,0,1)}))}const Vt=(o,e,t=10)=>Math.abs(o.clientX-e.x)<t&&Math.abs(o.clientY-e.y)<t,vt=new s.Raycaster,bt=new s.Vector2,wt=(o,e,t,n)=>{bt.set((o.clientX-e.left)/e.width*2-1,-((o.clientY-e.top)/e.height)*2+1),vt.setFromCamera(bt,t);const i=vt.intersectObjects(n,!1);if(i.length>0){i.sort((f,a)=>f.distance-a.distance);const l=.2,c=i[0].distance,u=i.filter(f=>f.distance<=c+l);u.length>1&&(u.sort((f,a)=>{const p=f.object.userData.intersectionOrder??0;return(a.object.userData.intersectionOrder??0)-p}),i.splice(0,u.length,...u))}const r=i.length?i[0]:null;return!r||!r.object.visible?null:r},X=1e-6,Ht=2*Math.PI,St=["x","y","z"],N=[...St,"nx","ny","nz"],kt=["x","z","y","nx","nz","ny"],Wt=["z","x","y","nz","nx","ny"],$="Right",Y="Top",J="Front",K="Left",tt="Bottom",et="Back",qt=[$,Y,J,K,tt,et].map(o=>o.toLocaleLowerCase()),xt=1.3,Et=(o,e=!0)=>{const{material:t,userData:n}=o,{color:i,opacity:r}=e?n.hover:n;t.color.set(i),t.opacity=r},H=o=>JSON.parse(JSON.stringify(o)),Nt={yUp:{x:$,y:Y,z:J,nx:K,ny:tt,nz:et},zUp:{x:$,y:et,z:Y,nx:K,ny:J,nz:tt},xUp:{x:Y,y:J,z:$,nx:tt,ny:et,nz:K}},Zt=o=>{const e=o.type||"sphere",t=e==="sphere",n=e==="rounded-cube",i=o.resolution||t?64:128,r=s.Object3D.DEFAULT_UP,l=r.z===1,c=r.x===1,f=Nt[l?"zUp":c?"xUp":"yUp"],{container:a}=o;o.container=void 0,o=JSON.parse(JSON.stringify(o)),o.container=a;const p=l?kt:c?Wt:N;qt.forEach((m,S)=>{o[m]&&(o[p[S]]=o[m])});const d={enabled:!0,color:16777215,opacity:1,scale:.7,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:t?16777215:9688043,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}}},h={line:!1,scale:t?.45:.7,hover:{scale:t?.5:.7}},b={type:e,container:document.body,size:128,placement:"top-right",resolution:i,lineWidth:4,radius:t?1:n?.3:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:t?16777215:14739180,opacity:t?0:1,hover:{color:t?16777215:14739180,opacity:t?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!t,color:t?15915362:16777215,opacity:1,scale:t?.15:.2,radius:1,smoothness:18,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:.225}},edges:{enabled:!t,color:t?15915362:n?15658734:16777215,opacity:t?1:0,radius:t?1:.125,smoothness:18,scale:t?.15:1,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:1}},x:{...H(d),...t?{label:"X",color:16725587,line:!0}:{label:f.x}},y:{...H(d),...t?{label:"Y",color:9100032,line:!0}:{label:f.y}},z:{...H(d),...t?{label:"Z",color:2920447,line:!0}:{label:f.z}},nx:{...H(h),label:t?"":f.nx},ny:{...H(h),label:t?"":f.ny},nz:{...H(h),label:t?"":f.nz}};if(dt(o,b),n){const m=o;m.edges.radius=m.radius,m.edges.scale=1,m.edges.opacity=1,m.edges.hover.scale=1,m.edges.hover.opacity=1,m.corners.radius=m.radius,m.corners.scale=1,m.corners.opacity=1,m.corners.hover.scale=1,m.corners.hover.opacity=1,m.radius=0,N.forEach(S=>{m[S].scale=1,m[S].opacity=1,m[S].hover.scale=1,m[S].hover.opacity=1})}return St.forEach(m=>dt(o[`n${m}`],H(o[m]))),{...o,isSphere:t}};function dt(o,...e){if(o instanceof HTMLElement||typeof o!="object"||o===null)return o;for(const t of e)for(const n in t)n!=="container"&&n in t&&(o[n]===void 0?o[n]=t[n]:typeof t[n]=="object"&&!Array.isArray(t[n])&&(o[n]=dt(o[n]||{},t[n])));return o}const Qt=(o,e=2)=>{const t=new s.Color,n=e*2,{isSphere:i,resolution:r,radius:l,font:c,corners:u,edges:f}=o,a=N.map(g=>({...o[g],radius:l}));i&&u.enabled&&a.push(u),i&&f.enabled&&a.push(f);const p=document.createElement("canvas"),d=p.getContext("2d");p.width=r*2+n*2,p.height=r*a.length+n*a.length;const[h,b]=O(a,r,c);a.forEach(({radius:g,label:x,color:j,labelColor:E,border:A,hover:{color:q,labelColor:C,border:R}},G)=>{const F=r*G+G*n+e;_(e,F,e,r,g,x,A,j,E),_(r+e*3,F,e,r,g,x,R??A,q??j,C??E)});const m=a.length,S=e/(r*2),M=e/(r*6),B=1/m,w=new s.CanvasTexture(p);return w.repeat.set(.5-2*S,B-2*M),w.offset.set(S,1-M),Object.assign(w,{colorSpace:s.SRGBColorSpace,wrapS:s.RepeatWrapping,wrapT:s.RepeatWrapping,userData:{offsetX:S,offsetY:M,cellHeight:B}}),w;function _(g,x,j,E,A,q,C,R,G){if(A=A*(E/2),R!=null&&R!==""&&(F(),d.fillStyle=t.set(R).getStyle(),d.fill()),C&&C.size){const Z=C.size*E/2;g+=Z,x+=Z,E-=C.size*E,A=Math.max(0,A-Z),F(),d.strokeStyle=t.set(C.color).getStyle(),d.lineWidth=C.size*E,d.stroke()}q&&y(d,g+E/2,x+(E+j)/2,q,t.set(G).getStyle());function F(){d.beginPath(),d.moveTo(g+A,x),d.lineTo(g+E-A,x),d.arcTo(g+E,x,g+E,x+A,A),d.lineTo(g+E,x+E-A),d.arcTo(g+E,x+E,g+E-A,x+E,A),d.lineTo(g+A,x+E),d.arcTo(g,x+E,g,x+E-A,A),d.lineTo(g,x+A),d.arcTo(g,x,g+A,x,A),d.closePath()}}function O(g,x,j){const A=[...g].sort((ct,ue)=>{var It,Rt;return(((It=ct.label)==null?void 0:It.length)||0)-(((Rt=ue.label)==null?void 0:Rt.length)||0)}).pop().label,{family:q,weight:C}=j,R=i?Math.sqrt(Math.pow(x*.7,2)/2):x;let G=R;o.font.size>0&&(G=o.font.size);let F=0,Z=0;do{d.font=`${C} ${G}px ${q}`;const ct=d.measureText(A);F=ct.width,Z=ct.fontBoundingBoxDescent,G--}while(F>R&&G>0);const Pt=R/Z,le=Math.min(R/F,Pt),de=Math.floor(G*le);return[`${C} ${de}px ${q}`,Pt]}function y(g,x,j,E,A){g.font=h,g.textAlign="center",g.textBaseline="middle",g.fillStyle=A,g.fillText(E,x,j+(i?b:0))}},Xt=(o,e)=>o.offset.x=(e?.5:0)+o.userData.offsetX,ut=(o,e)=>{const{offset:t,userData:{offsetY:n,cellHeight:i}}=o;t.y=1-(e+1)*i+n};function ft(o,e,t=2,n=2){const i=t/2-o,r=n/2-o,l=o/t,c=(t-o)/t,u=o/n,f=(n-o)/n,a=[i,r,0,-i,r,0,-i,-r,0,i,-r,0],p=[c,f,l,f,l,u,c,u],d=[3*(e+1)+3,3*(e+1)+4,e+4,e+5,2*(e+1)+4,2,1,2*(e+1)+3,3,4*(e+1)+3,4,0],h=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(y=>d[y]);let b,m,S,M,B,w,_,O;for(let y=0;y<4;y++){M=y<1||y>2?i:-i,B=y<2?r:-r,w=y<1||y>2?c:l,_=y<2?f:u;for(let g=0;g<=e;g++)b=Math.PI/2*(y+g/e),m=Math.cos(b),S=Math.sin(b),a.push(M+o*m,B+o*S,0),p.push(w+l*m,_+u*S),g<e&&(O=(e+1)*y+g+4,h.push(y,O,O+1))}return new s.BufferGeometry().setIndex(new s.BufferAttribute(new Uint32Array(h),1)).setAttribute("position",new s.BufferAttribute(new Float32Array(a),3)).setAttribute("uv",new s.BufferAttribute(new Float32Array(p),2))}const $t=(o,e)=>{const t=new s.Vector3,{isSphere:n,radius:i,smoothness:r,type:l}=o,u=l==="rounded-cube"?2-o.edges.radius*2:2,f=ft(i,r,u,u);return N.map((a,p)=>{const d=p<3,h=N[p],b=p?e.clone():e;ut(b,p);const{enabled:m,scale:S,opacity:M,hover:B}=o[h],w={map:b,opacity:M,transparent:!0},_=n?new s.Sprite(new s.SpriteMaterial(w)):new s.Mesh(f,new s.MeshBasicMaterial(w)),O=d?h:h[1];if(_.position[O]=(d?1:-1)*(n?xt:1),!n){_.lookAt(t.copy(_.position).multiplyScalar(1.7));const y=s.Object3D.DEFAULT_UP.z===1,g=s.Object3D.DEFAULT_UP.x===1;(y||g)&&(h==="z"&&y||h==="x"&&g?_.rotateZ(-Math.PI/2):(h==="nz"&&y||h==="nx"&&g)&&_.rotateZ(Math.PI/2))}return _.scale.setScalar(S),_.renderOrder=1,_.visible=m,_.userData={scale:S,opacity:M,hover:B},_})},Yt=(o,e)=>{const{isSphere:t,corners:n,type:i}=o,r=i==="rounded-cube";if(!n.enabled)return[];const{color:l,opacity:c,scale:u,radius:f,smoothness:a,hover:p}=n,d=t?null:r?new s.SphereGeometry(f,a*2,a):ft(f,a),h={transparent:!0,opacity:c},b=r?1-f:.85,m=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(M=>M*b),S=new s.Vector3;return Array(m.length/3).fill(0).map((M,B)=>{if(t){const O=e.clone();ut(O,6),h.map=O}else h.color=l;const w=t?new s.Sprite(new s.SpriteMaterial(h)):new s.Mesh(d,new s.MeshBasicMaterial(h)),_=B*3;return w.position.set(m[_],m[_+1],m[_+2]),t&&w.position.normalize().multiplyScalar(1.7),w.scale.setScalar(u),w.lookAt(S.copy(w.position).multiplyScalar(2)),w.renderOrder=1,w.userData={color:l,opacity:c,scale:u,hover:p,intersectionOrder:1},w})},Jt=(o,e,t)=>{const{isSphere:n,edges:i,type:r}=o,l=r==="rounded-cube";if(!i.enabled)return[];const{color:c,opacity:u,scale:f,hover:a,radius:p,smoothness:d}=i,h=l?2-p*2:1.2,b=n?null:l?new s.CylinderGeometry(p,p,h,d*4):ft(p,d,h,.25),m={transparent:!0,opacity:u},S=l?1-p:.925,M=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(_=>_*S),B=new s.Vector3,w=new s.Vector3(0,1,0);return Array(M.length/3).fill(0).map((_,O)=>{if(n){const x=e.clone();ut(x,t),m.map=x}else m.color=c;const y=n?new s.Sprite(new s.SpriteMaterial(m)):new s.Mesh(b,new s.MeshBasicMaterial(m)),g=O*3;return y.position.set(M[g],M[g+1],M[g+2]),n&&y.position.normalize().multiplyScalar(1.7),y.scale.setScalar(f),y.up.copy(w),y.lookAt(B.copy(y.position).multiplyScalar(2)),l?(!n&&!y.position.z&&(y.rotation.z=Math.PI),!n&&!y.position.x&&(y.rotation.x=0),!n&&!y.position.x&&(y.rotation.z=Math.PI/2)):!n&&!y.position.y&&(y.rotation.z=Math.PI/2),y.renderOrder=1,y.userData={color:c,opacity:u,scale:f,hover:a},y})};function Kt(o,e=!1){const t=o[0].index!==null,n=new Set(Object.keys(o[0].attributes)),i=new Set(Object.keys(o[0].morphAttributes)),r={},l={},c=o[0].morphTargetsRelative,u=new s.BufferGeometry;let f=0;for(let a=0;a<o.length;++a){const p=o[a];let d=0;if(t!==(p.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const h in p.attributes){if(!n.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;r[h]===void 0&&(r[h]=[]),r[h].push(p.attributes[h]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(c!==p.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const h in p.morphAttributes){if(!i.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;l[h]===void 0&&(l[h]=[]),l[h].push(p.morphAttributes[h])}if(e){let h;if(t)h=p.index.count;else if(p.attributes.position!==void 0)h=p.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;u.addGroup(f,h,a),f+=h}}if(t){let a=0;const p=[];for(let d=0;d<o.length;++d){const h=o[d].index;for(let b=0;b<h.count;++b)p.push(h.getX(b)+a);a+=o[d].attributes.position.count}u.setIndex(p)}for(const a in r){const p=At(r[a]);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;u.setAttribute(a,p)}for(const a in l){const p=l[a][0].length;if(p===0)break;u.morphAttributes=u.morphAttributes||{},u.morphAttributes[a]=[];for(let d=0;d<p;++d){const h=[];for(let m=0;m<l[a].length;++m)h.push(l[a][m][d]);const b=At(h);if(!b)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;u.morphAttributes[a].push(b)}}return u}function At(o){let e,t,n,i=-1,r=0;for(let f=0;f<o.length;++f){const a=o[f];if(e===void 0&&(e=a.array.constructor),e!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=a.itemSize),t!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=a.normalized),n!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=a.gpuType),i!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=a.count*t}const l=new e(r),c=new s.BufferAttribute(l,t,n);let u=0;for(let f=0;f<o.length;++f){const a=o[f];if(a.isInterleavedBufferAttribute){const p=u/t;for(let d=0,h=a.count;d<h;d++)for(let b=0;b<t;b++){const m=a.getComponent(d,b);c.setComponent(d+p,b,m)}}else l.set(a.array,u);u+=a.count*t}return i!==void 0&&(c.gpuType=i),c}const te=(o,e)=>{const{isSphere:t,background:{enabled:n,color:i,opacity:r,hover:l}}=e;let c;const u=new s.MeshBasicMaterial({color:i,side:s.BackSide,opacity:r,transparent:!0,depthWrite:!1});if(!n)return null;if(t)c=new s.Mesh(new s.SphereGeometry(1.8,64,64),u);else{let f;o.forEach(a=>{const p=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const d=a.geometry.clone();d.applyMatrix4(a.matrix),f=f?Kt([f,d]):d,a.scale.setScalar(p)}),c=new s.Mesh(f,u)}return c.userData={color:i,opacity:r,hover:l},c},Mt=new s.Box3,nt=new s.Vector3;class Ut extends s.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new s.Float32BufferAttribute(e,3)),this.setAttribute("uv",new s.Float32BufferAttribute(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceEnd",new s.InterleavedBufferAttribute(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceColorStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceColorEnd",new s.InterleavedBufferAttribute(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.WireframeGeometry(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s.Box3);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Mt.setFromBufferAttribute(t),this.boundingBox.union(Mt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new s.Sphere),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let r=0,l=e.count;r<l;r++)nt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(nt)),nt.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(nt));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}s.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},s.ShaderLib.line={uniforms:s.UniformsUtils.merge([s.UniformsLib.common,s.UniformsLib.fog,s.UniformsLib.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class pt extends s.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:s.UniformsUtils.clone(s.ShaderLib.line.uniforms),vertexShader:s.ShaderLib.line.vertexShader,fragmentShader:s.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const ht=new s.Vector4,Tt=new s.Vector3,zt=new s.Vector3,U=new s.Vector4,T=new s.Vector4,D=new s.Vector4,mt=new s.Vector3,gt=new s.Matrix4,z=new s.Line3,Lt=new s.Vector3,it=new s.Box3,st=new s.Sphere,P=new s.Vector4;let I,k;function Bt(o,e,t){return P.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),P.multiplyScalar(1/P.w),P.x=k/t.width,P.y=k/t.height,P.applyMatrix4(o.projectionMatrixInverse),P.multiplyScalar(1/P.w),Math.abs(Math.max(P.x,P.y))}function ee(o,e){const t=o.matrixWorld,n=o.geometry,i=n.attributes.instanceStart,r=n.attributes.instanceEnd,l=Math.min(n.instanceCount,i.count);for(let c=0,u=l;c<u;c++){z.start.fromBufferAttribute(i,c),z.end.fromBufferAttribute(r,c),z.applyMatrix4(t);const f=new s.Vector3,a=new s.Vector3;I.distanceSqToSegment(z.start,z.end,a,f),a.distanceTo(f)<k*.5&&e.push({point:a,pointOnLine:f,distance:I.origin.distanceTo(a),object:o,face:null,faceIndex:c,uv:null,uv1:null})}}function ne(o,e,t){const n=e.projectionMatrix,r=o.material.resolution,l=o.matrixWorld,c=o.geometry,u=c.attributes.instanceStart,f=c.attributes.instanceEnd,a=Math.min(c.instanceCount,u.count),p=-e.near;I.at(1,D),D.w=1,D.applyMatrix4(e.matrixWorldInverse),D.applyMatrix4(n),D.multiplyScalar(1/D.w),D.x*=r.x/2,D.y*=r.y/2,D.z=0,mt.copy(D),gt.multiplyMatrices(e.matrixWorldInverse,l);for(let d=0,h=a;d<h;d++){if(U.fromBufferAttribute(u,d),T.fromBufferAttribute(f,d),U.w=1,T.w=1,U.applyMatrix4(gt),T.applyMatrix4(gt),U.z>p&&T.z>p)continue;if(U.z>p){const w=U.z-T.z,_=(U.z-p)/w;U.lerp(T,_)}else if(T.z>p){const w=T.z-U.z,_=(T.z-p)/w;T.lerp(U,_)}U.applyMatrix4(n),T.applyMatrix4(n),U.multiplyScalar(1/U.w),T.multiplyScalar(1/T.w),U.x*=r.x/2,U.y*=r.y/2,T.x*=r.x/2,T.y*=r.y/2,z.start.copy(U),z.start.z=0,z.end.copy(T),z.end.z=0;const m=z.closestPointToPointParameter(mt,!0);z.at(m,Lt);const S=s.MathUtils.lerp(U.z,T.z,m),M=S>=-1&&S<=1,B=mt.distanceTo(Lt)<k*.5;if(M&&B){z.start.fromBufferAttribute(u,d),z.end.fromBufferAttribute(f,d),z.start.applyMatrix4(l),z.end.applyMatrix4(l);const w=new s.Vector3,_=new s.Vector3;I.distanceSqToSegment(z.start,z.end,_,w),t.push({point:_,pointOnLine:w,distance:I.origin.distanceTo(_),object:o,face:null,faceIndex:d,uv:null,uv1:null})}}}class ie extends s.Mesh{constructor(e=new Ut,t=new pt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let l=0,c=0,u=t.count;l<u;l++,c+=2)Tt.fromBufferAttribute(t,l),zt.fromBufferAttribute(n,l),i[c]=c===0?0:i[c-1],i[c+1]=i[c]+Tt.distanceTo(zt);const r=new s.InstancedInterleavedBuffer(i,2,1);return e.setAttribute("instanceDistanceStart",new s.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new s.InterleavedBufferAttribute(r,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;I=e.ray;const l=this.matrixWorld,c=this.geometry,u=this.material;k=u.linewidth+r,c.boundingSphere===null&&c.computeBoundingSphere(),st.copy(c.boundingSphere).applyMatrix4(l);let f;if(n)f=k*.5;else{const p=Math.max(i.near,st.distanceToPoint(I.origin));f=Bt(i,p,u.resolution)}if(st.radius+=f,I.intersectsSphere(st)===!1)return;c.boundingBox===null&&c.computeBoundingBox(),it.copy(c.boundingBox).applyMatrix4(l);let a;if(n)a=k*.5;else{const p=Math.max(i.near,it.distanceToPoint(I.origin));a=Bt(i,p,u.resolution)}it.expandByScalar(a),I.intersectsBox(it)!==!1&&(n?ee(this,t):ne(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(ht),this.material.uniforms.resolution.value.set(ht.z,ht.w))}}class Ot extends Ut{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setColors(n),this}setFromPoints(e){const t=e.length-1,n=new Float32Array(6*t);for(let i=0;i<t;i++)n[6*i]=e[i].x,n[6*i+1]=e[i].y,n[6*i+2]=e[i].z||0,n[6*i+3]=e[i+1].x,n[6*i+4]=e[i+1].y,n[6*i+5]=e[i+1].z||0;return super.setPositions(n),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class se extends ie{constructor(e=new Ot,t=new pt({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const oe=o=>{const e=new s.Color,t=[],n=[],{isSphere:i}=o;if(N.forEach((c,u)=>{const{enabled:f,line:a,scale:p,color:d}=o[c];if(!f||!a)return;const h=u<3?1:-1,m=(i?xt-p/2:.975)*h;t.push(c.includes("x")?m:0,c.includes("y")?m:0,c.includes("z")?m:0,0,0,0);const S=e.set(d).toArray();n.push(...S,...S)}),!t.length)return null;const r=new Ot().setPositions(t).setColors(n),l=new pt({linewidth:o.lineWidth,vertexColors:!0,resolution:new s.Vector2(window.innerWidth,window.innerHeight)});return new se(r,l).computeLineDistances()},re=o=>{const{corners:e,edges:t}=o,n=[],i=Qt(o),r=$t(o,i);n.push(...r),e.enabled&&n.push(...Yt(o,i)),t.enabled&&n.push(...Jt(o,i,e.enabled?7:6));const l=te(r,o),c=oe(o);return[n,l,c]},Q=(o,e=!0)=>{const{material:t,userData:n}=o,{opacity:i,color:r,scale:l}=e?n.hover:n;o.scale.setScalar(l),t.opacity=i,t.map?Xt(t.map,e):t.color.set(r)},ot=new s.Matrix4,Ct=new s.Spherical,ae=new s.Vector2,W=new s.Vector3,Dt=new s.Vector4,rt=new s.Quaternion().setFromAxisAngle(new s.Vector3(0,0,1),Math.PI/2),at=new s.Quaternion().setFromAxisAngle(new s.Vector3(0,0,1),-Math.PI/2);class ce extends s.Object3D{constructor(t,n,i={}){super();v(this,"enabled",!0);v(this,"camera");v(this,"renderer");v(this,"options");v(this,"target",new s.Vector3);v(this,"animated",!0);v(this,"speed",1);v(this,"animating",!1);v(this,"_options");v(this,"_intersections");v(this,"_background",null);v(this,"_viewport",[0,0,0,0]);v(this,"_originalViewport",[0,0,0,0]);v(this,"_originalScissor",[0,0,0,0]);v(this,"_scene");v(this,"_camera");v(this,"_container");v(this,"_domElement");v(this,"_domRect");v(this,"_dragging",!1);v(this,"_distance",0);v(this,"_lastAnimateTimeSeconds",null);v(this,"_targetQuaternion",new s.Quaternion);v(this,"_quaternionStart",new s.Quaternion);v(this,"_quaternionEnd",new s.Quaternion);v(this,"_pointerStart",new s.Vector2);v(this,"_focus",null);v(this,"_placement");v(this,"_controls");v(this,"_controlsListeners");this.camera=t,this.renderer=n,this._scene=new s.Scene().add(this),this.set(i)}get placement(){return this._placement}set placement(t){this._placement=V(this._domElement,t),this.domUpdate()}set(t={}){this.dispose(),this.options=t,this._options=Zt(t),this._camera=this._options.isSphere?new s.OrthographicCamera(-1.8,1.8,1.8,-1.8,5,10):new s.PerspectiveCamera(26,1,5,10),this._camera.position.set(0,0,7);const[n,i,r]=re(this._options);i&&this.add(i),r&&this.add(r),this.add(...n),this._background=i,this._intersections=n;const{container:l,animated:c,speed:u}=this._options;return this.animated=c,this.speed=u,this._container=l?Ft(l):document.body,this._domElement=Gt(this._options),this._domElement.onpointerdown=f=>this._onPointerDown(f),this._domElement.onpointermove=f=>this._onPointerMove(f),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:n}=this,i=t.getScissorTest(),r=t.autoClear;return t.autoClear=!1,t.setViewport(...n),i&&t.setScissor(...n),t.clear(!1,!0,!1),t.render(this._scene,this._camera),t.setViewport(...this._originalViewport),i&&t.setScissor(...this._originalScissor),t.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,n=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.splice(0,4,n.left-i.left,t.domElement.clientHeight-(n.top-i.top+n.height),n.width,n.height),t.getViewport(Dt).toArray(this._originalViewport),t.getScissorTest()&&t.getScissor(Dt).toArray(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new s.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(n=>{var r,l,c,u;this.remove(n);const i=n;(r=i.material)==null||r.dispose(),(c=(l=i.material)==null?void 0:l.map)==null||c.dispose(),(u=i.geometry)==null||u.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),_t(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:n}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),n.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this._lastAnimateTimeSeconds=null,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}this._controls&&(this._controls.enabled=!1);const i=performance.now()/1e3,r=this._lastAnimateTimeSeconds===null?0:i-this._lastAnimateTimeSeconds;this._lastAnimateTimeSeconds=i;const l=r*Ht*this.speed;if(this._quaternionStart.rotateTowards(this._quaternionEnd,l),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),n.rotateTowards(this._targetQuaternion,l),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),this._quaternionStart.angleTo(this._quaternionEnd)<X){if(this._controls){const c=this.camera.position.clone().sub(this.target).normalize();s.Object3D.DEFAULT_UP.z===1&&Math.abs(c.z)>.99?this.camera.position.set(0,-1e-6,this.camera.position.z):s.Object3D.DEFAULT_UP.x===1&&Math.abs(c.x)>.99&&this.camera.position.set(this.camera.position.x,X,0),this._controls.update(),this._controls.enabled=!0}this.animating=!1,this._lastAnimateTimeSeconds=null,this.dispatchEvent({type:"end"})}}_setOrientation(t){const n=this.camera,i=this.target;if(W.copy(t).multiplyScalar(this._distance),ot.setPosition(W).lookAt(W,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(ot),W.add(i),ot.lookAt(W,i,this.up),this._quaternionEnd.setFromRotationMatrix(ot),this._quaternionStart.copy(n.quaternion),s.Object3D.DEFAULT_UP.z===1&&Math.abs(t.z)>.99){const r=Math.sign(t.z);this._targetQuaternion.multiply(r===1?at:rt),this._quaternionEnd.multiply(r===1?at:rt)}else if(s.Object3D.DEFAULT_UP.x===1&&Math.abs(t.x)>.99){const r=Math.sign(t.x);this._targetQuaternion.multiply(r===1?at:rt),this._quaternionEnd.multiply(r===1?at:rt)}this.animating=!0,this._lastAnimateTimeSeconds=null,this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const n=f=>{if(!this._dragging){if(Vt(f,this._pointerStart))return;this._dragging=!0}const a=ae.set(f.clientX,f.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),p=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),d=Ct.setFromVector3(p);d.theta=c-a.x,d.phi=lt(u-a.y,X,Math.PI-X),this.coordinateConversion(this.camera.position.setFromSpherical(d),!0).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},i=()=>{if(document.removeEventListener("pointermove",n,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&(Q(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const r=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),l=Ct.setFromVector3(r),c=l.theta,u=l.phi;this._distance=l.radius,document.addEventListener("pointermove",n,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}coordinateConversion(t,n=!1){const{x:i,y:r,z:l}=t,c=s.Object3D.DEFAULT_UP;return c.x===1?n?t.set(r,l,i):t.set(l,i,r):c.z===1?n?t.set(l,i,r):t.set(r,l,i):t}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&Et(this._background,!0),this._handleHover(t))}_onPointerLeave(){if(!this.enabled||this._dragging)return;this._background&&Et(this._background,!1);const t=this._focus!==null;this._focus&&(Q(this._focus,!1),this._focus=null),this._domElement.style.cursor="",t&&this.dispatchEvent({type:"hoverchange",object:null})}_handleClick(t){const n=wt(t,this._domRect,this._camera,this._intersections);this._focus&&(Q(this._focus,!1),this._focus=null),n&&(this._setOrientation(n.object.position),this.dispatchEvent({type:"change"}))}_handleHover(t){const n=wt(t,this._domRect,this._camera,this._intersections),i=(n==null?void 0:n.object)||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&Q(this._focus,!1),(this._focus=i)?Q(i,!0):_t(this._options,this._intersections,this.camera),this.dispatchEvent({type:"hoverchange",object:i}))}}L.ViewportGizmo=ce,Object.defineProperty(L,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
