// ===== DATA: real programs & head coaches (opening day 2026) =====
// fields: id, school, abbr, mascot, conf, state, lat, lon, c1, c2, prestige, nil(1-10), facilities, academics, talent, coach, cREC, cDEV, cGAME
const TEAM_ROWS = [
// SEC
["alabama","Alabama","BAMA","Crimson Tide","SEC","AL",33.21,-87.55,"#9E1B32","#FFFFFF",97,9,98,72,88,"Kalen DeBoer",86,84,87],
["arkansas","Arkansas","ARK","Razorbacks","SEC","AR",36.07,-94.17,"#9D2235","#FFFFFF",72,5,85,65,72,"Ryan Silverfield",72,76,74],
["auburn","Auburn","AUB","Tigers","SEC","AL",32.60,-85.49,"#0C2340","#E87722",82,7,88,70,77,"Alex Golesh",78,78,80],
["florida","Florida","UF","Gators","SEC","FL",29.65,-82.32,"#0021A5","#FA4616",88,8,90,85,78,"Jon Sumrall",78,82,82],
["georgia","Georgia","UGA","Bulldogs","SEC","GA",33.95,-83.37,"#BA0C2F","#000000",96,9,96,80,91,"Kirby Smart",97,93,92],
["kentucky","Kentucky","UK","Wildcats","SEC","KY",38.04,-84.50,"#0033A0","#FFFFFF",62,4,80,68,68,"Will Stein",70,72,76],
["lsu","LSU","LSU","Tigers","SEC","LA",30.41,-91.18,"#461D7C","#FDD023",93,10,93,68,84,"Lane Kiffin",92,82,90],
["mississippi-state","Mississippi State","MSST","Bulldogs","SEC","MS",33.46,-88.79,"#660000","#FFFFFF",60,4,78,62,67,"Jeff Lebby",70,72,74],
["missouri","Missouri","MIZ","Tigers","SEC","MO",38.94,-92.33,"#F1B82D","#000000",70,6,82,72,79,"Eli Drinkwitz",82,80,80],
["oklahoma","Oklahoma","OU","Sooners","SEC","OK",35.21,-97.44,"#841617","#FDF9D8",90,8,90,72,82,"Brent Venables",82,84,78],
["ole-miss","Ole Miss","MISS","Rebels","SEC","MS",34.36,-89.53,"#CE1126","#14213D",76,9,85,68,81,"Pete Golding",76,80,78],
["south-carolina","South Carolina","SC","Gamecocks","SEC","SC",34.00,-81.03,"#73000A","#000000",70,6,85,72,72,"Shane Beamer",78,76,74],
["tennessee","Tennessee","TENN","Volunteers","SEC","TN",35.95,-83.93,"#FF8200","#FFFFFF",86,9,90,74,82,"Josh Heupel",82,80,86],
["texas","Texas","TEX","Longhorns","SEC","TX",30.28,-97.73,"#BF5700","#FFFFFF",95,10,97,86,89,"Steve Sarkisian",93,88,88],
["texas-am","Texas A&M","TAMU","Aggies","SEC","TX",30.61,-96.34,"#500000","#FFFFFF",86,10,94,80,86,"Mike Elko",85,86,86],
["vanderbilt","Vanderbilt","VAN","Commodores","SEC","TN",36.14,-86.80,"#866D4B","#000000",55,6,75,97,76,"Clark Lea",74,86,82],
// Big Ten
["illinois","Illinois","ILL","Fighting Illini","Big Ten","IL",40.10,-88.23,"#E84A27","#13294B",60,5,78,85,75,"Bret Bielema",72,82,80],
["indiana","Indiana","IU","Hoosiers","Big Ten","IN",39.17,-86.52,"#990000","#EEEDEB",70,8,80,82,89,"Curt Cignetti",80,92,95],
["iowa","Iowa","IOWA","Hawkeyes","Big Ten","IA",41.66,-91.55,"#FFCD00","#000000",72,4,82,80,76,"Kirk Ferentz",68,90,80],
["maryland","Maryland","MD","Terrapins","Big Ten","MD",38.99,-76.94,"#E03A3E","#FFD520",58,5,80,84,68,"Mike Locksley",76,70,68],
["michigan","Michigan","MICH","Wolverines","Big Ten","MI",42.27,-83.74,"#00274C","#FFCB05",94,10,95,95,83,"Kyle Whittingham",80,88,86],
["michigan-state","Michigan State","MSU","Spartans","Big Ten","MI",42.73,-84.48,"#18453B","#FFFFFF",70,5,84,80,66,"Pat Fitzgerald",72,80,76],
["minnesota","Minnesota","MINN","Golden Gophers","Big Ten","MN",44.97,-93.23,"#7A0019","#FFCC33",58,4,82,84,72,"P.J. Fleck",76,80,76],
["nebraska","Nebraska","NEB","Cornhuskers","Big Ten","NE",40.82,-96.70,"#E41C38","#FFFFFF",76,6,88,74,74,"Matt Rhule",80,80,74],
["northwestern","Northwestern","NW","Wildcats","Big Ten","IL",42.06,-87.67,"#4E2A84","#FFFFFF",52,3,86,98,70,"David Braun",66,78,76],
["ohio-state","Ohio State","OSU","Buckeyes","Big Ten","OH",40.00,-83.02,"#BB0000","#666666",98,10,97,84,92,"Ryan Day",94,90,88],
["oregon","Oregon","ORE","Ducks","Big Ten","OR",44.06,-123.07,"#154733","#FEE123",88,10,99,78,90,"Dan Lanning",94,88,88],
["penn-state","Penn State","PSU","Nittany Lions","Big Ten","PA",40.80,-77.86,"#041E42","#FFFFFF",86,7,90,84,78,"Matt Campbell",74,90,82],
["purdue","Purdue","PUR","Boilermakers","Big Ten","IN",40.43,-86.91,"#CEB888","#000000",52,4,76,88,62,"Barry Odom",70,76,76],
["rutgers","Rutgers","RUTG","Scarlet Knights","Big Ten","NJ",40.50,-74.45,"#CC0033","#FFFFFF",50,4,76,82,68,"Greg Schiano",74,78,74],
["ucla","UCLA","UCLA","Bruins","Big Ten","CA",34.07,-118.44,"#2774AE","#FFD100",74,6,84,95,66,"Bob Chesney",70,80,82],
["usc","USC","USC","Trojans","Big Ten","CA",34.02,-118.29,"#990000","#FFC72C",90,10,92,92,84,"Lincoln Riley",90,78,84],
["washington","Washington","UW","Huskies","Big Ten","WA",47.65,-122.30,"#4B2E83","#B7A57A",78,7,90,92,80,"Jedd Fisch",80,82,80],
["wisconsin","Wisconsin","WIS","Badgers","Big Ten","WI",43.07,-89.41,"#C5050C","#FFFFFF",74,5,86,90,66,"Luke Fickell",72,78,70],
// ACC
["boston-college","Boston College","BC","Eagles","ACC","MA",42.34,-71.17,"#98002E","#BC9B6A",52,3,75,92,64,"Bill O'Brien",66,76,72],
["cal","California","CAL","Golden Bears","ACC","CA",37.87,-122.26,"#003262","#FDB515",52,5,80,97,66,"Tosh Lupoi",76,72,68],
["clemson","Clemson","CLEM","Tigers","ACC","SC",34.68,-82.84,"#F56600","#522D80",90,7,95,80,83,"Dabo Swinney",86,84,80],
["duke","Duke","DUKE","Blue Devils","ACC","NC",36.00,-78.94,"#003087","#FFFFFF",58,7,82,98,74,"Manny Diaz",74,78,80],
["florida-state","Florida State","FSU","Seminoles","ACC","FL",30.44,-84.30,"#782F40","#CEB888",85,7,88,75,72,"Mike Norvell",82,70,70],
["georgia-tech","Georgia Tech","GT","Yellow Jackets","ACC","GA",33.77,-84.39,"#B3A369","#003057",58,4,78,94,78,"Brent Key",74,80,82],
["louisville","Louisville","LOU","Cardinals","ACC","KY",38.21,-85.76,"#AD0000","#000000",62,6,82,70,76,"Jeff Brohm",76,80,82],
["miami","Miami","MIA","Hurricanes","ACC","FL",25.72,-80.28,"#F47321","#005030",88,10,88,86,88,"Mario Cristobal",92,82,80],
["nc-state","NC State","NCST","Wolfpack","ACC","NC",35.78,-78.68,"#CC0000","#FFFFFF",56,4,80,80,68,"Dave Doeren",68,74,70],
["north-carolina","North Carolina","UNC","Tar Heels","ACC","NC",35.91,-79.05,"#7BAFD4","#13294B",66,7,82,92,66,"Bill Belichick",76,80,80],
["pitt","Pittsburgh","PITT","Panthers","ACC","PA",40.44,-79.96,"#003594","#FFB81C",58,4,78,82,72,"Pat Narduzzi",68,80,76],
["smu","SMU","SMU","Mustangs","ACC","TX",32.84,-96.78,"#CC0035","#354CA1",62,9,85,85,77,"Rhett Lashlee",78,78,82],
["stanford","Stanford","STAN","Cardinal","ACC","CA",37.43,-122.16,"#8C1515","#FFFFFF",55,4,88,99,60,"Tavita Pritchard",64,68,66],
["syracuse","Syracuse","SYR","Orange","ACC","NY",43.04,-76.14,"#F76900","#002D72",54,4,76,86,64,"Fran Brown",82,70,70],
["virginia","Virginia","UVA","Cavaliers","ACC","VA",38.03,-78.51,"#232D4B","#F84C1E",54,4,78,95,72,"Tony Elliott",66,76,76],
["virginia-tech","Virginia Tech","VT","Hokies","ACC","VA",37.22,-80.42,"#861F41","#E5751F",66,6,82,80,70,"James Franklin",84,80,76],
["wake-forest","Wake Forest","WAKE","Demon Deacons","ACC","NC",36.13,-80.28,"#9E7E38","#000000",48,4,74,93,64,"Jake Dickert",64,76,76],
// Big 12
["arizona","Arizona","ARIZ","Wildcats","Big 12","AZ",32.23,-110.95,"#CC0033","#003366",56,5,80,78,74,"Brent Brennan",68,78,78],
["arizona-state","Arizona State","ASU","Sun Devils","Big 12","AZ",33.42,-111.93,"#8C1D40","#FFC627",62,6,82,76,76,"Kenny Dillingham",82,80,84],
["baylor","Baylor","BAY","Bears","Big 12","TX",31.55,-97.11,"#154734","#FFB81C",56,5,84,82,70,"Dave Aranda",70,74,72],
["byu","BYU","BYU","Cougars","Big 12","UT",40.25,-111.65,"#002E5D","#FFFFFF",62,7,84,82,83,"Kalani Sitake",72,82,84],
["cincinnati","Cincinnati","CIN","Bearcats","Big 12","OH",39.13,-84.51,"#E00122","#000000",54,4,80,78,68,"Scott Satterfield",66,72,70],
["colorado","Colorado","COLO","Buffaloes","Big 12","CO",40.01,-105.27,"#CFB87C","#000000",68,7,82,80,66,"Deion Sanders",86,66,70],
["houston","Houston","HOU","Cougars","Big 12","TX",29.72,-95.34,"#C8102E","#FFFFFF",54,6,80,74,76,"Willie Fritz",68,78,80],
["iowa-state","Iowa State","ISU","Cyclones","Big 12","IA",42.03,-93.65,"#C8102E","#F1BE48",52,4,78,78,68,"Jimmy Rogers",70,76,74],
["kansas","Kansas","KU","Jayhawks","Big 12","KS",38.96,-95.25,"#0051BA","#E8000D",48,4,80,78,68,"Lance Leipold",66,80,78],
["kansas-state","Kansas State","KSU","Wildcats","Big 12","KS",39.20,-96.59,"#512888","#FFFFFF",56,5,80,74,68,"Collin Klein",68,76,74],
["oklahoma-state","Oklahoma State","OKST","Cowboys","Big 12","OK",36.13,-97.07,"#FF7300","#000000",60,5,82,72,60,"Eric Morris",70,74,78],
["tcu","TCU","TCU","Horned Frogs","Big 12","TX",32.71,-97.36,"#4D1979","#FFFFFF",60,7,86,82,74,"Sonny Dykes",76,76,80],
["texas-tech","Texas Tech","TTU","Red Raiders","Big 12","TX",33.58,-101.85,"#CC0000","#000000",64,10,85,72,86,"Joey McGuire",84,80,80],
["ucf","UCF","UCF","Knights","Big 12","FL",28.60,-81.20,"#BA9B37","#000000",56,5,80,74,64,"Scott Frost",68,70,70],
["utah","Utah","UTAH","Utes","Big 12","UT",40.76,-111.85,"#CC0000","#FFFFFF",60,6,86,80,78,"Morgan Scalley",72,80,78],
["west-virginia","West Virginia","WVU","Mountaineers","Big 12","WV",39.65,-79.95,"#002855","#EAAA00",58,5,78,70,66,"Rich Rodriguez",72,76,78],
// Independents
["notre-dame","Notre Dame","ND","Fighting Irish","Independent","IN",41.70,-86.24,"#0C2340","#C99700",94,8,95,97,89,"Marcus Freeman",90,86,84],
["uconn","UConn","UCONN","Huskies","Independent","CT",41.81,-72.25,"#000E2F","#FFFFFF",40,3,70,82,62,"Jason Candle",64,72,74],
// Pac-12 (rebuilt 2026)
["boise-state","Boise State","BSU","Broncos","Pac-12","ID",43.60,-116.20,"#0033A0","#D64309",56,3,78,70,72,"Spencer Danielson",70,76,76],
["colorado-state","Colorado State","CSU","Rams","Pac-12","CO",40.57,-105.08,"#1E4D2B","#C8C372",42,3,72,74,58,"Jim Mora",66,70,68],
["fresno-state","Fresno State","FRES","Bulldogs","Pac-12","CA",36.81,-119.75,"#DB0032","#002E6D",44,2,70,68,62,"Matt Entz",62,72,72],
["oregon-state","Oregon State","ORST","Beavers","Pac-12","OR",44.56,-123.28,"#DC4405","#000000",48,2,76,78,58,"Trent Bray",62,70,64],
["san-diego-state","San Diego State","SDSU","Aztecs","Pac-12","CA",32.77,-117.07,"#A6192E","#000000",46,2,74,74,66,"Sean Lewis",64,70,74],
["texas-state","Texas State","TXST","Bobcats","Pac-12","TX",29.89,-97.94,"#501214","#8D734A",40,3,72,66,64,"G.J. Kinne",66,72,76],
["utah-state","Utah State","USU","Aggies","Pac-12","UT",41.75,-111.81,"#0F2439","#FFFFFF",40,2,70,72,58,"Bronco Mendenhall",60,76,72],
["washington-state","Washington State","WSU","Cougars","Pac-12","WA",46.73,-117.16,"#981E32","#5E6A71",44,2,72,76,58,"Kirby Moore",62,70,72],
// American
["army","Army","ARMY","Black Knights","American","NY",41.39,-73.96,"#2C2A29","#D4BF91",48,1,80,95,62,"Jeff Monken",60,82,80],
["navy","Navy","NAVY","Midshipmen","American","MD",38.98,-76.49,"#00205B","#C5B783",48,1,80,95,66,"Brian Newberry",60,80,80],
["tulane","Tulane","TUL","Green Wave","American","LA",29.94,-90.12,"#006747","#41B6E6",50,4,76,92,70,"Will Hall",64,72,72],
["memphis","Memphis","MEM","Tigers","American","TN",35.12,-89.94,"#003087","#888C8F",48,5,76,70,68,"Charles Huff",68,72,72],
["usf","South Florida","USF","Bulls","American","FL",28.06,-82.41,"#006747","#CFC493",46,4,76,74,68,"Brian Hartline",74,72,68],
["utsa","UTSA","UTSA","Roadrunners","American","TX",29.58,-98.62,"#0C2340","#F15A22",44,3,74,68,64,"Jeff Traylor",68,72,74],
["north-texas","North Texas","UNT","Mean Green","American","TX",33.21,-97.13,"#00853E","#FFFFFF",42,4,72,70,70,"Neal Brown",64,72,72],
["east-carolina","East Carolina","ECU","Pirates","American","NC",35.61,-77.37,"#592A8A","#FDC82F",44,3,72,70,62,"Blake Harrell",62,70,70],
// Mountain West
["unlv","UNLV","UNLV","Rebels","Mountain West","NV",36.11,-115.14,"#CF0A2C","#666666",44,4,74,66,70,"Dan Mullen",70,74,80],
["hawaii","Hawaii","HAW","Rainbow Warriors","Mountain West","HI",21.30,-157.82,"#024731","#FFFFFF",40,1,62,72,58,"Timmy Chang",58,68,68],
["air-force","Air Force","AFA","Falcons","Mountain West","CO",38.99,-104.86,"#003087","#8A8D8F",46,1,80,92,58,"Troy Calhoun",56,78,76],
["new-mexico","New Mexico","UNM","Lobos","Mountain West","NM",35.08,-106.62,"#BA0C2F","#63666A",38,2,64,70,60,"Jason Eck",62,74,76],
["wyoming","Wyoming","WYO","Cowboys","Mountain West","WY",41.31,-105.57,"#492F24","#FFC425",38,2,66,70,54,"Jay Sawvel",56,72,66],
["san-jose-state","San Jose State","SJSU","Spartans","Mountain West","CA",37.33,-121.88,"#0055A2","#E5A823",38,2,66,72,56,"Ken Niumatalolo",60,70,70],
["nevada","Nevada","NEV","Wolf Pack","Mountain West","NV",39.54,-119.81,"#003366","#807F84",38,2,66,70,50,"Jeff Choate",58,68,64],
// Sun Belt
["james-madison","James Madison","JMU","Dukes","Sun Belt","VA",38.43,-78.87,"#450084","#CBB677",48,4,80,74,72,"Billy Napier",72,76,70],
["app-state","App State","APP","Mountaineers","Sun Belt","NC",36.21,-81.68,"#222222","#FFCC00",46,2,72,72,58,"Dowell Loggains",60,68,64],
["georgia-southern","Georgia Southern","GASO","Eagles","Sun Belt","GA",32.42,-81.78,"#011E41","#A3AAAE",42,2,70,68,60,"Clay Helton",64,70,70],
["troy","Troy","TROY","Trojans","Sun Belt","AL",31.80,-85.96,"#8A2432","#B3B5B8",40,2,68,66,58,"Gerad Parker",58,68,66],
["louisiana","Louisiana","ULL","Ragin' Cajuns","Sun Belt","LA",30.21,-92.02,"#CE181E","#FFFFFF",40,2,68,68,58,"Michael Desormeaux",58,68,64],
["old-dominion","Old Dominion","ODU","Monarchs","Sun Belt","VA",36.89,-76.30,"#003057","#7C878E",38,2,68,70,62,"Ricky Rahne",60,70,70],
];

