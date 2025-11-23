import{f as m,a as f}from"../chunks/Dr4Qhj0q.js";import"../chunks/CG65uvKC.js";import{o as I}from"../chunks/Bk-e5Ehq.js";import{p as y,j as g}from"../chunks/BA8RC1HY.js";import{i as E}from"../chunks/CrhTUrwl.js";class d{constructor(t,e={}){this.container=document.getElementById(t),this.options={length:6,onComplete:null,onInput:null,placeholder:"•",...e},this.boxes=[],this.currentIndex=0}render(){this.container.innerHTML=`
      <div class="pin-input-container">
        <div class="pin-input-wrapper" id="pin-wrapper">
          ${Array.from({length:this.options.length},(t,e)=>`
            <input
              type="text"
              class="pin-box"
              id="pin-box-${e}"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="off"
              aria-label="PIN digit ${e+1}"
            />
          `).join("")}
        </div>
        <div class="pin-error" id="pin-error" style="display: none;"></div>
      </div>
    `,this.boxes=Array.from({length:this.options.length},(t,e)=>document.getElementById(`pin-box-${e}`)),this.setupEventListeners(),this.focusBox(0)}setupEventListeners(){this.boxes.forEach((t,e)=>{t.addEventListener("input",n=>{this.handleInput(n,e)}),t.addEventListener("keydown",n=>{this.handleKeydown(n,e)}),t.addEventListener("paste",n=>{this.handlePaste(n,e)}),t.addEventListener("focus",()=>{this.currentIndex=e,t.select()}),t.addEventListener("keypress",n=>{!/[0-9]/.test(n.key)&&!["Backspace","Delete","Tab","Enter"].includes(n.key)&&n.preventDefault()})})}handleInput(t,e){const n=t.target.value;if(n&&!/^[0-9]$/.test(n)){t.target.value="";return}this.updateBoxState(e,n),this.options.onInput&&this.options.onInput(this.getPinValue(),e),n&&e<this.boxes.length-1&&this.focusBox(e+1),this.isComplete()&&this.options.onComplete&&this.options.onComplete(this.getPinValue())}handleKeydown(t,e){t.key==="Backspace"&&(this.boxes[e].value?(this.boxes[e].value="",this.updateBoxState(e,"")):e>0&&(this.focusBox(e-1),this.boxes[e-1].value="",this.updateBoxState(e-1,""))),t.key==="ArrowLeft"&&e>0&&(t.preventDefault(),this.focusBox(e-1)),t.key==="ArrowRight"&&e<this.boxes.length-1&&(t.preventDefault(),this.focusBox(e+1))}handlePaste(t,e){t.preventDefault(),(t.clipboardData||window.clipboardData).getData("text").replace(/\D/g,"").slice(0,this.boxes.length).split("").forEach((l,u)=>{const i=e+u;i<this.boxes.length&&(this.boxes[i].value=l,this.updateBoxState(i,l))});const c=this.boxes.findIndex(l=>!l.value);c!==-1?this.focusBox(c):this.focusBox(this.boxes.length-1),this.isComplete()&&this.options.onComplete&&this.options.onComplete(this.getPinValue())}focusBox(t){t>=0&&t<this.boxes.length&&(this.boxes[t].focus(),this.currentIndex=t)}updateBoxState(t,e){const n=this.boxes[t];e?(n.classList.add("filled"),n.classList.remove("empty")):(n.classList.add("empty"),n.classList.remove("filled"))}getPinValue(){return this.boxes.map(t=>t.value).join("")}isComplete(){return this.boxes.every(t=>t.value)}clear(){this.boxes.forEach((t,e)=>{t.value="",this.updateBoxState(e,"")}),this.focusBox(0)}setValue(t){const e=t.slice(0,this.boxes.length).split("");this.boxes.forEach((n,o)=>{n.value=e[o]||"",this.updateBoxState(o,e[o]||"")}),this.isComplete()&&this.options.onComplete&&this.options.onComplete(this.getPinValue())}showError(t){const e=document.getElementById("pin-error");e&&(e.textContent=t,e.style.display="block",e.classList.add("error-visible"))}hideError(){const t=document.getElementById("pin-error");t&&(t.style.display="none",t.classList.remove("error-visible"))}disable(){this.boxes.forEach(t=>{t.disabled=!0,t.style.cursor="not-allowed"})}enable(){this.boxes.forEach(t=>{t.disabled=!1,t.style.cursor="text"})}shake(){const t=document.getElementById("pin-wrapper");t&&(t.classList.add("shake"),setTimeout(()=>{t.classList.remove("shake")},500))}}class k{constructor(t){this.container=document.getElementById(t),this.pinInput=null,this.onCreateAccount=null}render(){this.container.innerHTML=`
      <div class="screen initial-screen">
        <div class="screen-header">
          <h1 class="app-title">1Key</h1>
          <p class="app-subtitle">Your secure password manager</p>
        </div>

        <div class="screen-content">
          <!-- PIN Input Container -->
          <div id="pin-input-container" class="pin-section"></div>

          <!-- Create Account Section -->
          <div class="account-actions">
            <button class="create-account-btn" id="create-account-btn">
              Create Account
            </button>
            <p class="account-help-text">
              New to 1Key? Create an account to get started securely storing your passwords.
            </p>
          </div>
        </div>
      </div>
    `,this.initPinInput(),this.setupEventListeners()}initPinInput(){document.getElementById("pin-input-container"),this.pinInput=new d("pin-input-container",{length:6,onComplete:t=>{console.log("PIN entered:",t)},onInput:(t,e)=>{this.pinInput.hideError()}}),this.pinInput.render()}setupEventListeners(){document.getElementById("create-account-btn").addEventListener("click",()=>{this.handleCreateAccount()}),document.addEventListener("keydown",e=>{e.key==="Enter"&&this.pinInput.isComplete()&&this.handleCreateAccount()})}handleCreateAccount(){this.pinInput.hideError(),this.onCreateAccount&&this.onCreateAccount()}showError(t){this.pinInput&&(this.pinInput.showError(t),this.pinInput.shake())}reset(){this.pinInput&&(this.pinInput.clear(),this.pinInput.enable());const t=document.getElementById("create-account-btn");t&&(t.disabled=!1,t.textContent="Create Account")}}class b{constructor(t){this.container=document.getElementById(t),this.pinInput=null,this.confirmPinInput=null,this.onComplete=null,this.enteredPin=null,this.step="enter"}render(){this.container.innerHTML=`
      <div class="screen pin-setup-screen">
        <div class="screen-header">
          <h1 class="app-title">1Key</h1>
          <p class="app-subtitle">Create your secure account</p>
        </div>

        <div class="screen-content">
          <!-- Enter PIN Section -->
          <div id="enter-pin-section" class="pin-setup-section">
            <h2 class="section-title">Enter PIN</h2>
            <p class="section-description">Choose a 6-digit PIN to secure your account</p>
            <div id="pin-input-container" class="pin-section"></div>
          </div>

          <!-- Confirm PIN Section (hidden initially) -->
          <div id="confirm-pin-section" class="pin-setup-section" style="display: none;">
            <h2 class="section-title">Confirm PIN</h2>
            <p class="section-description">Re-enter your PIN to confirm</p>
            <div id="confirm-pin-input-container" class="pin-section"></div>
          </div>

          <!-- Error Message -->
          <div id="pin-setup-error" class="error-message" style="display: none;"></div>

          <!-- Action Button -->
          <div class="account-actions">
            <button class="create-account-btn" id="setup-submit-btn" style="display: none;">
              Create Account
            </button>
          </div>
        </div>
      </div>
    `,this.initPinInputs(),this.setupEventListeners()}initPinInputs(){this.pinInput=new d("pin-input-container",{length:6,onComplete:t=>{this.handlePinEntered(t)},onInput:(t,e)=>{this.hideError()}}),this.pinInput.render(),this.confirmPinInput=null}setupEventListeners(){document.getElementById("setup-submit-btn").addEventListener("click",()=>{if(this.step==="enter"){const e=this.pinInput.getPinValue();this.pinInput.isComplete()&&this.handlePinEntered(e)}else if(this.step==="confirm"){const e=this.confirmPinInput.getPinValue();this.confirmPinInput.isComplete()&&this.handlePinConfirmed(e)}}),document.addEventListener("keydown",e=>{if(e.key==="Enter"){if(this.step==="enter"&&this.pinInput.isComplete()){const n=this.pinInput.getPinValue();this.handlePinEntered(n)}else if(this.step==="confirm"&&this.confirmPinInput.isComplete()){const n=this.confirmPinInput.getPinValue();this.handlePinConfirmed(n)}}})}handlePinEntered(t){if(t.length!==6){this.showError("PIN must be 6 digits"),this.pinInput.shake();return}this.enteredPin=t;const e=document.getElementById("enter-pin-section"),n=document.getElementById("confirm-pin-section"),o=document.getElementById("setup-submit-btn");e.style.display="none",n.style.display="block",o.style.display="block",o.textContent="Create Account",requestAnimationFrame(()=>{setTimeout(()=>{if(!document.getElementById("confirm-pin-input-container")){console.error("Confirm PIN container not found");return}this.confirmPinInput=new d("confirm-pin-input-container",{length:6,onComplete:l=>{this.handlePinConfirmed(l)},onInput:(l,u)=>{this.hideError()}}),this.confirmPinInput.render(),setTimeout(()=>{this.confirmPinInput&&this.confirmPinInput.focusBox(0)},100)},100)}),this.step="confirm",this.hideError()}handlePinConfirmed(t){if(t.length!==6){this.showError("PIN must be 6 digits"),this.confirmPinInput.shake();return}if(t!==this.enteredPin){this.showError("PINs do not match. Please try again."),this.confirmPinInput.shake(),this.confirmPinInput.clear(),setTimeout(()=>{this.confirmPinInput.focusBox(0)},100);return}this.hideError(),this.disableInputs();const e=document.getElementById("setup-submit-btn");e.disabled=!0,e.textContent="Creating Account...",this.onComplete&&this.onComplete(this.enteredPin)}showError(t){const e=document.getElementById("pin-setup-error");e&&(e.textContent=t,e.style.display="block"),this.step==="enter"&&this.pinInput?this.pinInput.showError(t):this.step==="confirm"&&this.confirmPinInput&&this.confirmPinInput.showError(t)}hideError(){const t=document.getElementById("pin-setup-error");t&&(t.style.display="none"),this.pinInput&&this.pinInput.hideError(),this.confirmPinInput&&this.confirmPinInput.hideError()}disableInputs(){this.pinInput&&this.pinInput.disable(),this.confirmPinInput&&this.confirmPinInput.disable()}enableInputs(){this.pinInput&&this.pinInput.enable(),this.confirmPinInput&&this.confirmPinInput.enable()}reset(){this.step="enter",this.enteredPin=null;const t=document.getElementById("enter-pin-section"),e=document.getElementById("confirm-pin-section"),n=document.getElementById("setup-submit-btn");t.style.display="block",e.style.display="none",n.style.display="none",this.pinInput&&(this.pinInput.clear(),this.pinInput.enable()),this.confirmPinInput&&this.confirmPinInput.clear(),this.hideError()}}class v{constructor(t){this.container=document.getElementById(t),this.pinInput=null,this.onUnlock=null,this.attempts=0,this.maxAttempts=5,this.lockoutTime=6e4,this.isLocked=!1}render(){this.container.innerHTML=`
      <div class="screen unlock-screen">
        <div class="screen-header">
          <h1 class="app-title">1Key</h1>
          <p class="app-subtitle">Enter your PIN to unlock</p>
        </div>

        <div class="screen-content">
          <!-- PIN Input Container -->
          <div id="pin-input-container" class="pin-section"></div>

          <!-- Error Message -->
          <div id="unlock-error" class="error-message" style="display: none;"></div>

          <!-- Attempts Remaining -->
          <div id="attempts-remaining" class="attempts-info" style="display: none;"></div>

          <!-- Lockout Message -->
          <div id="lockout-message" class="lockout-message" style="display: none;"></div>

          <!-- Action Button -->
          <div class="account-actions">
            <button class="unlock-btn" id="unlock-btn" style="display: none;">
              Unlock
            </button>
          </div>
        </div>
      </div>
    `,this.initPinInput(),this.setupEventListeners()}initPinInput(){this.pinInput=new d("pin-input-container",{length:6,onComplete:t=>{this.handleUnlock(t)},onInput:(t,e)=>{this.hideError();const n=document.getElementById("unlock-btn");t.length>0&&n&&(n.style.display="block")}}),this.pinInput.render()}setupEventListeners(){document.getElementById("unlock-btn").addEventListener("click",()=>{const e=this.pinInput.getPinValue();this.pinInput.isComplete()&&this.handleUnlock(e)}),document.addEventListener("keydown",e=>{if(e.key==="Enter"&&this.pinInput&&this.pinInput.isComplete()){const n=this.pinInput.getPinValue();this.handleUnlock(n)}})}async handleUnlock(t){if(this.isLocked)return;if(!t||t.length!==6){this.showError("Please enter a 6-digit PIN"),this.pinInput.shake();return}this.pinInput.disable();const e=document.getElementById("unlock-btn");e&&(e.disabled=!0,e.textContent="Unlocking...");try{this.onUnlock&&(await this.onUnlock(t),this.attempts=0,this.hideError(),this.hideAttemptsInfo())}catch{this.handleUnlockFailure()}}handleUnlockFailure(){this.attempts++;const t=this.maxAttempts-this.attempts;this.pinInput.enable();const e=document.getElementById("unlock-btn");e&&(e.disabled=!1,e.textContent="Unlock"),this.attempts>=this.maxAttempts?this.lockOut():(this.showError(`Incorrect PIN. ${t} attempt${t!==1?"s":""} remaining.`),this.showAttemptsInfo(t),this.pinInput.shake(),this.pinInput.clear(),setTimeout(()=>{this.pinInput.focusBox(0)},100))}lockOut(){this.isLocked=!0,this.pinInput.disable();const t=document.getElementById("unlock-btn");t&&(t.disabled=!0,t.style.display="none");const e=document.getElementById("lockout-message");e&&(e.textContent=`Too many failed attempts. Please wait ${this.lockoutTime/1e3} seconds before trying again.`,e.style.display="block"),this.hideError(),this.hideAttemptsInfo();let n=this.lockoutTime/1e3;const o=setInterval(()=>{n--,e&&(e.textContent=`Too many failed attempts. Please wait ${n} second${n!==1?"s":""} before trying again.`),n<=0&&(clearInterval(o),this.unlock())},1e3)}unlock(){this.isLocked=!1,this.attempts=0,this.pinInput.enable();const t=document.getElementById("unlock-btn");t&&(t.disabled=!1,t.style.display="block",t.textContent="Unlock");const e=document.getElementById("lockout-message");e&&(e.style.display="none"),this.pinInput.clear(),this.pinInput.focusBox(0)}showError(t){const e=document.getElementById("unlock-error");e&&(e.textContent=t,e.style.display="block"),this.pinInput&&this.pinInput.showError(t)}hideError(){const t=document.getElementById("unlock-error");t&&(t.style.display="none"),this.pinInput&&this.pinInput.hideError()}showAttemptsInfo(t){const e=document.getElementById("attempts-remaining");e&&(e.textContent=`${t} attempt${t!==1?"s":""} remaining`,e.style.display="block")}hideAttemptsInfo(){const t=document.getElementById("attempts-remaining");t&&(t.style.display="none")}reset(){this.attempts=0,this.isLocked=!1,this.pinInput&&(this.pinInput.clear(),this.pinInput.enable());const t=document.getElementById("unlock-btn");t&&(t.disabled=!1,t.textContent="Unlock",t.style.display="none"),this.hideError(),this.hideAttemptsInfo();const e=document.getElementById("lockout-message");e&&(e.style.display="none")}}const{invoke:p}=window.__TAURI__.core;class w{constructor(){this.isUnlocked=!1,this.walletData=null}async walletExists(){try{return await p("wallet_exists")}catch(t){return console.error("Error checking wallet existence:",t),!1}}async createWallet(t){if(!t||t.length!==6)throw new Error("PIN must be 6 digits");const e={private_key:this.generatePlaceholderPrivateKey(),address:this.generatePlaceholderAddress()};try{return await p("encrypt_and_store_wallet",{wallet:e,pin:t}),this.walletData={address:e.address},this.isUnlocked=!0,{address:e.address}}catch(n){throw console.error("Error creating wallet:",n),new Error("Failed to create wallet. Please try again.")}}async unlockWallet(t){if(this.isUnlocked&&this.walletData)return this.walletData;if(!t||t.length!==6)throw new Error("PIN must be 6 digits");try{const e=await p("decrypt_wallet_with_pin",{pin:t});return this.walletData=e,this.isUnlocked=!0,e}catch(e){throw console.error("Error unlocking wallet:",e),e.toString().includes("Decryption failed")||e.toString().includes("Wrong PIN")?new Error("Incorrect PIN"):new Error("Failed to unlock wallet. Please try again.")}}lockWallet(){this.walletData=null,this.isUnlocked=!1}getWalletData(){return!this.isUnlocked||!this.walletData?null:this.walletData}isWalletUnlocked(){return this.isUnlocked}async deleteWallet(){try{await p("delete_wallet"),this.lockWallet()}catch(t){throw console.error("Error deleting wallet:",t),new Error("Failed to delete wallet")}}generatePlaceholderPrivateKey(){const t="0123456789abcdef";let e="";for(let n=0;n<64;n++)e+=t[Math.floor(Math.random()*t.length)];return"0x"+e}generatePlaceholderAddress(){const t="0123456789abcdef";let e="";for(let n=0;n<64;n++)e+=t[Math.floor(Math.random()*t.length)];return"0x"+e}}const h=new w,{invoke:P}=window.__TAURI__.core;async function B(){try{console.log("Testing Aztec sidecar connection...");const s=await P("aztec_test");return console.log("✅ Sidecar test result:",s),{success:!0,message:"Aztec sidecar is connected",result:s}}catch(s){return console.error("❌ Failed to connect to Aztec sidecar:",s),console.error("Error details:",{message:s}),{success:!1,error:String(s)}}}var C=m('<div id="app-container"><div class="loading-state"><h1>1Key</h1> <p>Loading...</p></div></div>');function N(s,t){y(t,!1);let e=!1;I(async()=>{console.log("🧪 Testing Aztec.js import..."),await B(),e=await l(),e?c():n()});function n(){const i=new k("app-container");i.render(),i.onCreateAccount=async()=>{o()}}function o(){const i=new b("app-container");i.render(),i.onComplete=async a=>{try{console.log("Creating wallet with PIN:",a);const r=await h.createWallet(a);console.log("Wallet created successfully:",r.address),alert(`Account created successfully!

Address: ${r.address.substring(0,10)}...

Next time you open the app, you'll see the unlock screen.`),e=!0,c()}catch(r){console.error("Failed to create account:",r),i.showError(r.message||"Failed to create account. Please try again."),i.enableInputs(),i.reset()}}}function c(){const i=new v("app-container");i.render(),i.onUnlock=async a=>{try{console.log("Unlocking wallet with PIN:",a);const r=await h.unlockWallet(a);console.log("Wallet unlocked successfully:",r.address),alert(`Wallet unlocked!

Address: ${r.address.substring(0,10)}...

Password manager will be implemented in Step 7.`),i.reset()}catch(r){throw console.error("Failed to unlock:",r),r}}}async function l(){try{return await h.walletExists()}catch(i){return console.error("Error checking account existence:",i),!1}}E();var u=C();f(s,u),g()}export{N as component};
