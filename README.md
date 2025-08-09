<img width="3188" height="1202" alt="frame (3)" src="https://github.com/user-attachments/assets/517ad8e9-ad22-457d-9538-a9e62d137cd7" />


# ശ്രീരാജരാജേശ്വരി puzzle  🎯


## Basic Details
### Team Name: LAZY


### Team Members
- Member 1: Abhinav Shaji - MTech, DCS, CUSAT
- Member 2: Manu M J - MTech, DCS, CUSAT

### Project Description
A chaotic, colorful “ശ്രീരാജരാജേശ്വരി puzzle” where clicking one tile makes a different tile wobble, forcing you to deduce a secret mapping.
Reveal tiles strictly in order (1 → 100 on a 10×10 grid). Wrong click after your first correct reveal? The whole board gleefully resets. Peek animation, wiggles, glow, confetti, and a tiny hand cursor keep it playful.

### The Problem (that doesn't exist)
Modern puzzles are far too honest: click a tile and it politely responds. Where’s the mischief? Where’s the brain-bending chaos?
People also aren’t memorizing arbitrary bijections between grid cells nearly enough.

### The Solution (that nobody asked for)
Every cell secretly maps to a different cell. Click here, watch over there. Learn the mapping, then lock tiles in strict order.
Add silly feedback: boingy sounds, wobbles, a celebratory confetti blast, and a wave “peek” that briefly shows the hidden picture—pure, impractical delight.

## Technical Details
### Technologies/Components Used
For Software:
-For Software:
- Languages: TypeScript, CSS (Tailwind)
- Frameworks: Next.js App Router (single page), React
- Libraries: canvas-confetti, shadcn/ui (Button), Tailwind CSS
- Tools: ESLint, Prettier, VS Code (recommended)
For Hardware:
- Main components: Any device with a modern web browser
- Specifications: Audio output for the boing SFX (optional), a pointing device or touch screen
- Tools required: None (unless you count a confetti broom)

### Implementation

Mapping mechanic: Generate a derangement array prankMap where click i highlights j = prankMap[i].
Game flow:
- Before the first correct move, probe freely to learn the mapping.
- Once you correctly reveal tile #1, any wrong click immediately resets the puzzle.
- Continue in strict order until all tiles are locked; on completion, confetti and a silly success overlay appear.

Visuals and feel:
- 10×10 grid, reduced gaps for density.
- Wiggle, shake, flip-in animations; tiny hand cursor; pulse ring on mapped cell.
- Peek wave animation reveals the full picture briefly without changing progress.

Image:
- Uses the uploaded image via its Source URL directly in CSS background-position slicing.
  
For Software:
# Installation
Manual setup in a fresh Next.js app

- Commands:

- npx create-next-app@latest chaotic-mapping --ts --tailwind --eslint
- cd chaotic-mapping
- npm i canvas-confetti
- npx shadcn@latest init
- npx shadcn@latest add button



- Replace app/page.tsx with the code from this chat and add public/images/tiny-hand.png (use the link provided earlier).
- Run dev server:

- npm run dev
- open [http://localhost:3000]

# Run
Development:
- npm run dev
- Open [http://localhost:3000](http://localhost:3000)

Build and start:
- npm run build
- npm start

### Project Documentation
For Software:
# Screenshots (Add at least 3)
<img width="816" height="832" alt="Screenshot 2025-08-09 153811" src="https://github.com/user-attachments/assets/1a9d0e66-85c4-4c31-ab63-7febd2dea52e" />

### Project Demo
# Video
https://github.com/user-attachments/assets/cf7903e6-c898-439b-92d8-2a22d703c89d

Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--25-25?link=https%3A%2F%2Fwww.tinkerhub.org%2Fevents%2FQ2Q1TQKX6Q%2FUseless%2520Projects)