const P4 = ["SEC","Big Ten","ACC","Big 12"];
const CONFS = ["SEC","Big Ten","ACC","Big 12","Pac-12","American","Mountain West","Sun Belt","Independent"];
const CONF_GAMES = {"SEC":9,"Big Ten":9,"ACC":8,"Big 12":9,"Pac-12":7,"American":7,"Mountain West":6,"Sun Belt":5};

// rivalry pairs played in the final week (week 14)
const RIVALS = [
["alabama","auburn"],["georgia","georgia-tech"],["florida","florida-state"],["south-carolina","clemson"],["kentucky","louisville"],
["ohio-state","michigan"],["texas","texas-am"],["lsu","oklahoma"],["ole-miss","mississippi-state"],["tennessee","vanderbilt"],["arkansas","missouri"],
["usc","ucla"],["oregon","oregon-state"],["washington","washington-state"],["iowa","nebraska"],["minnesota","wisconsin"],["michigan-state","maryland"],
["penn-state","rutgers"],["indiana","purdue"],["illinois","northwestern"],["notre-dame","stanford"],
["north-carolina","nc-state"],["virginia","virginia-tech"],["duke","wake-forest"],["miami","pitt"],["boston-college","syracuse"],["cal","smu"],
["byu","utah"],["kansas","kansas-state"],["oklahoma-state","iowa-state"],["texas-tech","tcu"],["baylor","houston"],["arizona","arizona-state"],["colorado","west-virginia"],["ucf","cincinnati"],
["army","navy"],["boise-state","san-diego-state"],["fresno-state","colorado-state"],["texas-state","utah-state"],
["tulane","memphis"],["usf","east-carolina"],["utsa","north-texas"],["unlv","nevada"],["hawaii","san-jose-state"],["air-force","new-mexico"],
["james-madison","old-dominion"],["app-state","georgia-southern"],["troy","louisiana"],["uconn","wyoming"]
];
// Traditional rivalries that boost recruiting battles (not schedule)
const STATE_NAMES = {AL:"Alabama",AR:"Arkansas",AZ:"Arizona",CA:"California",CO:"Colorado",CT:"Connecticut",FL:"Florida",GA:"Georgia",HI:"Hawaii",IA:"Iowa",ID:"Idaho",IL:"Illinois",IN:"Indiana",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",MA:"Massachusetts",MD:"Maryland",MI:"Michigan",MN:"Minnesota",MO:"Missouri",MS:"Mississippi",NC:"North Carolina",NE:"Nebraska",NJ:"New Jersey",NM:"New Mexico",NV:"Nevada",NY:"New York",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",SC:"South Carolina",TN:"Tennessee",TX:"Texas",UT:"Utah",VA:"Virginia",WA:"Washington",WI:"Wisconsin",WV:"West Virginia",WY:"Wyoming"};

