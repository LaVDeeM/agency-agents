"use strict";(()=>{var e={};e.id=746,e.ids=[746],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},3601:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>f,requestAsyncStorage:()=>d,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>u});var a={};r.r(a),r.d(a,{POST:()=>c});var o=r(9303),i=r(8716),s=r(670);let n=new(r(4588)).ZP({apiKey:process.env.ANTHROPIC_API_KEY}),l=`You are an elite social media content strategist combining the expertise of two specialists:

1. **Content Performance Analyst** — You score content using data-driven frameworks: hook effectiveness, visual retention signals, pacing, text overlay quality, and estimated engagement tier.

2. **Viral Content Architect** — You know all 15 proven hook formulas, understand what makes content explode algorithmically, and can prescribe exact optimization changes.

When reviewing video frames from a creator's reel or TikTok, you deliver a professional, structured review that is honest, specific, and immediately actionable. You don't give generic advice — every recommendation ties back to what you actually see in the frames provided.

Format your response in clean markdown with clear section headers.`;async function c(e){let t=await e.json();if(!t.frames||0===t.frames.length)return new Response(JSON.stringify({error:"No frames provided"}),{status:400});let r=t.frames.map(e=>({type:"image",source:{type:"base64",media_type:"image/jpeg",data:e.replace(/^data:image\/\w+;base64,/,"")}})),a=t.frames.map((e,r)=>({type:"text",text:`Frame ${r+1} of ${t.frames.length} (at ${Math.round(r/(t.frames.length-1||1)*100)}% of video):`})),o=[];for(let e=0;e<t.frames.length;e++)o.push(a[e]),o.push(r[e]);let i=function(e){let t="tiktok"===e.platform?"TikTok":"instagram"===e.platform?"Instagram Reels":"youtube"===e.platform?"YouTube Shorts":"short-form video";return`Please review this ${t} video. I'm providing ${e.frames.length} key frames extracted from the video (at equal intervals).

**Creator Context:**
- Platform: ${t}
- Niche / Topic: ${e.niche}
- Target Audience: ${e.audience}
- Goal of this video: ${e.goal}

Analyze the frames and deliver a full professional review with these sections:

## 🎯 Overall Performance Prediction
Rate the video's viral potential: **Low / Average / Strong / Viral Potential**
Give a 2–3 sentence summary verdict.

## 🪝 Hook Strength Score: X/10
Analyze Frame 1 (the opening). Does it stop the scroll?
- Which of the 15 hook formula types is being used (or attempted)?
- What's working and what's failing in the first second?

## 📖 Visual Storytelling Arc
Analyze how the story or information progresses across the frames.
- Is there a clear beginning → middle → end?
- Where does engagement likely peak or drop?

## ⚡ Pacing & Energy Assessment
Based on visual progression between frames:
- Is pacing too fast, too slow, or well-matched for ${t}?
- Does the energy level match the platform and audience expectations?

## 📝 Text Overlay Audit
Assess any visible text overlays, captions, or graphics:
- Readability, positioning, timing effectiveness
- Are they adding value or cluttering the frame?

## 🖼️ Best Thumbnail Frame
Which frame number (1–${e.frames.length}) would make the strongest cover image and why?

## 🔝 Top 5 Optimization Actions
Numbered list of specific, immediately actionable changes to make before posting:
1.
2.
3.
4.
5.

## ✍️ Rewritten Hook Concept
If the hook could be stronger, describe an alternative opening concept for the first 1–2 seconds that would perform better on ${t}.`}(t),s=await n.messages.stream({model:"claude-sonnet-4-6",max_tokens:4096,system:l,messages:[{role:"user",content:[...o,{type:"text",text:i}]}]}),c=new TextEncoder;return new Response(new ReadableStream({async start(e){for await(let t of s)"content_block_delta"===t.type&&"text_delta"===t.delta.type&&e.enqueue(c.encode(t.delta.text));e.close()},cancel(){s.controller.abort()}}),{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-cache","X-Accel-Buffering":"no"}})}let p=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/review/route",pathname:"/api/review",filename:"route",bundlePath:"app/api/review/route"},resolvedPagePath:"/home/user/agency-agents/app/src/app/api/review/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:d,staticGenerationAsyncStorage:u,serverHooks:m}=p,h="/api/review/route";function f(){return(0,s.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:u})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[948,933],()=>r(3601));module.exports=a})();