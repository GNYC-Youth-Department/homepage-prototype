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
  ['PF-07','photo','Honors photo','Not shown since the Sep 27, 2026 page rework; optional: an investiture photo 1600×900 for the Investiture card'],
  ['PF-08','auto','Upcoming events','Pulled from the Events calendar when tagged Pathfinders'],
  ['PF-09','link','Monthly report','Form or portal URL, due date'],
  ['PF-10','link','Safety & screening','Sterling Volunteers / child-protection instructions'],
  ['PF-11','people','Leadership','Done: names from gnycyouth.org; add headshots 600×600 and emails for the seven lead area coordinators'],
  ['PF-12','data','Club directory','Every club: church, neighborhood, area, meeting day/time, director name, email or phone'],
  ['PF-13','link','Map','Google My Maps link, or we build it from the church addresses in PF-12'],
  ['PF-14','photo','Gallery','6 photos, 1200px+ long side: campout, drill, PBE, service, worship, investiture'],
  ['PF-15','text','FAQ','Confirm or rewrite the five answers; add cost range and uniform supplier'],
  ['PF-16','link','New-club inquiries','Email address to receive them'],
  ['PF-17','text','Why join: six reasons','Pathfinders page only. DRAFT: confirm or rewrite each reason, 20–30 words'],
  ['PF-18','text','Voices','Pathfinders page only. One parent and one Pathfinder quote, 25–40 words each, first name, club, and permission to publish'],
  ['PF-19','text','Aim and Motto','Pathfinders page only. Confirm the Aim and Motto wording GNYC uses'],
  ['PF-20','text','Class focus lines','Pathfinders page only. DRAFT: one focus line per class (Friend to Guide), 15–25 words, checked against the NAD class descriptions'],
  ['PF-21','data','Curriculum areas','Pathfinders page only. Confirm the Investiture Achievement area names used in GNYC clubs; some editions call the last area Honor Enrichment rather than Lifestyle Enrichment'],
  ['PF-22','text','Levels of dress','DRAFT NAD defines only Class A; confirm which of Modified A, Class B and Class C GNYC uses and when'],
  ['PF-23','text','How to start a club','DRAFT five steps shown in How to start. Confirm the GNYC process: who approves, how a club registers with the conference, fees, and Basic Staff Training dates']]},
 {code:'PBE', name:'Pathfinder Bible Experience', url:'ministries/pathfinders/bible-experience.html', group:'Built pages', note:'Sub-ministry page layout. TLT, Drum Corps, Drilling & Marching, Young Adults, School of Evangelism and Public Campus Ministry use the same layout.', slots:[
  ['PBE-01','photo','PBE logo','Supplied Sep 21, 2026 (518×369 PNG); a larger or vector copy is in the NAD logo pack on nadpbe.org'],
  ['PBE-02','text','Intro','30–50 words'],
  ['PBE-03','link','Team registration','Form URL and deadline'],
  ['PBE-04','text','Book and version','Confirm 2026–27 books (Mark, 1 & 2 Peter, 1, 2 & 3 John, per nadpbe.org) and the Bible version used at GNYC rounds'],
  ['PBE-05','data','Round dates','Club, area, conference, union, division dates and venues'],
  ['PBE-06','photo','Testing photo','1600×1000, a team at the table'],
  ['PBE-07','link','Registration form','Google Form or Events portal, fee if any'],
  ['PBE-08','file','GNYC study additions','NAD links are in place; add GNYC round details, sample questions or coach notes if any'],
  ['PBE-09','text','How a round works','Confirm question count, timing and scoring bands for GNYC'],
  ['PBE-10','data','Honor roll','Last 3 seasons: club names that placed first at each level + 1 team photo each'],
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
  ['AB-09','text','Office hours and contacts','Hours, and the best contact per ministry'],
  ['AB-10','data','How we’re organized','DRAFT confirm the age ranges used in the structure chart']]},
 {code:'ADA', name:'Adventurer Awards', url:'ministries/adventurers/awards.html', group:'Built pages', slots:[
  ['ADA-01','text','Intro','30–50 words; which awards GNYC clubs teach most'],
  ['ADA-02','photo','Patch photos','73 of 156 awards have a patch photo and are listed (34 from the Climb Higher camporee app, 39 from clubministries.org, Sep 27, 2026). The other 83 are hidden until a photo is supplied: photograph or scan them on a plain background, 600×600, and they appear automatically'],
  ['ADA-03','text','Class check','Done Sep 27, 2026 from the clubministries.org awards table: Potato is Busy Bee, Trikes & Bikes is Little Lamb, and Healthy Me and Insects are current Little Lamb stars. Five awards were added (ABCs, Colors, Numbers, Skater, Stamp Art); Stamp Art has no requirements page yet']]},
 {code:'PFH', name:'Pathfinder Honors', url:'ministries/pathfinders/honors.html', group:'Built pages', note:'All 567 honors, categories, approval, skill levels and patch images come from the AY Honors list on the Pathfinder Wiki (Aug 10, 2026). Each patch links to its wiki page, so requirements are not kept on our site.', slots:[
  ['PFH-01','text','Intro','30–50 words; name the honors GNYC teaches at camporee, if any'],
  ['PFH-02','link','Patch image permission','Before the live site: written permission from NAD Youth Ministries to host the 567 patch images, or switch to linking them from the wiki']]},
 {code:'DS', name:'Design guidelines', url:'design.html', group:'Built pages', slots:[
  ['DS-01','file','Official seal','GNYC Youth seal as vector (SVG/AI/EPS) or PNG 2000px, transparent'],
  ['DS-02','file','Club emblems','Adventurer, Pathfinder, Master Guide, AY emblems as vector or PNG 2000px, transparent (we have web-size copies)'],
  ['DS-03','file','Pathfinder class insignia','Friend, Companion, Explorer, Ranger, Voyager, Guide emblems, transparent PNG or vector, supplied Sep 21, 2026 as one sheet; used on the Pathfinders page. Vector originals from the GNYC Youth Store still welcome for print']]},
 {code:'AD', name:'Adventurers', tmpl:'PF', url:'ministries/adventurers.html', group:'Built pages · ministry layout', slots:[
  ['AD-02','text','Tagline','tagline, 25–40 words'],
  ['AD-03','data','Three figures','3 real figures'],
  ['AD-04','text','Why Adventurers','why this ministry, 60–90 words, in the Director’s voice'],
  ['AD-05','people','Page lead','Done from gnycyouth.org; add email'],
  ['AD-06','data','The club year (cycle)','DRAFT. Confirm the real annual cycle: events, order and month for each milestone'],
  ['AD-07','text','Classes: emblems and focus lines','Class emblems from NAD Club Ministries are in place. DRAFT focus lines: confirm one line per class, 15–25 words, and the ages and grades'],
  ['AD-08','photo','Family Network photo','1600×900 · a parent and child working on a requirement together'],
  ['AD-09','auto','Upcoming events','pulled from the Events calendar when tagged Adventurers'],
  ['AD-10','link','Director resources','screening instructions'],
  ['AD-11','people','Leadership','names and roles from gnycyouth.org; add headshots 600×600 and emails for the coordinators'],
  ['AD-12','data','Club directory','every club by area: church, neighborhood, meeting day, director name + email/phone'],
  ['AD-13','link','Map','locations (Google My Maps link or list of addresses)'],
  ['AD-14','photo','Gallery','6 images, 1200px+ on the long side: Fun Day, Awards, Nature walk, Crafts, Family camp, Investiture'],
  ['AD-15','text','FAQ','confirm or rewrite each answer'],
  ['AD-16','link','New-club inquiries','office address for inquiries'],
  ['AD-17','text','Why join: six reasons','DRAFT six reasons; confirm or rewrite each in 20–30 words'],
  ['AD-18','text','Voices','one parent and one club director or counselor, 25–40 words each, with full name, club and permission'],
  ['AD-19','text','Curriculum areas','confirm the four curriculum areas and their one-line descriptions'],
  ['AD-20','text','A club meeting','DRAFT four steps of a typical meeting; confirm the order, the usual length and when clubs meet'],
  ['AD-21','link','Monthly club report','monthly report form or portal URL'],
  ['AD-22','text','Family Network','DRAFT confirm how the Family Network runs in GNYC clubs: parent sessions, home requirements, family events'],
  ['AD-24','text','How to start a club','DRAFT five steps shown in How to start. Confirm the GNYC process to start an Adventurer club: who approves, registration with the conference, fees, training dates'],
  ['AD-23','text','Adventurer uniform','Confirm the GNYC dress uniform options (blouse and shirt color, socks, beret) and where families buy']], note:'Reworked Sep 27, 2026 around families: why join, a club meeting, the four curriculum areas (My God, My Self, My Family, My World), the Pledge and Law, and the six-class journey with the Family Network, investiture and awards. Its own slot list, no longer the Pathfinders layout.'},
 {code:'MG', name:'Master Guides', tmpl:'PF', url:'ministries/master-guides.html', group:'Built pages · ministry layout', note:'Reworked Sep 27, 2026 for adults and older youth answering a call to lead: why become a Master Guide, the NAD purpose, mission, vision and philosophy, the official Pledge and Law, the five-step leadership journey, and ways to keep growing.', slots:[
  ['MG-01','photo','Hero photo','1600×2000 portrait · a NAD photo of the Master Guide neckerchief is in place; replace with GNYC Master Guides at investiture when available'],
  ['MG-02','text','Tagline','tagline, 25–40 words'],
  ['MG-03','data','Three figures','3 real figures'],
  ['MG-04','text','Why Master Guides','why this ministry, 60–90 words, in the Director’s voice'],
  ['MG-05','people','Page lead','Done from gnycyouth.org; add email'],
  ['MG-06','data','The year (cycle)','DRAFT. Confirm the real annual cycle: events, order and month for each milestone'],
  ['MG-07','text','GNYC sign-off and investiture','DRAFT one line: who in GNYC reviews portfolios and when investiture is held. The requirements themselves link to the NAD page, not restated'],
  ['MG-08','photo','Investiture photo','1600×700 · investiture service, candidates receiving scarves'],
  ['MG-09','auto','Upcoming events','pulled from the Events calendar when tagged Master Guides'],
  ['MG-10','link','Tools for the course','screening instructions'],
  ['MG-11','people','Leadership','names and roles from gnycyouth.org; add headshots 600×600 and emails for the coordinators'],
  ['MG-12','data','Club directory','every Master Guide club by area: host church, meeting schedule, leader name + email'],
  ['MG-13','link','Map','locations (Google My Maps link or list of addresses)'],
  ['MG-14','photo','Gallery','6 images, 1200px+ on the long side: Investiture, Camporee staff, Class night, Camp skills, Mentoring, Summit'],
  ['MG-15','text','FAQ','confirm or rewrite each answer'],
  ['MG-16','link','Inquiries email','office address for inquiries'],
  ['MG-17','text','Master Guide uniform','confirm GNYC’s Master Guide uniform: bottoms color, jacket, shoulder cords and any conference additions'],
  ['MG-18','link','Record card','Done: links to the NAD Master Guide Requirements page, where the record card and portfolio are maintained'],
  ['MG-19','text','Why become a Master Guide: six reasons','DRAFT six reasons; confirm or rewrite each in 20–30 words'],
  ['MG-20','text','Voices','one invested Master Guide and one current candidate, 25–40 words each, with full name, club and permission'],
  ['MG-21','text','The five steps','DRAFT confirm the five steps and how GNYC runs them (who signs off, typical length)'],
  ['MG-22','data','Curriculum areas','the four NAD curriculum areas; confirm the names GNYC uses on the record card'],
  ['MG-23','text','Who starts the course','DRAFT confirm who starts the Master Guide course in GNYC (former Pathfinders and TLTs, adults new to clubs) and the TLT link'],
  ['MG-24','data','Where Master Guides serve','DRAFT confirm where GNYC Master Guides serve'],
  ['MG-25','photo','Class night photo','1600×900 · candidates at a Master Guide class night'],
  ['MG-26','text','How to start the course','DRAFT three steps for candidates. Confirm eligibility (age, baptism, club service), registration, record card, fee and class schedule'],
  ['MG-27','text','How to host a Master Guide club','DRAFT three steps. Confirm host-church approval, how many invested instructors are required, and registration with the conference']]},
 {code:'AY', name:'AY Ministries', tmpl:'PF', url:'ministries/ay-ministries.html', group:'Built pages · ministry layout', note:'Reworked Sep 27, 2026 for young adults: why AY, the GC AY model (Jesus at the center; reach up, across, out), the official Mission, Aim, Motto and Pledge, and four ways to belong.', slots:[
  ['AY-01','photo','Hero photo','1600×2000 portrait · young adults in worship or on a mission project'],
  ['AY-02','text','Tagline','25–40 words; DRAFT confirm the age range for AY in GNYC — the page shows 16–30, 16–35 and 16 and up in different places'],
  ['AY-03','data','Three figures','3 real figures'],
  ['AY-04','text','Why AY','why this ministry, 60–90 words, in the Director’s voice'],
  ['AY-05','people','Page lead','Done from gnycyouth.org; add email'],
  ['AY-06','data','The year (cycle)','DRAFT. Confirm the real annual cycle: events, order and month for each milestone'],
  ['AY-07','text','Ways to serve','Confirm the roles and any training required'],
  ['AY-08','photo','Mission photo','1600×700 · young adults serving in a community project'],
  ['AY-09','auto','Upcoming events','pulled from the Events calendar when tagged AY Ministries'],
  ['AY-10','link','Leader tools','mission trip forms'],
  ['AY-11','people','Leadership','names and roles from gnycyouth.org; add headshots 600×600 and emails for the coordinators'],
  ['AY-12','data','Society directory','AY societies and campus groups by area: church or campus, meeting time, leader name + email'],
  ['AY-13','link','Map','locations (Google My Maps link or list of addresses)'],
  ['AY-14','photo','Gallery','6 images, 1200px+ on the long side: Retreat, Congress, Campus group, LIFE Tour, Mission trip, AY Sabbath'],
  ['AY-15','text','FAQ','confirm or rewrite each answer'],
  ['AY-16','link','Inquiries email','office address for inquiries'],
  ['AY-17','text','Why AY: six reasons','DRAFT six reasons; confirm or rewrite each in 20–30 words'],
  ['AY-18','text','Heritage line','DRAFT confirm the heritage line (Luther Warren and Harry Fenner, Michigan, 1879) and the 1926 objective'],
  ['AY-19','link','AY program ideas','program resource page or folder'],
  ['AY-20','text','How to start or revive a society','DRAFT five steps. Confirm officer election, registration with the youth office, and AY leader training dates']]},
 {code:'TLT', name:'Teen Leadership Training', tmpl:'PBE', url:'ministries/pathfinders/teen-leadership-training.html', group:'Built pages · program layout', slots:null, note:'Logo supplied Sep 21, 2026 (TLT-01 done)'},
 {code:'DC', name:'Drum Corps (GNYC Drumline)', url:'ministries/pathfinders/drum-corps.html', group:'Built pages · program layout', owner:'Wilda (coordinating), Henry, Duece', note:'Confirmed Sep 22, 2026 by Wilda: enough material for a full page', slots:[
  ['DC-01','photo','Hero photo','1600×2000 portrait or 2400×1200 landscape of the Drumline performing (Henry / Wilda)'],
  ['DC-02','text','Vision and history','How the GNYC Drumline started, how it developed and where it is today, 200–400 words (Henry)'],
  ['DC-03','data','Tryouts','January 2027 date, venue, age range, what to prepare (Wilda)'],
  ['DC-04','data','Borough drum lines','For each line: borough, rehearsal place, day and time, line leader name (Wilda)'],
  ['DC-05','people','Leaders','Henry and Wilda: full names, roles, headshots 800×1000, email; line leaders by borough'],
  ['DC-06','file','Membership application','The current form, PDF or online link (Wilda)'],
  ['DC-07','file','Photo and video release','The current form, PDF (Wilda)'],
  ['DC-08','file','Records, scoresheets and cadences','Competition records, judging sheets, cadence notation or audio (Duece)'],
  ['DC-09','file','Uniform and equipment guide','What members wear and carry; how instruments are provided (administrative staff)'],
  ['DC-10','data','Performance calendar','This season’s dates: Pathfinder Day performances, Brooklyn Area World Pathfinder Day, Veterans Day parades, AY events, AUC competition'],
  ['DC-11','photo','Photos and video','8–12 photos 1600px+ and any video links from performances and the AUC competition, with releases on file'],
  ['DC-12','data','Highlights','AUC competition results and other achievements by year, 3–6 items']]},
 {code:'DM', name:'Drilling & Marching', tmpl:'PBE', url:'ministries/pathfinders/drilling-marching.html', group:'Built pages · program layout', slots:null},
 {code:'YA', name:'Young Adults', tmpl:'PBE', url:'ministries/ay/young-adults.html', group:'Built pages · program layout', slots:null},
 {code:'SOE', name:'School of Evangelism', tmpl:'PBE', url:'ministries/ay/school-of-evangelism.html', group:'Built pages · program layout', slots:null},
 {code:'PCM', name:'Public Campus Ministry', tmpl:'PBE', url:'ministries/ay/public-campus-ministry.html', group:'Built pages · program layout', slots:null, note:'Logo supplied Sep 22, 2026 (PCM-01 done)'},
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
 PF:[['01','photo','Hero photo','1600×2000 portrait, members in uniform or in action'],['02','text','Tagline','25–40 words'],['03','data','Three figures','Clubs / members / staff'],['04','text','Why this ministry','60–90 words'],['05','people','Ministry lead','Done from gnycyouth.org; add email'],['06','data','The year (cycle)','Confirm the real annual cycle for this ministry: events, order and month. The timeline shown is a draft'],['07','photo','Feature photo','1600×700'],['08','auto','Upcoming events','From the calendar'],['09','link','Director report / portal','URL'],['10','link','Safety & screening','URL'],['11','people','Leadership','Names done from gnycyouth.org; add coordinator headshots and emails'],['12','data','Club or group directory','Church, area, meeting time, contact'],['13','link','Map','Link or addresses'],['14','photo','Gallery','6 photos 1200px+'],['15','text','FAQ','5 questions and answers'],['16','link','Inquiries email','Address']],
 PBE:[['01','photo','Key art or logo','800×1067 or emblem, transparent'],['02','text','Intro','30–50 words'],['03','link','Sign-up or registration','URL and deadline'],['04','text','What it is this year','Focus, level or theme for the season'],['05','data','Key dates','Dates and venues'],['06','photo','Action photo','1600×1000'],['07','link','Form','Registration or application form'],['08','file','Resources','3–6 PDFs or links'],['09','text','How it works','Rules, requirements or curriculum summary, 80–120 words'],['10','data','Highlights or results','Recent achievements + photos'],['11','people','Coordinator','Responsible director shown; name the program coordinator if appointed, with email'],['12','text','FAQ','4 questions and answers']]
};

