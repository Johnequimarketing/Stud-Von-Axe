/* Contrast auditor, run in the browser console against a rendered section.
 * Vite serves project root files in dev, so it loads without being copied
 * into `public/`, which would ship a dev tool in the production build:
 *
 *   fetch('/scripts/contrast-audit.js').then(r=>r.text()).then(eval)
 *   __audit('#semen').filter(x => !x.pass)
 *
 * The guards below exist because getting each one wrong produced a false
 * result during the build, in both directions:
 *
 * 1. An element's own background is checked first, by walking ancestors for
 *    the first solid paint. Without it a filled gold button measures its
 *    text against the photograph behind the button, and reads 1.04:1.
 * 2. Text is only treated as sitting on an image when its GLYPH rect
 *    actually intersects the image. Measuring element boxes flags stretched
 *    grid cells whose text is nowhere near the picture.
 * 3. Over a photograph it samples the real pixels and takes the BRIGHTEST
 *    one in the region, not the mean, then composites any gradient overlay
 *    at that element's own height by reading the gradient's own stops.
 * 4. The image behind an element is found by intersection, per element. A
 *    section can hold many (a carousel holds one per card), and taking the
 *    first one measured every later card against the page ground.
 * 5. Invisible text is skipped on two more counts beyond opacity and
 *    visibility: `.visually-hidden` screen reader labels, and anything
 *    clipped out of an `overflow:hidden` ancestor, such as a collapsed
 *    reveal panel. Both keep a real rect and a real colour, and both
 *    produced confident failures for text nobody can see.
 * 6. A gradient layer's colour is its first NON transparent stop. CSS
 *    happily writes the transparent stop first, and taking the literal
 *    first colour function made the hero vignette read as opaque black:
 *    white headings over the photograph reported 21:1 instead of their real
 *    ratio, which is the most flattering possible answer.
 * 7. Colours must be sampled only after transitions settle. Anything with a
 *    colour transition, tab controls especially, gives phantom failures
 *    mid-animation: one label measured 4.41:1 while settling and 8.84:1 at
 *    rest. Allow ~900ms after any click before auditing.
 */

