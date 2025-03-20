import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import software from "./software.json" with {type: "json"};
import { Context } from "@oak/oak/context";

// Green: #43ff43

const router = new Router();

// index
router.get("/", (ctx) => {
  console.log("   %cGET / 200", "color:green")
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>SetupThing</title>
      <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

        *{
          font-family: "JetBrains Mono", serif;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
        }
        
        b{
          font-weight: 800;
        }

        a{
          position: relative;
          text-decoration: none;
          color: white;
          background-color: black;
          padding: 1rem;
        }

        a::after{
          z-index: -3;
          content:"";
          position: absolute;
          display: block;
          height: 100%;
          width: 100%;
          top: .5rem;
          left: .5rem;
          background-color: #43ff43;
          transition: top .1s, left .1s;
        }

        a:hover::after{
          top: 1rem;
          left: 1rem;
        }

        a:active::after{
          top: 0rem;
          left: 0rem;
        }

        h1{
          font-weight: 800;
          font-size: 60px;
          margin: 0px;
        }
        
        body, html{
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0px;
          padding: 0px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
      </style>
      <body>
        <h1>SetupThing</h1>
        <p>Use setups the <b>eazy</b> way</p>
        <a href="./editor">Create my setup</a>
      </body>
    </html>
  `;
});

// editor
router.get("/editor", (ctx) => {
  console.log("   %cGET /editor 200", "color:green")
  let items = "";
  for(const s in software){
    items += `<div class='item' name='${s}'>
      <img src="${software[s].icon}">
      <p>${(software[s].name || s)}</p>
    </div>`
  }
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>SetupThing</title>
        <link rel="favicon" type="image/png" src="./favicon.png">
      <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

        *{
          font-family: "JetBrains Mono", serif;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
        }
        button{
          all: unset;
          cursor: pointer;
          font-family: "JetBrains Mono", serif;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
          position: relative;
          text-decoration: none;
          color: white;
          background-color: black;
          padding: 1rem;
        }

        button::after{
          z-index: -3;
          content:"";
          position: absolute;
          display: block;
          height: 100%;
          width: 100%;
          top: .5rem;
          left: .5rem;
          background-color: #43ff43;
          transition: top .1s, left .1s;
        }

        button:hover::after{
          top: 1rem;
          left: 1rem;
        }

        button:active::after{
          top: 0rem;
          left: 0rem;
        }

        h1{
          font-weight: 800;
          font-size: 60px;
          text-align: center;
        }
        
        body, html{
          width: 100%;
          height: 100%;
          margin: 0px;
          padding: 0px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        #grid{
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1.2fr));
          width: 60%;
        }
        .item{
          position: relative;
          margin-bottom: 2rem;
          width: 100px;
          height: 100px;
          background-color: black;
          display:flex;
          align-items:center;
          flex-direction:column;
          padding: 5px;
        }

        .item img{
          height: 80%;
        }

        .item p{
          margin: 0px;
          color: white;
        }

        .item::after{
          z-index: -3;
          display: block;
          width: 100%;
          height: 100%;
          content: "";
          position: absolute;
          left: 0rem;
          top: 0rem;
          background-color: #43ff43;
          transition: left .1s, top .1s;
        }
        .item.on::after{
          left: 1rem;
          top: 1rem;
        }
        .item:not(.on ):hover::after{
          left: .5rem;
          top: .5rem;
        }
      </style>
      <body>
        <h1>Select the software you want</h1>
        <div id="grid">${items}</div>
        <div id="disclaimer">You may want to install <a href="https://flathub.org/setup">Flatpack</a>, <a href="https://snapcraft.io/docs/installing-snapd">Snap</a> or other package managers so, when searching, we find more options to install the software with.</div>
        <button onclick="create()">Create my setup</button>
      </body>
      <script>
        document.body.onclick = function(e){
          if(e.target.classList.contains("item")){
            e.target.classList.toggle("on")
          }
          else if(e.target.parentNode.classList.contains("item")){
            e.target.parentNode.classList.toggle("on")
          }
        }

        function create(){
          let els = Array.from(document.getElementsByClassName("on"))
          for(e in els){
            els[e] = els[e].getAttribute("name");
          }
          window.location.replace("./create/" + els.join(","))
        }
      </script>
    </html>
  `;
})

type order = {
  items: string[],
  status: "waiting" | "working" | "finished" | "error",
  id: string,
  result: string,
  expiration: Date
}

type orderList = {
  [key: string]: order;
}

let orders: orderList = {};

function orderNum(): number{
  return Object.entries(orders).length
}

function generateOrderID(){
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const idLen = 10;
  
  let id = "";
  while(id.length < idLen){
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  while(orders[id]){
    id = "";
    while(id.length < idLen){
      id += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return id;
}

// create
router.get("/create/:items", (ctx) => {
  console.log(`   %cGET /create/${ctx.params.items} 200`, "color:green")
  const items = ctx.params.items.split(",");
  const id = generateOrderID()
  orders[id] = {items: items, status: "waiting", id: id, result:"", expiration: new Date(0)}
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>SetupThing</title>
      <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

        *{
          font-family: "JetBrains Mono", serif;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
        }
        
        b{
          font-weight: 800;
        }

        a{
          position: relative;
          text-decoration: none;
          color: white;
          background-color: black;
          padding: 1rem;
        }

        a::after{
          z-index: -3;
          content:"";
          position: absolute;
          display: block;
          height: 100%;
          width: 100%;
          top: .5rem;
          left: .5rem;
          background-color: #43ff43;
          transition: top .1s, left .1s;
        }

        a:hover::after{
          top: 1rem;
          left: 1rem;
        }

        a:active::after{
          top: 0rem;
          left: 0rem;
        }

        h1{
          font-weight: 800;
          font-size: 60px;
          margin: 0px;
        }
        
        body, html{
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0px;
          padding: 0px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
      </style>
      <body>
        <h1>Creating order...</h1>
      </body>
      <script>
        window.location.href = "../order/${id}"
      </script>
    </html>
  `;
})

// order
router.get("/order/:id", (ctx) => {
  if(!orders[ctx.params.id]){
    console.log(`   %cGET /order/${ctx.params.id} 404`, "color:red")
    ctx.response.status = 404
    ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>SetupThing</title>
      <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

        *{
          font-family: "JetBrains Mono", serif;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
        }
        
        b{
          font-weight: 800;
        }

        a{
          position: relative;
          text-decoration: none;
          color: white;
          background-color: black;
          padding: 1rem;
        }

        a::after{
          z-index: -3;
          content:"";
          position: absolute;
          display: block;
          height: 100%;
          width: 100%;
          top: .5rem;
          left: .5rem;
          background-color: #43ff43;
          transition: top .1s, left .1s;
        }

        a:hover::after{
          top: 1rem;
          left: 1rem;
        }

        a:active::after{
          top: 0rem;
          left: 0rem;
        }

        h1{
          font-weight: 800;
          font-size: 60px;
          margin: 0px;
        }
        
        body, html{
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0px;
          padding: 0px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
      </style>
      <body>
        <h1>Internal error</h1>
        <p>Order not found</p>
        <a href="../">Create it again</a>
      </body>
    </html>
  `;
    return;
  }
  console.log(`   %cGET /order/${ctx.params.id} 200`, "color:green")
  if(orders[ctx.params.id].status == "finished" || orders[ctx.params.id].status == "error"){
    ctx.response.body = `<!DOCTYPE html>
      <html>
        <head>
          <title>SetupThing</title>
        <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

          *{
            font-family: "JetBrains Mono", serif;
            font-optical-sizing: auto;
            font-weight: 100;
            font-style: normal;
          }
          
          b{
            font-weight: 800;
          }

          a{
            position: relative;
            text-decoration: none;
            color: white;
            background-color: black;
            padding: 1rem;
          }

          a::after{
            z-index: -3;
            content:"";
            position: absolute;
            display: block;
            height: 100%;
            width: 100%;
            top: .5rem;
            left: .5rem;
            background-color: #43ff43;
            transition: top .1s, left .1s;
          }

          a:hover::after{
            top: 1rem;
            left: 1rem;
          }

          a:active::after{
            top: 0rem;
            left: 0rem;
          }

          h1{
            font-weight: 800;
            font-size: 60px;
            margin: 0px;
          }
          
          body, html{
            width: 100%;
            height: 100%;
            overflow: hidden;
            margin: 0px;
            padding: 0px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
        </style>
        <body>
          <h1>Finished</h1>
        </body>
        <script>
          window.location.href = "../result/${ctx.params.id}";
        </script>
      </html>
    `;
  }
  else{
    ctx.response.body = `<!DOCTYPE html>
      <html>
        <head>
          <title>SetupThing</title>
        <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

          *{
            font-family: "JetBrains Mono", serif;
            font-optical-sizing: auto;
            font-weight: 100;
            font-style: normal;
          }
          
          b{
            font-weight: 800;
          }

          a{
            position: relative;
            text-decoration: none;
            color: white;
            background-color: black;
            padding: 1rem;
          }

          a::after{
            z-index: -3;
            content:"";
            position: absolute;
            display: block;
            height: 100%;
            width: 100%;
            top: .5rem;
            left: .5rem;
            background-color: #43ff43;
            transition: top .1s, left .1s;
          }

          a:hover::after{
            top: 1rem;
            left: 1rem;
          }

          a:active::after{
            top: 0rem;
            left: 0rem;
          }

          h1{
            font-weight: 800;
            font-size: 60px;
            margin: 0px;
          }
          
          body, html{
            width: 100%;
            height: 100%;
            overflow: hidden;
            margin: 0px;
            padding: 0px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
        </style>
        <body>
          <h1>Creating</h1>
          <p>Order placed, creating command. Wait for a few moments...</p>
        </body>
        <script>
          setTimeout(function(){
            window.location.reload()
          },5000)
        </script>
      </html>
    `;
  }
})

// result
router.get("/result/:id", (ctx) => {
  if(!orders[ctx.params.id] || orders[ctx.params.id].status != "finished"){
    console.log(`   %cGET /result/${ctx.params.id} 404`, "color:red")
    ctx.response.status = 404
    ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>SetupThing</title>
      <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

        *{
          font-family: "JetBrains Mono", serif;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
        }
        
        b{
          font-weight: 800;
        }

        a{
          position: relative;
          text-decoration: none;
          color: white;
          background-color: black;
          padding: 1rem;
        }

        a::after{
          z-index: -3;
          content:"";
          position: absolute;
          display: block;
          height: 100%;
          width: 100%;
          top: .5rem;
          left: .5rem;
          background-color: #43ff43;
          transition: top .1s, left .1s;
        }

        a:hover::after{
          top: 1rem;
          left: 1rem;
        }

        a:active::after{
          top: 0rem;
          left: 0rem;
        }

        h1{
          font-weight: 800;
          font-size: 60px;
          margin: 0px;
        }
        
        body, html{
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0px;
          padding: 0px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
      </style>
      <body>
        <h1>Internal error</h1>
        <p>Order not found or it's not finished</p>
        <p>How did you get here, then? ;)</p>
        <a href="../">Create it again</a>
      </body>
    </html>
  `;
    return;
  }
  console.log(`   %cGET /result/${ctx.params.id} 200`, "color:green")
  if(orders[ctx.params.id].status == "finished" || orders[ctx.params.id].status == "error"){
    ctx.response.body = `<!DOCTYPE html>
      <html>
        <head>
          <title>SetupThing</title>
        <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

          *{
            font-family: "JetBrains Mono", serif;
            font-optical-sizing: auto;
            font-weight: 100;
            font-style: normal;
          }
          
          b{
            font-weight: 800;
          }

          h1{
            font-weight: 800;
            font-size: 60px;
            margin: 0px;
          }
          
          body, html{
            width: 100%;
            height: 100%;
            overflow: hidden;
            margin: 0px;
            padding: 0px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }

          input{
            all:unset;
            width: 60%;
            border: 2px solid;
            padding: 5px;
            font-family: "JetBrains Mono", serif;
            font-optical-sizing: auto;
            font-weight: 100;
            font-style: normal;
            cursor: pointer;
          }
        </style>
        <body>
          <h1>Setup ready</h1>
          <p>Copy this into your terminal to install your setup</p>
          <input readonly="" id="code" value="curl -sSL https://setupthing.deno.dev/api/${ctx.params.id} | bash">
          <p>This should not harm your computer in any way, as it's using other package managers and code from other sources. You can check the code before using it <a href="https://setupthing.deno.dev/api/${ctx.params.id}">here</a>. We do not certify the security and / or originality of these packages. You can see the sources <a href="https://github.com/roger-padrell/setupthing/blob/main/software.json">here</a></p>
        </body>
        <script>
          let code = document.getElementById("code");

          code.onclick = function(){
            code.select()
            code.setSelectionRange(0, 99999)
            navigator.clipboard.writeText(code.value);
            alert("Copied the code");
          }
        </script>
      </html>
    `;
  }
})

// expirate loop (every 10 minutes)
setInterval(function(){
  for(const o in orders){
    if(orders[o].expiration != new Date(0) && orders[o].expiration <= new Date(Date.now())){
      delete orders[o]
    }
  }
}, 10 * 60 * 1000)

// api order code
router.get("/api/:id", (ctx) => {
  console.log(`   %cGET /api/${ctx.params.id} 200`, "color:green")
  ctx.response.type = "text/x-shellscript";
  if(!orders[ctx.params.id]){
    ctx.response.status = 404
    ctx.response.body = `echo 404: Order with id "${ctx.params.id}" not found`
    return;
  }
  if(orders[ctx.params.id].status == "finished" || orders[ctx.params.id].status == "error"){
    ctx.response.status = 200;
    ctx.response.body = orders[ctx.params.id].result;
  }
  else{
    ctx.response.status = 400
    ctx.response.body = `echo 400: Order with id "${ctx.params.id}" is still processing`
    return;
  }
})

// static (used for my other projects)
let availableStatics = ["ffmpeg"]
router.get("/static/:name", (ctx) => {
  console.log(`   %cGET /static/${ctx.params.name} 200`, "color:green")
  ctx.response.type = "text/x-shellscript";
  if(availableStatics.includes(ctx.params.name)){
    ctx.response.status = 200;
    ctx.response.body = Deno.readFileSync("./static/src/" + ctx.params.name + ".sh");
  }
  else{
    ctx.response.status = 400
    ctx.response.body = `echo 400: Trying static script at "https://setupthing.deno.dev/static/${ctx.params.id}", it does not exist`
    return;
  }
})


// undefined software image
router.get("/undefined", async (ctx) => {
  console.log("   %cGET /undefined 303", "color:yellow")
  const imageBuf = await Deno.readFile("./static/default.png");
  ctx.response.body = imageBuf;
  ctx.response.headers.set('Content-Type', 'image/png');
})

// favicon.ico
router.get("/favicon.ico", async (ctx) => {
  console.log("   %cGET /favicon.ico 200", "color:green")
  const imageBuf = await Deno.readFile("./static/default.ico");
  ctx.response.body = imageBuf;
  ctx.response.headers.set('Content-Type', 'image/ico');
})

// favicon.png
router.get("/favicon.png", async (ctx) => {
  console.log("   %cGET /favicon.png 200", "color:green")
  const imageBuf = await Deno.readFile("./static/default.png");
  ctx.response.body = imageBuf;
  ctx.response.headers.set('Content-Type', 'image/png');
})

// 404
router.get("/(.*)", (ctx) => {   
  const url = ctx.request.url;
  console.log("   %cGET " + url.pathname + " 404", "color:red")   
  ctx.response.status = 404;
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>SetupThing</title>
      <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap');

        *{
          font-family: "JetBrains Mono", serif;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
        }
        
        b{
          font-weight: 800;
        }

        a{
          position: relative;
          text-decoration: none;
          color: white;
          background-color: black;
          padding: 1rem;
        }

        a::after{
          z-index: -3;
          content:"";
          position: absolute;
          display: block;
          height: 100%;
          width: 100%;
          top: .5rem;
          left: .5rem;
          background-color: #43ff43;
          transition: top .1s, left .1s;
        }

        a:hover::after{
          top: 1rem;
          left: 1rem;
        }

        a:active::after{
          top: 0rem;
          left: 0rem;
        }

        h1{
          font-weight: 800;
          font-size: 60px;
          margin: 0px;
        }
        
        body, html{
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0px;
          padding: 0px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
      </style>
      <body>
        <h1>404</h1>
        <p>Page not found</p>
        <a href="../">Return to start</a>
      </body>
    </html>
  `;
});

// software json
router.get("/software.json", (ctx) => {
  console.log("   %cGET /software.json 200", "color:green")
  ctx.response.body = software;
})

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const portN: number = 8080;
console.log("%cSetupThing", "font-weight: black; color: green")
console.log("   Use setups the %ceazy %cway", "font-weight: bold", "font-weight: normal")
console.log("")
console.log("%cRequests", "font-weight: black; color: blue")
app.listen({ port: portN });

// solve order
// set first

const methodCommand = {
  "apt":"sudo apt install %s%",
  "dnf":"sudo dnf install %s%",
  "yum":"sudo yum install %s%",
  "pacman":"sudo pacman -S %s%",
  "zypper":"sudo zypper install %s%",
  "snap":"sudo snap install %s%",
  "flatpak":"flatpak install %s%",
  "emerge":"sudo emerge %s%",
  "apk":"sudo apk add %s%",
  "pkg":"sudo pkg install %s%",
  "brew":"brew install %s%",
  "nix-env":"nix-env -iA nixpkgs.%s%",
  "rpm":"sudo rpm -i %s%.rpm",
  "dpkg":"sudo dpkg -i %s%.deb"
}

let detectSH = `#!/bin/bash

# List of common package managers to check
package_managers=(
    apt        # Debian/Ubuntu
    dnf        # Fedora
    yum        # Older Fedora/RHEL
    pacman     # Arch/Manjaro
    zypper     # openSUSE
    snap       # Snap packages
    flatpak    # Flatpak
    emerge     # Gentoo
    apk        # Alpine
    pkg        # FreeBSD (rare on Linux)
    brew       # Linuxbrew
    nix-env    # Nix
    rpm        # RPM-based (low-level)
    dpkg       # Debian-based (low-level)
)

detected=()

# Check each package manager
for pm in "\${package_managers[@]}"; do
    if command -v "$pm" &> /dev/null; then
        detected+=("$pm")
    fi
done`

function solveOrder(solvingOrder: order){
  let result = detectSH;
    for(const item in solvingOrder.items){
      // generate single-item code
      let i = solvingOrder.items[item];
      let methods = software[i].methods;
      // start block
      result += `
# Installing ${i}
available=("${Object.keys(software[i].methods).join('" "')}")
installed=0

for pm in "\${available[@]}"; do
    if [ "$installed" -eq 0 ]; then
        if printf '%s\n' "$\{detected[@]}" | grep -Fxq "$pm"; then`
      for(const m in methods){
        result += `
            if [[ "$pm" = "${m}" ]]; then
                ${methodCommand[m].replace("%s%",methods[m])}
                installed=1
            fi`
      }
      result += `
        fi
    fi
done
# Finished installing ${i}`
    }
    return result;
}

let solving = false;
setInterval(function(){
  if(solving){
    return;
  }
  if(orderNum() > 0){
    let entries = Object.entries(orders)
    let nextEntry = (entries.find((item) => item[1].status === "waiting"));
    
    if(!nextEntry){
      return;
    }

    solving=true;

    let nextOrder = nextEntry[1]

    nextOrder.status = "working";

    const result = solveOrder(nextOrder);

    orders[nextOrder.id].result = result;
    orders[nextOrder.id].status = "finished";
    const tenMinutesFromNow = new Date(new Date(Date.now()).getTime() + 10 * 60 * 1000);
    orders[nextOrder.id].expiration = tenMinutesFromNow;
    solving = false;
  }
},1000)