// recruit geography: [state, weight, lat, lon, cities]
const RECRUIT_GEO = [
["TX",15,31.0,-97.5,["Houston","Dallas","Austin","San Antonio","Fort Worth","Katy","Allen","Duncanville","Southlake","DeSoto","Lake Travis","Tyler","Beaumont","Lubbock"]],
["FL",13,28.3,-81.7,["Miami","Tampa","Orlando","Jacksonville","Fort Lauderdale","Bradenton","Plantation","Tallahassee","Lakeland","Venice"]],
["GA",10,33.3,-84.0,["Atlanta","Buford","Savannah","Macon","Valdosta","Milton","Carrollton","Columbus","Gainesville","Thomasville"]],
["CA",9,34.8,-118.8,["Los Angeles","Santa Ana","Mission Viejo","Corona","San Diego","Sacramento","Oakland","Fresno","Bellflower","Concord"]],
["AL",5,32.8,-86.8,["Birmingham","Mobile","Montgomery","Huntsville","Hoover","Thompson","Auburn","Saraland"]],
["LA",5,30.6,-91.5,["New Orleans","Baton Rouge","Shreveport","Lafayette","Monroe","Destrehan","Ruston"]],
["OH",5,40.2,-82.8,["Columbus","Cincinnati","Cleveland","Akron","Toledo","Massillon","Dayton"]],
["NC",4,35.6,-79.5,["Charlotte","Raleigh","Greensboro","Durham","Wilmington","Matthews"]],
["SC",3,34.0,-81.0,["Columbia","Greenville","Charleston","Rock Hill","Gaffney"]],
["TN",3,35.8,-86.4,["Nashville","Memphis","Knoxville","Chattanooga","Murfreesboro"]],
["MS",3,32.6,-89.7,["Jackson","Hattiesburg","Tupelo","Starkville","Biloxi"]],
["PA",3,40.6,-77.5,["Philadelphia","Pittsburgh","Harrisburg","Erie","Allentown"]],
["NJ",2.5,40.2,-74.6,["Newark","Paterson","Bergen","Camden","Trenton"]],
["MD",2.5,39.1,-76.8,["Baltimore","Olney","Hyattsville","Annapolis"]],
["VA",2.5,37.6,-78.0,["Richmond","Norfolk","Virginia Beach","Chesapeake","Alexandria"]],
["MI",2.5,42.6,-84.0,["Detroit","Grand Rapids","Belleville","Lansing","Southfield"]],
["IL",2.5,41.0,-88.6,["Chicago","Naperville","Joliet","Peoria","Wheaton"]],
["AZ",2,33.2,-111.7,["Phoenix","Chandler","Scottsdale","Tucson","Mesa","Gilbert"]],
["OK",2,35.5,-97.3,["Tulsa","Oklahoma City","Norman","Edmond"]],
["MO",2,38.6,-92.2,["St. Louis","Kansas City","Springfield","Columbia"]],
["IN",1.6,39.8,-86.2,["Indianapolis","Fort Wayne","Carmel","Evansville"]],
["WA",1.6,47.4,-121.5,["Seattle","Tacoma","Spokane","Bellevue"]],
["UT",1.4,40.6,-111.9,["Salt Lake City","Provo","Draper","St. George"]],
["AR",1.4,35.0,-92.4,["Little Rock","Bentonville","Fayetteville","Pine Bluff"]],
["KY",1.2,37.8,-85.2,["Louisville","Lexington","Bowling Green"]],
["NV",1.1,36.3,-115.2,["Las Vegas","Henderson","Reno"]],
["NY",1.1,41.5,-74.5,["Bronx","Brooklyn","Buffalo","Rochester"]],
["MN",1,44.9,-93.3,["Minneapolis","St. Paul","Eden Prairie"]],
["WI",1,43.2,-89.0,["Milwaukee","Madison","Green Bay"]],
["IA",0.8,41.8,-92.5,["Des Moines","Cedar Rapids","Iowa City"]],
["CO",1,39.6,-105.0,["Denver","Colorado Springs","Aurora"]],
["OR",0.8,45.3,-122.8,["Portland","Eugene","Salem"]],
["KS",0.7,38.5,-96.8,["Wichita","Olathe","Topeka"]],
["NE",0.5,41.0,-96.5,["Omaha","Lincoln"]],
["MA",0.7,42.3,-71.4,["Boston","Worcester","Springfield"]],
["CT",0.5,41.5,-72.7,["Hartford","New Haven"]],
["HI",0.6,21.4,-157.9,["Honolulu","Kahuku","Mililani"]],
["WV",0.4,38.6,-80.6,["Charleston","Morgantown"]],
["NM",0.3,35.0,-106.6,["Albuquerque","Las Cruces"]],
["ID",0.3,43.6,-116.3,["Boise","Meridian"]],
];

