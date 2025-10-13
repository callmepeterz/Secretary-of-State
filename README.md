# Secretary of State

## Overview

Secretary of State is a Discord bot intended to serve the Bayer Free State and therefore its features are very specific. Modifications may be needed to be more general-purpose or to suit the user's own needs.

## Installation

 1. ### Clone the repository
 ```bash
 git clone https://github.com/Secretary-of-State.git
 ```

 2. ### Install packages
 ```bash
 cd Secretary-of-State
 npm install
 ```

 3. ### Configure environment variables

 Create a file named `.env` in the directory with the following content:
 ```env
 TOKEN= #Discord bot token
 GUILD_ID= #Discord server ID
 CLIENT_ID= #Discord user ID
 OWNER_ID= #Discord owner ID
 INTENTS=[53608447]
 PARTIALS=[1]
 DEFAULT_COLOR= #Default hex color
 UTC_OFFSET= #Timezone UTC offset
 CITIZEN_ROLE_ID= #Citizen role ID
 CHINH_ID= # Chinh ID, if TROLL_CHINH is 1
 TROLL_CHINH=0 # Set to 1 to enable
 RANDOM_API_KEY= #random.org API key
 LOG_CHANNEL_ID= #Discord log channel ID, if LOG_ENABLED is set to 1
 LOG_ENABLED=0 # Set to 1 to enable logging deleted and edited messages
 CONTEXT_LIMIT=10000 #Context limit in bytes
 AI_MAX_ATTEMPT=3
 ATTEMPT_TIMEOUT=3000
 DEFAULT_COOLDOWN=3000
 WOLFRAM_ALPHA_APPID_1= #Wolfram API keys
 WOLFRAM_ALPHA_APPID_2=
 GEMINI_API_KEY= #Google AI API keys
 GEMINI_API_KEY_2=
 ```
 4. ### (Optional) Provide AI system instruction in `assets/systemPrompt.txt`

 5. ### Register slash commands
 
 Register commands at application level
 ```bash
 npm run register_app
 ```
 or at guild level
 ```bash
 npm run register_guild
 ```

 6. ### Start the bot
 ```bash
 node index.js
 ```

 ## Reloading

 To reload AI system instruction, commands, user data, or event callbacks, run `/reload [component]` in the bot's DM as the owner specified in `.env` `OWNER_ID` (no restart required).

 ## License

This project is licensed under the MIT License - see the LICENSE file for details.