(function(){
function lum(a){const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(a[0])+0.7152*f(a[1])+0.0722*f(a[2])}
function ratio(a,b){const L1=lum(a),L2=lum(b);const hi=Math.max(L1,L2),lo=Math.min(L1,L2);return (hi+0.05)/(lo+0.05)}
function parse(c){const cv=document.createElement('canvas');cv.width=cv.height=1;const x=cv.getContext('2d');x.fillStyle='#000';x.fillStyle=c;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255]}
function over(f,b){const a=f[3];return [f[0]*a+b[0]*(1-a), f[1]*a+b[1]*(1-a), f[2]*a+b[2]*(1-a),1]}
function intersects(a,b){return a.right>b.left && a.left<b.right && a.bottom>b.top && a.top<b.bottom}

const cv=document.createElement('canvas'), ctx=cv.getContext('2d');
/* Brightest real pixel of the image under `rect`, honouring object-fit
   cover and object-position. Worst case, not the mean: light text has to
   survive the lightest part of what is behind it. */
function photoUnder(img, rect){
  const box=img.getBoundingClientRect(), iw=img.naturalWidth, ih=img.naturalHeight;
  if(!iw || !intersects(rect, box)) return null;
  const s=Math.max(box.width/iw, box.height/ih);
  const pos=getComputedStyle(img).objectPosition.split(' ');
  const px=(parseFloat(pos[0])||50)/100, py=(parseFloat(pos[1])||50)/100;
  const ox=(box.width-iw*s)*px, oy=(box.height-ih*s)*py;
  const left=Math.max(rect.left, box.left), top=Math.max(rect.top, box.top);
  const right=Math.min(rect.right, box.right), bottom=Math.min(rect.bottom, box.bottom);
  const sx=Math.max(0,(left-box.left-ox)/s), sy=Math.max(0,(top-box.top-oy)/s);
  const sw=Math.max(1,Math.min(iw-sx,(right-left)/s)), sh=Math.max(1,Math.min(ih-sy,(bottom-top)/s));
  cv.width=14;cv.height=14;
  try{ctx.drawImage(img,sx,sy,sw,sh,0,0,14,14)}catch(e){return null}
  let d;try{d=ctx.getImageData(0,0,14,14).data}catch(e){return null}
  /* BOTH extremes, not just the brightest. Brightest-only was right when
     every photo carried light type (its worst case). Direction D sets dark
     ink over photography, where the worst case is the DARKEST pixel, and
     brightest-only silently flattered it. The caller measures against
     whichever extreme gives the worse ratio for its foreground. */
  let bright=null,bl=-1,dark=null,dl=2;
  for(let i=0;i<d.length;i+=4){
    const p=[d[i],d[i+1],d[i+2],1],L=lum(p);
    if(L>bl){bl=L;bright=p}
    if(L<dl){dl=L;dark=p}
  }
  return bright ? {bright, dark} : null;
}

/* Split a computed background-image into its individual gradient functions.
   A stack like the hero's is three gradients in one property, and treating
   the whole string as one gradient was silently wrong: the hero heading
   measured an unchanging 2.98:1 no matter what its wash was set to. */
function splitGradients(bg){
  const out=[]; let depth=0, start=0;
  for(let i=0;i<bg.length;i++){
    const c=bg[i];
    if(c==='(') depth++;
    else if(c===')') depth--;
    else if(c===',' && depth===0){ out.push(bg.slice(start,i).trim()); start=i+1 }
  }
  out.push(bg.slice(start).trim());
  return out.filter(g=>g.includes('gradient'));
}

/* Top level comma split, for a gradient's own argument list. */
function splitArgs(inner){
  const out=[]; let depth=0, start=0;
  for(let i=0;i<inner.length;i++){
    const c=inner[i];
    if(c==='(') depth++;
    else if(c===')') depth--;
    else if(c===',' && depth===0){ out.push(inner.slice(start,i).trim()); start=i+1 }
  }
  out.push(inner.slice(start).trim());
  return out;
}

function alphaOfStop(stop){
  if(/transparent/.test(stop)) return 0;
  const m=stop.match(/\/\s*([\d.]+)\s*\)/);
  return m ? +m[1] : 1;
}

/* Interpolate one gradient's alpha at a normalized progress t in [0,1]. */
function alphaAlong(args, t){
  const stops=args.map(a=>{
    const pos=a.match(/([\d.]+)%\s*$/);
    return {a:alphaOfStop(a), p:pos? +pos[1]/100 : null};
  });
  if(stops[0].p===null) stops[0].p=0;
  if(stops[stops.length-1].p===null) stops[stops.length-1].p=1;
  /* Fill unspecified positions evenly between known ones. */
  for(let i=1;i<stops.length-1;i++){
    if(stops[i].p===null){
      let j=i; while(stops[j].p===null) j++;
      const span=(stops[j].p-stops[i-1].p)/(j-i+1);
      stops[i].p=stops[i-1].p+span;
    }
  }
  if(t<=stops[0].p) return stops[0].a;
  for(let i=1;i<stops.length;i++){
    if(t<=stops[i].p){
      const span=stops[i].p-stops[i-1].p || 1;
      const k=(t-stops[i-1].p)/span;
      return stops[i-1].a+(stops[i].a-stops[i-1].a)*k;
    }
  }
  return stops[stops.length-1].a;
}

/* One gradient's alpha at a point, approximated: linear gradients project
   the point onto the gradient axis, radial gradients use distance from the
   centre over the stated extent. Approximate on purpose, and honest about
   it: exact CSS gradient rasterisation is not worth reimplementing, but a
   projected linear ramp is close enough to catch a real failure. */