const FIRST = ["Jaylen","Marcus","DeShawn","Tyler","Caleb","Jordan","Elijah","Isaiah","Malik","Trey","Bryce","Cam","Jalen","Xavier","Josiah","Kendrick","Devin","Micah","Jaden","Ty","Brady","Cole","Mason","Carson","Landon","Chase","Hunter","Jace","Kaden","Tre","Darius","Javon","Kobe","Noah","Ethan","Aiden","Drew","Gavin","Zion","Amari","Kamari","Jamarion","Kingston","Messiah","Cooper","Brock","Jett","Tate","Luke","Owen","Jakobe","Davion","Quentin","Terrance","Andre","Dylan","Austin","Blake","Trent","Kyle","Nico","Mateo","Tavita","Keanu","Manny","Dante","Roman","Rashad","Damon","Desmond","Julian","Grayson","Ryder","Colt","Bo","Easton","Keon","Ahmad","Omari","Jabari","Khalil","Lamar","Reggie","Shedeur","Tristan","Vernon","Will","Zach","Ezekiel","Jeremiah","Nehemiah","Cedric","Emeka","Chidi","Sione","Kainoa","Tevita","Luis","Diego","Carter"];
const LAST = ["Johnson","Williams","Smith","Brown","Jones","Davis","Miller","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Robinson","Lewis","Walker","Allen","Young","King","Wright","Scott","Green","Baker","Adams","Nelson","Hill","Campbell","Mitchell","Carter","Roberts","Phillips","Evans","Turner","Parker","Collins","Edwards","Stewart","Morris","Murphy","Cook","Rogers","Bell","Bailey","Cooper","Richardson","Cox","Howard","Ward","Peterson","Gray","James","Watson","Brooks","Kelly","Sanders","Price","Bennett","Wood","Barnes","Ross","Henderson","Coleman","Jenkins","Perry","Powell","Long","Patterson","Hughes","Washington","Butler","Simmons","Foster","Bryant","Alexander","Russell","Griffin","Hayes","Myers","Ford","Hamilton","Graham","Sullivan","Wallace","Woods","Cole","West","Jordan","Owens","Reynolds","Fisher","Ellis","Harrison","Gibson","McDonald","Marshall","Mack","Tuimoloau","Fifita","Okafor","Nwosu","Mauigoa","Kalani","Gonzalez","Ramirez","Hollins","Pittman","Lockett","Fountain","Dorsey","Battle","Starks","Pope","Holloway","Strong","Booker","Gaines","Stroud","Freeman","Branch","Haynes","Flowers","Burks","Banks","Pickens"];

