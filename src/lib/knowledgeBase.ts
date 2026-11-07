/**
 * LIVELIHOODSAATHI AI - Curated Career Knowledge Base (RAG)
 *
 * Contains authoritative, accurate, and structured career intelligence
 * for engineering internships, technical disciplines, mechanical engineering,
 * cybersecurity, data analysis, interview prep, and resume building.
 */

export interface CareerKnowledgeItem {
  id: string;
  topic: string;
  keywords: string[];
  summaryEn: string;
  summaryTa: string;
  summaryTanglish: string;
  summaryHi: string;
  keyDirectives: string[];
  actionStepsEn: string[];
  actionStepsTa: string[];
  actionStepsTanglish: string[];
  actionStepsHi: string[];
  recommendedPathwayId: string;
}

export const CAREER_KNOWLEDGE_BASE: CareerKnowledgeItem[] = [
  {
    id: 'engineering-internship-2nd-year',
    topic: 'Engineering Internship Preparation (2nd & 3rd Year)',
    keywords: [
      'internship',
      'இன்டர்ன்ஷிப்',
      'இரண்டாம் ஆண்டு',
      'second year',
      'college',
      'graduation',
      'கல்லூரி படிப்பு',
      'intern',
      'internshala',
      'படிப்பு முடிவதற்குள்',
      'வாங்க என்ன செய்ய வேண்டும்',
      'படிக்கிறேன்',
      'பட்டம் முடிப்பதற்குள்',
      'engineering student',
      'semester',
    ],
    summaryEn:
      'For a 2nd year engineering student, securing a quality internship before graduation requires a structured, multi-stage roadmap: 1. Solidify core technical skills (master 1 programming language or core engineering tool, plus fundamental data structures/engineering principles). 2. Build 2-3 substantial hands-on projects beyond classroom curriculum and publish them with clean documentation on GitHub or a portfolio. 3. Draft a clean 1-page ATS-friendly resume highlighting projects and quantifiable outcomes. 4. Apply proactively across Internshala, LinkedIn, Wellfound (AngelList), and college alumni networks. 5. Prepare for technical interviews by practicing problem-solving, algorithmic thinking, and clearly explaining the technical decisions behind your projects.',
    summaryTa:
      'இரண்டாம் ஆண்டு இன்ஜினியரிங் படிக்கும் போதே கல்லூரி முடிவதற்குள் நல்ல இன்டர்ன்ஷிப் பெற முறையான திட்டம் அவசியம்:\n\n1. **முதன்மைத் திறன்கள்**: உங்கள் துறை சார்ந்த 1 நிரலாக்க மொழி (Java, Python, C++) அல்லது முதன்மை வடிவமைப்பு மென்பொருளை ஆழமாக கற்கவும். அடிப்படை தரவுக் கட்டமைப்புகளை (Data Structures) பயிலவும்.\n2. **செய்முறை திட்டப்பணிகள் (Projects)**: வெறும் கல்லூரி பாடத்திட்டத்துடன் நிற்காமல், நடைமுறை சிக்கல்களுக்கு தீர்வு தரும் 2 முதல் 3 முழுமையான செயலிகள் அல்லது திட்டப்பணிகளை உருவாக்கி GitHub தளத்தில் பதிவேற்றவும்.\n3. **1-பக்க பயோடேட்டா (Resume)**: நீங்கள் செய்த திட்டப்பணிகள், தொழில்நுட்பத் திறன்கள் மற்றும் GitHub இணைப்புகளை தெளிவாகக் கொண்ட நேர்த்தியான பயோடேட்டாவைத் தயாரிக்கவும்.\n4. **விண்ணப்பிக்கும் தளங்கள்**: Internshala, LinkedIn, Wellfound தளங்கள் மூலமாகவும், உங்கள் கல்லூரி முன்னாள் மாணவர்கள் (Alumni) பரிந்துரைகள் மூலமாகவும் முன்கூட்டியே விண்ணப்பிக்கவும்.\n5. **நேர்காணல் தயாரிப்பு**: தொழில்நுட்ப அடிப்படை வினாக்கள், செய்முறை கணக்குகள் மற்றும் நீங்கள் உருவாக்கிய திட்டப்பணிகள் குறித்து நம்பிக்கையுடன் விவரிக்கப் பழகவும்.',
    summaryTanglish:
      'Second year engineering padikkum bothe graduation ku munnadi nalla internship vaanga clear plan idho:\n\n1. **Core Skills**: Unga department ku thavaiyana 1 programming language (Python, Java, or C++) and Data Structures fundamentals nalla learn pannunga.\n2. **Practical Projects**: College assignments thaandi, 2 to 3 real-world working projects build panni GitHub profile la clean code and live demo oda upload pannunga.\n3. **1-Page Resume**: Ungaloda projects, technical skills and GitHub link highlight panni clean resume ready pannunga.\n4. **Application Platforms**: Internshala, LinkedIn, Wellfound portals and college alumni networking moolama daily apply pannunga.\n5. **Interview Prep**: Technical problem-solving, project architecture and behavioral questions confidently answer panna mock practice pannunga.',
    summaryHi:
      'इंजीनियरिंग के दूसरे वर्ष में ग्रेजुएशन से पहले अच्छी इंटर्नशिप प्राप्त करने की संपूर्ण रणनीति:\n\n1. **मूलभूत तकनीकी कौशल**: अपनी स्ट्रीम के अनुसार 1 प्रोग्रामिंग भाषा (Python, Java, C++) और डेटा स्ट्रक्चर्स (DSA) में महारत हासिल करें।\n2. **व्यावहारिक प्रोजेक्ट्स**: केवल कॉलेज असाइनमेंट पर निर्भर न रहें। 2 से 3 वास्तविक प्रोजेक्ट्स बनाकर GitHub पर लाइव डेमो के साथ अपलोड करें।\n3. **1-पेज रेज़्यूमे**: अपने प्रोजेक्ट्स, तकनीकी कौशल और GitHub लिंक को प्रमुखता से दर्शाने वाला साफ-सुथरा रेज़्यूमे तैयार करें।\n4. **आवेदन के प्लेटफॉर्म**: Internshala, LinkedIn, Wellfound और पूर्व छात्रों (Alumni) के नेटवर्क का उपयोग करके सक्रिय रूप से आवेदन करें।\n5. **इंटरव्यू की तैयारी**: कोडिंग प्रॉब्लम-सॉल्विंग, तकनीकी फंडामेंटल्स और अपने प्रोजेक्ट्स के आर्किटेक्चर को समझाने का अभ्यास करें।',
    keyDirectives: [
      'Focus specifically on internship preparation for engineering students.',
      'Cover skills, portfolio projects on GitHub, 1-page resume, application platforms (Internshala, LinkedIn), and interview prep.',
      'Do NOT recommend Junior Data Analyst, Automation Specialist, or unrelated government schemes.',
    ],
    actionStepsEn: [
      'Master 1 core language and data structures; build 2 hands-on portfolio projects on GitHub.',
      'Prepare a crisp 1-page resume showcasing technical projects and verifiable code repositories.',
      'Apply aggressively across Internshala, LinkedIn jobs, and leverage college alumni referrals.',
    ],
    actionStepsTa: [
      '1 முதன்மை நிரலாக்க மொழி மற்றும் தரவுக் கட்டமைப்புகளைக் கற்று 2 திட்டப்பணிகளை GitHub-ல் சேர்க்கவும்.',
      'திட்டப்பணிகளை முன்னிலைப்படுத்தும் 1 பக்க நேர்த்தியான பயோடேட்டாவைத் தயாரிக்கவும்.',
      'Internshala மற்றும் LinkedIn தளங்கள் வழியாக தொடர்ச்சியாக இன்டர்ன்ஷிப்களுக்கு விண்ணப்பிக்கவும்.',
    ],
    actionStepsTanglish: [
      '1 core programming language and DSA learn panni 2 projects GitHub la add pannunga.',
      'Projects and skills highlight panra 1-page clean resume draft pannunga.',
      'Internshala, LinkedIn and alumni network moolama regular-a apply pannunga.',
    ],
    actionStepsHi: [
      '1 प्रोग्रामिंग लैंग्वेज और DSA सीखकर 2 व्यावहारिक प्रोजेक्ट्स GitHub पर अपलोड करें।',
      'अपने प्रोजेक्ट्स और स्किल्स को हाइलाइट करने वाला 1-पेज का प्रभावशाली रेज़्यूमे बनाएं।',
      'Internshala और LinkedIn पर नियमित रूप से इंटर्नशिप के लिए आवेदन करें।',
    ],
    recommendedPathwayId: 'path-12',
  },
  {
    id: 'web-development',
    topic: 'Web Development & Full-Stack Engineering',
    keywords: [
      'software developer',
      'software development',
      'software engineer',
      'programmer',
      'coding',
      'web development',
      'web dev',
      'frontend',
      'backend',
      'full stack',
      'full-stack',
      'html',
      'css',
      'javascript',
      'react',
      'node',
      'மென்பொருள்',
      'வலைப்பக்க',
      'வலைத்தளம்',
      'வெப் டெவலப்மெண்ட்',
      'सॉफ्टवेयर डेवलपर',
    ],
    summaryEn:
      'Software development and modern web engineering involves building scalable applications. The recommended roadmap: 1. Master programming fundamentals and modern JavaScript (ES6+) along with React.js/Next.js and Tailwind CSS. 2. Learn Backend architecture: Node.js/Express or Python, RESTful API development, and database systems (PostgreSQL or MongoDB). 3. Build & deploy 2-3 full-stack projects on GitHub with live URLs and host them on Vercel or Render.',
    summaryTa:
      'வலைப்பக்க உருவாக்கம் (Web Development) மற்றும் முழுமையான மென்பொருள் பொறியியல் வழிகாட்டுதல்:\n\n1. **முன்பக்க உருவாக்கம் (Frontend)**: HTML5, CSS3, நவீன JavaScript (ES6+) மற்றும் React.js/Next.js கட்டமைப்புகளைப் பயிலவும்.\n2. **பின்பக்க உருவாக்கம் (Backend)**: Node.js, Express மற்றும் தரவுத்தளங்களான PostgreSQL அல்லது MongoDB பயன்படுத்தி RESTful APIs உருவாக்கவும்.\n3. **செய்முறை திட்டப்பணிகள்**: குறைந்தது 2 முழுமையான இணையதள செயலிகளை உருவாக்கி Vercel அல்லது Render தளங்களில் இயக்கி GitHub-ல் பகிரவும்.',
    summaryTanglish:
      'Web development career path and learning roadmap:\n\n1. **Frontend**: HTML, CSS, modern JavaScript and React.js/Next.js nalla kathukonga.\n2. **Backend & DB**: Node.js, Express APIs and PostgreSQL/MongoDB database connection learn pannunga.\n3. **Projects & Deploy**: 2 to 3 full-stack apps build panni Vercel or Render la deploy panni live links resume la share pannunga.',
    summaryHi:
      'वेब डेवलपमेंट और फुल-स्टैक इंजीनियरिंग करियर रोडमैप:\n\n1. **फ्रंटेंड**: HTML5, CSS3, मॉडर्न जावास्क्रिप्ट (ES6+) और React.js/Next.js सीखें।\n2. **बैकएंड और डेटाबेस**: Node.js/Express के साथ RESTful APIs और PostgreSQL या MongoDB डेटाबेस पर काम करें।\n3. **प्रोजेक्ट्स और डिप्लॉयमेंट**: कम से कम 2 फुल-स्टैक प्रोजेक्ट्स बनाकर Vercel पर डिप्लॉय करें और GitHub पर शेयर करें।',
    keyDirectives: [
      'Focus strictly on modern web development (Frontend, Backend, Databases, and deployment).',
      'Do not confuse with data analysis or unrelated operations.',
    ],
    actionStepsEn: [
      'Master modern JavaScript and component-based frontend engineering with React.',
      'Build secure REST APIs using Node.js and integrate relational or NoSQL databases.',
      'Deploy 2 production-ready full-stack applications to public cloud hosting with GitHub links.',
    ],
    actionStepsTa: [
      'JavaScript மற்றும் React.js கட்டமைப்பில் மாதிரி பயனர் இடைமுகங்களை உருவாக்கவும்.',
      'Node.js மற்றும் தரவுத்தளங்களைப் பயன்படுத்தி பாதுகாப்பான API-களை கட்டமைக்கவும்.',
      '2 முழுமையான வலைப்பக்க செயலிகளை இணையத்தில் நேரலையாக பதிவேற்றவும்.',
    ],
    actionStepsTanglish: [
      'JavaScript and React fundamentals master pannunga.',
      'Node.js APIs and database integration practical-a build pannunga.',
      '2 full-stack web applications deploy panni live portfolio ready pannunga.',
    ],
    actionStepsHi: [
      'जावास्क्रिप्ट और रिएक्ट (React) का उपयोग करके इंटरैक्टिव यूआई बनाएं।',
      'Node.js और डेटाबेस के साथ सुरक्षित REST APIs विकसित करें।',
      'कम से कम 2 फुल-स्टैक वेब प्रोजेक्ट्स को लाइव होस्ट करके पोर्टफोलियो में जोड़ें।',
    ],
    recommendedPathwayId: 'path-3',
  },
  {
    id: 'cybersecurity',
    topic: 'Cybersecurity & Information Defense',
    keywords: [
      'cybersecurity',
      'security',
      'ethical hacking',
      'hacker',
      'soc analyst',
      'penetration testing',
      'network security',
      'சைபர் பாதுகாப்பு',
      'சைபர்செக்யூரிட்டி',
      'ஹேக்கிங்',
    ],
    summaryEn:
      'To build a career in Cybersecurity: 1. Establish core foundations in computer networking (TCP/IP, OSI, routing, DNS) and Linux system administration. 2. Learn core security domains: vulnerability assessment, threat intelligence, firewall configurations, and basic ethical hacking. 3. Practice hands-on labs on platforms like TryHackMe and HackTheBox. 4. Target industry-recognized foundational certifications like CompTIA Security+ or CEH to enter entry-level Security Operations Center (SOC) Analyst roles.',
    summaryTa:
      'சைபர் பாதுகாப்பு (Cybersecurity) துறையில் நுழைவதற்கான வழிகாட்டுதல்:\n\n1. **கணினி நெட்வொர்க்கிங்**: TCP/IP, OSI மாதிரிகள், ரூட்டிங், DNS மற்றும் Linux கட்டளைகளை ஆழமாக கற்கவும்.\n2. **பாதுகாப்பு அடிப்படைகள்**: கணினி அமைப்புகளின் பலவீனங்களை கண்டறிதல் (Vulnerability Assessment), ஃபயர்வால் அமைப்புகள் மற்றும் குறியாக்கவியல் (Cryptography) பயிலவும்.\n3. **செய்முறை பயிற்சிகள்**: TryHackMe மற்றும் HackTheBox போன்ற தளங்களில் நடைமுறை ஆய்வக சோதனைகளை செய்து பழகவும்.\n4. **சான்றிதழ்கள் & பணிகள்**: CompTIA Security+ அல்லது CEH சான்றிதழ் பெற்று தொடக்கநிலை SOC Analyst பணிகளுக்கு விண்ணப்பிக்கவும்.',
    summaryTanglish:
      'Cybersecurity la career start panna structured roadmap idho:\n\n1. **Networking & Linux**: Computer networks (TCP/IP, DNS) and Linux operating system commands strong-a learn pannunga.\n2. **Security Basics**: Vulnerability scanning, firewalls and ethical hacking fundamentals kathukonga.\n3. **Hands-on Labs**: TryHackMe and HackTheBox platforms la daily practical capture-the-flag (CTF) challenges solve pannunga.\n4. **Target Roles**: CompTIA Security+ prepare panni Junior SOC Analyst or Security Associate roles ku apply pannunga.',
    summaryHi:
      'साइबर सुरक्षा (Cybersecurity) में करियर शुरू करने की रूपरेखा:\n\n1. **नेटवर्किंग और लिनक्स**: कंप्यूटर नेटवर्किंग (TCP/IP, DNS) और लिनक्स (Linux) कमांड्स की गहरी समझ विकसित करें।\n2. **सुरक्षा सिद्धांत**: वल्नेरेबिलिटी असेसमेंट, फ़ायरवॉल कॉन्फ़िगरेशन और बेसिक एथिकल हैकिंग सीखें।\n3. **प्रैक्टिकल लैब्स**: TryHackMe और HackTheBox जैसे प्लेटफॉर्म्स पर नियमित अभ्यास करें।\n4. **सर्टिफिकेशन और जॉब्स**: CompTIA Security+ सर्टिफिकेशन का लक्ष्य रखें और एंट्री-लेवल SOC Analyst पदों के लिए आवेदन करें।',
    keyDirectives: [
      'Focus specifically on networking, Linux, defensive security, ethical hacking, and SOC roles.',
      'Do not recommend software web development or general analytics.',
    ],
    actionStepsEn: [
      'Master TCP/IP networking, subnets, and essential Linux administration commands.',
      'Complete hands-on beginner paths on TryHackMe or HackTheBox.',
      'Prepare for CompTIA Security+ and apply for entry-level SOC Analyst Tier 1 positions.',
    ],
    actionStepsTa: [
      'கணினி நெட்வொர்க்கிங் மற்றும் Linux கட்டளைகளை முழுமையாகக் கற்கவும்.',
      'TryHackMe தளத்தில் பாதுகாப்பு ஆய்வகப் பயிற்சிகளை முடிக்கவும்.',
      'CompTIA Security+ சான்றிதழ் பெற்று SOC Analyst பணிகளுக்கு விண்ணப்பிக்கவும்.',
    ],
    actionStepsTanglish: [
      'Computer networking and Linux command line fundamentals master pannunga.',
      'TryHackMe platform la hands-on security rooms complete pannunga.',
      'Security+ certification prepare panni SOC Analyst roles ku target pannunga.',
    ],
    actionStepsHi: [
      'कंप्यूटर नेटवर्किंग और लिनक्स एडमिनिस्ट्रेशन में दक्षता प्राप्त करें।',
      'TryHackMe या HackTheBox पर व्यावहारिक सुरक्षा लैब्स पूरी करें।',
      'CompTIA Security+ की तैयारी करके SOC एनालिस्ट पदों के लिए आवेदन करें।',
    ],
    recommendedPathwayId: 'path-10',
  },
  {
    id: 'mechanical-engineering',
    topic: 'Mechanical Engineering Career Pathways',
    keywords: [
      'mechanical',
      'mechanical engineering',
      'மெக்கானிக்கல்',
      'இயந்திரவியல்',
      'cad',
      'solidworks',
      'ansys',
      'robotics',
      'mechatronics',
      'automotive',
      'manufacturing',
      'hvac',
    ],
    summaryEn:
      'Career options after Mechanical Engineering span high-demand modern engineering disciplines: 1. Computer-Aided Design & Simulation: SolidWorks, CATIA, AutoCAD, and FEA using Ansys. 2. Electric Mobility & Clean Automotive: Battery pack packaging, powertrain thermal analysis, and EV chassis integration. 3. Robotics & Mechatronics: Automation controls, PLC programming, and sensor integration. 4. HVAC & Building MEP: Energy modeling, commercial heating/cooling, and piping design. 5. Core Manufacturing & Supply Chain: CNC operations, Quality Assurance (Six Sigma), and lean operations.',
    summaryTa:
      'மெக்கானிக்கல் இன்ஜினியரிங் (Mechanical Engineering) முடித்தவர்களுக்கான முன்னணி தொழில் வாய்ப்புகள்:\n\n1. **CAD வடிவமைப்பு & FEA பகுப்பாய்வு**: SolidWorks, CATIA, AutoCAD மற்றும் Ansys மென்பொருட்களைப் பயன்படுத்தி தயாரிப்பு வடிவமைப்பு பொறியாளராகலாம்.\n2. **மின்சார வாகனங்கள் (EV) & ஆட்டோமோட்டிவ்**: பேட்டரி பேக் வடிவமைப்பு, வெப்ப மேலாண்மை மற்றும் மோட்டார் ஒருங்கிணைப்புப் பணிகளுக்கு அதிக தேவை உள்ளது.\n3. **ரோபோடிக்ஸ் & மெக்கட்ரானிக்ஸ்**: தொழிற்சாலை ஆட்டோமேஷன், PLC புரோகிராமிங் மற்றும் சென்சார் ஒருங்கிணைப்புத் துறைகள்.\n4. **HVAC & கட்டிடப் பொறியியல்**: வணிக வளாகங்களுக்கான குளிரூட்டும் அமைப்புகள் மற்றும் கட்டிட பொறியியல் (MEP).\n5. **உற்பத்தி மற்றும் தரக் கட்டுப்பாடு**: CNC இயந்திர இயக்கம், சிக்ஸ் சிக்மா மற்றும் தர உத்தரவாதப் பணிகள்.',
    summaryTanglish:
      'Mechanical engineering mudichavangalukku top career pathways:\n\n1. **Design & CAD/CAE**: SolidWorks, CATIA, AutoCAD and Ansys analysis learn panni Design Engineer aagalam.\n2. **EV & Automotive**: Electric vehicle battery thermal management and chassis design la huge demand irukku.\n3. **Robotics & Mechatronics**: Industrial automation, PLC and sensors integration field select pannalam.\n4. **HVAC & MEP**: Commercial building air conditioning and piping design tracks.\n5. **Manufacturing**: CNC machining, Quality control and Six Sigma management roles.',
    summaryHi:
      'मैकेनिकल इंजीनियरिंग के बाद प्रमुख करियर विकल्प:\n\n1. **CAD डिजाइन और सिमुलेशन**: SolidWorks, CATIA, AutoCAD और Ansys सीखकर प्रोडक्ट डिज़ाइन इंजीनियर बनें।\n2. **इलेक्ट्रिक वाहन (EV) और ऑटोमोटिव**: बैटरी पैक थर्मल मैनेजमेंट और ईवी पावरट्रेन डिज़ाइन में असीम अवसर हैं।\n3. **रोबोटिक्स और मेकाट्रॉनिक्स**: इंडस्ट्रियल ऑटोमेशन, पीएलसी (PLC) प्रोग्रामिंग और सेंसर इंटीग्रेशन।\n4. **एचवीएसी (HVAC) और एमईपी**: वाणिज्यिक इमारतों के लिए हीटिंग, वेंटिलेशन और एयर कंडीशनिंग डिज़ाइन।\n5. **विनिर्माण और गुणवत्ता नियंत्रण**: सीएनसी (CNC) ऑपरेशंस और सिक्स सिग्मा क्वालिटी कंट्रोल।',
    keyDirectives: [
      'Focus specifically on mechanical engineering career paths (CAD, EV, Robotics, HVAC, Manufacturing).',
      'Do not redirect to generic IT software development unless requested.',
    ],
    actionStepsEn: [
      'Master professional 3D CAD modeling software (SolidWorks / CATIA) and GD&T drafting standards.',
      'Complete hands-on simulation modules using Ansys FEA or CFD for real-world mechanical assemblies.',
      'Build a mechanical design portfolio showing 3 detailed engineering prototypes with bills of materials.',
    ],
    actionStepsTa: [
      'SolidWorks அல்லது CATIA மென்பொருளில் 3D மாடலிங் மற்றும் வரைபடங்களை உருவாக்கப் பழகவும்.',
      'Ansys FEA மூலம் இயந்திர பாகங்களின் வலிமை மற்றும் வெப்பப் பகுப்பாய்வை மேற்கொள்ளவும்.',
      '3 இயந்திர மாதிரி வடிவமைப்புகளுடன் கூடிய போர்ட்ஃபோலியோவை உருவாக்கவும்.',
    ],
    actionStepsTanglish: [
      'SolidWorks or CATIA 3D modeling and GD&T drafting master pannunga.',
      'Ansys FEA simulation software use panni structural analysis practice pannunga.',
      '3 CAD design case studies ready panni mechanical portfolio create pannunga.',
    ],
    actionStepsHi: [
      'SolidWorks या CATIA में 3D मॉडलिंग और GD&T मानकों में महारत हासिल करें।',
      'Ansys FEA का उपयोग करके स्ट्रक्चरल सिमुलेशन और एनालिसिस का अभ्यास करें।',
      '3 विस्तृत मैकेनिकल डिज़ाइन प्रोजेक्ट्स का पोर्टफोलियो तैयार करें।',
    ],
    recommendedPathwayId: 'path-11',
  },
  {
    id: 'data-analytics',
    topic: 'Data Analysis & Business Intelligence',
    keywords: [
      'data analyst',
      'data analytics',
      'data science',
      'power bi',
      'sql',
      'excel analyst',
      'tableau',
      'டேட்டா அனலிஸ்ட்',
      'தரவு ஆய்வாளர்',
      'டேட்டா',
      'डेटा एनालिस्ट',
    ],
    summaryEn:
      'To build a career as a Data Analyst: 1. Master Advanced Excel (Pivot tables, XLOOKUP, power query) and relational database SQL (aggregations, JOINs, subqueries, window functions). 2. Learn business intelligence dashboarding with Power BI or Tableau. 3. Add foundational Python (Pandas, Matplotlib) for automated data cleaning. 4. Construct 2-3 interactive business dashboards using real-world sales, marketing, or financial datasets to showcase in your portfolio.',
    summaryTa:
      'தரவு ஆய்வாளர் (Data Analyst) பணிக்கான முழுமையான வழிகாட்டுதல்:\n\n1. **Excel & SQL**: மேம்பட்ட Excel பார்முலாக்கள் மற்றும் SQL தரவுத்தள வினவல்களை (JOINs, Group By, Subqueries) முழுமையாக கற்கவும்.\n2. **டேஷ்போர்டுகள்**: Power BI அல்லது Tableau மூலம் வணிக மேலாளர்களுக்கான காட்சி வடிவ டேஷ்போர்டுகளை உருவாக்கப் பழகவும்.\n3. **Python (Pandas)**: தானியங்கி முறையில் பெரிய தரவுகளை சுத்தம் செய்து பகுப்பாய்வு செய்ய பைத்தான் கற்கவும்.\n4. **செய்முறை போர்ட்ஃபோலியோ**: விற்பனை மற்றும் நிதித் தரவுகளைக் கொண்ட 2 ஊடாடும் வணிக டாஷ்போர்டுகளை உருவாக்கி நிரூபிக்கவும்.',
    summaryTanglish:
      'Data Analyst career roadmap:\n\n1. **Excel & SQL**: Advanced Excel (XLOOKUP, Pivot tables) and SQL relational database queries master pannunga.\n2. **BI Dashboards**: Power BI or Tableau use panni interactive executive reports build panna kathukonga.\n3. **Python Pandas**: Repetitive data cleaning and analysis automate panna Python basics learn pannunga.\n4. **Portfolio**: Real business datasets vechu 2 dynamic sales/finance dashboards create panni portfolio ready pannunga.',
    summaryHi:
      'डेटा एनालिस्ट बनने का रोडमैप:\n\n1. **एक्सेल और एसक्यूएल**: एडवांस्ड एक्सेल और रिलेशनल एसक्यूएल (SQL Joins, Group By) में दक्षता प्राप्त करें।\n2. **बिजनेस इंटेलिजेंस**: पावर बीआई (Power BI) या झांकी (Tableau) का उपयोग करके इंटरैक्टिव डैशबोर्ड बनाएं।\n3. **पायथन पांडास**: डेटा क्लीनिंग और विश्लेषण को स्वचालित करने के लिए पायथन सीखें।\n4. **पोर्टफोलियो**: वास्तविक व्यावसायिक डेटा पर आधारित 2 उत्कृष्ट डैशबोर्ड बनाकर अपना पोर्टफोलियो तैयार करें।',
    keyDirectives: [
      'Provide specific data analyst roadmap (SQL, Excel, Power BI, Python).',
      'Only recommend this when the user specifically asks about data analysis.',
    ],
    actionStepsEn: [
      'Master relational SQL querying including multi-table JOINs, subqueries, and aggregations.',
      'Design 2 comprehensive business dashboards in Power BI utilizing DAX and data modeling.',
      'Implement exploratory data analysis and data cleansing scripts using Python Pandas.',
    ],
    actionStepsTa: [
      'SQL தரவுத்தள வினவல்கள் மற்றும் Excel பார்முலாக்களை முழுமையாகப் பயிலவும்.',
      'Power BI பயன்படுத்தி 2 வணிக விற்பனை டாஷ்போர்டுகளை வடிவமைக்கவும்.',
      'Python Pandas மூலம் தரவு பகுப்பாய்வு ஸ்கிரிப்ட்களை எழுதப் பழகவும்.',
    ],
    actionStepsTanglish: [
      'SQL database complex queries and Advanced Excel master pannunga.',
      'Power BI la 2 interactive sales/business dashboards create pannunga.',
      'Python Pandas data analysis scripts build panni portfolio ready pannunga.',
    ],
    actionStepsHi: [
      'एसक्यूएल (SQL) और एडवांस्ड एक्सेल में पूर्ण दक्षता प्राप्त करें।',
      'पावर बीआई (Power BI) का उपयोग करके 2 इंटरैक्टिव डैशबोर्ड तैयार करें।',
      'पायथन पांडास (Pandas) के साथ डेटा क्लीनिंग और विश्लेषण का अभ्यास करें।',
    ],
    recommendedPathwayId: 'path-1',
  },
  {
    id: 'technical-interview-prep',
    topic: 'Technical Interview Preparation & Coding Rounds',
    keywords: [
      'technical interview',
      'interview preparation',
      'interview tips',
      'coding interview',
      'crack interview',
      'நேர்காணல் தயாரிப்பு',
      'இன்டர்வியூ',
      'டெக்னிக்கல் இன்டர்வியூ',
      'इंटरव्यू की तैयारी',
      'तकनीकी इंटरव्यू',
    ],
    summaryEn:
      'To prepare for technical interviews effectively: 1. Core Data Structures & Algorithms: Practice patterns on LeetCode/HackerRank (Arrays, HashMaps, Two Pointers, Trees, Graphs) in 1 primary language. 2. Computer Science Fundamentals: Solidify Operating Systems (threads, memory), Database concepts (indexing, ACID, normalization), and Object-Oriented Design. 3. Project Architecture: Be prepared to explain every system design choice, trade-off, and challenge in your portfolio projects. 4. Behavioral Questions: Structure past team/project challenges using the STAR method (Situation, Task, Action, Result).',
    summaryTa:
      'தொழில்நுட்ப நேர்காணலில் (Technical Interview) வெற்றிபெற தயாரிப்பு உத்திகள்:\n\n1. **தரவுக் கட்டமைப்புகள் (DSA)**: LeetCode அல்லது HackerRank தளங்களில் தினசரி 2 கணக்குகளை (Arrays, Strings, HashMaps, Trees) தீர்த்து பழகவும்.\n2. **கணினி அறிவியல் அடிப்படைகள்**: இயங்குதளங்கள் (OS), தரவுத்தள மேலாண்மை (DBMS ACID, Indexing) மற்றும் OOP கருத்துகளை தெளிவாக கற்கவும்.\n3. **திட்டப்பணி விளக்கம்**: உங்கள் பயோடேட்டாவில் உள்ள திட்டப்பணிகளை ஏன், எப்படி உருவாக்கினீர்கள் என்ற தொழில்நுட்ப காரணங்களை தெளிவாக விவரிக்க பழகவும்.\n4. **STAR அணுகுமுறை**: நடத்தை சார்ந்த கேள்விகளுக்கு STAR (சூழ்நிலை, பணி, நடவடிக்கை, முடிவு) உத்தியைப் பயன்படுத்தி பதிலளிக்கவும்.',
    summaryTanglish:
      'Technical interview crack panna proven strategy idho:\n\n1. **DSA Practice**: LeetCode la daily common patterns (Arrays, HashMaps, Trees) 1 primary language la solve pannunga.\n2. **CS Core Concepts**: OS memory/threads, DBMS indexing/ACID and OOP principles revise pannunga.\n3. **Project Deep Dive**: Resume la potta projects oda architectural decisions and challenges explain panna ready-a irunga.\n4. **STAR Method**: Behavioral questions ku STAR framework (Situation, Task, Action, Result) use panni confident-a answer pannunga.',
    summaryHi:
      'तकनीकी इंटरव्यू (Technical Interview) की प्रभावी तैयारी रणनीति:\n\n1. **डेटा स्ट्रक्चर्स और एल्गोरिदम (DSA)**: LeetCode पर प्रतिदिन मुख्य पैटर्न्स (Arrays, HashMaps, Trees) का अभ्यास करें।\n2. **कंप्यूटर साइंस फंडामेंटल्स**: ऑपरेटिंग सिस्टम, डेटाबेस (ACID, इंडेक्सिंग) और ऑब्जेक्ट-ओरिएंटेड प्रोग्रामिंग (OOP) को अच्छी तरह समझें।\n3. **प्रोजेक्ट्स का गहन ज्ञान**: अपने रेज़्यूमे में शामिल प्रोजेक्ट्स के हर तकनीकी निर्णय और चुनौती को समझाने में सक्षम हों।\n4. **STAR तकनीक**: व्यावहारिक और व्यवहारिक प्रश्नों के उत्तर देने के लिए STAR (Situation, Task, Action, Result) पद्धति का उपयोग करें।',
    keyDirectives: [
      'Focus specifically on coding rounds, CS fundamentals, project walkthroughs, and behavioral STAR framework.',
      'Do not recommend generic training schemes.',
    ],
    actionStepsEn: [
      'Solve 50-75 core DSA problems across Arrays, Strings, HashMaps, and Binary Trees on standard platforms.',
      'Conduct 2 mock technical interviews focusing on live coding while verbally communicating your thought process.',
      'Prepare STAR-formatted answers for 3 common behavioral questions regarding teamwork and technical conflict.',
    ],
    actionStepsTa: [
      'முக்கிய DSA வினாக்களை தினசரி பயிற்சி செய்து தீர்க்கவும்.',
      'திட்டப்பணிகளின் தொழில்நுட்ப கட்டமைப்பை விவரிக்கும் மாதிரி நேர்காணலை மேற்கொள்ளவும்.',
      'STAR முறையைப் பயன்படுத்தி நேர்காணல் வினாக்களுக்கு பயிற்சி பெறவும்.',
    ],
    actionStepsTanglish: [
      'LeetCode core patterns solve panni coding speed improve pannunga.',
      'Live coding pesitte panra maadhiri mock interview practice pannunga.',
      'Behavioral rounds ku STAR format la answers prepare pannunga.',
    ],
    actionStepsHi: [
      'LeetCode पर मुख्य DSA समस्याओं का नियमित अभ्यास करें।',
      'लाइव कोडिंग और समस्या समाधान पर 2 मॉक इंटरव्यू दें।',
      'STAR पद्धति का उपयोग करके मुख्य व्यवहारिक प्रश्नों के उत्तर तैयार करें।',
    ],
    recommendedPathwayId: 'path-12',
  },
  {
    id: 'resume-building',
    topic: 'Resume Building & ATS Optimization',
    keywords: [
      'resume',
      'cv',
      'பயோடேட்டா',
      'ரெஸ்யூம்',
      'bio data',
      'ats',
      'resume building',
      'placement resume',
      'रेज़्यूमे',
      'सीवी',
    ],
    summaryEn:
      'To construct an impressive, placement-winning resume: 1. Use a clean, single-page, ATS-compliant layout with standard typography (no multiple columns or progress bars). 2. Highlight technical projects prominently: define the technical problem, stack used, and quantifiable outcome (e.g., "reduced latency by 25%"). 3. Provide direct, clickable GitHub repositories and live demo links. 4. Group skills by category (Languages, Frameworks, Developer Tools, Databases). 5. Tailor keywords to the specific job description.',
    summaryTa:
      'வேலைவாய்ப்பை எளிதில் பெற்றுத்தரும் சிறந்த பயோடேட்டா (Resume) உருவாக்கும் வழிகாட்டுதல்:\n\n1. **1-பக்க வடிவம்**: பல வண்ணங்கள் அல்லது சிக்கலான பத்திகள் இன்றி, கணினி மென்பொருட்கள் (ATS) எளிதில் படிக்கக்கூடிய 1-பக்க நவீன வடிவத்தைப் பயன்படுத்தவும்.\n2. **செய்முறை திட்டப்பணிகள்**: நீங்கள் செய்த முக்கிய திட்டப்பணிகளை, பயன்படுத்திய தொழில்நுட்பங்கள் மற்றும் அடைந்த அளவிடக்கூடிய முடிவுகளுடன் (Quantifiable Metrics) குறிப்பிடவும்.\n3. **நேரடி இணைப்புகள்**: GitHub களஞ்சியம் மற்றும் இணையதள நேரடி இணைப்புகளை சேர்க்கவும்.\n4. **திறன்கள் வகைப்பாடு**: நிரலாக்க மொழிகள், கருவிகள், தரவுத்தளங்கள் என பிரித்து தெளிவாக பட்டியலிடவும்.',
    summaryTanglish:
      'Placement crack panra clean resume build panra key tips:\n\n1. **1-Page ATS Layout**: Multiple columns or graphics illama, clean single-page format use pannunga.\n2. **Quantifiable Projects**: Tech stack used and measurable impact (e.g. built app with 500+ users or improved speed by 30%) mention pannunga.\n3. **Live Links**: Working GitHub repository and live demo links kandippa add pannunga.\n4. **Skills Grouping**: Languages, Frameworks, Tools nu neat categories la organize pannunga.',
    summaryHi:
      'प्रभावशाली और जॉब-विनिंग रेज़्यूमे बनाने की मुख्य बातें:\n\n1. **1-पेज एटीएस प्रारूप**: जटिल ग्राफिक्स के बिना साफ-सुथरा 1-पेज का लेआउट रखें जो ATS सॉफ़्टवेयर में आसानी से स्कैन हो सके।\n2. **मापने योग्य प्रोजेक्ट्स**: प्रोजेक्ट्स में समस्या, उपयोग की गई तकनीक और मापने योग्य परिणाम (जैसे- गति 25% बढ़ाई) लिखें।\n3. **लाइव लिंक्स**: अपने GitHub कोड और लाइव प्रोजेक्ट डेमो के सीधे लिंक्स जोड़ें।\n4. **कौशल वर्गीकरण**: भाषाओं, टूल्स और डेटाबेस को अलग-अलग श्रेणियों में व्यवस्थित करें।',
    keyDirectives: [
      'Focus specifically on resume layout, ATS compliance, project metrics, and GitHub portfolio links.',
    ],
    actionStepsEn: [
      'Format your resume into a single-page reverse-chronological layout emphasizing GitHub/portfolio links.',
      'Rewrite project bullet points using the Action Verb + Context + Quantifiable Result formula.',
      'Run your resume through an ATS analyzer against your target job description.',
    ],
    actionStepsTa: [
      'பயோடேட்டாவை 1 பக்க நேர்த்தியான வடிவத்தில் மாற்றி திட்டப்பணிகளை முன்னிலைப்படுத்தவும்.',
      'செயல்முறை திட்டப்பணிகளில் அளவிடக்கூடிய முடிவுகளை தெளிவாகக் குறிப்பிடவும்.',
      'GitHub மற்றும் நேரடி திட்டப்பணி இணைப்புகளை சேர்க்கவும்.',
    ],
    actionStepsTanglish: [
      'Resume-a 1-page clean ATS format la restructure pannunga.',
      'Project points la action verb and measurable metric use pannunga.',
      'GitHub links and portfolio clickable-a irukkaradha verify pannunga.',
    ],
    actionStepsHi: [
      'रेज़्यूमे को 1-पेज के लेआउट में व्यवस्थित करें और GitHub लिंक्स जोड़ें।',
      'प्रोजेक्ट्स के विवरण में मापने योग्य परिणाम और एक्शन वर्ब्स का प्रयोग करें।',
      'अपने लक्षित जॉब डिस्क्रिप्शन के आधार पर आवश्यक कीवर्ड्स शामिल करें।',
    ],
    recommendedPathwayId: 'path-12',
  },
  {
    id: 'undecided-career-guidance',
    topic: 'Career Navigation for Undecided Students',
    keywords: [
      'i don\'t know which career',
      'confused',
      'which career to choose',
      'என்ன வேலை தேர்வு செய்வது',
      'புரியவில்லை',
      'விருப்பம்',
      'career selection',
      'கண்டுபிடிப்பது எப்படி',
      'करियर कैसे चुनें',
      'समझ नहीं आ रहा',
    ],
    summaryEn:
      'When you are unsure which career to choose, follow a systematic 3-step decision matrix: 1. Evaluate your natural strengths: Do you lean towards logical problem-solving (Software, Data, Cybersecurity), visual and creative communication (Digital Marketing, UI/UX), interpersonal operations (Human Resources, Business Analysis), or physical/hands-on systems (Mechanical, Solar, EV)? 2. Run low-risk 1-week micro-trials: Spend 5 days completing a beginner coding tutorial, 5 days on a basic CAD/design exercise, and 5 days exploring marketing campaigns. 3. Match with market demand and your current educational foundation.',
    summaryTa:
      'எந்தத் தொழிலைத் தேர்வு செய்வது என்று உறுதியாகத் தெரியாதபோது பின்பற்ற வேண்டிய வழிகாட்டுதல்:\n\n1. **சுய மதிப்பீடு**: உங்கள் பலம் எதில் உள்ளது? தர்க்கரீதியான கணிதப் பிரச்சினைகளை தீர்ப்பதா (Software, Data, Security), காட்சி மற்றும் படைப்பாற்றல் தொடர்பா (Marketing, Design), மனிதர்களுடன் ஒருங்கிணைந்து செயல்படுவதா (HR, Business Analysis), அல்லது செய்முறை அமைப்புகளா (Mechanical, EV, Solar)?\n2. **1-வார மாதிரி முயற்சி**: ஒரு குறிப்பிட்ட துறையில் 5 நாட்கள் அடிப்படை பயிற்சியை முயற்சி செய்து பாருங்கள். உங்கள் ஈடுபாடு மற்றும் ஆர்வத்தை சோதிக்க இதுவே சிறந்த வழி.\n3. உங்கள் கல்விப் பின்னணி மற்றும் உங்களுக்கு இயல்பாக வரும் திறனை அடிப்படையாகக் கொண்டு முடிவெடுக்கலாம். நீங்கள் தற்போது என்ன படித்துக் கொண்டிருக்கிறீர்கள்?',
    summaryTanglish:
      'Endha career choose panradhu nu theriyala na idho simple 3-step approach:\n\n1. **Self-Assessment**: Ungalukku logic/coding interest-a (Software, Data), creative/communication interest-a (Marketing, HR), or physical machines/core interest-a (Mechanical, EV, Solar)?\n2. **1-Week Trial**: Edhavadhu 1 domain eduthu 5 days basic tutorial try panni paarunga. Ungalukku pudichirukka nu easily therinjidum.\n3. Unga current degree background and personal strength match panni choose pannalam. Unga degree enna nu solla mudiyuma?',
    summaryHi:
      'जब आपको यह तय करने में परेशानी हो कि कौन सा करियर चुनना है:\n\n1. **आत्म-मूल्यांकन**: अपनी प्राकृतिक शक्तियों को पहचानें - क्या आपकी रुचि लॉजिकल प्रॉब्लम-सॉल्विंग (सॉफ्टवेयर, डेटा), रचनात्मक संचार (मार्केटिंग, डिज़ाइन), मानव संसाधन प्रबंधन (एचआर), या व्यावहारिक मशीनों (मैकेनिकल, ईवी, सोलर) में है?\n2. **1-सप्ताह का ट्रायल**: किसी एक क्षेत्र का चयन करें और 5 दिन बुनियादी ट्यूटोरियल करके देखें कि क्या आपको इसमें आनंद आ रहा है।\n3. सटीक मार्गदर्शन के लिए, क्या आप अपनी वर्तमान शिक्षा और सबसे पसंदीदा विषय साझा कर सकते हैं?',
    keyDirectives: [
      'Provide an empathetic, structured self-assessment framework (logical vs. creative vs. interpersonal vs. physical).',
      'Ask a short, focused clarification question about their strengths and degree background.',
      'Do not force a single career path.',
    ],
    actionStepsEn: [
      'Identify your core aptitude: analytical problem-solving, creative communication, or hands-on engineering.',
      'Complete a 1-week zero-cost micro-trial in your top 2 candidate domains.',
      'Share your current degree and top 2 interests to receive a tailored roadmap.',
    ],
    actionStepsTa: [
      'உங்கள் முதன்மைத் திறனைக் கண்டறியவும்: தர்க்க சிந்தனையா, படைப்பாற்றலா அல்லது செய்முறை பொறியியலா?',
      'உங்களுக்கு விருப்பமான 2 துறைகளில் தலா 1 வாரம் மாதிரி பயிற்சிகளை செய்து பார்க்கவும்.',
      'பொருத்தமான வழிகாட்டலைப் பெற உங்கள் தற்போதைய கல்வி விவரத்தைப் பகிரவும்.',
    ],
    actionStepsTanglish: [
      'Unga strength identify pannunga: coding logic, creative marketing, or core engineering.',
      'Top 2 candidate domains la 1-week basic practical micro-trials try pannunga.',
      'Unga degree and interest mention pannunga, exact custom roadmap tharuvom.',
    ],
    actionStepsHi: [
      'अपनी स्वाभाविक क्षमता पहचानें: विश्लेषणात्मक, रचनात्मक या व्यावहारिक इंजीनियरिंग।',
      'पसंदीदा 2 क्षेत्रों में 1-1 सप्ताह का ट्रायल कोर्स पूरा करें।',
      'सटीक रोडमैप प्राप्त करने के लिए अपनी वर्तमान डिग्री और रुचियां साझा करें।',
    ],
    recommendedPathwayId: 'path-9',
  },
];

/**
 * Retrieves the most relevant knowledge item based on multi-keyword scoring.
 */
export function retrieveRelevantKnowledge(query: string): CareerKnowledgeItem | null {
  const lower = (query || '').toLowerCase();
  let bestMatch: CareerKnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of CAREER_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 3 : 2;
      }
    }

    if (score > highestScore && score >= 2) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}