function gradientAlphaAt(grad, box, x, y){
  const open=grad.indexOf('(');
  const head=grad.slice(0,open);
  const args=splitArgs(grad.slice(open+1,grad.lastIndexOf(')')));
  const fx=(x-box.left)/Math.max(1,box.width);
  const fy=(y-box.top)/Math.max(1,box.height);

  if(/radial/.test(head)){
    let cx=0.5, cy=0.5, rx=0.6, ry=0.6, rest=args;
    const first=args[0];
    if(/at\s/.test(first)){
      const at=first.split(/\bat\b/);
      const size=at[0].trim().match(/([\d.]+)%\s+([\d.]+)%/);
      if(size){ rx=+size[1]/100; ry=+size[2]/100 }
      const pos=at[1].trim().match(/([\d.]+)%\s+([\d.]+)%/);
      if(pos){ cx=+pos[1]/100; cy=+pos[2]/100 }
      rest=args.slice(1);
    }
    const d=Math.sqrt(((fx-cx)/rx)**2 + ((fy-cy)/ry)**2);
    return alphaAlong(rest, Math.min(1,d));
  }

  let angle=180, rest=args;
  const m=args[0].match(/^(-?[\d.]+)deg$/);
  if(m){ angle=+m[1]; rest=args.slice(1) }
  else if(/^to\s/.test(args[0])){
    const dir=args[0];
    angle = /bottom/.test(dir) ? 180 : /top/.test(dir) ? 0 : /right/.test(dir) ? 90 : 270;
    rest=args.slice(1);
  }
  /* 0deg points up, so progress runs from the bottom edge. */
  const rad=(angle-90)*Math.PI/180;
  const ux=Math.cos(rad), uy=Math.sin(rad);
  const t=0.5 + ((fx-0.5)*ux + (fy-0.5)*uy);
  return alphaAlong(rest, Math.max(0,Math.min(1,t)));
}

/* The rect of the actual glyphs, not the element box. A grid cell can
   stretch far past its text, which makes text look as if it sits on a
   photograph it never touches. */
function glyphRect(el){
  const range=document.createRange();
  let best=null;
  for(const n of el.childNodes){
    if(n.nodeType!==3 || !n.textContent.trim()) continue;
    range.selectNodeContents(n);
    const r=range.getBoundingClientRect();
    if(!r.width && !r.height) continue;
    best = best ? {
      left:Math.min(best.left,r.left), top:Math.min(best.top,r.top),
      right:Math.max(best.right,r.right), bottom:Math.max(best.bottom,r.bottom),
    } : {left:r.left, top:r.top, right:r.right, bottom:r.bottom};
  }
  if(!best) return el.getBoundingClientRect();
  return {...best, width:best.right-best.left, height:best.bottom-best.top};
}

/* Is the element clipped out of view by an overflow:hidden ancestor? */
function clippedOut(el){
  const r=glyphRect(el);
  if(!r.width && !r.height) return true;
  let n=el.parentElement;
  while(n && n!==document.documentElement){
    const cs=getComputedStyle(n);
    if(cs.overflow!=='visible' || cs.overflowY!=='visible' || cs.overflowX!=='visible'){
      const b=n.getBoundingClientRect();
      const overlapH=Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top);
      const overlapW=Math.min(r.right,b.right)-Math.max(r.left,b.left);
      if(overlapH<=1 || overlapW<=1) return true;
    }
    n=n.parentElement;
  }
  return false;
}