const POSITIONS = ["QB","RB","WR","TE","OL","DL","EDGE","LB","CB","S","K"];
const POS_SHARE = {QB:0.075,RB:0.08,WR:0.15,TE:0.055,OL:0.16,DL:0.10,EDGE:0.09,LB:0.09,CB:0.11,S:0.075,K:0.015};
const POS_ROSTER_TARGET = {QB:4,RB:5,WR:10,TE:5,OL:15,DL:9,EDGE:7,LB:8,CB:9,S:7,K:2};
const POS_STARTERS = {QB:1,RB:1,WR:3,TE:1,OL:5,DL:2,EDGE:2,LB:2,CB:3,S:2,K:1};
const POS_WEIGHT = {QB:0.20,RB:0.05,WR:0.10,TE:0.04,OL:0.18,DL:0.10,EDGE:0.09,LB:0.07,CB:0.09,S:0.06,K:0.02};
const POS_SIZE = {QB:[74,215],RB:[71,205],WR:[73,190],TE:[76,240],OL:[77,300],DL:[75,295],EDGE:[76,250],LB:[74,228],CB:[72,182],S:[73,200],K:[72,190]};
const POS_FORTY = {QB:4.75,RB:4.50,WR:4.48,TE:4.70,OL:5.20,DL:4.95,EDGE:4.70,LB:4.65,CB:4.45,S:4.52,K:4.95};

const MOTIVES = [
 ["pt","Playing Time","Early path to the field"],
 ["nil","NIL Value","Getting paid what he's worth"],
 ["win","Championship Contender","Competing for titles now"],
 ["prox","Close to Home","Family can see him play"],
 ["coach","Head Coach","Relationship with the head coach"],
 ["dev","NFL Development","Track record producing pros"],
 ["acad","Academics","Degree that lasts beyond football"],
 ["brand","Brand & Facilities","Big stage, best stuff"],
];
const MOTIVE_IDX = {}; MOTIVES.forEach((m,i)=>MOTIVE_IDX[m[0]]=i);

const FCS_OPPS = ["Furman","Sacramento State","Montana","Montana State","North Dakota State","South Dakota State","Idaho","UC Davis","Villanova","Delaware State","Mercer","Chattanooga","Samford","Eastern Kentucky","Austin Peay","Southern Utah","Northern Arizona","Abilene Christian","Incarnate Word","Prairie View A&M","Jackson State","Alabama A&M","Western Carolina","The Citadel","Wofford","Charleston Southern","Kennesaw State","Tennessee Tech","Lafayette","Bucknell","Holy Cross","Maine","Rhode Island","Youngstown State","Illinois State","Northern Iowa","Southeast Missouri","UT Martin","Nicholls","McNeese","Southeastern Louisiana","Stephen F. Austin","Tarleton State","Weber State","Portland State","Eastern Washington","Cal Poly","Florida A&M","Bethune-Cookman","Norfolk State"];

