import{d,i as u,a as p,f as s,E as i,g as r,t as c,o as l,_ as m}from"./index-8175108c.js";const f=["innerHTML"],y=["textContent"],k=["textContent"],v=d({__name:"NoteDisplay",props:{class:{type:String,required:!1},noteHtml:{type:String,required:!1},note:{type:String,required:!1},placeholder:{type:String,required:!1}},emits:["click"],setup(t){const o=t;return u(p),(n,e)=>t.noteHtml?(l(),s("div",{key:0,class:i(["prose overflow-auto outline-none",o.class]),onClick:e[0]||(e[0]=a=>n.$emit("click")),innerHTML:t.noteHtml},null,10,f)):t.note?(l(),s("div",{key:1,class:i(["prose overflow-auto outline-none",o.class]),onClick:e[1]||(e[1]=a=>n.$emit("click"))},[r("p",{textContent:c(t.note)},null,8,y)],2)):(l(),s("div",{key:2,class:i(["prose overflow-auto outline-none opacity-50 italic",o.class]),onClick:e[2]||(e[2]=a=>n.$emit("click"))},[r("p",{textContent:c(o.placeholder||"No notes.")},null,8,k)],2))}}),g=m(v,[["__file","/home/runner/work/my-coffeeshop-guide/my-coffeeshop-guide/node_modules/@slidev/client/internals/NoteDisplay.vue"]]);export{g as N};