function bgOf(el, section){
  const rect=glyphRect(el);
  /* The image behind THIS element, not the section's first one. A carousel
     has one photograph per card, and assuming the first meant every card
     after the first was measured against the page ground instead of its own
     picture, which silently passed everything. */
  const img=[...section.querySelectorAll('img')].find((candidate) =>
    intersects(rect, candidate.getBoundingClientRect()),
  ) || null;
  const layers=[];
  let n=el, opaque=null;
  while(n && n!==document.documentElement){
    const c=parse(getComputedStyle(n).backgroundColor);
    /* An ancestor that paints solid is the ground: stop there. This is what
       makes a filled button measure against its own fill. */
    if(c[3]>0.85){ opaque=c; break }
    if(c[3]>0) layers.push(c);
    if(img && n.contains(img)) break;
    n=n.parentElement;
  }
  /* Photo grounds carry TWO candidate bases (brightest and darkest pixel)
     so the caller can take whichever is worse for its foreground. Solid
     and default grounds carry one. */
  let bases;
  if(opaque) bases=[opaque];
  else {
    const photo = img ? photoUnder(img, rect) : null;
    if(photo){
      bases=[photo.bright, photo.dark];
      /* Every gradient of every overlay covering this point, composited in
         CSS paint order: within one background-image the first gradient
         listed paints on top, so they are applied last to first.
         The sample point is the centre of the glyph-photo INTERSECTION,
         not of the whole glyph rect: when only the bottom sliver of a
         heading grazes a photograph, the photo ground applies exactly
         there, and sampling overlays at the heading's own centre missed a
         veil that fully covers the sliver. */
      const ib=img.getBoundingClientRect();
      const cx=(Math.max(rect.left,ib.left)+Math.min(rect.right,ib.right))/2;
      const cy=(Math.max(rect.top,ib.top)+Math.min(rect.bottom,ib.bottom))/2;
      for(const g of section.querySelectorAll('*')){
        const gcs=getComputedStyle(g);
        if(!gcs.backgroundImage.includes('gradient')) continue;
        const gb=g.getBoundingClientRect();
        if(cx<gb.left||cx>gb.right||cy<gb.top||cy>gb.bottom) continue;
        if(g.contains(el)===false && el.contains(g)===false && !gb.width) continue;
        const grads=splitGradients(gcs.backgroundImage);
        for(let i=grads.length-1;i>=0;i--){
          const a=gradientAlphaAt(grads[i], gb, cx, cy);
          if(a>0){
            /* The layer's colour is the first stop that is NOT fully
               transparent. Taking the literal first colour function was
               wrong for any gradient written transparent-stop-first: the
               hero vignette starts on `rgba(0, 0, 0, 0)`, so every heading
               over the photograph composited toward BLACK and reported a
               flattering 21:1 for white type. */
            const cols=grads[i].match(/(?:rgba?|color)\([^)]*\)/g) || [];
            const col=parse(cols.find(c=>parse(c)[3]>0) || cols[0] || '#0b1626');
            bases=bases.map(b=>over([col[0],col[1],col[2],a], b));
          }
        }
      }
    } else {
      bases = [el.closest('[data-theme="inverse"]') ? [16,26,48,1] : [251,249,244,1]];
    }
  }
  /* Reverse ONCE outside the map: reverse() mutates, so calling it per
     candidate would flip the layer order back and forth. */
  const ordered=layers.slice().reverse();
  return bases.map(base=>ordered.reduce((acc,l)=>over(l,acc), base));
}

window.__audit = function(selector){
  const section=document.querySelector(selector);
  const out=[];
  for(const el of section.querySelectorAll('*')){
    const cs=getComputedStyle(el);
    if(!el.offsetParent||cs.visibility==='hidden'||cs.opacity==='0') continue;
    if(el.getAttribute('aria-hidden')==='true'||el.closest('[aria-hidden=true]')) continue;
    /* Screen reader only labels are 1x1 and clipped: they have a colour and
       a computed size but are never seen. */
    if(el.closest('.visually-hidden')) continue;
    /* Content clipped out of an overflow:hidden ancestor is not visible
       either. A collapsed reveal panel keeps a real rect, and measuring it
       reported white text on the page ground at 1.05:1 for something the
       reader cannot see. */
    if(clippedOut(el)) continue;
    const txt=[...el.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent.trim()).join('');
    if(!txt) continue;
    const size=parseFloat(cs.fontSize), w=+cs.fontWeight||400;
    const need=(size>=24||(size>=18.66&&w>=700))?3:4.5;
    /* Worst case across the candidate grounds: dark ink fails on the
       darkest photo pixel, light ink on the brightest. */
    const fg=parse(cs.color);
    const bgs=bgOf(el, section);
    let bg=bgs[0], r=ratio(fg, bgs[0]);
    for(const cand of bgs.slice(1)){
      const cr=ratio(fg, cand);
      if(cr<r){ r=cr; bg=cand }
    }
    out.push({t:txt.slice(0,22), size:+size.toFixed(1), r:+r.toFixed(2), need, pass:r>=need, bg:bg.slice(0,3).map(Math.round)});
  }
  return out;
};
return 'audit ready';
})()
