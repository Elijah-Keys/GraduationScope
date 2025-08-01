const ChicoTOPIC_TO_CLASSES = {
  science: [
    // Includes Physical Science, Biological Science, Laboratory, and some critical thinking science classes
    "Inquiry into the Science of Climate Change - ERTH 104", 
    "General Chemistry for Applied Sciences - CHEM 107",
    "Organic Chemistry for Applied Sciences - CHEM 108",
    "General Chemistry I - CHEM 111",
    "Fun with Electronics and Systems - EECE 110",
    "Our Changing Planet - ERTH 101",
    "Physical Geology - ERTH 102",
    "Oceanography - ERTH 110",
    "Introduction to Environmental Science - ERTH 130",
    "Earth Systems and Physical Geography - GEOG 101",
    "General Physics I - PHYS 202A",
    "Physics for Students of Science and Engineering: Mechanics - PHYS 204A",
    "Introduction to Biological Anthropology - ANTH 111",
    "Introduction to Living Systems - BIOL 102",
    "Human Anatomy - BIOL 103",
    "Visualizing Local Landscapes - GEOG 139",
    "Human Physiology - BIOL 104",
    "Food, Fiber, and Drugs - BIOL 105",
    "Principles of Ecological, Evolutionary, and Organismal Biology - BIOL 161",
    "Principles of Cellular and Molecular Biology - BIOL 162",
    "Principles of Physiology and Development - BIOL 163",
    "Biological Processes in Environmental Engineering - CIVL 175",
    "Basic Nutrition - NFSC 100",
    "Introduction to Plant Science - PSSC 101",
    "Introduction to Astronomy: Survey of the Cosmos - ASTR 100",
    "Earth Systems and Physical Geography Lab - GEOG 101L",
    "Introduction to Biological Anthropology - ANTH 111", // also in Laboratory
  ],

  business: [
    "Personal Financial Literacy - FINA 101",
    "Introduction to Agricultural Business and Economics - ABUS 101",
    "Principles of Macroeconomic Analysis - ECON 102",
    "Principles of Microeconomic Analysis - ECON 103",
    "Intercultural Communication - CMST 235",
     "Design Thinking - MADT 102",
     "Introduction to International Engagement (W) - INST 110W",
     "Principles of Psychology - PSYC 101",
     "Small Group Communication - CMST 132",
     "Social Media Storytelling - MADT 218",
       "Introduction to Statistics - MATH 105",
     "Public Speaking - CMST 131",
    "Statistics of Business and Economics - MATH 108",
    "Argumentation and Advocacy - CMST 225",
    "Finite Mathamatics for Busniess - MATH 107",
  ],

  social: [
    "Introduction to Archaeology - ANTH 112",
      "Learning from Women of Color in Leadership - MCGS 145",
    "Magic, Witchcraft, and Religion - ANTH 140",
    "Latin America Today - LAST 110",
      "Principles of Macroeconomic Analysis - ECON 102",
        "Leisure and Life - RPHM 180",
         "Introduction to the Asian American Experience - AAST 152",
           "Introduction to Critical HMoob Studies - AAST 330",
            "Introduction to Black/African American Studies - AFAM 170",
         "Introduction to Asian Studies - AAST 110",
       "Design Thinking - MADT 102",
      "Intercultural Communication - CMST 235",
    "Introduction to Spirituality and Religion in California - RELS 180",
    "Women Writers (W) - ENGL 264W",
    "Marriage and Family Relationships - CHLD 255",
    "Introduction to Criminal Justice - CRIM 250",
    "Humanities (W) - HNRS 102W",
    "Peoples, Places, and Environments - GEOG 102",
     "Communication and Social Change - HNRS 100",
    "California Cultural Landscapes - GEOG 105",
    "Pop Culture and Media Innovation - JOUR 210",
     "Islam and the World - HIST 261",
    "Developmental Wellness - PYSC 152",
    "Applications of Critical Thinking and Decision Making - PSYC 100",
    "Diversity in Public Lands - RHPM 210",
    "Introduction to Sociology - SOCI 100",
    "Sociology of Sexuality - SOCI 133",
    "Social Welfare Institutions: A Response to Power and Scarcity - SWRK 170",
    "Transitions and Transformation: Academic Identity and Success - UNIV 120",
    "Women Internationally - WMST 233",
      "Introduction to Women's Studies - WMST 170",
     "Inquiry into the Science of Climate Change - ERTH 104", 
  ],

  health: [
    "Health at Every Size: A Non-Diet Approach to Wellness (W) - NFSC 200W",
    "Human Sexuality - PHHA 265",
    "Physical Activity and Wellness: A Way of Life - KINE 110",
    "World Sports and Games - KINE 247",
    "Nutrition and Society - NUTR 11",
    "Developmental Wellness - PYSC 152",
    "Basic Nutrition - NFSC 100",
  ],

  education: [
    "Child Development - CHLD 252",
    "Developmental Wellness - PYSC 152",
     "Public Speaking - CMST 131",
     "Marriage and Family Relationships - CHLD 255",
     "Small Group Communication - CMST 132",
    "Intercultural Communication - CMST 235",
     "Logic and Critical Thinking - PHIL 102",
    "Environmental Literacy - ENVL 105",
    "Introduction to International Engagement (W) - INST 110W",
    "Introduction to Education - EDTE 1",
     "Applications of Critical Thinking and Decision Making - PSYC 100",
    "Child Development - EDTE 30",
    "Foundations of Multicultural Education - EDTE 40",
  ],

  engineering: [
    "ENGR 5 - Science of High Technology",
    "ENGR 10 - Introduction to Engineering",
    "ENGR 25 - The Digital World and Society",
     "Biological Processes in Environmental Engineering - CIVL 175",
    "PHYS 50 - General Physics/Mechanics",
     "General Physics I - PHYS 202A",
      "Physics for Students of Science and Engineering: Mechanics - PHYS 204A",
    "Fun with Electronics and Systems - EECE 110",
  ],

  math: [
    "Patterns of Mathematical Thought - MATH 101",
    "Introduction to Statistics - MATH 105",
    "Finite Mathematics for Business - MATH 107",
    "Patterns of Mathmatical Thought - MATH 101",
    "Statistics of Business and Economics - MATH 108",
    "Concepts and Structures of Mathematics - MATH 110",
    "College Algebra - MATH 116",
    "Trigonometry - MATH 118",
    "Precalculus Mathematics - MATH 119",
    "Analytic Geometry and Calculus - MATH 120",
  ],

  language: [
    "Beginning Spanish I - SPAN 101",
    "Academic Writing (W) - ENGL 130W",
     "Asian Film and Literature (W) - HUMN 224W",
     "American Indian Storytelling/Oral Narrative - AIST 365",
    "Language and Culture of Deaf Americans - CMSD 156",
    "Professional Writing for Public Audiences (W) - JOUR 130W",
    "Academic Writing - ESL (W) - ENGL 130EW",
    "English as a Foreign Language - EFLN 170",
    "Science Fiction - TECH 182",
    "Beginning Spanish II - SPAN 102",
    "Intermediate Spanish I - SPAN 201",
    "Intermediate Spanish for Healthcare - SPAN 201C",
    "Intermediate Spanish II - SPAN 202",
    "American Indian Literature - AIST 252",
    "Intermediate Spanish for Heritage Speakers - SPAN 202N",
    "English as a Foreign Language - EFLN 170",
    "Beginning French I - FREN 101",
    "Beginning German I - GERM 101",
    "Beginning German II - GERM 102",
    "Intermediate German I - GERM 201",
    "Intermediate German II - GERM 202",
    "Beginning Italian I - ITAL 101",
    "Beginning Creative Writing - ENGL 220W",
    "Beginning Japanese I - JAPN 101",
    "Beginning Japanese II - JAPN 102",
    "Intermediate Japanese I - JAPN 201",
    "Intermediate Japanese II - JAPN 202",
  ],

  environment: [
    "Introduction to Environmental Issues - ENVS 1",
    "Life on a Changing Planet - ENVS 10",
    "Sustainability, Human Development, and the Earth - GEOL 5",
    "Sustainability, Human Development, and the Earth - SCED 5",
    "Geology of California - GEOL 6",
     "Environmental Literacy - ENVL 105",    
    "Global Warming: Science and Solutions - METR 12",
    "Visualizing Local Landscapes - GEOG 139",
    "Ecological Biology - BIOL 20",
    "Principles of Biology I - BIOL 30",
    "Peoples, Places, and Environments - GEOG 102",
    "Principles of Biology II - BIOL 31",
    "Physical Geography - GEOG 1",
    "Age of the Dinosaurs - GEOL 8",
     "Inquiry into the Science of Climate Change - ERTH 104", 
    "Earth Disasters - GEOL 9",
    "Physical Science of Food - NUFS 1A",
     "California Cultural Landscapes - GEOG 105",
    "Earth, Time and Life - GEOL 7",
    "Weather and Climate - METR 10",
    "Introduction to Human Evolution - ANTH 12",
  ],

  communication: [
    "Argumentation and Advocacy - CMST 255",
    "Public Speaking - CMST 131",
      "Pop Culture and Media Innovation - JOUR 210",
    "Small Group Communication - CMST 132",
    "Communication and Social Change - HNRS 100",
      "Disability and Physcial Activity in the Media - KINE 295",
    "Gender and Sexuality in Media - JOUR 211",
    "Intercultural Communication - CMST 235",
     "Computer-Assisted Art I - CAGD 110",
    "Interpersonal Communication - COMM 50",
    "Gender Communication - CMST 234",
    "Social Media Storytelling - MADT 218",
    "Public Speaking - COMM 10",
    "Argumentation and Debate - COMM 20",
    "Introduction to Journalism - JOUR 10",
     "Design Thinking - MADT 102",
    "Professional Writing for Public Audiences (W) - JOUR 130W",
    "Argumentation and Advocacy - CMST 225",
    "Digital Literacy and Media Technology - JOUR 255",
  ],

  law: [
    "Introduction to Criminal Justice - CRIM 250",
    "Law, Politics, and Justice - LEGL 112",
     "Small Group Communication - CMST 132",
     "Public Speaking - CMST 131",
    "American Government - POLY 101",
    "Argumentation and Advocacy - CMST 225",
  ],

  history: [
    "American Indian Histories Past and Present - AIST 230",
    "Mexican American History - CHLX 235",
    "United States History - HIST 130",
     "Humanities (W) - HNRS 102W",
     "Asian Film and Literature (W) - HUMN 224W",
     "Latin American Film and Culture - LAST 120",
     "Magic, Witchcraft, and Religion - ANTH 140",
     "Introduction to Spiritual Traditions of Asia - RELS 110",
    "World History to 1400 - HIST 101",
    "Chicana/o Arts and Ideas - CHLX 254",
    "Lifestyles and Livelihoods in the Italian Renaissance - ITAL 260",
    "Islam and the World - HIST 261",
    "American Ethnic and Reigonal Writers",
    "Art Appreciation: Multicultural Perspectives - ARTH 100",
     "Arts and Ideas: Renaissance to the Present - HUMN 222",
    "Art History Survey: Prehistory to Medieval - ARTH 110",
      "Survey of Arts of the Americas, Oceania, and Africa - ARTH 150",
    "Art History Survey: 1800 to the Present - ARTH 130",
    "Ancient and Medieval Art and Literature - HUMN 220",
     "Introduction to the Asian American Experience - AAST 152",
       "Introduction to Latinx - CHLX 157",
         "Mexican American History - CHLX 235",
      "Introduction to Black/African American Studies - AFAM 170",
      "Introduction to American Indian/US Native American Studies - AIST 170",
       "Introduction to Critical HMoob Studies - AAST 330",
       "American Indian Storytelling/Oral Narrative - AIST 365",
    "Introduction to Asian Studies - AAST 110",
  ],

  philosophy: [
    "Introduction to Philosophy - PHIL 101",
    "Dying, Death, and Afterlife - RELS 264",
      "Introduction to Intersectional Ethnic Studies - MCGS 155",
  "Introduction to Intersectional Ethnic Studies (W) - MCGS 155W",   
    "Magic, Witchcraft, and Religion - ANTH 140",
    "Health at Every Size: A Non-Diet Approach to Wellness (W) - NFSC 200W",
    "Logic and Critical Thinking - PHIL 102",
   "The Good Life - PHIL 104",
   "Introduction to Spirituality and Religion in California - RELS 180",
    "Ethics for College Life and Beyond - PHIL 106",
    "Ethics of Artificial Intelligence - PHIL 111",
    "Honors Ethnic Studies Methodologies - HNRS 300",
    "Environmental Ethics - PHIL 129",
    "Introduction to Spiritual Traditions of Asia - RELS 110",
    "Women and Religion - RELS 275",
      "Leisure and Life - RPHM 180",
    "Philosophy and Video Games - PHIL 133",
    "The Meaning of Life - PHIL 207",
  ],

  computer: [
    "Introduction to Computer Science - CS 20",
    "Science Fiction - TECH 182",
    "Programming in Python - CS 30",
     "Computer-Assisted Art I - CAGD 110",
     "Fun with Electronics and Systems - EECE 110",
     "Digital Literacy and Media Technology - JOUR 255",
    "Data Structures and Algorithms - CS 40",
  ],

  psychology: [
    "Introduction to Psychology - PSYC 1",
    "Developmental Psychology - PSYC 20",
    "Biological Psychology - PSYC 30",
    "Principles of Psychology - PSYC 101",
    "Applications of Critical Thinking and Decision Making - PSYC 100",
  ],

  politics: [
    "American Government - POLY 101",
    "Social Media Storytelling - MADT 218",
     "Communication and Social Change - HNRS 100",
    "Comparative Governments - POLY 102",
     "Introduction to International Engagement (W) - INST 110W",
     "Small Group Communication - CMST 132",
     "Intercultural Communication - CMST 235",
    "Professional Writing for Public Audiences (W) - JOUR 130W",
     "Inquiry into the Science of Climate Change - ERTH 104", 
      "Logic and Critical Thinking - PHIL 102",
       "Public Speaking - CMST 131",
       "Applications of Critical Thinking and Decision Making - PSYC 100",
    "Argumentation and Advocacy - CMST 225"
  ],

  art_design: [
    "Art Appreciation: Multicultural Perspectives - ARTH 100",
    "Art History Survey: Prehistory to Medieval - ARTH 110",
    "Art History Survey: 1800 to the Present - ARTH 130",
    "Introduction to Comics and Graphic Novels - ENGL 204",
    "Survey of Arts of the Americas, Oceania, and Africa - ARTH 150",
    "Computer-Assisted Art I - CAGD 110",
    "Ancient and Medieval Art and Literature - HUMN 220",
    "Arts and Ideas: Renaissance to the Present - HUMN 222",
    "Chicana/o Arts and Ideas - CHLX 254",
     "Design Thinking - MADT 102",
    "Introduction to Dance - KINE 152",
    "Social Media Storytelling - MADT 218",
    "Introduction to Acting - THEA 112",
    "World Theatre - THEA 251",
    "Food and Film - HUMN 281",
    "History of the American Musical: Oklahoma! to Hamilton - THEA 254",
  ],

  music: [
    "World Music - MUSC 290",
    "American Music: It's History and International Influence - MUSC 291",
    "The Appreciation of Music - MUSC 292",
    "History of Rock Music - MUSC 294",
     "History of the American Musical: Oklahoma! to Hamilton - THEA 254",
  ],

  sports: [
    "Physical Fitness - PHED 1",
    "Introduction to Kinesiology - KIN 100",
     "Basic Nutrition - NFSC 100",
    "World Sports and Games - KINE 247",
    "Physical Activity and Wellness: A Way of Life - KINE 110",
  ],
};
export { ChicoTOPIC_TO_CLASSES };