// Season calendar for each cycle. Week labels use the season year.
const BOWLS = ["Las Vegas Bowl","Citrus Bowl","ReliaQuest Bowl","Gator Bowl","Alamo Bowl","Holiday Bowl","Music City Bowl","Pop-Tarts Bowl","Texas Bowl","Duke's Mayo Bowl","Liberty Bowl","Sun Bowl","Pinstripe Bowl","Armed Forces Bowl","Birmingham Bowl","Independence Bowl","First Responder Bowl","Hawai'i Bowl","Arizona Bowl","Boca Raton Bowl"];
const CFP_BOWLS = {qf:["Cotton Bowl","Orange Bowl","Rose Bowl","Sugar Bowl"], sf:["Fiesta Bowl","Peach Bowl"], f:"CFP National Championship — Allegiant Stadium, Las Vegas"};

// ===== v2 DATA =====
MOTIVES.push(
 ["scheme","Scheme Fit","Fits how the team plays"],
 ["stab","Coaching Stability","Coach will be there all four years"],
 ["life","Lifestyle & Climate","Where he wants to live"],
 ["legacy","Family Ties","Family history with a program"]
);
MOTIVES.forEach((m,i)=>MOTIVE_IDX[m[0]]=i);
const OFF_STYLES=["Air Raid","Spread RPO","Pro Style","Power Run","Option"];
const DEF_STYLES=["4-3","3-4","4-2-5","3-3-5"];
const TEAM_STYLE={ "texas-tech":["Air Raid","4-2-5"],"washington-state":["Air Raid","4-2-5"],"north-texas":["Air Raid","4-2-5"],"ole-miss":["Spread RPO","4-2-5"],
 "army":["Option","3-4"],"navy":["Option","3-3-5"],"air-force":["Option","3-4"],"iowa":["Pro Style","4-3"],"wisconsin":["Power Run","3-4"],"michigan":["Power Run","4-3"],
 "georgia":["Pro Style","3-4"],"alabama":["Pro Style","3-4"],"ohio-state":["Spread RPO","4-2-5"],"oregon":["Spread RPO","3-4"],"penn-state":["Pro Style","4-3"],"lsu":["Spread RPO","4-3"],
 "notre-dame":["Pro Style","4-2-5"],"stanford":["Pro Style","3-4"],"indiana":["Spread RPO","4-2-5"],"texas":["Spread RPO","4-2-5"],"utah":["Power Run","4-2-5"],"kansas-state":["Power Run","3-3-5"],
 "west-virginia":["Spread RPO","3-3-5"],"usc":["Air Raid","4-3"],"oklahoma":["Spread RPO","4-2-5"],"tennessee":["Spread RPO","4-3"],"smu":["Spread RPO","4-2-5"],"minnesota":["Power Run","4-3"],
 "boston-college":["Pro Style","4-3"],"north-carolina":["Pro Style","3-4"],"baylor":["Spread RPO","3-3-5"],"pitt":["Pro Style","4-3"],"clemson":["Spread RPO","4-3"],"miami":["Pro Style","4-3"]};
const COACH_YRS={georgia:10,alabama:2,tennessee:5,texas:5,"texas-am":2,oklahoma:4,missouri:6,"south-carolina":5,"mississippi-state":2,vanderbilt:5,illinois:5,indiana:2,iowa:27,maryland:7,
 nebraska:3,northwestern:2,"ohio-state":7,oregon:4,purdue:1,rutgers:6,usc:4,washington:2,wisconsin:3,"boston-college":1,clemson:17,duke:1,"florida-state":6,"georgia-tech":3,louisville:3,miami:4,
 "nc-state":13,"north-carolina":1,pitt:11,smu:3,syracuse:2,virginia:4,"wake-forest":1,arizona:1,"arizona-state":3,baylor:6,byu:10,cincinnati:3,colorado:3,houston:1,kansas:5,tcu:4,"texas-tech":4,
 ucf:1,"west-virginia":1,"notre-dame":4,minnesota:9,"boise-state":2,army:12,navy:3,"air-force":19,utsa:7,unlv:1,hawaii:3,"san-jose-state":1,nevada:1,wyoming:2,"new-mexico":1,"oregon-state":2,
 "utah-state":1,"fresno-state":1,"san-diego-state":1,"texas-state":2,"app-state":1,"georgia-southern":3,troy:1,louisiana:4,"old-dominion":6,"east-carolina":1};
// Hidden player traits. dev = progression multiplier; port = portal risk add; vis = how it's usually discovered
const TRAITS={
 gym:{n:"Gym Rat",i:"🏋️",good:1,dev:1.3,d:"Lives in the weight room. Develops faster.",vis:"eval"},
 film:{n:"Film Junkie",i:"🎞️",good:1,dev:1.12,game:0.25,d:"Studies tape obsessively. Steady growth, plays smart.",vis:"film"},
 quick:{n:"Quick Learner",i:"⚡",good:1,early:1.35,d:"Picks up the playbook fast. Big jumps early in his career.",vis:"film"},
 lead:{n:"Natural Leader",i:"📣",good:1,mor:6,game:0.2,d:"Teammates follow him. Lifts locker-room morale.",vis:"talk"},
 clutch:{n:"Clutch",i:"🎯",good:1,game:0.35,d:"Raises his level in big moments.",vis:"film"},
 iron:{n:"Iron Man",i:"🛡️",good:1,d:"Never misses a practice or a game.",vis:"eval"},
 loyal:{n:"Loyal",i:"🤝",good:1,port:-0.12,flip:0.35,d:"Once he commits, he's yours. Rarely transfers.",vis:"talk"},
 raw:{n:"Raw Athlete",i:"🧪",good:0,dev:1.0,late:1.45,early:0.75,d:"Elite tools, unrefined. Slow start, huge upside later.",vis:"eval"},
 brand:{n:"Brand Builder",i:"📸",good:0,nil:1.5,d:"Big social following. Expects big NIL — and brings attention.",vis:"talk"},
 lazy:{n:"Coasts",i:"😴",good:-1,dev:0.65,d:"Talent carries him… until it doesn't. Slow development.",vis:"eval"},
 diva:{n:"Diva",i:"💅",good:-1,port:0.18,mor:-5,d:"Needs the ball and the spotlight. Portal risk if unhappy.",vis:"talk"},
 home:{n:"Homesick",i:"🏠",good:-1,port:0.15,d:"Struggles far from home. Transfer risk if he's far away.",vis:"talk"},
 inj:{n:"Injury Prone",i:"🩹",good:-1,dev:0.85,d:"Keeps getting dinged. Misses development time.",vis:"eval"},
 party:{n:"Off-Field Concerns",i:"🚨",good:-1,mor:-3,d:"Discipline issues. Suspensions happen.",vis:"talk"},
};
const TRAIT_KEYS=Object.keys(TRAITS);
const SKILLS=[["eval","Evaluation","Faster scouting; at Lv6+ your own grades stop misreading"],["pers","Persuasion","Calls & pitches land harder; learn priorities faster"],["rel","Relationships","Visits, HC visits & official visits hit harder"],["neg","Negotiation","NIL dollars go further; cheaper retention; fewer NIL Go flags"],["net","Networking","+1 hour/week per level; bigger booster nights"]];

