(function () {
  "use strict";
  // Generated from 谜题题库-v1.md by scripts/build-demo-data.mjs.
  const screenCatalog = [
  {
    "group": "Onboarding",
    "items": [
      [
        "08",
        "Welcome"
      ],
      [
        "37",
        "Choose Your Theme"
      ],
      [
        "17",
        "Alarm Access"
      ],
      [
        "18",
        "Sound & Rehearsal"
      ],
      [
        "09",
        "Rehearsal Bravo"
      ],
      [
        "19",
        "Alarm Ready"
      ]
    ]
  },
  {
    "group": "Daily",
    "items": [
      [
        "01",
        "Home"
      ],
      [
        "02",
        "Alarm Editor"
      ],
      [
        "14",
        "Settings"
      ],
      [
        "23",
        "Permission Off"
      ]
    ]
  },
  {
    "group": "Showtime",
    "items": [
      [
        "24",
        "iOS System Entry"
      ],
      [
        "16",
        "Curtain Rising"
      ],
      [
        "03",
        "Showtime"
      ],
      [
        "04",
        "Math"
      ],
      [
        "05",
        "Math Wrong"
      ],
      [
        "06",
        "Riddle"
      ],
      [
        "20",
        "Riddle Wrong"
      ],
      [
        "21",
        "Safety Valve"
      ],
      [
        "15",
        "Emergency Stop"
      ],
      [
        "07",
        "Bravo"
      ],
      [
        "22",
        "Wake-up Check"
      ]
    ]
  },
  {
    "group": "Delight",
    "items": [
      [
        "13",
        "Standing Ovation"
      ],
      [
        "12",
        "Your Run"
      ],
      [
        "10",
        "Sound Booth"
      ],
      [
        "11",
        "Backstage Pass"
      ]
    ]
  },
  {
    "group": "Configuration",
    "items": [
      [
        "25",
        "Wake-up Intensity"
      ],
      [
        "26",
        "Final Question Topic"
      ],
      [
        "27",
        "Volume Strategy"
      ],
      [
        "28",
        "Wake-up Check Timing"
      ],
      [
        "29",
        "Emergency Rules"
      ],
      [
        "30",
        "Haptics"
      ],
      [
        "36",
        "Alarm Access Settings"
      ]
    ]
  },
  {
    "group": "Confirmations",
    "items": [
      [
        "31",
        "Curtain Call Detail"
      ],
      [
        "32",
        "Delete Alarm"
      ],
      [
        "33",
        "Test Countdown"
      ],
      [
        "34",
        "Purchase Preview"
      ],
      [
        "35",
        "Restore Result"
      ]
    ]
  },
  {
    "group": "Theme Studio",
    "items": [
      [
        "38",
        "Official Free Themes"
      ],
      [
        "39",
        "Theme Preview"
      ],
      [
        "40",
        "Future Collections"
      ]
    ]
  },
  {
    "group": "Support & Results",
    "items": [
      [
        "41",
        "Help & Reliability"
      ],
      [
        "42",
        "Privacy"
      ],
      [
        "43",
        "Diagnostics"
      ],
      [
        "44",
        "Alarm Results"
      ]
    ]
  }
];
  screenCatalog.push({group:"Morning Crew & Question Library",items:[["45","First Wake-up Intensity"],["46","Question Library"],["47","Question Pack"],["48","Pack Sample"],["49","Offline Questions"],["50","Your Morning Crew"]]});
  // Keep stable IDs for saved alarms; the catalog contains only the twelve supplied recordings.
  const soundPresets = [
  {
    "id": "first-light",
    "name": "Gentle Dawn",
    "mood": "Soothing · gentle dawn",
    "detail": "Soothing",
    "color": "mint",
    "premium": false,
    "src": "assets/audio/free-01.m4a",
    "duration": 20,
    "previewDuration": 6,
    "price": 0,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "velvet-dawn",
    "name": "Soft Glow",
    "mood": "Soothing · soft glow",
    "detail": "Soothing",
    "color": "lilac",
    "premium": false,
    "src": "assets/audio/free-02.m4a",
    "duration": 20,
    "previewDuration": 6,
    "price": 0,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "rose-parade",
    "name": "Momentum",
    "mood": "Intense · gather momentum",
    "detail": "Intense",
    "color": "rose",
    "premium": false,
    "src": "assets/audio/free-03.m4a",
    "duration": 20,
    "previewDuration": 6,
    "price": 0,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "golden-hour",
    "name": "Onward",
    "mood": "Intense · move forward",
    "detail": "Intense",
    "color": "gold",
    "premium": false,
    "src": "assets/audio/free-04.m4a",
    "duration": 20,
    "previewDuration": 6,
    "price": 0,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "cloud-waltz",
    "name": "Rise",
    "mood": "Energetic · rise and shine",
    "detail": "Energetic",
    "color": "lilac",
    "premium": false,
    "src": "assets/audio/free-05.m4a",
    "duration": 20,
    "previewDuration": 6,
    "price": 0,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "morning-dew",
    "name": "Blast",
    "mood": "Explosive · a bold beginning",
    "detail": "Explosive",
    "color": "mint",
    "premium": false,
    "src": "assets/audio/free-06.m4a",
    "duration": 20,
    "previewDuration": 6,
    "price": 0,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "studio-sunrise",
    "name": "Velvet Morning",
    "mood": "Soothing · a velvet morning",
    "detail": "Soothing",
    "color": "gold",
    "premium": true,
    "src": "assets/audio/premium-01.m4a",
    "duration": 30,
    "previewDuration": 6,
    "price": 1.99,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "garden-after-rain",
    "name": "Resolve",
    "mood": "Intense · find your resolve",
    "detail": "Intense",
    "color": "lilac",
    "premium": true,
    "src": "assets/audio/premium-02.m4a",
    "duration": 30,
    "previewDuration": 6,
    "price": 1.99,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "starlight-serenade",
    "name": "Ascend",
    "mood": "Energetic · take the stage",
    "detail": "Energetic",
    "color": "lilac",
    "premium": true,
    "src": "assets/audio/premium-03.m4a",
    "duration": 30,
    "previewDuration": 6,
    "price": 1.99,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "amber-encore",
    "name": "Leap",
    "mood": "Energetic · make the leap",
    "detail": "Energetic",
    "color": "gold",
    "premium": true,
    "src": "assets/audio/premium-04.m4a",
    "duration": 30,
    "previewDuration": 6,
    "price": 1.99,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "ocean-aria",
    "name": "Supernova",
    "mood": "Explosive · a supernova morning",
    "detail": "Explosive",
    "color": "mint",
    "premium": true,
    "src": "assets/audio/premium-05.m4a",
    "duration": 30,
    "previewDuration": 6,
    "price": 1.99,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  },
  {
    "id": "moonlit-piano",
    "name": "Starburst",
    "mood": "Explosive · a burst of light",
    "detail": "Explosive",
    "color": "lilac",
    "premium": true,
    "src": "assets/audio/premium-06.m4a",
    "duration": 30,
    "previewDuration": 6,
    "price": 1.99,
    "currency": "USD",
    "license": "Owner-provided music; commercial rights not independently verified",
    "delivery": "bundled-aac"
  }
];
  const themes = [
    {id:"daybreak",name:"Daybreak",description:"Mint light, cloud-soft cards and a fresh morning stage.",premium:false,price:0,currency:"USD",mascot:"curtain"},
    {id:"velvet",name:"Velvet",description:"Cream, rose and lilac curtains for a quietly theatrical morning.",premium:false,price:0,currency:"USD",mascot:"curtain"},
    {id:"lunar",name:"Moonlight",description:"Soft lavender moonlight with your little lantern companion.",premium:true,price:1.99,currency:"USD",mascot:"lamp"},
    {id:"amber",name:"Amber Backstage",description:"Warm amber light and a curious little backstage mouse.",premium:true,price:1.99,currency:"USD",mascot:"mouse"}
  ];
  themes.forEach(theme => Object.assign(theme, {free:!theme.premium,available:true}));
  const paidPackProducts = [
    ["quick-math","Quick Math","Ten short mental-arithmetic challenges."],
    ["number-logic","Number Logic","Ten clearly defined number patterns and logic challenges."],
    ["europe","Around Europe","Ten questions about European places and capitals."],
    ["us-geography","Across America","Ten questions about United States geography."],
    ["world-landmarks","World Landmarks","Ten questions about remarkable places around the world."],
    ["us-history","American Milestones","Ten questions about key United States milestones."],
    ["biography","Remarkable Lives","Ten questions about notable people and their work."]
  ];
  const commerce = Object.freeze({
    currency:"USD",model:"subscription-preview",pricesConfirmed:false,billingStatus:"not-connected",livePurchases:false,adsEnabled:false,
    products:[
      {id:"ad-free",sku:"ad-free",name:"Drama Plus",description:"Ongoing access to premium sounds, themes and collections, with ad removal on ordinary pages while subscribed.",price:null,currency:"USD",type:"subscription",itemId:"ad-free"},
      ...soundPresets.filter(item=>item.premium).map(item=>({id:`sound:${item.id}`,sku:`sound:${item.id}`,name:item.name,description:item.mood,price:null,currency:"USD",type:"sound",itemId:item.id})),
      ...themes.filter(item=>item.premium).map(item=>({id:`theme:${item.id}`,sku:`theme:${item.id}`,name:item.name,description:item.description,price:null,currency:"USD",type:"theme",itemId:item.id})),
      ...paidPackProducts.map(([id,name,description])=>({id:`pack:${id}`,sku:`pack:${id}`,name,description,price:null,currency:"USD",type:"pack",itemId:id}))
    ]
  });
  const riddles = [
  {
    "id": "R001",
    "level": "Gentle",
    "type": "Object",
    "question": "What gets wetter while helping something else get dry?",
    "options": [
      "A towel",
      "A mirror",
      "A lamp",
      "A spoon"
    ],
    "answer": 0,
    "explanation": "A towel absorbs the water used to dry something.",
    "optionIds": [
      "R001:0",
      "R001:1",
      "R001:2",
      "R001:3"
    ],
    "correctOptionId": "R001:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R002",
    "level": "Gentle",
    "type": "Object",
    "question": "What becomes shorter the longer it works?",
    "options": [
      "A candle",
      "A ladder",
      "A road",
      "A window"
    ],
    "answer": 0,
    "explanation": "A burning candle becomes shorter over time.",
    "optionIds": [
      "R002:0",
      "R002:1",
      "R002:2",
      "R002:3"
    ],
    "correctOptionId": "R002:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R003",
    "level": "Gentle",
    "type": "Object",
    "question": "What goes up when rain comes down?",
    "options": [
      "An umbrella",
      "A shoe",
      "A carpet",
      "A pillow"
    ],
    "answer": 0,
    "explanation": "People raise an umbrella when it rains.",
    "optionIds": [
      "R003:0",
      "R003:1",
      "R003:2",
      "R003:3"
    ],
    "correctOptionId": "R003:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R004",
    "level": "Gentle",
    "type": "Object",
    "question": "What has a face and two hands but no arms or legs?",
    "options": [
      "A clock",
      "A chair",
      "A book",
      "A cup"
    ],
    "answer": 0,
    "explanation": "A clock has a face and hour and minute hands.",
    "optionIds": [
      "R004:0",
      "R004:1",
      "R004:2",
      "R004:3"
    ],
    "correctOptionId": "R004:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R005",
    "level": "Gentle",
    "type": "Object",
    "question": "What has many keys but opens no doors?",
    "options": [
      "A piano",
      "A suitcase",
      "A map",
      "A basket"
    ],
    "answer": 0,
    "explanation": "Piano keys make notes rather than open locks.",
    "optionIds": [
      "R005:0",
      "R005:1",
      "R005:2",
      "R005:3"
    ],
    "correctOptionId": "R005:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R006",
    "level": "Gentle",
    "type": "Object",
    "question": "What has teeth but cannot bite?",
    "options": [
      "A comb",
      "A blanket",
      "A plate",
      "A candle"
    ],
    "answer": 0,
    "explanation": "The points on a comb are called teeth.",
    "optionIds": [
      "R006:0",
      "R006:1",
      "R006:2",
      "R006:3"
    ],
    "correctOptionId": "R006:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R007",
    "level": "Gentle",
    "type": "Object",
    "question": "What has one eye but cannot see?",
    "options": [
      "A needle",
      "A button",
      "A shoe",
      "A coin"
    ],
    "answer": 0,
    "explanation": "The opening in a needle is called its eye.",
    "optionIds": [
      "R007:0",
      "R007:1",
      "R007:2",
      "R007:3"
    ],
    "correctOptionId": "R007:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R008",
    "level": "Gentle",
    "type": "Cause",
    "question": "An object blocks the light from a lamp. What forms behind the object?",
    "options": [
      "A shadow",
      "A sound",
      "A flavor",
      "A breeze"
    ],
    "answer": 0,
    "explanation": "The blocked light creates a shadow behind the object.",
    "optionIds": [
      "R008:0",
      "R008:1",
      "R008:2",
      "R008:3"
    ],
    "correctOptionId": "R008:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R009",
    "level": "Gentle",
    "type": "State",
    "question": "What does an ice cube become when it melts?",
    "options": [
      "Liquid water",
      "Steam",
      "Sand",
      "Glass"
    ],
    "answer": 0,
    "explanation": "Melting changes solid ice into liquid water.",
    "optionIds": [
      "R009:0",
      "R009:1",
      "R009:2",
      "R009:3"
    ],
    "correctOptionId": "R009:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R010",
    "level": "Gentle",
    "type": "Sequence",
    "question": "What comes next: 2, 4, 6, 8, __?",
    "options": [
      "9",
      "10",
      "12",
      "16"
    ],
    "answer": 1,
    "explanation": "The sequence increases by 2.",
    "optionIds": [
      "R010:0",
      "R010:1",
      "R010:2",
      "R010:3"
    ],
    "correctOptionId": "R010:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R011",
    "level": "Gentle",
    "type": "Sequence",
    "question": "What comes next: A, B, C, D, __?",
    "options": [
      "E",
      "F",
      "G",
      "Z"
    ],
    "answer": 0,
    "explanation": "E follows D in the alphabet.",
    "optionIds": [
      "R011:0",
      "R011:1",
      "R011:2",
      "R011:3"
    ],
    "correctOptionId": "R011:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R012",
    "level": "Gentle",
    "type": "Logic",
    "question": "One box holds only red balls. Which color ball will you pick?",
    "options": [
      "Blue",
      "Green",
      "Red",
      "Yellow"
    ],
    "answer": 2,
    "explanation": "Every ball in the box is red.",
    "optionIds": [
      "R012:0",
      "R012:1",
      "R012:2",
      "R012:3"
    ],
    "correctOptionId": "R012:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R013",
    "level": "Gentle",
    "type": "Time",
    "question": "A clock reads 3:00. Where is the minute hand?",
    "options": [
      "At 3",
      "At 6",
      "At 9",
      "At 12"
    ],
    "answer": 3,
    "explanation": "At an exact hour, the minute hand points to 12.",
    "optionIds": [
      "R013:0",
      "R013:1",
      "R013:2",
      "R013:3"
    ],
    "correctOptionId": "R013:3",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R014",
    "level": "Gentle",
    "type": "Quantity",
    "question": "Which is heavier?",
    "options": [
      "1 kg of cotton",
      "1 kg of metal",
      "They weigh the same",
      "Not enough information"
    ],
    "answer": 2,
    "explanation": "Both amounts weigh exactly 1 kilogram.",
    "optionIds": [
      "R014:0",
      "R014:1",
      "R014:2",
      "R014:3"
    ],
    "correctOptionId": "R014:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R015",
    "level": "Gentle",
    "type": "Spatial",
    "question": "A square has how many corners?",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": 1,
    "explanation": "A square has four corners.",
    "optionIds": [
      "R015:0",
      "R015:1",
      "R015:2",
      "R015:3"
    ],
    "correctOptionId": "R015:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R016",
    "level": "Gentle",
    "type": "Logic",
    "question": "When you turn off a lamp, what does it stop producing?",
    "options": [
      "Light",
      "The lamp",
      "A table",
      "A room"
    ],
    "answer": 0,
    "explanation": "A switched-off lamp stops producing light.",
    "optionIds": [
      "R016:0",
      "R016:1",
      "R016:2",
      "R016:3"
    ],
    "correctOptionId": "R016:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R017",
    "level": "Gentle",
    "type": "Cause",
    "question": "Which item makes a dark room brighter?",
    "options": [
      "A flashlight",
      "A towel",
      "A pillow",
      "A glove"
    ],
    "answer": 0,
    "explanation": "A flashlight produces light.",
    "optionIds": [
      "R017:0",
      "R017:1",
      "R017:2",
      "R017:3"
    ],
    "correctOptionId": "R017:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R018",
    "level": "Gentle",
    "type": "Order",
    "question": "Mia is ahead of Leo. Who is behind?",
    "options": [
      "Mia",
      "Leo",
      "Both",
      "Neither"
    ],
    "answer": 1,
    "explanation": "If Mia is ahead, Leo is behind her.",
    "optionIds": [
      "R018:0",
      "R018:1",
      "R018:2",
      "R018:3"
    ],
    "correctOptionId": "R018:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R019",
    "level": "Gentle",
    "type": "Quantity",
    "question": "In this puzzle, each of two hands has five fingers. How many fingers in total?",
    "options": [
      "5",
      "8",
      "10",
      "12"
    ],
    "answer": 2,
    "explanation": "Five plus five is ten.",
    "optionIds": [
      "R019:0",
      "R019:1",
      "R019:2",
      "R019:3"
    ],
    "correctOptionId": "R019:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R020",
    "level": "Gentle",
    "type": "Logic",
    "question": "An otherwise empty glass is open to the air. What fills its space?",
    "options": [
      "Air",
      "Water",
      "Sand",
      "Metal"
    ],
    "answer": 0,
    "explanation": "Air fills the open space even when the glass has no liquid.",
    "optionIds": [
      "R020:0",
      "R020:1",
      "R020:2",
      "R020:3"
    ],
    "correctOptionId": "R020:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R021",
    "level": "Classic",
    "type": "Sequence",
    "question": "What comes next: 3, 6, 12, 24, __?",
    "options": [
      "27",
      "36",
      "48",
      "96"
    ],
    "answer": 2,
    "explanation": "Each number is doubled.",
    "optionIds": [
      "R021:0",
      "R021:1",
      "R021:2",
      "R021:3"
    ],
    "correctOptionId": "R021:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R022",
    "level": "Classic",
    "type": "Sequence",
    "question": "What comes next: 1, 1, 2, 3, 5, __?",
    "options": [
      "6",
      "7",
      "8",
      "10"
    ],
    "answer": 2,
    "explanation": "Each number is the sum of the previous two.",
    "optionIds": [
      "R022:0",
      "R022:1",
      "R022:2",
      "R022:3"
    ],
    "correctOptionId": "R022:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R023",
    "level": "Classic",
    "type": "Logic",
    "question": "All roses are flowers. This is a rose. What must it be?",
    "options": [
      "A tree",
      "A flower",
      "A fruit",
      "A stone"
    ],
    "answer": 1,
    "explanation": "The statement says every rose is a flower.",
    "optionIds": [
      "R023:0",
      "R023:1",
      "R023:2",
      "R023:3"
    ],
    "correctOptionId": "R023:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R024",
    "level": "Classic",
    "type": "Logic",
    "question": "No blue blocks are round. This block is blue. What cannot it be?",
    "options": [
      "Heavy",
      "Small",
      "Round",
      "New"
    ],
    "answer": 2,
    "explanation": "The rule excludes round blue blocks.",
    "optionIds": [
      "R024:0",
      "R024:1",
      "R024:2",
      "R024:3"
    ],
    "correctOptionId": "R024:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R025",
    "level": "Classic",
    "type": "Spatial",
    "question": "Face north, turn right, then right again. Which way do you face?",
    "options": [
      "North",
      "South",
      "East",
      "West"
    ],
    "answer": 1,
    "explanation": "Two right turns from north point south.",
    "optionIds": [
      "R025:0",
      "R025:1",
      "R025:2",
      "R025:3"
    ],
    "correctOptionId": "R025:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R026",
    "level": "Classic",
    "type": "Spatial",
    "question": "A cube has how many faces?",
    "options": [
      "4",
      "6",
      "8",
      "12"
    ],
    "answer": 1,
    "explanation": "A cube has six square faces.",
    "optionIds": [
      "R026:0",
      "R026:1",
      "R026:2",
      "R026:3"
    ],
    "correctOptionId": "R026:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R027",
    "level": "Classic",
    "type": "Order",
    "question": "Ava finished before Ben but after Cole. Who finished first?",
    "options": [
      "Ava",
      "Ben",
      "Cole",
      "A tie"
    ],
    "answer": 2,
    "explanation": "The order is Cole, Ava, then Ben.",
    "optionIds": [
      "R027:0",
      "R027:1",
      "R027:2",
      "R027:3"
    ],
    "correctOptionId": "R027:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R028",
    "level": "Classic",
    "type": "Quantity",
    "question": "Four cats sit in four corners. How many cats are there?",
    "options": [
      "4",
      "8",
      "12",
      "16"
    ],
    "answer": 0,
    "explanation": "There is one cat in each of four corners.",
    "optionIds": [
      "R028:0",
      "R028:1",
      "R028:2",
      "R028:3"
    ],
    "correctOptionId": "R028:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R029",
    "level": "Classic",
    "type": "Logic",
    "question": "A closed book has 120 pages. You turn it upside down. How many pages now?",
    "options": [
      "60",
      "120",
      "240",
      "0"
    ],
    "answer": 1,
    "explanation": "Turning a book changes its orientation, not its page count.",
    "optionIds": [
      "R029:0",
      "R029:1",
      "R029:2",
      "R029:3"
    ],
    "correctOptionId": "R029:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R030",
    "level": "Classic",
    "type": "Cause",
    "question": "An ice cube stays in a warm room until it changes state. What does it become?",
    "options": [
      "Liquid water",
      "More ice",
      "Metal",
      "Glass"
    ],
    "answer": 0,
    "explanation": "In a warm room, the ice melts into liquid water.",
    "optionIds": [
      "R030:0",
      "R030:1",
      "R030:2",
      "R030:3"
    ],
    "correctOptionId": "R030:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R031",
    "level": "Classic",
    "type": "Sequence",
    "question": "What comes next: 20, 18, 16, 14, __?",
    "options": [
      "10",
      "11",
      "12",
      "13"
    ],
    "answer": 2,
    "explanation": "The sequence decreases by 2.",
    "optionIds": [
      "R031:0",
      "R031:1",
      "R031:2",
      "R031:3"
    ],
    "correctOptionId": "R031:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R032",
    "level": "Classic",
    "type": "Pattern",
    "question": "Which item does not belong?",
    "options": [
      "Triangle",
      "Square",
      "Circle",
      "Banana"
    ],
    "answer": 3,
    "explanation": "The first three are geometric shapes.",
    "optionIds": [
      "R032:0",
      "R032:1",
      "R032:2",
      "R032:3"
    ],
    "correctOptionId": "R032:3",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R033",
    "level": "Classic",
    "type": "Logic",
    "question": "If every Zim is quiet and Lee is a Zim, Lee must be what?",
    "options": [
      "Quiet",
      "Loud",
      "Tall",
      "Blue"
    ],
    "answer": 0,
    "explanation": "Lee inherits the stated property of every Zim.",
    "optionIds": [
      "R033:0",
      "R033:1",
      "R033:2",
      "R033:3"
    ],
    "correctOptionId": "R033:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R034",
    "level": "Classic",
    "type": "Time",
    "question": "It is 7:50. How many minutes until 8:00?",
    "options": [
      "5",
      "10",
      "20",
      "50"
    ],
    "answer": 1,
    "explanation": "Ten minutes take the time from 7:50 to 8:00.",
    "optionIds": [
      "R034:0",
      "R034:1",
      "R034:2",
      "R034:3"
    ],
    "correctOptionId": "R034:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R035",
    "level": "Classic",
    "type": "Quantity",
    "question": "Three pairs of socks contain how many socks?",
    "options": [
      "3",
      "5",
      "6",
      "9"
    ],
    "answer": 2,
    "explanation": "Each pair contains two socks, so three pairs contain six.",
    "optionIds": [
      "R035:0",
      "R035:1",
      "R035:2",
      "R035:3"
    ],
    "correctOptionId": "R035:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R036",
    "level": "Classic",
    "type": "Spatial",
    "question": "Which shape can roll smoothly in every direction?",
    "options": [
      "A sphere",
      "A cube",
      "A pyramid",
      "A flat square"
    ],
    "answer": 0,
    "explanation": "A sphere has no edges and can roll in every direction.",
    "optionIds": [
      "R036:0",
      "R036:1",
      "R036:2",
      "R036:3"
    ],
    "correctOptionId": "R036:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R037",
    "level": "Classic",
    "type": "Logic",
    "question": "Which tool is made to open its matching lock?",
    "options": [
      "The correct key",
      "A pillow",
      "A plate",
      "A candle"
    ],
    "answer": 0,
    "explanation": "A matching key is designed to open that lock.",
    "optionIds": [
      "R037:0",
      "R037:1",
      "R037:2",
      "R037:3"
    ],
    "correctOptionId": "R037:0",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R038",
    "level": "Classic",
    "type": "Pattern",
    "question": "Which of these numbers is odd: 2, 4, 7, 8?",
    "options": [
      "2",
      "4",
      "7",
      "8"
    ],
    "answer": 2,
    "explanation": "Seven is the only odd number.",
    "optionIds": [
      "R038:0",
      "R038:1",
      "R038:2",
      "R038:3"
    ],
    "correctOptionId": "R038:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R039",
    "level": "Classic",
    "type": "Order",
    "question": "Put these from smallest to largest: ant, cat, elephant. Which is second?",
    "options": [
      "Ant",
      "Cat",
      "Elephant",
      "They are equal"
    ],
    "answer": 1,
    "explanation": "The cat is larger than the ant and smaller than the elephant.",
    "optionIds": [
      "R039:0",
      "R039:1",
      "R039:2",
      "R039:3"
    ],
    "correctOptionId": "R039:1",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  },
  {
    "id": "R040",
    "level": "Classic",
    "type": "Quantity",
    "question": "A basket has 5 apples. You remove 2, then return 1. How many remain?",
    "options": [
      "2",
      "3",
      "4",
      "5"
    ],
    "answer": 2,
    "explanation": "Five minus two plus one leaves four apples in the basket.",
    "optionIds": [
      "R040:0",
      "R040:1",
      "R040:2",
      "R040:3"
    ],
    "correctOptionId": "R040:2",
    "contentVersion": "1.1.0",
    "locale": "en-US",
    "reviewStatus": "independent-human-review-pending",
    "retired": false
  }
];
  window.DramaAlarmData = Object.freeze({ screenCatalog, soundPresets, themes, commerce, riddles });
})();
