export const TAG_AND_TALLY = `
# Tag and Tally

# This file is for use with text-mapper.
# https://alexschroeder.ch/cgit/text-mapper/about/

# To the extent possible under law, the authors have waived all
# copyright and related or neighboring rights to this work.
# https://creativecommons.org/publicdomain/zero/1.0/

default attributes fill="none" stroke="#ccc" stroke-width="3"

text font-size="20pt" dy="15px"
label font-size="20pt" dy="5px"
glow stroke="white" stroke-width="0pt"

forest-bg attributes fill="#6FAF84"
plains-bg attributes fill="#D6E6B8"
mountain-bg attributes fill="#B3B6B8"
swamp-bg attributes fill="#8FA582"
island-bg attributes fill="#7FC3D2"
desert-bg attributes fill="#F1DCA8"
wastelands-bg attributes fill="#C9A183"
magiclands-bg attributes fill="#B6A1EE"

ghost attributes fill="#f1f1f1"

road path attributes stroke="#666" stroke-width="3" fill-opacity="0" stroke-dasharray="10 10"
river path attributes stroke="#78c8f5" stroke-width="10" fill-opacity="0" stroke-linecap="round"
canyon path attributes stroke="black" stroke-width="24" fill="none" opacity="0.2"
border path attributes stroke="red" stroke-width="15" stroke-opacity="0.5" fill-opacity="0"
trail path attributes stroke="#e3bea3" stroke-width="6" fill="none" transform="translate(10,-10)"
trail-right path attributes stroke="#e3bea3" stroke-width="6" fill="none" transform="translate(20)"
trail-down path attributes stroke="#e3bea3" stroke-width="6" fill="none" transform="translate(0,20)"

wasteland path m -30,12 c 26,3 50,-0 74,-1 -3,2 -6,4 -9,7 -24,1 -52,4 -74,1 3,-2 6,-4 9,-6 z

forest path m -12,-34 c -6,3 -5,3 -7,15 -5,3 -31,1 -28,16 2,9 8,7 16,11 -8,10 -11,16 -9,20 2,4 8,7 21,5 3,13 8,15 13,16 5,1 13,0 19,-11 12,6 26,9 30,6 4,-3 8,-16 3,-28 C 58,9 53,3 53,-2 52,-7 44,-7 32,-11 c 3,-13 4,-13 1,-16 -4,-3 -13,-7 -24,0 -8,-10 -14,-10 -20,-8 z m 3,4 c 4,-1 9,-1 16,8 9,-6 18,-4 22,-1 3,2 1,4 -1,15 11,3 20,5 20,9 C 49,4 53,8 43,13 47,24 44,36 41,39 38,42 22,38 12,33 7,43 1,44 -3,44 -7,43 -14,40 -16,29 -27,30 -32,29 -34,26 c -2,-4 1,-9 8,-18 -9,-5 -20,-4 -13,-18 2,-4 12,-5 23,-5 2,-11 4,-14 8,-15 z

mountain path M 30,-30 c -5,3 -19,18 -28,28 -4,-5 -7,-10 -9,-16 -7,4 -40,43 -43,53 2,2 4,2 6,2 7,-8 26,-40 34,-46 10,14 26,31 35,49 2,-1 4,-3 5,-3 C 30,33 16,18 3,0 11,-8 21,-19 29,-25 39,-9 49,-3 58,13 60,12 60,11 61,10 61,5 42,-7 29,-30 z

settlement path m 3,2 c 3,6 16,11 23,13 -1,3 0,6 1,6 -4,-2 -6,-3 -9,-4 -2,6 0,11 1,16 -4,0 -3,2 -6,2 1,-6 2,-15 2,-18 -4,-2 -8,-6 -13,-8 -4,3 -10,6 -14,10 1,6 0,10 1,16 -3,1 -4,1 -6,2 0,-4 1,-10 1,-15 -3,2 -6,3 -10,4 1,-6 22,-10 25,-22 z m-8,32 q5,-28 13,-1 z

dungeon path m -40,40 c 4,0 6,1 7,1 14,-37 1,-28 29,-22 1,12 3,7 8,21 3,-0 4,-0 6,0 -2,-2 -11,-18 -11,-27 5,-0 18,-1 26,1 1,1 1,3 1,6 6,0 9,5 12,6 1,9 -1,2 0,8 3,0 11,-1 10,7 2,-0 5,-0 7,0 -1,-4 -8,-11 -14,-9 -1,-6 0,-8 0,-9 -5,-1 -8,-4 -12,-5 -1,-0 0,-9 -0,-9 -15,1 -31,2 -31,1 -4,2 -1,6 -5,6 -36,-13 -12,2 -33,24 z m 50,-22 c -1,-0 -2,0 -4,0 0,2 1,4 0,5 2,-0 3,-0 5,-0 0,-2 0,-4 0,-5 -0,-0 -1,-0 -1,-0 z m 18,7 c -2,-0 -3,0 -5,0 0,2 1,4 0,5 2,-0 4,-0 6,-0 0,-2 0,-4 0,-5 -0,-0 -1,-0 -2,-0 z m -9,1 c -1,-0 -2,0 -4,0 0,2 1,6 0,7 2,-0 3,-0 5,-0 0,-2 0,-6 0,-7 -0,-0 -1,-0 -1,-0 z m -33,6 c -0,-0 -1,0 -1,0 h 0 c -3,1 -6,8 -6,10 4,-0 13,-0 14,-1 0,-4 -3,-10 -7,-10 z

lair path M -16.6,40 c 5.4,-39.2 45.8,-37.9 41.1,1.2 -14.5,-4.2 -25.9,1.6 -41.1,-1.2 z M -33.3,39.6 C -30.1,34.0 -16.7,-4.3 9.6,-4.7 28.2,-3.5 41.8,26.1 41.9,41.7 37.7,42.1 36.4,43.4 29.3,41.0 30.4,26.2 21.1,1.9 4.7,1.2 -11.7,0.5 -21.7,26.7 -26.7,39.0 c -2.4,1.0 -4.8,1.0 -6.6,0.7 z

swamp path m 2,-47 c -3,2 -2,12 1,5 2,-2 2,-5 -1,-5 z m -7,3 c -7,1 6,10 1,2 l 0,-1 z m 8,8 c -7,1 -15,3 -22,3 0,5 6,1 9,3 7,-2 15,-4 23,0 6,2 13,-1 19,-2 -2,-6 -12,3 -17,-1 -4,-1 -8,-2 -12,-3 z m -58,7 c -2,5 6,8 8,10 3,-4 -5,-7 -8,-10 z m 20,2 c -3,1 -4,9 -1,6 2,-2 5,-6 1,-6 z m -8,1 c 0,0 0,0 -1,0 -1,3 1,6 3,5 1,-2 1,-5 -2,-5 z m -21,9 c -1,6 10,5 15,4 7,-2 14,-1 21,1 2,0 12,2 10,-2 -7,0 -15,-3 -23,-3 -6,0 -13,4 -20,1 -1,-1 -2,-1 -3,-1 z M 47,-27 c -4,3 -3,13 1,6 1,-2 2,-5 -1,-6 z m -7,3 c -8,1 5,11 1,3 0,-1 -1,-2 -1,-3 z m 7,9 c -7,1 -14,2 -21,2 -1,5 6,1 8,3 8,-2 16,-3 23,0 7,2 13,-1 19,-2 -2,-6 -12,3 -17,-1 -4,-1 -8,-2 -12,-2 z m -63,11 c -4,3 7,14 4,5 -1,-2 -2,-4 -4,-5 z m 10,2 c -4,2 -3,12 0,5 1,-1 4,-5 0,-5 z M -50,8 c -1,0 -1,0 -2,0 -4,2 -14,-1 -15,4 1,0 1,0 2,1 8,-1 17,-3 25,1 7,1 13,-4 19,0 6,-1 13,-4 20,0 5,-4 -6,-4 -8,-6 -8,3 -15,3 -23,2 -6,4 -12,-2 -18,-2 z m 80,1 c -2,5 6,8 8,11 3,-5 -5,-8 -8,-11 z m 20,2 c -3,1 -4,7 -2,5 3,-1 3,-2 2,-5 z m -7,1 c -1,0 -1,0 -2,1 -1,2 2,7 3,5 0,-2 1,-6 -1,-6 z m -22,9 c -1,6 10,5 15,5 6,-3 14,-2 21,0 2,0 12,2 10,-2 -7,0 -15,-3 -23,-3 -6,0 -13,5 -20,1 -1,0 -2,-1 -3,-1 z m -36,11 c -2,1 -6,10 -2,7 1,-2 8,-6 2,-7 z m -5,2 c -6,0 0,12 0,3 1,-1 0,-2 0,-3 z m 14,8 c -7,1 -15,4 -22,0 -6,0 -14,0 -17,3 4,4 11,-3 17,1 7,3 15,0 23,-1 7,0 13,5 21,1 6,-1 12,2 19,2 C 38,43 27,44 24,44 16,41 9,47 2,43 -1,42 -3,42 -6,42 z

plains path m 2,-47 c -3,2 -2,12 1,5 2,-2 2,-5 -1,-5 z m -7,3 c -7,1 6,10 1,2 l 0,-1 z m -50,15 c -2,5 6,8 8,10 3,-4 -5,-7 -8,-10 z m 20,2 c -3,1 -4,9 -1,6 2,-2 5,-6 1,-6 z m 82,0 c -4,3 -3,13 1,6 1,-2 2,-5 -1,-6 z m -91,1 c -1,3 1,6 3,5 1,-2 1,-5 -2,-5 z m 53,-5 c -3,0 -3,3 -1,5 3,7 4,-3 1,-5 z m 31,7 c -8,1 5,11 1,3 0,-1 -1,-2 -1,-3 z m -24,-4 -1,1 0,1 c -5,8 8,-1 1,-2 z M 62,-1 C 59,2 51,5 54,9 56,7 64,4 62,-1 z M -40,-5 c -3,1 -2,4 -1,6 4,7 5,-3 1,-6 z m 82,6 c -4,0 -1,4 1,6 3,3 2,-5 -1,-6 z M -10,0 c -4,3 7,14 4,5 -1,-2 -2,-4 -4,-5 z m 60,2 c -3,0 -3,3 -2,5 2,1 4,-2 3,-5 z M 0,2 C -4,4 -3,14 0,7 1,6 4,2 0,2 z m -33,-4 c 0,1 -1,2 -1,3 -4,8 9,-2 1,-3 z m -1,27 c -2,5 6,8 8,11 3,-5 -5,-8 -8,-11 z m 20,2 c -3,1 -4,7 -2,5 3,-1 3,-2 2,-5 z m -8,1 c 0,0 0,0 -1,1 -1,2 2,7 3,5 0,-2 1,-6 -1,-6 0,0 0,0 -1,0 z M 23,18 c -2,1 -3,3 -4,5 -3,9 8,-2 4,-5 z m -10,2 c -4,0 -1,4 0,5 3,7 4,-3 0,-5 z m 24,17 c -3,3 -11,6 -8,11 2,-3 10,-6 8,-11 z m 20,-3 c -2,1 -6,10 -2,7 1,-2 8,-6 2,-7 z m -40,5 c -1,3 -1,4 2,5 2,2 1,-4 -2,-5 z m 35,-3 c -6,0 0,12 0,3 1,-1 0,-2 0,-3 z m -28,4 c -2,0 -1,4 -1,6 1,2 4,-3 3,-5 -1,-1 -1,-1 -2,-1 z M -58,12 c -6,1 1,5 2,7 4,3 0,-6 -2,-7 z m 5,2 c 0,1 -1,2 0,3 0,9 6,-3 0,-3 z

jungle path m 8,-20 c -6,-12 -36,-5 -44,7 9,-6 35,-12 37,-5 -18,0 -29,6 -33,24 C -22,-13 -8,-14 2,-13 -8,6 -20,13 -16,50 c 4,3 9,-5 5,-8 -1,-7 -1,-13 0,-20 C -10,10 1,-7 9,-12 27,-8 36,0 34,15 44,4 30,-12 14,-15 28,-16 41,-7 45,1 47,-8 29,-19 17,-20 c 11,-7 25,-3 30,3 -5,-14 -36,-11 -39,-3 z

<path id="desert" stroke="black" stroke-width="4" d="M-60,10 v4 M-50,-30 v4 M-40,-0 v4 M-30,40 v4 M-20,-20 v4 M-10,10 v4 M5,-30 v4 M10,20 v4 M20,0 v4 M30,30 v4 M30,-40 v4 M40,10 v4 M60,-10 v4 "/>

<circle id="level" stroke="black" stroke-width="7" cx="60" cy="00" r="15"/>
<use id="level-3" xlink:href="#level" transform="scale(0.7)" fill="#1FA84F"/>
<use id="level-4" xlink:href="#level" transform="scale(0.7)" fill="#7BCB3A"/>
<use id="level-5" xlink:href="#level" transform="scale(0.7)" fill="#C7D92D"/>
<use id="level-6" xlink:href="#level" transform="scale(0.7)" fill="#FFD200"/>
<use id="level-7" xlink:href="#level" transform="scale(0.7)" fill="#FFB000"/>
<use id="level-8" xlink:href="#level" transform="scale(0.7)" fill="#FF7A00"/>
<use id="level-9" xlink:href="#level" transform="scale(0.7)" fill="#E53900"/>
<use id="level-10" xlink:href="#level" transform="scale(0.7)" fill="#B00020"/>

/* Districts */

noble-bg attributes fill="#F3E6C8"
market-bg attributes fill="#EAF2D8"
residential-bg attributes fill="#E6EAE4"
slums-bg attributes fill="#E9D8CE"
garden-bg attributes fill="#E1F2E1"
religious-bg attributes fill="#E6F4F2"
trade-bg attributes fill="#FFF0D6"
central-bg attributes fill="#F6E3EA"
admin-bg attributes fill="#E8ECF6"
scholar-bg attributes fill="#F0E9F8"
entertainment-bg attributes fill="#FFE6ED"
crafts-bg attributes fill="#E6F0FF"
arcane-bg attributes fill="#EFE6DA"
industrial-bg attributes fill="#E1E1E1"

easy attributes fill="white" fill-opacity=".25"
rough attributes fill="black" fill-opacity="0"
dangerous attributes fill="black" fill-opacity=".10"
`;