// ===== v3 DATA: director career, administration, pipelines =====
const PERKS=[
 {k:"e1",b:"Evaluator",n:"Film Room Efficiency",d:"Film study costs 1 hour instead of 2."},
 {k:"e2",b:"Evaluator",n:"Eye for Talent",d:"Spot 💎 gems and ⚠️ overrated kids at 30% scouting. Transcripts visible immediately."},
 {k:"e3",b:"Evaluator",n:"Trait Whisperer",d:"+50% chance to uncover hidden traits — recruits and your own roster."},
 {k:"e4",b:"Evaluator",n:"Projection Expert",d:"Exact ceiling grades at 40% scouting, and your grades never misread."},
 {k:"c1",b:"Closer",n:"Silver Tongue",d:"Calls and pitches are 15% more effective."},
 {k:"c2",b:"Closer",n:"Living Room Legend",d:"+1 head-coach visit every week."},
 {k:"c3",b:"Closer",n:"Flip Artist",d:"+35% interest gains on players committed elsewhere."},
 {k:"c4",b:"Closer",n:"Closer",d:"When a recruit decides and you're within 10% of the leader, he picks you."},
 {k:"n1",b:"Connector",n:"Grinder",d:"+4 recruiting hours every week."},
 {k:"n2",b:"Connector",n:"Pipeline Builder",d:"High school and state pipelines grow twice as fast."},
 {k:"n3",b:"Connector",n:"Portal Hawk",d:"+30% interest gains with transfers; see their exact OVR."},
 {k:"n4",b:"Connector",n:"Booster Whisperer",d:"Booster dinners raise 50% more; pledges after wins come more often."},
 {k:"x1",b:"Executive",n:"Cap Guru",d:"Your NIL offers land like they're 10% bigger."},
 {k:"x2",b:"Executive",n:"Visit Architect",d:"Official visits hit 20% harder and you get +4 OV slots per weekend."},
 {k:"x3",b:"Executive",n:"AD's Right Hand",d:"+50% political capital earned; +15% odds on every AD request."},
 {k:"x4",b:"Executive",n:"Culture Keeper",d:"Retention asks 25% cheaper and 30% less portal risk."},
];
const PERK_BRANCHES=["Evaluator","Closer","Connector","Executive"];
const DIR_TITLES=[[1,"Recruiting Assistant"],[4,"Recruiting Coordinator"],[8,"Director of Recruiting"],[13,"Elite Recruiter"],[19,"Recruiting Legend"]];
// administration: academic standard tiers and honor codes
const SCHOOL_RULES={stanford:{acad:"strict"},northwestern:{acad:"strict"},duke:{acad:"strict"},"notre-dame":{acad:"strict",honor:1},cal:{acad:"strict"},
 "georgia-tech":{acad:"strict"},virginia:{acad:"strict"},vanderbilt:{acad:"strict"},"boston-college":{acad:"moderate"},"wake-forest":{acad:"moderate"},michigan:{acad:"moderate"},ucla:{acad:"moderate"},
 byu:{acad:"moderate",honor:1},army:{acad:"strict",honor:1},navy:{acad:"strict",honor:1},"air-force":{acad:"strict",honor:1},tulane:{acad:"moderate"},usc:{acad:"moderate"}};
const TIER_GPA={strict:3.3,moderate:2.7,flexible:2.3};
const TIER_WAIV={strict:0,moderate:2,flexible:4};
const TIER_ORDER=["strict","moderate","flexible"];
const AD_REQS=[
 {k:"nil",n:"Increase player-comp commitment",d:"+$800K/yr to your NIL & rev-share budget.",pc:30},
 {k:"staff",n:"Fund more recruiting staff",d:"+4 hours/week and +2 official-visit slots per weekend.",pc:25},
 {k:"fac",n:"Push a facilities project",d:"+5 facilities, small prestige bump.",pc:40},
 {k:"waiv",n:"Admissions exception",d:"+1 academic/honor-code waiver for this class.",pc:15},
 {k:"relax",n:"Relax academic standards",d:"Permanently lower your admissions bar one tier. Tough sell at elite academic schools.",pc:60},
];
const HS_SUFFIX=["High","Central","North","South","East","West","Catholic","Prep","Christian","Academy","Lakes","Ridge","Valley","Heights","Memorial","Senior High"];

// ===== v4 DATA =====
// Famous rivalries played during the season (in addition to rivalry week)
const RIVAL_EXTRA=[["texas","oklahoma"],["alabama","tennessee"],["alabama","lsu"],["georgia","florida"],["georgia","auburn"],["michigan","michigan-state"],["usc","notre-dame"],["oregon","washington"],
 ["florida","tennessee"],["clemson","florida-state"],["miami","florida-state"],["texas-am","lsu"],["ohio-state","penn-state"],["oklahoma","oklahoma-state"],["navy","notre-dame"],["arizona-state","utah"],
 ["wisconsin","iowa"],["virginia-tech","west-virginia"],["boise-state","fresno-state"],["texas","texas-tech"],["army","air-force"],["navy","air-force"],["byu","boise-state"],["pitt","penn-state"],["kansas","missouri"]];
const SERVICES={A:"PrepGrid 300",B:"Blue Chip Index"};
BOWLS.push("Gasparilla Bowl","Frisco Bowl","Myrtle Beach Bowl","New Mexico Bowl","LA Bowl","Famous Idaho Potato Bowl","Camellia Bowl","Cure Bowl","Bahamas Bowl","Military Bowl","Fenway Bowl","Salute to Veterans Bowl","Rate Bowl","Xbox Bowl","New Orleans Bowl","Tailgate Bowl");

