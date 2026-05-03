(function(B,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("three")):typeof define=="function"&&define.amd?define(["exports","three"],s):(B=typeof globalThis<"u"?globalThis:B||self,s(B.ThreeViewportGizmo={},B.THREE))})(this,function(B,s){"use strict";var me=Object.defineProperty;var ge=(B,s,k)=>s in B?me(B,s,{enumerable:!0,configurable:!0,writable:!0,value:k}):B[s]=k;var b=(B,s,k)=>ge(B,typeof s!="symbol"?s+"":s,k);const k=(o,e)=>{const[t,n]=e.split("-");return Object.assign(o.style,{left:n==="left"?"0":n==="center"?"50%":"",right:n==="right"?"0":"",top:t==="top"?"0":t==="bottom"?"":"50%",bottom:t==="bottom"?"0":"",transform:`${n==="center"?"translateX(-50%)":""} ${t==="center"?"translateY(-50%)":""}`}),e},jt=({placement:o,size:e,offset:t,id:n,className:i})=>{const r=document.createElement("div"),{top:l,left:c,right:d,bottom:f}=t;return Object.assign(r.style,{id:n,position:"absolute",zIndex:"1000",height:`${e}px`,width:`${e}px`,margin:`${l}px ${d}px ${f}px ${c}px`,borderRadius:"100%"}),k(r,o),n&&(r.id=n),i&&(r.className=i),r},kt=o=>{const e=typeof o=="string"?document.querySelector(o):o;if(!e)throw Error("Invalid DOM element");return e};function ot(o,e,t){return Math.max(e,Math.min(t,o))}const Ht=[["x",0,3],["y",1,4],["z",2,5]],vt=new s.Vector3;function bt({isSphere:o},e,t){o&&(vt.set(0,0,1).applyQuaternion(t.quaternion),Ht.forEach(([n,i,r])=>{const l=vt[n];let c=e[i],d=c.userData.opacity;c.material.opacity=ot(l>=0?d:d/2,0,1),c=e[r],d=c.userData.opacity,c.material.opacity=ot(l>=0?d/2:d,0,1)}))}const Wt=(o,e,t=10)=>Math.abs(o.clientX-e.x)<t&&Math.abs(o.clientY-e.y)<t,wt=new s.Raycaster,St=new s.Vector2,xt=(o,e,t,n)=>{St.set((o.clientX-e.left)/e.width*2-1,-((o.clientY-e.top)/e.height)*2+1),wt.setFromCamera(St,t);const i=wt.intersectObjects(n,!1);if(i.length>0){i.sort((f,a)=>f.distance-a.distance);const l=.2,c=i[0].distance,d=i.filter(f=>f.distance<=c+l);d.length>1&&(d.sort((f,a)=>{const p=f.object.userData.intersectionOrder??0;return(a.object.userData.intersectionOrder??0)-p}),i.splice(0,d.length,...d))}const r=i.length?i[0]:null;return!r||!r.object.visible?null:r},$=1e-6,qt=2*Math.PI,Et=["x","y","z"],H=[...Et,"nx","ny","nz"],Nt=["x","z","y","nx","nz","ny"],Zt=["z","x","y","nz","nx","ny"],st="Right",rt="Top",at="Front",ct="Left",lt="Bottom",ut="Back",At=["right","top","front","left","bottom","back"],Mt=1.3,zt=(o,e=!0)=>{const{material:t,userData:n}=o,{color:i,opacity:r}=e?n.hover:n;t.color.set(i),t.opacity=r},W=o=>JSON.parse(JSON.stringify(o)),Qt={yUp:{x:st,y:rt,z:at,nx:ct,ny:lt,nz:ut},zUp:{x:st,y:ut,z:rt,nx:ct,ny:at,nz:lt},xUp:{x:rt,y:at,z:st,nx:lt,ny:ut,nz:ct}},Xt=o=>{const e=o.type||"sphere",t=e==="sphere",n=e==="rounded-cube",i=o.resolution||t?64:128,r=s.Object3D.DEFAULT_UP,l=r.z===1,c=r.x===1,f=Qt[l?"zUp":c?"xUp":"yUp"],{container:a}=o;o.container=void 0,o=JSON.parse(JSON.stringify(o)),o.container=a;const p=l?Nt:c?Zt:H;At.forEach((m,S)=>{o[m]&&(o[p[S]]=o[m])});const u={enabled:!0,color:16777215,opacity:1,scale:.7,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:t?16777215:9688043,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}}},h={line:!1,scale:t?.45:.7,hover:{scale:t?.5:.7}},w={type:e,container:document.body,size:128,placement:"top-right",resolution:i,lineWidth:4,radius:t?1:n?.3:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:t?16777215:14739180,opacity:t?0:1,hover:{color:t?16777215:14739180,opacity:t?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!t,color:t?15915362:16777215,opacity:1,scale:t?.15:.2,radius:1,smoothness:18,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:.225}},edges:{enabled:!t,color:t?15915362:n?15658734:16777215,opacity:t?1:0,radius:t?1:.125,smoothness:18,scale:t?.15:1,hover:{color:t?16777215:9688043,opacity:1,scale:t?.2:1}},x:{...W(u),...t?{label:"X",color:16725587,line:!0}:{label:f.x}},y:{...W(u),...t?{label:"Y",color:9100032,line:!0}:{label:f.y}},z:{...W(u),...t?{label:"Z",color:2920447,line:!0}:{label:f.z}},nx:{...W(h),label:t?"":f.nx},ny:{...W(h),label:t?"":f.ny},nz:{...W(h),label:t?"":f.nz}};if(dt(o,w),n){const m=o;m.edges.radius=m.radius,m.edges.scale=1,m.edges.opacity=1,m.edges.hover.scale=1,m.edges.hover.opacity=1,m.corners.radius=m.radius,m.corners.scale=1,m.corners.opacity=1,m.corners.hover.scale=1,m.corners.hover.opacity=1,m.radius=0,H.forEach(S=>{m[S].scale=1,m[S].opacity=1,m[S].hover.scale=1,m[S].hover.opacity=1})}return Et.forEach(m=>dt(o[`n${m}`],W(o[m]))),{...o,isSphere:t}};function dt(o,...e){if(o instanceof HTMLElement||typeof o!="object"||o===null)return o;for(const t of e)for(const n in t)n!=="container"&&n in t&&(o[n]===void 0?o[n]=t[n]:typeof t[n]=="object"&&!Array.isArray(t[n])&&(o[n]=dt(o[n]||{},t[n])));return o}const $t=(o,e=2)=>{const t=new s.Color,n=e*2,{isSphere:i,resolution:r,radius:l,font:c,corners:d,edges:f}=o,a=H.map(y=>({...o[y],radius:l}));i&&d.enabled&&a.push(d),i&&f.enabled&&a.push(f);const p=document.createElement("canvas"),u=p.getContext("2d");p.width=r*2+n*2,p.height=r*a.length+n*a.length;const[h,w]=C(a,r,c);a.forEach(({radius:y,label:A,color:G,labelColor:x,border:E,hover:{color:O,labelColor:D,border:F}},V)=>{const j=r*V+V*n+e;v(e,j,e,r,y,A,E,G,x),v(r+e*3,j,e,r,y,A,F??E,O??G,D??x)});const m=a.length,S=e/(r*2),M=e/(r*6),L=1/m,_=new s.CanvasTexture(p);return _.repeat.set(.5-2*S,L-2*M),_.offset.set(S,1-M),Object.assign(_,{colorSpace:s.SRGBColorSpace,wrapS:s.RepeatWrapping,wrapT:s.RepeatWrapping,userData:{offsetX:S,offsetY:M,cellHeight:L}}),_;function v(y,A,G,x,E,O,D,F,V){if(E=E*(x/2),F!=null&&F!==""&&(j(),u.fillStyle=t.set(F).getStyle(),u.fill()),D&&D.size){const Q=D.size*x/2;y+=Q,A+=Q,x-=D.size*x,E=Math.max(0,E-Q),j(),u.strokeStyle=t.set(D.color).getStyle(),u.lineWidth=D.size*x,u.stroke()}O&&g(u,y+x/2,A+(x+G)/2,O,t.set(V).getStyle());function j(){u.beginPath(),u.moveTo(y+E,A),u.lineTo(y+x-E,A),u.arcTo(y+x,A,y+x,A+E,E),u.lineTo(y+x,A+x-E),u.arcTo(y+x,A+x,y+x-E,A+x,E),u.lineTo(y+E,A+x),u.arcTo(y,A+x,y,A+x-E,E),u.lineTo(y,A+E),u.arcTo(y,A,y+E,A,E),u.closePath()}}function C(y,A,G){const E=[...y].sort((it,he)=>{var Ft,Vt;return(((Ft=it.label)==null?void 0:Ft.length)||0)-(((Vt=he.label)==null?void 0:Vt.length)||0)}).pop().label,{family:O,weight:D}=G,F=i?Math.sqrt(Math.pow(A*.7,2)/2):A;let V=F;o.font.size>0&&(V=o.font.size);let j=0,Q=0;do{u.font=`${D} ${V}px ${O}`;const it=u.measureText(E);j=it.width,Q=it.fontBoundingBoxDescent,V--}while(j>F&&V>0);const Gt=F/Q,fe=Math.min(F/j,Gt),pe=Math.floor(V*fe);return[`${D} ${pe}px ${O}`,Gt]}function g(y,A,G,x,E){y.font=h,y.textAlign="center",y.textBaseline="middle",y.fillStyle=E,y.fillText(x,A,G+(i?w:0))}},Yt=(o,e)=>o.offset.x=(e?.5:0)+o.userData.offsetX,ft=(o,e)=>{const{offset:t,userData:{offsetY:n,cellHeight:i}}=o;t.y=1-(e+1)*i+n};function pt(o,e,t=2,n=2){const i=t/2-o,r=n/2-o,l=o/t,c=(t-o)/t,d=o/n,f=(n-o)/n,a=[i,r,0,-i,r,0,-i,-r,0,i,-r,0],p=[c,f,l,f,l,d,c,d],u=[3*(e+1)+3,3*(e+1)+4,e+4,e+5,2*(e+1)+4,2,1,2*(e+1)+3,3,4*(e+1)+3,4,0],h=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(g=>u[g]);let w,m,S,M,L,_,v,C;for(let g=0;g<4;g++){M=g<1||g>2?i:-i,L=g<2?r:-r,_=g<1||g>2?c:l,v=g<2?f:d;for(let y=0;y<=e;y++)w=Math.PI/2*(g+y/e),m=Math.cos(w),S=Math.sin(w),a.push(M+o*m,L+o*S,0),p.push(_+l*m,v+d*S),y<e&&(C=(e+1)*g+y+4,h.push(g,C,C+1))}return new s.BufferGeometry().setIndex(new s.BufferAttribute(new Uint32Array(h),1)).setAttribute("position",new s.BufferAttribute(new Float32Array(a),3)).setAttribute("uv",new s.BufferAttribute(new Float32Array(p),2))}const Jt=(o,e)=>{const t=new s.Vector3,{isSphere:n,radius:i,smoothness:r,type:l}=o,d=l==="rounded-cube"?2-o.edges.radius*2:2,f=pt(i,r,d,d);return H.map((a,p)=>{const u=p<3,h=H[p],w=p?e.clone():e;ft(w,p);const{enabled:m,scale:S,opacity:M,hover:L}=o[h],_={map:w,opacity:M,transparent:!0},v=n?new s.Sprite(new s.SpriteMaterial(_)):new s.Mesh(f,new s.MeshBasicMaterial(_)),C=u?h:h[1];if(v.position[C]=(u?1:-1)*(n?Mt:1),!n){v.lookAt(t.copy(v.position).multiplyScalar(1.7));const g=s.Object3D.DEFAULT_UP.z===1,y=s.Object3D.DEFAULT_UP.x===1;(g||y)&&(h==="z"&&g||h==="x"&&y?v.rotateZ(-Math.PI/2):(h==="nz"&&g||h==="nx"&&y)&&v.rotateZ(Math.PI/2))}return v.scale.setScalar(S),v.renderOrder=1,v.visible=m,v.userData={scale:S,opacity:M,hover:L,kind:"face",axes:[H[p]],face:At[p]},v})},Kt=(o,e)=>{const{isSphere:t,corners:n,type:i}=o,r=i==="rounded-cube";if(!n.enabled)return[];const{color:l,opacity:c,scale:d,radius:f,smoothness:a,hover:p}=n,u=t?null:r?new s.SphereGeometry(f,a*2,a):pt(f,a),h={transparent:!0,opacity:c},w=r?1-f:.85,m=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(M=>M*w),S=new s.Vector3;return Array(m.length/3).fill(0).map((M,L)=>{if(t){const g=e.clone();ft(g,6),h.map=g}else h.color=l;const _=t?new s.Sprite(new s.SpriteMaterial(h)):new s.Mesh(u,new s.MeshBasicMaterial(h)),v=L*3;_.position.set(m[v],m[v+1],m[v+2]),t&&_.position.normalize().multiplyScalar(1.7),_.scale.setScalar(d),_.lookAt(S.copy(_.position).multiplyScalar(2)),_.renderOrder=1;const C=[_.position.x>0?"x":"nx",_.position.y>0?"y":"ny",_.position.z>0?"z":"nz"];return _.userData={color:l,opacity:c,scale:d,hover:p,intersectionOrder:1,kind:"corner",axes:C},_})},ht=(o,e,t)=>o===0?null:o>0?e:t,te=(o,e,t)=>{const{isSphere:n,edges:i,type:r}=o,l=r==="rounded-cube";if(!i.enabled)return[];const{color:c,opacity:d,scale:f,hover:a,radius:p,smoothness:u}=i,h=l?2-p*2:1.2,w=n?null:l?new s.CylinderGeometry(p,p,h,u*4):pt(p,u,h,.25),m={transparent:!0,opacity:d},S=l?1-p:.925,M=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(v=>v*S),L=new s.Vector3,_=new s.Vector3(0,1,0);return Array(M.length/3).fill(0).map((v,C)=>{if(n){const O=e.clone();ft(O,t),m.map=O}else m.color=c;const g=n?new s.Sprite(new s.SpriteMaterial(m)):new s.Mesh(w,new s.MeshBasicMaterial(m)),y=C*3;g.position.set(M[y],M[y+1],M[y+2]),n&&g.position.normalize().multiplyScalar(1.7),g.scale.setScalar(f),g.up.copy(_),g.lookAt(L.copy(g.position).multiplyScalar(2)),l?(!n&&!g.position.z&&(g.rotation.z=Math.PI),!n&&!g.position.x&&(g.rotation.x=0),!n&&!g.position.x&&(g.rotation.z=Math.PI/2)):!n&&!g.position.y&&(g.rotation.z=Math.PI/2),g.renderOrder=1;const A=ht(g.position.x,"x","nx"),G=ht(g.position.y,"y","ny"),x=ht(g.position.z,"z","nz"),E=[A,G,x].filter(O=>O!==null);return g.userData={color:c,opacity:d,scale:f,hover:a,kind:"edge",axes:E},g})};function ee(o,e=!1){const t=o[0].index!==null,n=new Set(Object.keys(o[0].attributes)),i=new Set(Object.keys(o[0].morphAttributes)),r={},l={},c=o[0].morphTargetsRelative,d=new s.BufferGeometry;let f=0;for(let a=0;a<o.length;++a){const p=o[a];let u=0;if(t!==(p.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const h in p.attributes){if(!n.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;r[h]===void 0&&(r[h]=[]),r[h].push(p.attributes[h]),u++}if(u!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(c!==p.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const h in p.morphAttributes){if(!i.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;l[h]===void 0&&(l[h]=[]),l[h].push(p.morphAttributes[h])}if(e){let h;if(t)h=p.index.count;else if(p.attributes.position!==void 0)h=p.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;d.addGroup(f,h,a),f+=h}}if(t){let a=0;const p=[];for(let u=0;u<o.length;++u){const h=o[u].index;for(let w=0;w<h.count;++w)p.push(h.getX(w)+a);a+=o[u].attributes.position.count}d.setIndex(p)}for(const a in r){const p=Ut(r[a]);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;d.setAttribute(a,p)}for(const a in l){const p=l[a][0].length;if(p===0)break;d.morphAttributes=d.morphAttributes||{},d.morphAttributes[a]=[];for(let u=0;u<p;++u){const h=[];for(let m=0;m<l[a].length;++m)h.push(l[a][m][u]);const w=Ut(h);if(!w)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;d.morphAttributes[a].push(w)}}return d}function Ut(o){let e,t,n,i=-1,r=0;for(let f=0;f<o.length;++f){const a=o[f];if(e===void 0&&(e=a.array.constructor),e!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=a.itemSize),t!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=a.normalized),n!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=a.gpuType),i!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=a.count*t}const l=new e(r),c=new s.BufferAttribute(l,t,n);let d=0;for(let f=0;f<o.length;++f){const a=o[f];if(a.isInterleavedBufferAttribute){const p=d/t;for(let u=0,h=a.count;u<h;u++)for(let w=0;w<t;w++){const m=a.getComponent(u,w);c.setComponent(u+p,w,m)}}else l.set(a.array,d);d+=a.count*t}return i!==void 0&&(c.gpuType=i),c}const ne=(o,e)=>{const{isSphere:t,background:{enabled:n,color:i,opacity:r,hover:l}}=e;let c;const d=new s.MeshBasicMaterial({color:i,side:s.BackSide,opacity:r,transparent:!0,depthWrite:!1});if(!n)return null;if(t)c=new s.Mesh(new s.SphereGeometry(1.8,64,64),d);else{let f;o.forEach(a=>{const p=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const u=a.geometry.clone();u.applyMatrix4(a.matrix),f=f?ee([f,u]):u,a.scale.setScalar(p)}),c=new s.Mesh(f,d)}return c.userData={color:i,opacity:r,hover:l},c},Tt=new s.Box3,Y=new s.Vector3;class Bt extends s.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new s.Float32BufferAttribute(e,3)),this.setAttribute("uv",new s.Float32BufferAttribute(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceEnd",new s.InterleavedBufferAttribute(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new s.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceColorStart",new s.InterleavedBufferAttribute(n,3,0)),this.setAttribute("instanceColorEnd",new s.InterleavedBufferAttribute(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.WireframeGeometry(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new s.Box3);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Tt.setFromBufferAttribute(t),this.boundingBox.union(Tt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new s.Sphere),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let r=0,l=e.count;r<l;r++)Y.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Y)),Y.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Y));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}s.UniformsLib.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},s.ShaderLib.line={uniforms:s.UniformsUtils.merge([s.UniformsLib.common,s.UniformsLib.fog,s.UniformsLib.line]),vertexShader:`
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
		`};class mt extends s.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:s.UniformsUtils.clone(s.ShaderLib.line.uniforms),vertexShader:s.ShaderLib.line.vertexShader,fragmentShader:s.ShaderLib.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const gt=new s.Vector4,Lt=new s.Vector3,Ot=new s.Vector3,z=new s.Vector4,U=new s.Vector4,P=new s.Vector4,yt=new s.Vector3,_t=new s.Matrix4,T=new s.Line3,Ct=new s.Vector3,J=new s.Box3,K=new s.Sphere,I=new s.Vector4;let R,q;function Dt(o,e,t){return I.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),I.multiplyScalar(1/I.w),I.x=q/t.width,I.y=q/t.height,I.applyMatrix4(o.projectionMatrixInverse),I.multiplyScalar(1/I.w),Math.abs(Math.max(I.x,I.y))}function ie(o,e){const t=o.matrixWorld,n=o.geometry,i=n.attributes.instanceStart,r=n.attributes.instanceEnd,l=Math.min(n.instanceCount,i.count);for(let c=0,d=l;c<d;c++){T.start.fromBufferAttribute(i,c),T.end.fromBufferAttribute(r,c),T.applyMatrix4(t);const f=new s.Vector3,a=new s.Vector3;R.distanceSqToSegment(T.start,T.end,a,f),a.distanceTo(f)<q*.5&&e.push({point:a,pointOnLine:f,distance:R.origin.distanceTo(a),object:o,face:null,faceIndex:c,uv:null,uv1:null})}}function oe(o,e,t){const n=e.projectionMatrix,r=o.material.resolution,l=o.matrixWorld,c=o.geometry,d=c.attributes.instanceStart,f=c.attributes.instanceEnd,a=Math.min(c.instanceCount,d.count),p=-e.near;R.at(1,P),P.w=1,P.applyMatrix4(e.matrixWorldInverse),P.applyMatrix4(n),P.multiplyScalar(1/P.w),P.x*=r.x/2,P.y*=r.y/2,P.z=0,yt.copy(P),_t.multiplyMatrices(e.matrixWorldInverse,l);for(let u=0,h=a;u<h;u++){if(z.fromBufferAttribute(d,u),U.fromBufferAttribute(f,u),z.w=1,U.w=1,z.applyMatrix4(_t),U.applyMatrix4(_t),z.z>p&&U.z>p)continue;if(z.z>p){const _=z.z-U.z,v=(z.z-p)/_;z.lerp(U,v)}else if(U.z>p){const _=U.z-z.z,v=(U.z-p)/_;U.lerp(z,v)}z.applyMatrix4(n),U.applyMatrix4(n),z.multiplyScalar(1/z.w),U.multiplyScalar(1/U.w),z.x*=r.x/2,z.y*=r.y/2,U.x*=r.x/2,U.y*=r.y/2,T.start.copy(z),T.start.z=0,T.end.copy(U),T.end.z=0;const m=T.closestPointToPointParameter(yt,!0);T.at(m,Ct);const S=s.MathUtils.lerp(z.z,U.z,m),M=S>=-1&&S<=1,L=yt.distanceTo(Ct)<q*.5;if(M&&L){T.start.fromBufferAttribute(d,u),T.end.fromBufferAttribute(f,u),T.start.applyMatrix4(l),T.end.applyMatrix4(l);const _=new s.Vector3,v=new s.Vector3;R.distanceSqToSegment(T.start,T.end,v,_),t.push({point:v,pointOnLine:_,distance:R.origin.distanceTo(v),object:o,face:null,faceIndex:u,uv:null,uv1:null})}}}class se extends s.Mesh{constructor(e=new Bt,t=new mt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let l=0,c=0,d=t.count;l<d;l++,c+=2)Lt.fromBufferAttribute(t,l),Ot.fromBufferAttribute(n,l),i[c]=c===0?0:i[c-1],i[c+1]=i[c]+Lt.distanceTo(Ot);const r=new s.InstancedInterleavedBuffer(i,2,1);return e.setAttribute("instanceDistanceStart",new s.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new s.InterleavedBufferAttribute(r,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;R=e.ray;const l=this.matrixWorld,c=this.geometry,d=this.material;q=d.linewidth+r,c.boundingSphere===null&&c.computeBoundingSphere(),K.copy(c.boundingSphere).applyMatrix4(l);let f;if(n)f=q*.5;else{const p=Math.max(i.near,K.distanceToPoint(R.origin));f=Dt(i,p,d.resolution)}if(K.radius+=f,R.intersectsSphere(K)===!1)return;c.boundingBox===null&&c.computeBoundingBox(),J.copy(c.boundingBox).applyMatrix4(l);let a;if(n)a=q*.5;else{const p=Math.max(i.near,J.distanceToPoint(R.origin));a=Dt(i,p,d.resolution)}J.expandByScalar(a),R.intersectsBox(J)!==!1&&(n?ie(this,t):oe(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(gt),this.material.uniforms.resolution.value.set(gt.z,gt.w))}}class Pt extends Bt{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setColors(n),this}setFromPoints(e){const t=e.length-1,n=new Float32Array(6*t);for(let i=0;i<t;i++)n[6*i]=e[i].x,n[6*i+1]=e[i].y,n[6*i+2]=e[i].z||0,n[6*i+3]=e[i+1].x,n[6*i+4]=e[i+1].y,n[6*i+5]=e[i+1].z||0;return super.setPositions(n),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class re extends se{constructor(e=new Pt,t=new mt({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const ae=o=>{const e=new s.Color,t=[],n=[],{isSphere:i}=o;if(H.forEach((c,d)=>{const{enabled:f,line:a,scale:p,color:u}=o[c];if(!f||!a)return;const h=d<3?1:-1,m=(i?Mt-p/2:.975)*h;t.push(c.includes("x")?m:0,c.includes("y")?m:0,c.includes("z")?m:0,0,0,0);const S=e.set(u).toArray();n.push(...S,...S)}),!t.length)return null;const r=new Pt().setPositions(t).setColors(n),l=new mt({linewidth:o.lineWidth,vertexColors:!0,resolution:new s.Vector2(window.innerWidth,window.innerHeight)});return new re(r,l).computeLineDistances()},ce=o=>{const{corners:e,edges:t}=o,n=[],i=$t(o),r=Jt(o,i);n.push(...r),e.enabled&&n.push(...Kt(o,i)),t.enabled&&n.push(...te(o,i,e.enabled?7:6));const l=ne(r,o),c=ae(o);return[n,l,c]},X=(o,e=!0)=>{const{material:t,userData:n}=o,{opacity:i,color:r,scale:l}=e?n.hover:n;o.scale.setScalar(l),t.opacity=i,t.map?Yt(t.map,e):t.color.set(r)},le=new s.Vector3;function Z(o){if(!o)return{kind:null,axes:null,face:null,direction:null};const e=o.userData;return{kind:e.kind??null,axes:e.axes??null,face:e.face??null,direction:le.copy(o.position).normalize().clone()}}const tt=new s.Matrix4,It=new s.Spherical,ue=new s.Vector2,N=new s.Vector3,Rt=new s.Vector4,et=new s.Quaternion().setFromAxisAngle(new s.Vector3(0,0,1),Math.PI/2),nt=new s.Quaternion().setFromAxisAngle(new s.Vector3(0,0,1),-Math.PI/2);class de extends s.Object3D{constructor(t,n,i={}){super();b(this,"enabled",!0);b(this,"camera");b(this,"renderer");b(this,"options");b(this,"target",new s.Vector3);b(this,"animated",!0);b(this,"speed",1);b(this,"animating",!1);b(this,"_options");b(this,"_intersections");b(this,"_background",null);b(this,"_viewport",[0,0,0,0]);b(this,"_originalViewport",[0,0,0,0]);b(this,"_originalScissor",[0,0,0,0]);b(this,"_scene");b(this,"_camera");b(this,"_container");b(this,"_domElement");b(this,"_domRect");b(this,"_dragging",!1);b(this,"_distance",0);b(this,"_lastAnimateTimeSeconds",null);b(this,"_targetQuaternion",new s.Quaternion);b(this,"_quaternionStart",new s.Quaternion);b(this,"_quaternionEnd",new s.Quaternion);b(this,"_pointerStart",new s.Vector2);b(this,"_focus",null);b(this,"_placement");b(this,"_controls");b(this,"_controlsListeners");this.camera=t,this.renderer=n,this._scene=new s.Scene().add(this),this.set(i)}get placement(){return this._placement}set placement(t){this._placement=k(this._domElement,t),this.domUpdate()}set(t={}){this.dispose(),this.options=t,this._options=Xt(t),this._camera=this._options.isSphere?new s.OrthographicCamera(-1.8,1.8,1.8,-1.8,5,10):new s.PerspectiveCamera(26,1,5,10),this._camera.position.set(0,0,7);const[n,i,r]=ce(this._options);i&&this.add(i),r&&this.add(r),this.add(...n),this._background=i,this._intersections=n;const{container:l,animated:c,speed:d}=this._options;return this.animated=c,this.speed=d,this._container=l?kt(l):document.body,this._domElement=jt(this._options),this._domElement.onpointerdown=f=>this._onPointerDown(f),this._domElement.onpointermove=f=>this._onPointerMove(f),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:n}=this,i=t.getScissorTest(),r=t.autoClear;return t.autoClear=!1,t.setViewport(...n),i&&t.setScissor(...n),t.clear(!1,!0,!1),t.render(this._scene,this._camera),t.setViewport(...this._originalViewport),i&&t.setScissor(...this._originalScissor),t.autoClear=r,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,n=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.splice(0,4,n.left-i.left,t.domElement.clientHeight-(n.top-i.top+n.height),n.width,n.height),t.getViewport(Rt).toArray(this._originalViewport),t.getScissorTest()&&t.getScissor(Rt).toArray(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new s.Vector3().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(n=>{var r,l,c,d;this.remove(n);const i=n;(r=i.material)==null||r.dispose(),(c=(l=i.material)==null?void 0:l.map)==null||c.dispose(),(d=i.geometry)==null||d.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),bt(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:n}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),n.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this._lastAnimateTimeSeconds=null,this.dispatchEvent({type:"change",...Z(null)}),this.dispatchEvent({type:"end"});return}this._controls&&(this._controls.enabled=!1);const i=performance.now()/1e3,r=this._lastAnimateTimeSeconds===null?0:i-this._lastAnimateTimeSeconds;this._lastAnimateTimeSeconds=i;const l=r*qt*this.speed;if(this._quaternionStart.rotateTowards(this._quaternionEnd,l),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),n.rotateTowards(this._targetQuaternion,l),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change",...Z(null)})),this._quaternionStart.angleTo(this._quaternionEnd)<$){if(this._controls){const c=this.camera.position.clone().sub(this.target).normalize();s.Object3D.DEFAULT_UP.z===1&&Math.abs(c.z)>.99?this.camera.position.set(0,-1e-6,this.camera.position.z):s.Object3D.DEFAULT_UP.x===1&&Math.abs(c.x)>.99&&this.camera.position.set(this.camera.position.x,$,0),this._controls.update(),this._controls.enabled=!0}this.animating=!1,this._lastAnimateTimeSeconds=null,this.dispatchEvent({type:"end"})}}_setOrientation(t){const n=this.camera,i=this.target;if(N.copy(t).multiplyScalar(this._distance),tt.setPosition(N).lookAt(N,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(tt),N.add(i),tt.lookAt(N,i,this.up),this._quaternionEnd.setFromRotationMatrix(tt),this._quaternionStart.copy(n.quaternion),s.Object3D.DEFAULT_UP.z===1&&Math.abs(t.z)>.99){const r=Math.sign(t.z);this._targetQuaternion.multiply(r===1?nt:et),this._quaternionEnd.multiply(r===1?nt:et)}else if(s.Object3D.DEFAULT_UP.x===1&&Math.abs(t.x)>.99){const r=Math.sign(t.x);this._targetQuaternion.multiply(r===1?nt:et),this._quaternionEnd.multiply(r===1?nt:et)}this.animating=!0,this._lastAnimateTimeSeconds=null,this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const n=f=>{if(!this._dragging){if(Wt(f,this._pointerStart))return;this._dragging=!0}const a=ue.set(f.clientX,f.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),p=this.coordinateConversion(N.subVectors(this.camera.position,this.target)),u=It.setFromVector3(p);u.theta=c-a.x,u.phi=ot(d-a.y,$,Math.PI-$),this.coordinateConversion(this.camera.position.setFromSpherical(u),!0).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change",...Z(null)})},i=()=>{if(document.removeEventListener("pointermove",n,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&(X(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const r=this.coordinateConversion(N.subVectors(this.camera.position,this.target)),l=It.setFromVector3(r),c=l.theta,d=l.phi;this._distance=l.radius,document.addEventListener("pointermove",n,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}coordinateConversion(t,n=!1){const{x:i,y:r,z:l}=t,c=s.Object3D.DEFAULT_UP;return c.x===1?n?t.set(r,l,i):t.set(l,i,r):c.z===1?n?t.set(l,i,r):t.set(r,l,i):t}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&zt(this._background,!0),this._handleHover(t))}_onPointerLeave(){if(!this.enabled||this._dragging)return;this._background&&zt(this._background,!1);const t=this._focus!==null;this._focus&&(X(this._focus,!1),this._focus=null),this._domElement.style.cursor="",t&&this.dispatchEvent({type:"hoverchange",object:null,...Z(null)})}_handleClick(t){const n=xt(t,this._domRect,this._camera,this._intersections);this._focus&&(X(this._focus,!1),this._focus=null),n&&(this._setOrientation(n.object.position),this.dispatchEvent({type:"change",...Z(n.object)}))}_handleHover(t){const n=xt(t,this._domRect,this._camera,this._intersections),i=(n==null?void 0:n.object)||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&X(this._focus,!1),(this._focus=i)?X(i,!0):bt(this._options,this._intersections,this.camera),this.dispatchEvent({type:"hoverchange",object:i,...Z(i)}))}}B.ViewportGizmo=de,Object.defineProperty(B,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=three-viewport-gizmo.umd.cjs.map
