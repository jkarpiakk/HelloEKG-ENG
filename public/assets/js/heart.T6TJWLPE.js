var H=i=>[1,3,5].map(t=>parseInt(i.slice(t,t+2),16)/255),O=H("#175A42"),B=H("#2BB380"),Y=H("#3EE6A8"),U=H("#66F2C4"),T=(i,t,v)=>i.map((u,y)=>u+(t[y]-u)*v);function N(i){let t=i/4920,v=[],u=[],y=()=>(Math.random()-.5)*.045,z=(s,a,l,e)=>{v.push(s+y(),a+y(),l+y()),u.push(e[0],e[1],e[2])},F=s=>T(T(O,Y,Math.max(0,Math.min(1,(s+1)/1.7))),B,Math.random()*.3),f,d,r,A,_,P,b;for(f=0;f<2100*t;f++)d=Math.random(),r=Math.random()*Math.PI*2,P=.5-1.4*d,A=.72*Math.pow(1-d,.55)*(1+.08*Math.sin(r*2)),_=Math.cos(r)*A-.3*d+.12,b=Math.sin(r)*A*.8,z(_,P,b,F(P));for(f=0;f<900*t;f++)d=Math.random()*.72,r=Math.random()*Math.PI*2,P=.42-1.1*d,A=.44*Math.pow(1-d/.72,.5),_=.52+Math.cos(r)*A-.18*d,b=.12+Math.sin(r)*A*.75,z(_,P,b,F(P));let R=(s,a,l,e,c,M,o)=>{for(let n=0;n<o*t;n++){let h=Math.acos(2*Math.random()-1),p=Math.random()*Math.PI*2;z(s+Math.sin(h)*Math.cos(p)*e,a+Math.cos(h)*c,l+Math.sin(h)*Math.sin(p)*M,F(a))}};R(-.18,.55,-.18,.34,.28,.3,420),R(.42,.5,-.05,.3,.24,.26,350),R(-.05,.62,.22,.22,.18,.18,200);let x=[[.02,.55,0],[.06,.95,.02],[-.08,1.22,-.02],[-.42,1.28,-.08],[-.66,1.05,-.12],[-.72,.7,-.14]],w=(s,a,l,e,c)=>a.map((M,o)=>.5*(2*a[o]+(-s[o]+l[o])*c+(2*s[o]-5*a[o]+4*l[o]-e[o])*c*c+(-s[o]+3*a[o]-3*l[o]+e[o])*c*c*c)),S=s=>{let a=x.length-1,l=s*a,e=Math.min(a-1,Math.floor(l)),c=l-e,M=o=>x[Math.max(0,Math.min(a,o))];return w(M(e-1),M(e),M(e+1),M(e+2),c)};for(f=0;f<950*t;f++){let s=Math.random(),a=S(s),l=S(Math.min(1,s+.01)),e=S(Math.max(0,s-.01)),c=l.map((m,g)=>m-e[g]),M=Math.hypot(...c)||1,o=c.map(m=>m/M),n=Math.abs(o[1])>.9?[1,0,0]:[0,1,0],h=(m,g)=>[m[1]*g[2]-m[2]*g[1],m[2]*g[0]-m[0]*g[2],m[0]*g[1]-m[1]*g[0]],p=m=>{let g=Math.hypot(...m)||1;return m.map(L=>L/g)},C=p(h(o,n)),I=p(h(o,C));r=Math.random()*Math.PI*2;let E=.13*(1-.25*s),D=T(U,B,Math.random()*.4);z(a[0]+(C[0]*Math.cos(r)+I[0]*Math.sin(r))*E,a[1]+(C[1]*Math.cos(r)+I[1]*Math.sin(r))*E,a[2]+(C[2]*Math.cos(r)+I[2]*Math.sin(r))*E,D)}return{P:new Float32Array(v),C:new Float32Array(u)}}var q=`
attribute vec3 aPos; attribute vec3 aCol;
uniform float uRotY, uScale, uHalfH, uSize;
varying vec3 vCol; varying float vDepth;
void main(){
  // brand transform: tilt (rot.z -0.18), drop 0.12, scale, spin around Y
  float cz = cos(-0.18), sz = sin(-0.18);
  vec3 p = vec3(aPos.x * cz - aPos.y * sz, aPos.x * sz + aPos.y * cz, aPos.z);
  p.y -= 0.12;
  p *= uScale;
  float cy = cos(uRotY), sy = sin(uRotY);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  // camera at (0, 0.15, 4.6), fov 38\xB0
  float zc = 4.6 - p.z;
  float f = 2.9042;
  gl_Position = vec4(f * p.x / zc, f * (p.y - 0.15) / zc, 0.0, 1.0);
  gl_PointSize = uSize * uHalfH / zc;
  vCol = aCol; vDepth = clamp((p.z + 1.2) / 2.4, 0.0, 1.0);
}`,V=`
precision mediump float;
varying vec3 vCol; varying float vDepth;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float a = 0.95 * smoothstep(0.25, 0.1, r) * (0.62 + 0.38 * vDepth);
  gl_FragColor = vec4(vCol, a);
}`;function j(i){let t=i.getContext("webgl",{alpha:!0,antialias:!0,premultipliedAlpha:!1});if(!t)return null;let v=(n,h)=>{let p=t.createShader(n);return t.shaderSource(p,h),t.compileShader(p),p},u=t.createProgram();if(t.attachShader(u,v(t.VERTEX_SHADER,q)),t.attachShader(u,v(t.FRAGMENT_SHADER,V)),t.linkProgram(u),!t.getProgramParameter(u,t.LINK_STATUS))return null;t.useProgram(u);let y=Math.min(innerWidth,innerHeight)<700,{P:z,C:F}=N(y?3600:8200),f=(n,h)=>{let p=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,p),t.bufferData(t.ARRAY_BUFFER,n,t.STATIC_DRAW);let C=t.getAttribLocation(u,h);t.enableVertexAttribArray(C),t.vertexAttribPointer(C,3,t.FLOAT,!1,0,0)};f(z,"aPos"),f(F,"aCol");let d=z.length/3,r=n=>t.getUniformLocation(u,n),A=r("uRotY"),_=r("uScale"),P=r("uHalfH"),b=r("uSize");t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.clearColor(0,0,0,0);let R=matchMedia("(prefers-reduced-motion: reduce)").matches,x=-10,w=0,S=!1,s=performance.now();function a(){let n=Math.min(devicePixelRatio||1,2),h=i.getBoundingClientRect();i.width=Math.round(h.width*n),i.height=Math.round(h.height*n),t.viewport(0,0,i.width,i.height),t.uniform1f(P,i.height/2),t.uniform1f(b,.03)}let l=n=>Math.exp(-(((n-.1)/.042)**2))*.06+Math.exp(-(((n-.28)/.058)**2))*.035;function e(n){let h=(n-s)/1e3;t.clear(t.COLOR_BUFFER_BIT),t.uniform1f(A,R?.4:h*.32),t.uniform1f(_,1.18*(1+(R?0:l(h-x)))),t.drawArrays(t.POINTS,0,d),S&&(w=requestAnimationFrame(e))}a(),new ResizeObserver(a).observe(i);let c=()=>{!S&&!R&&(S=!0,w=requestAnimationFrame(e))},M=()=>{S=!1,cancelAnimationFrame(w)},o=!1;return new IntersectionObserver(([n])=>{o=n.isIntersecting,o?c():M()}).observe(i),document.addEventListener("visibilitychange",()=>document.hidden||!o?M():c()),R&&requestAnimationFrame(e),i.classList.add("is-ready"),{beat(){x=(performance.now()-s)/1e3+.05}}}export{j as mountHeart};