/* items already supplied during the prototype are marked in their spec */
function preDone(spec){return /^(Done|Supplied)/i.test(spec||'')}

/* ---------- live tracker (Google Sheet) ----------
   The Sheet is the source of truth for state and owners. It must be shared "Anyone with the link: Viewer" for the page to read it. */
var TRACKER_ID='1MyNo2o8HU9yuw4UiIbeg81gDz8qweUPCp04mtkXLwpI';
var TRACKER_URL='https://docs.google.com/spreadsheets/d/'+TRACKER_ID+'/edit';
function loadTracker(cb){
  var url='https://docs.google.com/spreadsheets/d/'+TRACKER_ID+'/gviz/tq?tqx=out:csv&headers=1&t='+Date.now();
  fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){
    if(t.indexOf('<')===0)throw 0;
    var rows=[],row=[],f='',q=false;
    for(var i=0;i<t.length;i++){var c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else{if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}else f+=c}}
    if(f||row.length){row.push(f);rows.push(row)}
    var head=rows.shift().map(function(h){return h.trim().toLowerCase()});
    var iA=head.indexOf('ask'),iO=head.findIndex(function(h){return h.indexOf('owner')===0}),iS=head.indexOf('state'),iE=head.indexOf('evidence link'),iB=head.indexOf('signed by');
    var by={};rows.forEach(function(r){if(r[iA])by[r[iA].trim()]={owner:(r[iO]||'').trim(),state:(r[iS]||'').trim(),evidence:(r[iE]||'').trim(),signed:(r[iB]||'').trim()}});
    cb(null,by);
  }).catch(function(){cb(true)});
}