// ===== v5 DATA =====
function buildCalendar(yr){
  const cal=[];
  const wkDates=["Aug 29","Sep 5","Sep 12","Sep 19","Sep 26","Oct 3","Oct 10","Oct 17","Oct 24","Oct 31","Nov 7","Nov 14","Nov 21","Nov 28"];
  cal.push({key:"pre",label:"Preseason",date:"Aug 22",type:"pre"});
  for(let w=0;w<=13;w++) cal.push({key:"w"+w,label:"Week "+w,date:wkDates[w],type:"game",week:w});
  cal.push({key:"esp",label:"Early Signing Period",date:"Dec 2",type:"esp",dead:true});
  cal.push({key:"ccg",label:"Championship Weekend",date:"Dec 5",type:"ccg"});
  cal.push({key:"sel",label:"CFP Selection, Bowls & Carousel",date:"Dec 6",type:"sel"});
  cal.push({key:"cfp1",label:"CFP First Round",date:"Dec 19",type:"cfp",round:1,dead:true});
  cal.push({key:"cfpq",label:"CFP Quarterfinals",date:"Jan 1",type:"cfp",round:2,dead:true});
  cal.push({key:"portal1",label:"Transfer Portal: Opening Days",date:"Jan 5",type:"portal"});
  cal.push({key:"cfps",label:"CFP Semifinals",date:"Jan 9",type:"cfp",round:3});
  cal.push({key:"allstar",label:"All-American Bowl Week",date:"Jan 10",type:"allstar"});
  cal.push({key:"portal2",label:"Transfer Portal: Closing Window",date:"Jan 14",type:"portal"});
  cal.push({key:"cfpf",label:"CFP National Championship",date:"Jan 18",type:"cfp",round:4});
  cal.push({key:"nsd",label:"National Signing Day",date:"Feb 3",type:"nsd"});
  cal.push({key:"spring1",label:"Junior Days",date:"Mar",type:"off"});
  cal.push({key:"spring2",label:"Spring Practice & NFL Draft",date:"Apr",type:"off"});
  cal.push({key:"spring3",label:"Spring Evaluation Period",date:"May",type:"off"});
  cal.push({key:"camp",label:"Camp Season",date:"Jun 1",type:"camp"});
  cal.push({key:"ov1",label:"Official Visits I",date:"Jun 12",type:"ov"});
  cal.push({key:"ov2",label:"Official Visits II",date:"Jun 26",type:"ov"});
  cal.push({key:"jul",label:"Commitment Season",date:"Jul",type:"off"});
  return cal;
}
const STAFF_ROLES=[{k:"oc",n:"Offensive Coordinator",pos:["QB"],side:"off"},{k:"dc",n:"Defensive Coordinator",pos:["LB","S"],side:"def"},
 {k:"op",n:"Offensive Position Coach",pos:null,side:"off"},{k:"dp",n:"Defensive Position Coach",pos:null,side:"def"},{k:"rc",n:"Recruiting Coordinator",pos:[],side:null}];
const POS_GROUPS={off:[["WR","TE"],["OL"],["RB"]],def:[["DL","EDGE"],["CB"]]};
const CAMP_REGIONS=[["Southeast Elite Camp",["FL","GA","AL","SC","MS","TN","LA"]],["Lone Star Camp",["TX","OK","AR","LA"]],["West Coast Showcase",["CA","AZ","NV","UT","WA","OR","HI","CO","ID","NM"]],["Midwest–Northeast Camp",["OH","MI","IL","IN","PA","NJ","NY","MD","VA","WI","MN","IA","MO","KY","MA","CT","WV","KS","NE"]]];
const HANDLER_KINDS=["trainer","7-on-7 coach","uncle","\"family advisor\""];
const PARENT_KINDS={acad:"Mom wants a real degree plan",pt:"Dad wants a path to early playing time",close:"Grandma wants him close enough to visit",faith:"Family wants a strong faith community",dad:"Dad played college ball and runs point on the recruitment"};
const DIFF_MULT={easy:0.85,normal:1.1,hard:1.35};
const SAVE_VER=7;

// ===== v6 DATA: play styles & scheme synergy =====
// Each archetype's natural fit by scheme (-1..1). Offense: Air Raid, Spread RPO, Pro Style, Power Run, Option. Defense: 4-3, 3-4, 4-2-5, 3-3-5.
const ARCH={
 QB:[["Pocket Passer",[0.8,0,1,0.2,-1]],["Dual-Threat",[-0.3,1,-0.4,0.2,1]],["Gunslinger",[1,0.4,0.2,-0.6,-1]],["Game Manager",[-0.4,0.2,0.6,1,0.3]]],
 RB:[["Power Back",[-0.6,0,0.4,1,0.6]],["Scat Back",[1,0.6,-0.2,-0.6,0]],["Zone Runner",[0,1,0.6,0.2,0.4]],["Receiving Back",[0.8,0.6,0.4,-0.4,-0.6]]],
 WR:[["Deep Threat",[1,0.4,0.4,0.2,-0.4]],["Possession",[0.6,0.4,0.8,0,-0.6]],["Slot Quick",[1,0.8,-0.2,-0.6,-0.4]],["Big Body",[0,0.4,0.8,0.6,0]]],
 TE:[["Blocking TE",[-1,-0.2,0.6,1,0.8]],["Receiving TE",[0.6,0.8,0.4,-0.4,-0.6]],["H-Back",[-0.2,0.6,0.6,0.6,0.4]]],
 OL:[["Mauler",[-0.6,0,0.6,1,0.6]],["Zone Blocker",[0,1,0.4,0,0.6]],["Pass Protector",[1,0.4,0.6,-0.4,-0.8]]],
 DL:[["Nose Tackle",[0,1,-0.6,0.2]],["3-Tech Penetrator",[1,-0.2,0.8,0]],["Two-Gapper",[0.2,1,-0.2,0.6]]],
 EDGE:[["Speed Rusher",[0.6,0,1,0.4]],["Power End",[1,-0.2,0.2,0]],["Stand-Up OLB",[-0.4,1,0.2,0.8]]],
 LB:[["Run Stopper",[1,0.6,-0.4,0]],["Coverage LB",[0,0,1,0.8]],["Blitzer",[0.2,1,0.4,0.6]]],
 CB:[["Press Man",[0.6,0.6,0.4,-0.4]],["Zone Corner",[0,0.2,0.6,1]],["Nickel",[-0.4,0,1,0.8]]],
 S:[["Box Safety",[1,0.6,-0.2,0.2]],["Center Fielder",[0.2,0.4,0.8,0.6]],["Hybrid",[-0.2,0.4,1,1]]],
 K:[["Kicker",[0,0,0,0,0]]]
};
const OFF_POS=["QB","RB","WR","TE","OL"];
const FIT_LETTER={4:"A+",3:"A",2:"B+",1:"B",0:"C","-1":"C-","-2":"D+","-3":"D","-4":"F"};
