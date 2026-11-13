# AI Usage Log

Tool used throughout: ChatGPT. The requests below are summarized.

## 1. Setting up the CRM repository

**Goal:** Start the JavaScript exam project.

**Prompt summary:** I first asked how to start the project. I then narrowed the request to a separate GitHub repository using HTML, CSS and vanilla JavaScript.

**What I used:** I followed the Git setup steps and kept the CRM separate from my React shop.

**What I learned:** Checking the repo root and remote before pushing helps me catch mistakes early.

## 2. Designing the login and signup pages

**Goal:** Make both forms fit the CTRL+ME brand.

**Prompt summary:** Redesign the two forms with a shared stylesheet and a layout that works on mobile.

**What I changed:** The first centered card felt dated. I used a dark brand panel beside the form and stacked the two on smaller screens.

**What I learned:** I can change the layout at a breakpoint and keep the same HTML.

## 3. Validating signup and login

**Goal:** Show clear errors and save accounts only after validation passes.

**Prompt summary:** Review my signup and login forms against the exam requirements and help me implement validation.

**What I corrected:** An early suggestion kept the button disabled until every field was valid. I switched to checking the fields on submit so users can see what needs fixing.

**What I learned:** Separating validation from storage makes it easier to trace why a form was rejected.

## 4. Debugging the blank Clients page

**Goal:** Find out why the page opened with no content.

**Prompt summary:** Help me diagnose a blank Clients page when the navigation link opens the right URL.

**What I used:** I checked the script path from the terminal. The HTML pointed to a JavaScript file that was missing. The page worked after I added it.

**What I learned:** A working page link and a working script are two separate things to check.

## 5. Improving the client status control

**Goal:** Make it easier to see and change a client’s deal stage.

**Prompt summary:** Combine the colored badge and the status dropdown into one control.

**What I changed:** I used a single colored select. Changing the stage updates its color and saves the new value with the client record.

**What I learned:** A native select handles the interaction and a data attribute lets CSS handle the color.