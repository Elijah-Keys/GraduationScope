// src/components/BerkeleyTopic_To_Classes.jsx
const BERKELEY_TOPIC_TO_CLASSES = {
  science: [
    "ANTHRO 2AC - Archaeology",
    "AHMA R1B - Ancient History and Mediterranean Archaeology",
    "ESPM 50AC - Introduction to Culture and Natural Resource Management",
    "ESPM 163AC - Environmental Justice: Race, Class, Equity, and the Environment",
    "LINGUIS R1B - Linguistics Science",
    "PBHLTH 155E - Seeing People: Understanding Homelessness' Roots, Stigmas & Solutions - A Berkeley Changemaker Course",
    "GEOG 10AC - Worldings: Regions, Peoples and States",
    "SOCIOL 137AC - Environmental Justice: Race, Class, Equity, and the Environment"
  ],
  business: [
    "UGBA 39AC - Philanthropy: A Cross-Cultural Perspective",
    "HISTORY 133B - Wall Street / Main Street",
    "AMERSTD 101AC - American Culture and Studies",
    "GEOG 50AC - California",
    "PUBPOL 117AC - Race, Ethnicity, and Public Policy",
    "CYPLAN 118AC - The Urban Community",
    "HISTORY 100AC - Sports and Gender in U.S. History",
    "SOCIOL 113AC - Sociology of Education",
    "RHETOR 129AC - Individualism and American Autobiography",
    "MUSIC 26AC - Music in American Culture"
  ],
  social: [
    "AFRICAM 27AC - African American Literature",
    "AFRICAM R1B - African American Studies",
    "AMERSTD 101AC - American Culture and Studies",
    "ANTHRO 3AC - American Anthropology",
    "ASAMST 20AC - Asian American Studies",
    "ASAMST 128AC - Muslims in America",
    "COLWRIT 25AC - Diversity and Access in U.S. Public Education",
    "CYPLAN 118AC - The Urban Community",
    "GWS 50AC - Gender in American Culture",
    "GWS 100AC - Women in American Culture",
    "GEOG 50AC - California",
    "LINGUIS 55AC - The American Languages",
    "SOCIOL 3AC - Principles of Sociology: American Cultures",
    "SOCIOL 111AC - Sociology of the Family",
    "SOCIOL 113AC - Sociology of Education",
    "SOCWEL 150AC - Race, Ethnic Relations, and Social Welfare in the United States",
    "XASAMST 20AC - Asian American Communities and Race Relations",
    "XETHSTD 21AC - A Comparative Survey of Racial and Ethnic Groups in the U.S",
    "ANTHRO R5B - Anthropology",
    "XSOCIOL 3AC - Principles of Sociology: American Cultures"
  ],
  health: [
    "PBHLTH 155E - Seeing People: Understanding Homelessness' Roots, Stigmas & Solutions - A Berkeley Changemaker Course",
    "ASAMST 143AC - Asian American Health",
    "GWS 130AC - Gender, Race, Nation, and Health",
    "SOCWEL 150AC - Race, Ethnic Relations, and Social Welfare in the United States",
    "GWS 100AC - Women in American Culture"
  ],
  education: [
    "EDUC 131AC - A Focus on Equity and Urban Schools",
    "EDUC 140AC - Educational Perspectives on Literacy and Learning in a Global World",
    "EDUC W140A - Educational Perspectives on Literacy and Learning in a Global World",
    "EDUC C181 - What is the Role of Race in Urban Schools?",
    "EDUC W190A - Critical Studies in Education",
    "EDUC 282 - Introduction to Disciplined Inquiry",
    "COLWRIT 25AC - Diversity and Access in U.S. Public Education",
    "SOCIOL 113AC - Sociology of Education"
  ],
  engineering: [
    "CYPLAN 118AC - The Urban Community",
    "ESPM 50AC - Introduction to Culture and Natural Resource Management",
    "ESPM 163AC - Environmental Justice: Race, Class, Equity, and the Environment",
    "GEOG 10AC - Worldings: Regions, Peoples and States",
    "GEOG 50AC - California",
    "HISTART R1B - Reading and Writing about Visual Experience"
  ],
  math: [
    "PHILOS R1B - Reading and Composition through Philosophy",
    "LINGUIS R1B - Linguistics Science",
    "SOCIOL R1B - Sociological Reading & Composition",
    "EDUC 282 - Introduction to Disciplined Inquiry",
    "AHMA R1B - Ancient History and Mediterranean Archaeology",
    "GEOG 10AC - Worldings: Regions, Peoples and States"
  ],
  language: [
    "GERMAN R5A - German Literature",
    "FRENCH R1B - Narrating Childhood in 20th Century France",
    "ITALIAN R5A - Italian Literature",
    "ITALIAN R5B - The Art of Protest",
    "SPANISH R1A - Reading and Composition Through Readings from the Spanish-Speaking World",
    "SCANDIN R5A - Scandinavian Literature and Culture",
    "SCANDIN R5B - Scandinavian Literature",
    "SLAVIC R5A - Literature of Fantastic Transformation",
    "SLAVIC R5B - Slavic Literature",
    "CELTIC R1B - Celtic Writers",
    "EALANG R1B - East Asia",
    "SASIAN R5A - Great Books of India",
    "SASIAN R5B - India in the Writer's Eye",
    "SEASIAN R5A - Self, Representation, and Nation",
    "LINGUIS 55AC - The American Languages",
    "AFRICAM C133A - African American Language and Studies",
    "DUTCH 171AC - Dutch Culture",
    "NATAMST R1A - Native American Studies Reading and Composition",
    "CHICANO R1A - Introduction to Chicano Literature in English",
    "MELC R1A - Middle Eastern Culture"
  ],
  environment: [
    "ESPM 50AC - Introduction to Culture and Natural Resource Management",
    "ESPM 163AC - Environmental Justice: Race, Class, Equity, and the Environment",
    "SOCIOL 137AC - Environmental Justice: Race, Class, Equity, and the Environment",
    "GEOG 10AC - Worldings: Regions, Peoples and States",
    "GEOG 50AC - California",
    "GWS 133AC - Women, Men, and Other Animals: Human Animality in American Cultures",
    "XESPM 50AC - Introduction to Culture and Natural Resource Management"
  ],
  communication: [
    "COLWRIT R1A - Accelerated Reading and Composition 6 Units",
    "COLWRIT R4A",
    "COMLIT R1A - English Composition in Connection",
    "ENGLISH R1A - College Writing",
    "FILM R1A - The Craft of Writing Film Focus",
    "RHETOR R1A - The Craft of Writing",
    "COLWRIT R4B - 2nd Half Reading and Composition",
    "ENGLISH R1B - Reading and Composition",
    "FILM R1B - Film Comprehension",
    "RHETOR R1B - The Craft of Writing",
    "XCOLWRI R1A - College Writing R1A",
    "XCOMLIT R1A - Comparative Literature",
    "XENGLIS R1A - English",
    "XENGLIS R1B - Societal Reading and Composition",
    "THEATER R1B - Performance: Writing and Research",
    "COMLIT R1B - English Composition in Connection with the Reading of World Literature",
    "COMLIT R3B - English Composition in Connection with Reading of World and Hispanic Literature"
  ],
  law: [
    "LEGALST R1B - Reading and Composition in Connection with the Law as a Social Institution",
    "LEGALST 162AC - Restorative Justice",
    "PUBPOL 117AC - Race, Ethnicity, and Public Policy",
    "SOCIOL 131AC - Race and Ethnic Relations: U.S. American Cultures",
    "XETHSTD 21AC - A Comparative Survey of Racial and Ethnic Groups in the U.S"
  ],
  history: [
    "AHMA R1B - Ancient History and Mediterranean Archaeology",
    "HISTORY R1B - Reading and Composition courses in History",
    "HISTORY 7A - Introduction to the History of the United States: The United States from Settlement to Civil War",
    "HISTORY 124B - The Recent United States: The United States from World War II",
    "XHISTOR 7B - The United States from Civil War to Present",
    "HISTORY 125A - African American History and Race Relations: 1450-1860",
    "HISTORY 133B - Wall Street / Main Street",
    "AMERSTD 101AC - American Culture and Studies",
    "ITALIAN 70AC - The Recent United States: The United States from World War II",
    "MELC 117AC - The Origins of Racism in the West",
    "GEOG 50AC - California",
    "GEOG 10AC - Worldings: Regions, Peoples and States"
  ],
  philosophy: [
    "PHILOS R1B - Reading and Composition through Philosophy",
    "RHETOR 129AC - Individualism and American Autobiography",
    "ETHSTD 22AC - An Introduction to Abolition Pedagogy and Practice",
    "MELC 117AC - The Origins of Racism in the West",
    "ITALIAN R5B - The Art of Protest"
  ],
  computer: [
    "RHETOR 129AC - Individualism and American Autobiography",
    "COLWRIT R1A - Accelerated Reading and Composition 6 Units",
    "FILM R1B - Film Comprehension",
    "ENGLISH R1A - College Writing",
    "XCOMLIT R1A - Comparative Literature",
    "LINGUIS 55AC - The American Languages",
    "GEOG 10AC - Worldings: Regions, Peoples and States"
  ],
  psychology: [
    "SOCIOL 3AC - Principles of Sociology: American Cultures",
    "SOCIOL 111AC - Sociology of the Family",
    "SOCIOL 131AC - Race and Ethnic Relations: U.S. American Cultures",
    "PBHLTH 155E - Seeing People: Understanding Homelessness' Roots, Stigmas & Solutions - A Berkeley Changemaker Course",
    "RHETOR 129AC - Individualism and American Autobiography",
    "AFRICAM 27AC - African American Literature",
    "ASAMST R2A - Asian American Literature",
    "GWS 50AC - Gender in American Culture"
  ],
  politics: [
    "POLSCI 1 - The Politics of Immigration",
    "XPOLSCI 1 - Introduction to American Politics",
    "PUBPOL 117AC - Race, Ethnicity, and Public Policy",
    "LEGALST 162AC - Restorative Justice",
    "LGBT 20AC - Sexual Politics and Queer Organizing in the US",
    "CYPLAN 118AC - The Urban Community",
    "ASAMST 128AC - Muslims in America",
    "SOCIOL 131AC - Race and Ethnic Relations: U.S. American Cultures",
    "GEOG 10AC - Worldings: Regions, Peoples and States",
    "AMERSTD 101AC - American Culture and Studies",
    "MELC 158 - Middle East: Post-Colonialism, Migration, and Diaspora"
  ],
  art_design: [
    "FILM R1A - The Craft of Writing Film Focus",
    "FILM R1B - Film Comprehension",
    "HISTART R1B - Reading and Writing about Visual Experience",
    "THEATER R1A - Reading and Composition",
    "THEATER R1B - Performance: Writing and Research",
    "THEATER 52AC - Dance in American Cultures",
    "XTHEATR 52AC - Dance in American Cultures",
    "GERMAN R5A - German Literature",
    "SCANDIN R5A - Scandinavian Literature and Culture",
    "ITALIAN R5B - The Art of Protest",
    "SLAVIC R5A - Literature of Fantastic Transformation"
  ],
  music: [
    "MUSIC 26AC - Music in American Culture",
    "MUSIC R1B - Music Reading and Writing",
    "XMUSIC 26AC - Music in American Culture",
    "THEATER 52AC - Dance in American Cultures"
  ]
};

export default BERKELEY_TOPIC_TO_CLASSES;
