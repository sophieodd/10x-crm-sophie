# AI Usage Log

## 1. CRM project setup

**Tool:** ChatGPT

**Prompt summary:** Help me set up the 10X CRM exam project in a separate GitHub repository using HTML, CSS and vanilla JavaScript.

**How I refined the request:** I started by asking how to begin the JavaScript project. Then I specified that the CRM needed its own repository and that it would use vanilla JavaScript.

**What I used and why:** I used the Git setup instructions to create and connect the CRM repository. This gave the CRM its own commit history.

**What I learned:** I can check the repository root and remote before pushing to make sure I’m working in the right project.

## 2. Login and signup design

**Tool:** ChatGPT

**Prompt summary:** Redesign the login and signup forms to match the CTRL ME brand. Use the same stylesheet for both pages and adapt the layout for mobile.

**What I changed and why:** The first version used a centered form card that felt dated to me. I asked for a different layout and used the version with a dark brand panel beside the form. On mobile, the brand panel sits above the form.

**What I learned:** A shared stylesheet keeps both pages consistent. The same layout can change at a breakpoint without duplicating the HTML.

## 3. Signup and login validation

**Tool:** ChatGPT

**Prompt summary:** Add vanilla JavaScript validation to signup and login. Follow the CRM PRD, show errors beside the relevant fields and save valid accounts and sessions in browser storage.

**What I corrected and why:** The first suggestion kept the submit button disabled until all fields were valid. The PRD says to validate on submit and show the errors together. I used the revised script, which enables submit when the form is ready and only saves an account after validation passes.

**What I learned:** Keeping validation separate from saving makes it easier to see why a submission was rejected and when the app writes to browser storage.