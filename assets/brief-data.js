/* Slot inventory shared by brief.html and sitemap.html */
/* ---------- slot inventory ---------- */
var P = [
 {code:'HM', name:'Homepage', url:'index.html', group:'Built pages', slots:[
  ['HM-01','photo','Hero photo','2400×1200 landscape, New York skyline or a large gathering; the current one is a stock skyline'],
  ['HM-02','text','Hero headline and one-line intro','Confirm “Helping New York youth live, lead and love like Jesus.” or supply your own, plus 25 words'],
  ['HM-03','file','Featured event flyer','AY Congress flyer at 1600px+ (current copy is small and says XIX; confirm XVIII vs XIX)'],
  ['HM-04','data','Three next events','Dates from gnycyouth.org (Retreat Sep 25–27, TLT Convention Oct 3–4, Bible Olympics Oct 24); add venues, blurbs, links and flyers'],
  ['HM-11','link','2027 club registration','URL of the club registration form (banner on gnycyouth.org)'],
  ['HM-05','text','Three real stories for the homepage','Headline, 40–60 word summary, month, author, and a photo 1600×1000 from the event with consent on file. No stock and no placeholder text; assign a writer'],
  ['HM-07','text','Club card descriptions','Confirm the four 25-word descriptions and age ranges'],
  ['HM-08','file','Four featured resources','Which four downloads should the homepage show; link or file for each'],
  ['HM-09','link','Store link','Done: gnycyouth.org/shop'],
  ['HM-10','file','Year calendar PDF','The current season’s printable calendar']]},
 {code:'PF', name:'Pathfinders', url:'ministries/pathfinders.html', group:'Built pages', note:'Ministry page layout. Adventurers, Master Guides and AY Ministries use the same layout and the same list of slots.', slots:[
  ['PF-01','photo','Hero photo','1600×2000 portrait, Pathfinders in Class A uniform, outdoors'],
  ['PF-02','text','Tagline','25–40 words'],
  ['PF-03','data','Three figures','Number of clubs, Pathfinders, trained staff (real numbers)'],
  ['PF-04','text','Why Pathfinders','60–90 words in the Director’s voice'],
  ['PF-05','people','Pathfinder page lead','Done: Dr. Andrew Gordon, Associate Director · Club Ministry; add email'],
  ['PF-06','data','The club year (cycle)','Confirm the real Pathfinder annual cycle: which events, in what order, in which month. The timeline shown is a draft'],
  ['PF-07','photo','Honors photo','1600×700, sash close-up or an honor being taught'],
  ['PF-08','auto','Upcoming events','Pulled from the Events calendar when tagged Pathfinders'],
  ['PF-09','link','Monthly report','Form or portal URL, due date'],
  ['PF-10','link','Safety & screening','Sterling Volunteers / child-protection instructions'],
  ['PF-11','people','Leadership','Done: names from gnycyouth.org; add headshots 600×600 and emails for the seven lead area coordinators'],
  ['PF-12','data','Club directory','Every club: church, neighbourhood, area, meeting day/time, director name, email or phone'],
  ['PF-13','link','Map','Google My Maps link, or we build it from the church addresses in PF-12'],
  ['PF-14','photo','Gallery','6 photos, 1200px+ long side: campout, drill, PBE, service, worship, investiture'],
  ['PF-15','text','FAQ','Confirm or rewrite the five answers; add cost range and uniform supplier'],
  ['PF-16','link','New-club enquiries','Email address to receive them']]},
 {code:'PBE', name:'Pathfinder Bible Experience', url:'ministries/pathfinders/bible-experience.html', group:'Built pages', note:'Sub-ministry page layout. TLT, Drum Corps, Drilling & Marching, Young Adults, School of Evangelism and Public Campus Ministry use the same layout.', slots:[
  ['PBE-01','photo','PBE logo','Supplied 21 Sep 2026 (518×369 PNG); a larger or vector copy is in the NAD logo pack on nadpbe.org'],
  ['PBE-02','text','Intro','30–50 words'],
  ['PBE-03','link','Team registration','Form URL and deadline'],
  ['PBE-04','text','Book and version','Confirm 2026–27 books (Mark, 1 & 2 Peter, 1, 2 & 3 John, per nadpbe.org) and the Bible version used at GNYC rounds'],
  ['PBE-05','data','Round dates','Club, area, conference, union, division dates and venues'],
  ['PBE-06','photo','Testing photo','1600×1000, a team at the table'],
  ['PBE-07','link','Registration form','Google Form or Events portal, fee if any'],
  ['PBE-08','file','GNYC study additions','NAD links are in place; add GNYC round details, sample questions or coach notes if any'],
  ['PBE-09','text','How a round works','Confirm question count, timing and scoring bands for GNYC'],
  ['PBE-10','data','Honour roll','Last 3 seasons: club names that placed first at each level + 1 team photo each'],
  ['PBE-11','people','PBE coordinator','Dr. Andrew Gordon shown as responsible; name the PBE coordinator if there is one, with email'],
  ['PBE-12','text','FAQ','Confirm the four answers']]},
 {code:'EV', name:'Events', url:'events.html', group:'Built pages', slots:[
  ['EV-01','text','Intro line','One sentence and the season the calendar covers'],
  ['EV-02','link','Calendar subscription','Public Google Calendar or iCal URL'],
  ['EV-03','file','Printable calendar','This season’s PDF'],
  ['EV-04','data','Featured event','Title, dates, venue, 40 words, registration link, flyer 1600px+'],
  ['EV-05','data','Every event this season','Title, date, time, venue, audience (Adventurers / Pathfinders / Leaders / Youth), 30 words, flyer 1200×1200, registration link. A spreadsheet is ideal']]},
 {code:'RS', name:'Resources', url:'resources.html', group:'Built pages', slots:[
  ['RS-01','text','Intro','30–50 words'],
  ['RS-02','file','Resource inventory','Every document to publish: title, one-line description, ministry, category, the file (PDF/Doc/link), year, English or Spanish. A spreadsheet plus a folder of files']]},
 {code:'AB', name:'About & Leadership', url:'about.html', group:'Built pages', slots:[
  ['AB-01','photo','Hero photo','1600×1200, the team or a large gathering'],
  ['AB-02','text','Mission statement','30–50 words'],
  ['AB-03','people','Youth Director','Done from gnycyouth.org: Pr. Christian Genao'],
  ['AB-04','text','Director’s welcome','150–220 words, first person'],
  ['AB-05','text','Four pillars','Confirm or rewrite: title + 25 words each'],
  ['AB-06','people','Department staff','Names, titles and photos done from gnycyouth.org (5 people); add each person’s email'],
  ['AB-07','people','Lead area coordinators','15 names and areas done from gnycyouth.org (Club and AY tracks); add headshots 800×1000 and emails'],
  ['AB-08','data','Timeline','Youth directors since 1979 done; add founding dates (first club, first camporee, first congress)'],
  ['AB-09','text','Office hours and contacts','Hours, and the best contact per ministry']]},
 {code:'ADA', name:'Adventurer Awards', url:'ministries/adventurers/awards.html', group:'Built pages', slots:[
  ['ADA-01','text','Intro','30–50 words; which awards GNYC clubs teach most'],
  ['ADA-02','photo','Patch photos','117 awards still show a grey circle; 34 patch photos came from the Climb Higher camporee app. Photograph or scan the rest on a plain background, 600×600'],
  ['ADA-03','text','Class check','Confirm the class assignment for Potato and Trikes & Bikes, and whether Healthy Me and Insects (Little Lamb) are still current']]},
 {code:'DS', name:'Design guidelines', url:'design.html', group:'Built pages', slots:[
  ['DS-01','file','Official seal','GNYC Youth seal as vector (SVG/AI/EPS) or PNG 2000px, transparent'],
  ['DS-02','file','Club emblems','Adventurer, Pathfinder, Master Guide, AY emblems as vector or PNG 2000px, transparent (we have web-size copies)'],
  ['DS-03','file','Pathfinder class insignia','Friend, Companion, Explorer, Ranger, Voyager, Guide emblems, transparent PNG or vector, supplied 21 Sep 2026 as one sheet; used on the Pathfinders page. Vector originals from AdventSource still welcome for print']]},
 {code:'AD', name:'Adventurers', tmpl:'PF', url:'ministries/adventurers.html', group:'Built pages · ministry layout', slots:null, note:'Class emblems, club logo and the NAD illustrated backgrounds are in place (AD-01, AD-07 done); a real photo can replace the hero illustration later'},
 {code:'MG', name:'Master Guides', tmpl:'PF', url:'ministries/master-guides.html', group:'Built pages · ministry layout', slots:null},
 {code:'AY', name:'AY Ministries', tmpl:'PF', url:'ministries/ay-ministries.html', group:'Built pages · ministry layout', slots:null},
 {code:'TLT', name:'Teen Leadership Training', tmpl:'PBE', url:'ministries/pathfinders/teen-leadership-training.html', group:'Built pages · program layout', slots:null, note:'Logo supplied 21 Sep 2026 (TLT-01 done)'},
 {code:'DC', name:'Drum Corps', tmpl:'PBE', url:'ministries/pathfinders/drum-corps.html', group:'Built pages · program layout', slots:null},
 {code:'DM', name:'Drilling & Marching', tmpl:'PBE', url:'ministries/pathfinders/drilling-marching.html', group:'Built pages · program layout', slots:null},
 {code:'YA', name:'Young Adults', tmpl:'PBE', url:'ministries/ay/young-adults.html', group:'Built pages · program layout', slots:null},
 {code:'SOE', name:'School of Evangelism', tmpl:'PBE', url:'ministries/ay/school-of-evangelism.html', group:'Built pages · program layout', slots:null},
 {code:'PCM', name:'Public Campus Ministry', tmpl:'PBE', url:'ministries/ay/public-campus-ministry.html', group:'Built pages · program layout', slots:null, note:'Logo supplied 22 Sep 2026 (PCM-01 done)'},
 {code:'NW', name:'News & stories', url:'news.html', group:'Built pages · other', slots:[
  ['NW-01','text','Stories to launch with','6–10 real stories: headline, 300–600 words, month, author. Assign writers by ministry'],
  ['NW-02','photo','Story photos','1600×1000 per story from the event, plus 2–4 inside photos; photo consent on file for minors'],
  ['NW-03','data','Categories','Which tags to use (club, event, leadership, young adults, safety…)']]},
 {code:'HS', name:'Our history', url:'history.html', group:'Built pages · other', slots:[
  ['HS-01','text','Theme summaries','One or two sentences for the years without one (2025–2020, 2017–2018, 2015, 2006, 2005, 2004); 2019 artwork missing'],
  ['HS-02','photo','Archive photos','3–6 scans or photos, any size, with year and caption'],
  ['HS-03','data','Directors','Done from gnycyouth.org; confirm gaps 1986–1990 and 1997–2003'],
  ['HS-04','text','History narrative','400–800 words in the Director’s words']]},
 {code:'LG', name:'Legal & policies', group:'Not mocked up', slots:[
  ['LG-01','file','Privacy policy, terms, risk management','Current text or documents; confirm the three footer links']]}
];
/* generic ministry / sub-ministry slot lists for sibling pages */
var TEMPLATES={
 PF:[['01','photo','Hero photo','1600×2000 portrait, members in uniform or in action'],['02','text','Tagline','25–40 words'],['03','data','Three figures','Clubs / members / staff'],['04','text','Why this ministry','60–90 words'],['05','people','Ministry lead','Done from gnycyouth.org; add email'],['06','data','The year (cycle)','Confirm the real annual cycle for this ministry: events, order and month. The timeline shown is a draft'],['07','photo','Feature photo','1600×700'],['08','auto','Upcoming events','From the calendar'],['09','link','Director report / portal','URL'],['10','link','Safety & screening','URL'],['11','people','Leadership','Names done from gnycyouth.org; add coordinator headshots and emails'],['12','data','Club or group directory','Church, area, meeting time, contact'],['13','link','Map','Link or addresses'],['14','photo','Gallery','6 photos 1200px+'],['15','text','FAQ','5 questions and answers'],['16','link','Enquiries email','Address']],
 PBE:[['01','photo','Key art or logo','800×1067 or emblem, transparent'],['02','text','Intro','30–50 words'],['03','link','Sign-up or registration','URL and deadline'],['04','text','What it is this year','Focus, level or theme for the season'],['05','data','Key dates','Dates and venues'],['06','photo','Action photo','1600×1000'],['07','link','Form','Registration or application form'],['08','file','Resources','3–6 PDFs or links'],['09','text','How it works','Rules, requirements or curriculum summary, 80–120 words'],['10','data','Highlights or results','Recent achievements + photos'],['11','people','Coordinator','Responsible director shown; name the program coordinator if appointed, with email'],['12','text','FAQ','4 questions and answers']]
};

/* items already supplied during the prototype are marked in their spec */
function preDone(spec){return /^(Done|Supplied)/i.test(spec||'')}
